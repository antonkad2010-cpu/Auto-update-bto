const {test} = require('node:test');
const assert = require('node:assert/strict');
const {translate} = require('../tools/translate_payload.cjs');

test('payload translation changes identifiers and exact property keys, preserving labels', () => {
  const source = 'var α=world;α.β();α["β"]();const label="text β";α[γ]();';
  const result = translate(source, {identifiers: {α: 'δ', β: 'ε'}, constants: {γ: 'send'}});
  assert.equal(result, 'var δ=world;δ.ε();δ["ε"]();const label="text β";δ[("send")]();');
});

test('malformed names and folding constants as literal properties stop a build', () => {
  assert.throws(() => translate('obj.α()', {constants: {α: 5}}), /Constant used as a property/);
  assert.throws(() => translate('α()', {identifiers: {α: 'x;evil()'}}), /Invalid binding/);
});
