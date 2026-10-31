import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('publish_watch', ROOT / 'tools/publish_watch.py')
publisher = importlib.util.module_from_spec(spec)
spec.loader.exec_module(publisher)


class PublicationTests(unittest.TestCase):
    def test_semantic_change_keeps_last_good_script_and_publishes_reason(self):
        with tempfile.TemporaryDirectory() as tmp:
            output, dist = Path(tmp) / 'output', Path(tmp) / 'dist'
            output.mkdir()
            dist.mkdir()
            (dist / 'game.modded.js').write_text('last good guarded build')
            (output / 'game.modded.js').write_text('stale temporary file')
            status = {'status': 'new_version_needs_remapping', 'source_sha256': 'a' * 64,
                      'message': 'Semantic change', 'checked_at': 100}
            (output / 'status.json').write_text(json.dumps(status))
            public = publisher.publish(output, dist)
            self.assertEqual((dist / 'game.modded.js').read_text(), 'last good guarded build')
            self.assertEqual(public['publication'], 'retained_previous_build')
            self.assertEqual(public['message'], 'Semantic change')
            self.assertNotIn('checked_at', public)

    def test_only_verified_hash_replaces_public_script(self):
        with tempfile.TemporaryDirectory() as tmp:
            output, dist = Path(tmp) / 'output', Path(tmp) / 'dist'
            output.mkdir()
            (output / 'game.modded.js').write_bytes(b'new build')
            status = {'status': 'verified_bindings', 'output_sha256': '0' * 64}
            (output / 'status.json').write_text(json.dumps(status))
            with self.assertRaisesRegex(ValueError, 'hash'):
                publisher.publish(output, dist)
            self.assertFalse((dist / 'game.modded.js').exists())
            status['output_sha256'] = hashlib.sha256(b'new build').hexdigest()
            (output / 'status.json').write_text(json.dumps(status))
            publisher.publish(output, dist)
            self.assertEqual((dist / 'game.modded.js').read_bytes(), b'new build')
