#!/usr/bin/env python3
"""Fetch the current public game JS without executing site code."""
import argparse
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import urllib.parse
import urllib.request

BASE = "https://devast.io/"
LIMIT = 30_000_000

class Scripts(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = []
    def handle_starttag(self, tag, attrs):
        if tag.lower() == "script":
            src = dict(attrs).get("src")
            if src:
                self.urls.append(urllib.parse.urljoin(BASE, src))

def get(url, limit=LIMIT):
    parsed = urllib.parse.urlparse(url)
    if parsed.scheme != "https" or not (parsed.hostname == "devast.io" or parsed.hostname.endswith(".devast.io")):
        raise ValueError("Only devast.io HTTPS resources are accepted")
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=25) as res:
        if int(res.headers.get("Content-Length", "0")) > limit:
            raise ValueError("Exceeds size limit")
        content = res.read(limit + 1)
        if len(content) > limit:
            raise ValueError("Exceeds size limit")
        return content

def main():
    argp = argparse.ArgumentParser()
    argp.add_argument("--out", default="build")
    args = argp.parse_args()
    html = get(BASE, 3_000_000).decode("utf-8", "replace")
    parser = Scripts()
    parser.feed(html)
    urls = [u for u in dict.fromkeys(parser.urls) if re.search(r"\.js(?:[?#]|$)", u, re.I)]
    if not urls:
        raise SystemExit("No external JS files found; no output produced.")
    candidates = []
    for url in urls:
        try:
            data = get(url)
            if len(data) > 20_000:
                candidates.append((len(data), url, data))
        except (OSError, ValueError) as err:
            print("Skipping", url, str(err))
    if not candidates:
        raise SystemExit("No downloadable game JS candidate found.")
    candidates.sort(reverse=True)
    size, url, data = candidates[0]
    if len(candidates) > 1 and candidates[1][0] >= size * 0.75:
        raise SystemExit("Ambiguous candidates; refusing to select a file.")
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    (out / "game.current.js").write_bytes(data)
    manifest = dict(source_url=url, sha256=hashlib.sha256(data).hexdigest(), size=size,
                    status="Unmodified game JS; patches not yet applied")
    (out / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    print(json.dumps(manifest, indent=2))

if __name__ == "__main__":
    main()
