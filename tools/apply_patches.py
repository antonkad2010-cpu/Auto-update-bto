#!/usr/bin/env python3
"""Fail-closed, versioned patch engine for an obfuscated JS client.

Each patch is bound to a unique anchor and optionally a containing-function
signature. No global renaming and no fuzzy guessing of obfuscated identifiers.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import sys
import subprocess

def sha256(text):
    return hashlib.sha256(text.encode("utf-8")).hexdigest()

def die(message):
    raise SystemExit("PATCH FAILED: " + message)

def unique_span(text, expression, name, flags=0):
    try:
        matches = list(re.finditer(expression, text, flags))
    except re.error as exc:
        die(f"{name}: bad regex: {exc}")
    if len(matches) != 1:
        die(f"{name}: expected 1 match, got {len(matches)}")
    return matches[0].span()

def render(template, bindings, patch_name):
    def replace(match):
        key = match.group(1)
        if key not in bindings:
            die(f"{patch_name}: unresolved variable {key}")
        value = bindings[key]
        if not isinstance(value, str) or not re.fullmatch(r"[$\w\u0080-\uffff]+", value):
            die(f"{patch_name}: invalid JS identifier for {key}")
        return value
    result = re.sub(r"\{\{([A-Za-z][A-Za-z0-9_]*)\}\}", replace, template)
    if "{{" in result or "}}" in result:
        die(f"{patch_name}: unresolved placeholder")
    return result

def apply(source, spec):
    expected = spec.get("base_sha256")
    if not isinstance(expected, str) or not re.fullmatch(r"[a-f0-9]{64}", expected):
        die("manifest must contain an exact base_sha256 (64 lowercase hex)")
    if sha256(source) != expected:
        die("upstream JS hash changed; patches must be remapped")
    output = source
    report = []
    patches = spec.get("patches", [])
    if not isinstance(patches, list) or not patches:
        die("manifest contains no verified patches")
    for patch in patches:
        name = patch.get("id")
        if not name or not isinstance(name, str):
            die("each patch needs a stable id")
        literal = patch.get("literal", False)
        if literal and patch.get("variables"):
            die(f"{name}: literal patches cannot have variable bindings")
        bindings = {}
        for key, pattern in patch.get("variables", {}).items():
            span = unique_span(output, pattern, f"{name} variable {key}")
            m = re.search(pattern, output[span[0]:span[1]])
            if not m or m.lastindex != 1:
                die(f"{name}: variable pattern needs exactly one capture group")
            bindings[key] = m.group(1)
        anchor = patch.get("anchor", "")
        if not literal:
            anchor = render(anchor, bindings, name)
        if not anchor:
            die(f"{name}: missing anchor")
        start, end = unique_span(output, re.escape(anchor), f"{name} anchor")
        replacement = patch.get("replacement", "")
        if not literal:
            replacement = render(replacement, bindings, name)
        if not replacement:
            die(f"{name}: replacement missing")
        mode = patch.get("mode")
        if mode == "after":
            output = output[:end] + replacement + output[end:]
        elif mode == "before":
            output = output[:start] + replacement + output[start:]
        elif mode == "replace":
            output = output[:start] + replacement + output[end:]
        else:
            die(f"{name}: invalid mode {mode}")
        assertion = patch.get("assert_contains")
        if assertion and (assertion if literal else render(assertion, bindings, name)) not in output:
            die(f"{name}: postcondition failed")
        report.append({"id": name, "mode": mode, "bindings": bindings})
    if output == source:
        die("output unchanged")
    return output, report

def load_manifest(path):
    """Load readable payloads without duplicating them in the version manifest."""
    path = Path(path)
    spec = json.loads(path.read_text(encoding="utf-8"))
    binding_path = None
    if spec.get('payload_bindings'):
        root = path.resolve().parent.parent
        binding_path = (path.parent / spec['payload_bindings']).resolve()
        if not binding_path.is_relative_to(root) or not binding_path.is_file():
            die('payload bindings are missing or outside the project')
    for patch in spec.get("patches", []):
        files = patch.get("replacement_files")
        if files is None:
            if patch.get('id') == 'install-responsive-runtime':
                metadata = {'source_sha256': spec['base_sha256'],
                            'source_url': spec.get('source_url')}
                patch['replacement'] = 'var __devastBuildInfo=' + json.dumps(metadata) + ';\n' + patch['replacement']
            continue
        if "replacement" in patch or not isinstance(files, list) or not files:
            die("replacement_files must be a nonempty list without replacement")
        root = path.resolve().parent.parent
        parts = []
        for name in files:
            if not isinstance(name, str) or Path(name).is_absolute():
                die("replacement files must use relative paths")
            target = (path.parent / name).resolve()
            if not target.is_relative_to(root) or not target.is_file():
                die("replacement file is missing or outside the project")
            parts.append(target.read_text(encoding="utf-8"))
        payload = "\n" + "\n".join(parts) + "\n"
        if binding_path:
            translated = subprocess.run(
                ['node', str(root / 'tools' / 'translate_payload.cjs'), str(binding_path)],
                input=payload, text=True, capture_output=True, timeout=30)
            if translated.returncode:
                die('payload translation failed: ' + translated.stderr[-1000:])
            payload = translated.stdout
        if patch.get('id') == 'install-responsive-runtime':
            metadata = {'source_sha256': spec['base_sha256'],
                        'source_url': spec.get('source_url')}
            payload = 'var __devastBuildInfo=' + json.dumps(metadata) + ';\n' + payload
        patch["replacement"] = payload
    return spec

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", required=True)
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--report", required=True)
    args = parser.parse_args()
    base = Path(args.base).read_text(encoding="utf-8")
    spec = load_manifest(args.manifest)
    output, report = apply(base, spec)
    # A retained last-good build must not run against a differently named bundle.
    source_url = spec.get('source_url')
    if source_url:
        guard = (';(function(){if(typeof document===\'undefined\')return;'
                 'var s=document.currentScript;if(!s||!s.src)return;'
                 'var u=new URL(s.src,location.href),expected=new URL(' + json.dumps(source_url) + ');'
                 'if(u.hostname===expected.hostname&&u.pathname.startsWith(\'/js/\')&&u.pathname!==expected.pathname)'
                 'throw new Error(\'Devast mod: this game version needs updated bindings. Check dist/update-status.json.\');})();\n')
        output = guard + output
    path = Path(args.output)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(output, encoding="utf-8")
    Path(args.report).write_text(json.dumps({
        "base_sha256": sha256(base), "output_sha256": sha256(output),
        "patches": report}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

if __name__ == "__main__":
    main()
