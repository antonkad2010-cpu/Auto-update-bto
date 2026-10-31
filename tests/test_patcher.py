import importlib.util
from pathlib import Path
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location('patcher', ROOT / 'tools/apply_patches.py')
patcher = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(patcher)


class PatcherTests(unittest.TestCase):
    def spec(self, source='function f(){{return 1;}}'):
        return {'base_sha256': patcher.sha256(source), 'patches': [{
            'id': 'literal-js', 'literal': True, 'anchor': 'return 1;',
            'replacement': 'if(true){{return 2;}}', 'mode': 'replace'}]}

    def test_literal_javascript_braces_are_not_template_placeholders(self):
        output, report = patcher.apply('function f(){{return 1;}}', self.spec())
        self.assertIn('if(true){{return 2;}}', output)
        self.assertEqual(len(report), 1)

    def test_changed_client_fails_closed(self):
        with self.assertRaisesRegex(SystemExit, 'hash changed'):
            patcher.apply('different client', self.spec())

    def test_nonunique_anchor_fails_closed(self):
        source = 'return 1; return 1;'
        with self.assertRaisesRegex(SystemExit, 'expected 1 match, got 2'):
            patcher.apply(source, self.spec(source))

    def test_literal_patches_cannot_silently_drop_bindings(self):
        spec = self.spec()
        spec['patches'][0]['variables'] = {'x': '(name)'}
        with self.assertRaisesRegex(SystemExit, 'literal patches cannot'):
            patcher.apply('function f(){{return 1;}}', spec)

    def test_manifest_loads_readable_runtime_and_adapter(self):
        spec = patcher.load_manifest(ROOT / 'patches/manifest.json')
        payload = spec['patches'][-1]['replacement']
        self.assertIn('function createBBY(game)', payload)
        self.assertIn('window.BBY = __BBY;', payload)
        self.assertEqual(len(spec['patches']), 7)

    def test_external_payload_path_is_rejected(self):
        with tempfile.TemporaryDirectory() as temp:
            path = Path(temp) / 'patches'
            path.mkdir()
            (path / 'manifest.json').write_text('{"patches":[{"replacement_files":["/etc/passwd"]}]}')
            with self.assertRaisesRegex(SystemExit, 'relative paths'):
                patcher.load_manifest(path / 'manifest.json')

    def test_remapped_inline_payload_keeps_actual_build_identity(self):
        with tempfile.TemporaryDirectory() as temp:
            path = Path(temp) / 'remapped.json'
            path.write_text('{"base_sha256":"abc","source_url":"https://devast.io/js/new.js",'
                            '"patches":[{"id":"install-responsive-runtime",'
                            '"replacement":"install();"}]}')
            loaded = patcher.load_manifest(path)
            payload = loaded['patches'][0]['replacement']
            self.assertIn('"source_sha256": "abc"', payload)
            self.assertIn('https://devast.io/js/new.js', payload)
            self.assertTrue(payload.endswith('install();'))


if __name__ == '__main__':
    unittest.main()
