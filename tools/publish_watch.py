#!/usr/bin/env python3
"""Publish a verified artifact atomically and retain the last good build on failure."""
import argparse
import hashlib
import json
import os
from pathlib import Path


def atomic_bytes(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name('.' + path.name + '.tmp')
    temporary.write_bytes(data)
    os.replace(temporary, path)


def publish(output, destination):
    status = json.loads((output / 'status.json').read_text())
    verified = status.get('status') == 'verified_bindings'
    target = destination / 'game.modded.js'
    previous_path = destination / 'update-status.json'
    previous = json.loads(previous_path.read_text()) if previous_path.exists() else {}
    if verified:
        data = (output / 'game.modded.js').read_bytes()
        if hashlib.sha256(data).hexdigest() != status.get('output_sha256'):
            raise ValueError('Artifact hash does not match the successful check')
        atomic_bytes(target, data)
    public = {k: v for k, v in status.items() if k != 'checked_at'}
    public['publication'] = 'compatible_build' if verified else 'retained_previous_build' if target.exists() else 'no_compatible_build'
    public['published_source_sha256'] = status.get('source_sha256') if verified else previous.get('published_source_sha256')
    public['published_output_sha256'] = hashlib.sha256(target.read_bytes()).hexdigest() if target.exists() else None
    public['actions_url'] = 'https://github.com/antonkad2010-cpu/Auto-update-bto/actions/workflows/watch-responsive.yml'
    atomic_bytes(destination / 'update-status.json', (json.dumps(public, ensure_ascii=False, indent=2) + '\n').encode())
    return public


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=Path('build/watch'))
    parser.add_argument('--destination', type=Path, default=Path('dist'))
    args = parser.parse_args()
    public = publish(args.output, args.destination)
    print(json.dumps(public, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
