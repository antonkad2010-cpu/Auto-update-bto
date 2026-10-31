const {test}=require('node:test');
const assert=require('node:assert/strict');
const {equivalence,remap,rewrite}=require('../tools/remap.cjs');
const {remapChecks}=require('../tools/remap.cjs');
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
test('exact reviewed nodes and the diagnostic binding follow a proven rename',()=>{
  const before='var α=function(){return β;};var β=0;';
  const after='var γ = function () { return δ; };var δ=0;';
  const spec={base_sha256:hash(before),integrity_name:'β',checks:[{id:'integrity',kind:'variable-initializer',name:'α',sha256:hash('function(){return β;}')}]};
  const result=remapChecks(before,after,spec);
  assert.equal(result.base_sha256,hash(after));assert.equal(result.integrity_name,'δ');
  assert.equal(result.checks[0].name,'γ');assert.equal(result.checks[0].sha256,hash('function () { return δ; }'));
  assert.throws(()=>remapChecks(before,after.replace('δ=0','δ=1'),spec),/changed/);
});
