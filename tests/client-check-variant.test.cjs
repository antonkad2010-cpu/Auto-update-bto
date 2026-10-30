const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const {digest, removeReviewedChecks} = require('../tools/client_check_variant.cjs');

function fixture() {
  const api = 'function () { probes++; flagged = 1; }';
  const dom = '{eval("function menuProbe(){probes++; flagged=1}")}';
  const filename = '{eval("if(filename!==expected)flagged=1")}';
  const source = 'var probes=0,flagged=0,filename="replacement",expected="original"; var check=' + api + ';' + dom + filename + ';function send(packet){sent.push(JSON.stringify(packet))}';
  const spec = {checks: [
    {id: 'browser-api-integrity', kind: 'variable-initializer', name: 'check', sha256: digest(api)},
    {id: 'known-menu-dom', kind: 'encoded-block', name: 'menuProbe', sha256: digest(dom)},
    {id: 'script-filename-check', kind: 'encoded-block', sha256: digest(filename)}
  ]};
  return {source, spec, dom};
}

test('local variant removes reviewed probes while retaining callers and packet serialization', () => {
  const {source, spec} = fixture();
  const result = removeReviewedChecks(source, spec);
  const context = vm.createContext({sent: []});
  vm.runInContext(result.output + ';check();menuProbe();send([6,123]);send([4]);send([5]);', context);
  assert.equal(context.probes, 0); assert.equal(context.flagged, 0);
  assert.deepEqual(context.sent, ['[6,123]', '[4]', '[5]']);
  assert.equal(result.removed.length, 3);
  assert.ok(!result.output.includes('flagged = 0'));
});

test('changed or duplicate probe bodies stop variant generation', () => {
  const {source, spec, dom} = fixture();
  assert.throws(() => removeReviewedChecks(source.replace('probes++; flagged', 'probes+=2; flagged'), spec), /expected one/);
  assert.throws(() => removeReviewedChecks(source + dom, spec), /found 2/);
});
