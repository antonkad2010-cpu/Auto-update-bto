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


class WithoutReviewedVariant(unittest.TestCase):
    def setUp(self):
        control = patch.object(watch, 'reviewed_check_spec', return_value=None)
        control.start()
        self.addCleanup(control.stop)


class WatchGameTests(WithoutReviewedVariant):
    def test_unknown_version_is_reported_without_publishing(self):
        def fake_run(command):
            if 'tools/remap.cjs' in command:
                raise RuntimeError('Semantic change refused')
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

class AutoRemappingTests(WithoutReviewedVariant):
    def test_changed_version_uses_generated_manifest_before_publication(self):
        commands = []
        def fake_run(command):
            commands.append(command)
            if 'tools/fetch_current.py' in command:
                work = Path(command[command.index('--out') + 1])
                (work / 'manifest.json').write_text(json.dumps({'source_url': 'https://devast.io/js/new.js', 'sha256': 'b'*64}))
            elif 'tools/remap.cjs' in command:
                Path(command[-1]).write_text('{}')
            elif 'tools/apply_patches.py' in command:
                self.assertEqual(Path(command[command.index('--manifest')+1]).name, 'remapped.json')
                Path(command[command.index('--output')+1]).write_text('/* mapped */')
                Path(command[command.index('--report')+1]).write_text('{}')
        with tempfile.TemporaryDirectory() as tmp, patch.object(watch,'run',side_effect=fake_run):
            self.assertTrue(watch.check(Path(tmp)))
            status=json.loads((Path(tmp)/'status.json').read_text())
            self.assertTrue(status['automatically_remapped'])
            self.assertTrue(any('tests/remap.test.cjs' in command for command in commands))


class ReviewedPublicationTests(unittest.TestCase):
    def setUp(self):
        reviewed = json.loads(watch.REVIEWED_CHECKS.read_text())
        control = patch.object(watch, 'reviewed_check_spec', return_value=reviewed)
        control.start()
        self.addCleanup(control.stop)

    def test_reviewed_changes_are_built_and_checked_before_stable_publication(self):
        expected = json.loads(watch.MANIFEST.read_text())['base_sha256']
        commands = []

        def fake_run(command):
            commands.append(command)
            if 'tools/fetch_current.py' in command:
                work = Path(command[command.index('--out') + 1])
                (work / 'manifest.json').write_text(json.dumps({
                    'source_url': 'https://devast.io/js/current.js', 'sha256': expected}))
            elif 'tools/apply_patches.py' in command:
                Path(command[command.index('--output') + 1]).write_text('ordinary build')
                Path(command[command.index('--report') + 1]).write_text('{}')
            elif 'tools/client_check_variant.cjs' in command:
                self.assertEqual(Path(command[3]).read_text(), 'ordinary build')
                Path(command[-2]).write_text('reviewed build')
                Path(command[-1]).write_text(json.dumps({'removed': [1, 2, 3]}))

        with tempfile.TemporaryDirectory() as tmp, patch.object(watch, 'run', side_effect=fake_run):
            output = Path(tmp)
            self.assertTrue(watch.check(output))
            self.assertEqual((output / 'game.modded.js').read_text(), 'reviewed build')
            status = json.loads((output / 'status.json').read_text())
            report = json.loads((output / 'report.json').read_text())
            self.assertTrue(status['client_check_variant'])
            self.assertEqual(status['output_sha256'], report['output_sha256'])
            self.assertEqual(report['client_checks']['removed'], [1, 2, 3])
            syntax = next(c for c in commands if '--check' in c)
            self.assertEqual(Path(syntax[-1]).name, 'reviewed.js')

    def test_new_version_does_not_silently_publish_without_reviewed_changes(self):
        commands = []

        def fake_run(command):
            commands.append(command)
            if 'tools/remap.cjs' in command:
                self.assertIn(str(watch.REVIEWED_CHECKS), command)
                raise RuntimeError('Token structure changed; semantic review required')
            self.assertIn('tools/fetch_current.py', command)
            work = Path(command[command.index('--out') + 1])
            (work / 'manifest.json').write_text(json.dumps({
                'source_url': 'https://devast.io/js/new.js', 'sha256': 'c' * 64}))

        with tempfile.TemporaryDirectory() as tmp, patch.object(watch, 'run', side_effect=fake_run):
            output = Path(tmp)
            (output / 'game.modded.js').write_text('previous build')
            self.assertFalse(watch.check(output))
            self.assertEqual(len(commands), 2)
            self.assertEqual((output / 'game.modded.js').read_text(), 'previous build')
            self.assertEqual(json.loads((output / 'status.json').read_text())['status'],
                             'new_version_needs_remapping')

    def test_proven_rename_remaps_reviewed_checks_before_building(self):
        commands = []

        def fake_run(command):
            commands.append(command)
            if 'tools/fetch_current.py' in command:
                work = Path(command[command.index('--out') + 1])
                (work / 'manifest.json').write_text(json.dumps({
                    'source_url': 'https://devast.io/js/new.js', 'sha256': 'd' * 64}))
            elif 'tools/remap.cjs' in command:
                Path(command[5]).write_text('{}')
                Path(command[7]).write_text('{"base_sha256":"' + 'd' * 64 + '"}')
            elif 'tools/apply_patches.py' in command:
                manifest = Path(command[command.index('--manifest') + 1])
                self.assertEqual(json.loads(manifest.read_text())['source_url'], 'https://devast.io/js/new.js')
                Path(command[command.index('--output') + 1]).write_text('ordinary build')
                Path(command[command.index('--report') + 1]).write_text('{}')
            elif 'tools/client_check_variant.cjs' in command:
                self.assertEqual(Path(command[4]).name, 'remapped-checks.json')
                Path(command[-2]).write_text('reviewed remapped build')
                Path(command[-1]).write_text('{}')

        with tempfile.TemporaryDirectory() as tmp, patch.object(watch, 'run', side_effect=fake_run):
            self.assertTrue(watch.check(Path(tmp)))
            self.assertEqual((Path(tmp) / 'game.modded.js').read_text(), 'reviewed remapped build')


class ClientCheckPolicyTests(unittest.TestCase):
    def test_restoring_native_checks_and_rejecting_malformed_policy(self):
        with tempfile.TemporaryDirectory() as tmp:
            policy = Path(tmp) / 'policy.json'
            with patch.object(watch, 'CLIENT_CHECK_POLICY', policy):
                policy.write_text('{"enabled": false}')
                self.assertIsNone(watch.reviewed_check_spec())
                policy.write_text('{"enabled": true}')
                self.assertEqual(watch.reviewed_check_spec(),
                                 json.loads(watch.REVIEWED_CHECKS.read_text()))
                policy.write_text('{"enabled": 1}')
                with self.assertRaisesRegex(ValueError, 'boolean'):
                    watch.reviewed_check_spec()
