#!/usr/bin/env python3
"""Poll Devast and build only a version whose bindings are already verified."""
import argparse
import hashlib
import json
import logging
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import time

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / 'patches' / 'responsive.json'


def atomic_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_name(path.name + '.tmp')
    temp.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    os.replace(temp, path)


def run(command):
    result = subprocess.run(command, cwd=ROOT, text=True, capture_output=True, timeout=180)
    if result.returncode:
        raise RuntimeError((result.stderr or result.stdout or 'command failed')[-2000:])
    return result


def check(output):
    output.mkdir(parents=True, exist_ok=True)
    expected = json.loads(MANIFEST.read_text(encoding='utf-8'))['base_sha256']
    with tempfile.TemporaryDirectory(prefix='devast-watch-') as work:
        work = Path(work)
        run([sys.executable, 'tools/fetch_current.py', '--out', str(work)])
        source = json.loads((work / 'manifest.json').read_text(encoding='utf-8'))
        info = {'source_url': source['source_url'], 'source_sha256': source['sha256'],
                'checked_at': int(time.time())}
        manifest = MANIFEST
        remapped = source['sha256'] != expected
        if remapped:
            manifest = work / 'remapped.json'
            try:
                run(['node', 'tools/remap.cjs', 'baselines/current.js.gz',
                     str(work / 'game.current.js'), str(MANIFEST), str(manifest)])
            except RuntimeError as error:
                atomic_json(output / 'status.json', {**info, 'status': 'new_version_needs_remapping',
                            'message': str(error)})
                return False
        product, report = work / 'game.modded.js', work / 'report.json'
        run([sys.executable, '-m', 'unittest', 'discover', '-s', 'tests', '-p', 'test_*.py'])
        run(['node', '--test', 'tests/responsive.test.cjs', 'tests/ilm-integration.test.cjs', 'tests/native-labels.test.cjs', 'tests/doors.test.cjs', 'tests/fast-loot.test.cjs'])
        run(['node', '--test', 'tests/remap.test.cjs'])
        run([sys.executable, 'tools/apply_patches.py', '--base', str(work / 'game.current.js'),
             '--manifest', str(manifest), '--output', str(product), '--report', str(report)])
        run(['node', '--check', str(product)])
        data = product.read_bytes()
        temporary = output / '.game.modded.js.tmp'
        temporary.write_bytes(data)
        os.replace(temporary, output / 'game.modded.js')
        atomic_json(output / 'report.json', json.loads(report.read_text(encoding='utf-8')))
        atomic_json(output / 'status.json', {**info, 'status': 'verified_bindings',
                    'automatically_remapped': remapped,
                    'output_sha256': hashlib.sha256(data).hexdigest(),
                    'message': 'Static checks passed; live gameplay was not tested.'})
        return True


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--interval', type=int, default=120)
    parser.add_argument('--output', type=Path, default=ROOT / 'build' / 'watch')
    parser.add_argument('--once', action='store_true')
    args = parser.parse_args()
    if args.interval < 120:
        parser.error('interval must be at least 120 seconds')
    logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
    while True:
        start = time.monotonic()
        try:
            ok = check(args.output)
            logging.info('check complete: %s', 'verified version' if ok else 'remapping required')
        except (OSError, RuntimeError, subprocess.TimeoutExpired, ValueError, KeyError) as error:
            logging.error('check failed: %s', error)
            atomic_json(args.output / 'status.json', {'status': 'check_failed', 'checked_at': int(time.time()),
                                                      'message': str(error)})
            ok = False
        if args.once:
            return 0 if ok else 1
        time.sleep(max(0, args.interval - (time.monotonic() - start)))


if __name__ == '__main__':
    raise SystemExit(main())
