const {test}=require('node:test');
const assert=require('node:assert/strict');
const {equivalence,remap,rewrite}=require('../tools/remap.cjs');
const crypto=require('node:crypto');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
test('consistent Unicode identifier renaming and formatting are accepted',()=>{
  const a='var α=1; function β(){return α+1;}';
  const b='/* update */ var γ = 1; function δ () { return γ + 1; }';
  const e=equivalence(a,b);assert.equal(e.names.get('α'),'γ');
  const spec={base_sha256:hash(a),patches:[{id:'x',literal:true,anchor:'return α+1;',mode:'replace',replacement:'return α+2;'}]};
  const r=remap(a,b,spec,process.cwd());
  assert.equal(r.patches[0].anchor,'return γ + 1;');assert.equal(r.patches[0].replacement,'return γ+2;');assert.equal(r.base_sha256,hash(b));
});
test('semantic changes and ambiguous renames are refused',()=>{
  for(const [a,b] of [['var α=1;','var β=2;'],['var α=1,β=2;','var γ=1,γ=2;'],['var α=1;α++;','var β=1;γ++;'],['var α=1;','var abc=1;'],['var α=1;','var β=1;β++;']]) assert.throws(()=>equivalence(a,b));
});
test('quoted runtime bindings are translated without changing arbitrary strings',()=>{
  assert.equal(rewrite('B.α;B["α"];"label α"',new Map([['α','β']])), 'B.β;B["β"];"label α"');
});
