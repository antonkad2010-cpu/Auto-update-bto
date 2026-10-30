const {test} = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const vm = require('node:vm');
const native = require('./fixtures/native-export-probes.json');
const manifest = require('../patches/responsive.json');

test('all three decoded native token conditions react to the optional export independently of the shared flag', () => {
  assert.equal(native.base_sha256, manifest.base_sha256);
  assert.equal(native.predicates.length, 3);
  for (const probe of native.predicates) {
    assert.equal(crypto.createHash('sha256').update(probe.source).digest('hex'), probe.sha256);
    for (const exported of [false, true]) for (const flag of [0, 1]) {
      const context = vm.createContext({...native.constants, Ꮷρ༧: flag});
      vm.runInContext('window=globalThis;ⲥ︍ߊ=globalThis;', context);
      if (exported) vm.runInContext('р̄９={};', context);
      const result = vm.runInContext('(' + probe.source + ')', context, {timeout: 500});
      assert.equal(result, exported || flag === 1, probe.function);
      assert.equal(context.Ꮷρ༧, flag);
    }
  }
});
