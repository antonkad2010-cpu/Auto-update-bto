import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('watch_game', ROOT / 'tools' / 'watch_game.py')
watch = importlib.util.module_from_spec(spec)
spec.loader.exec_module(watch)


class WatchGameTests(unittest.TestCase):
    def test_unknown_version_is_reported_without_publishing(self):
        def fake_run(command):
            self.assertIn('tools/fetch_current.py', command)
            work = Path(command[command.index('--out') + 1])
            (work / 'manifest.json').write_text(json.dumps({'source_url': 'https://devast.io/js/new.js', 'sha256': 'a' * 64}))
        with tempfile.TemporaryDirectory() as tmp, patch.object(watch, 'run', side_effect=fake_run):
            output = Path(tmp)
            self.assertFalse(watch.check(output))
            self.assertEqual(json.loads((output / 'status.json').read_text())['status'], 'new_version_needs_remapping')
            self.assertFalse((output / 'game.modded.js').exists())

    def test_known_version_publishes_only_after_checks(self):
        expected = json.loads(watch.MANIFEST.read_text())['base_sha256']
        def fake_run(command):
            if 'tools/fetch_current.py' in command:
                work = Path(command[command.index('--out') + 1])
                (work / 'manifest.json').write_text(json.dumps({'source_url': 'https://devast.io/js/current.js', 'sha256': expected}))
            if 'tools/apply_patches.py' in command:
                Path(command[command.index('--output') + 1]).write_text('valid js')
                Path(command[command.index('--report') + 1]).write_text('{}')
        with tempfile.TemporaryDirectory() as tmp, patch.object(watch, 'run', side_effect=fake_run):
            output = Path(tmp)
            self.assertTrue(watch.check(output))
            self.assertEqual((output / 'game.modded.js').read_text(), 'valid js')
            self.assertEqual(json.loads((output / 'status.json').read_text())['status'], 'verified_bindings')

if __name__ == '__main__':
    unittest.main()
