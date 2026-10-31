// Conservative whole-program token equivalence. Never execute downloaded JS.
const acorn = require('acorn');
const fs = require('node:fs');
const zlib = require('node:zlib');
const crypto = require('node:crypto');
const path = require('node:path');
const {translate} = require('./translate_payload.cjs');
const digest = s => crypto.createHash('sha256').update(s).digest('hex');
function tokens(s) {
  return [...acorn.tokenizer(s, {ecmaVersion:'latest',allowHashBang:true})];
}
const obfuscated = s => /[^\x00-\x7f]/.test(s);
function equivalence(before, after) {
  const a=tokens(before), b=tokens(after), names=new Map(), reverse=new Map();
  if(a.length!==b.length) throw Error('Token count changed; semantic review required');
  for(let i=0;i<a.length;i++) {
    const x=a[i], y=b[i], kind=x.type.label;
    if(kind!==y.type.label) throw Error('Token structure changed at '+i);
    if(kind==='name' && obfuscated(x.value) && obfuscated(y.value)) {
      if(names.has(x.value) && names.get(x.value)!==y.value || reverse.has(y.value) && reverse.get(y.value)!==x.value)
        throw Error('Identifier mapping is not bijective');
      names.set(x.value,y.value);reverse.set(y.value,x.value);
    } else if (before.slice(x.start,x.end)!==after.slice(y.start,y.end)) {
      throw Error('Literal or protected identifier changed at '+i);
    }
  }
  return {a,b,names};
}
function rewrite(s,names) {
  const changes=[];
  for(const t of tokens(s)) {
    if(t.type.label==='name' && names.has(t.value)) changes.push([t.start,t.end,names.get(t.value)]);
    // Runtime sometimes accesses obfuscated properties through quoted keys.
    if(t.type.label==='string' && names.has(t.value)) changes.push([t.start,t.end,JSON.stringify(names.get(t.value))]);
  }
  for(const [start,end,value] of changes.reverse()) s=s.slice(0,start)+value+s.slice(end);
  return s;
}
function remap(before,after,spec,root) {
  if(digest(before)!==spec.base_sha256) throw Error('Baseline hash mismatch');
  const {a,b,names}=equivalence(before,after);
  const starts=new Map(a.map((t,i)=>[t.start,i])), ends=new Map(a.map((t,i)=>[t.end,i]));
  const result=structuredClone(spec);
  for(const p of result.patches) {
    if(!p.literal || p.variables) throw Error('Only literal audited patches are supported');
    const offset=before.indexOf(p.anchor);
    if(offset<0 || before.indexOf(p.anchor,offset+1)!==-1) throw Error('Baseline anchor is not unique: '+p.id);
    const lo=starts.get(offset), hi=ends.get(offset+p.anchor.length);
    if(lo===undefined || hi===undefined) throw Error('Anchor must span complete tokens: '+p.id);
    p.anchor=after.slice(b[lo].start,b[hi].end);
    if(p.replacement_files) {
      p.replacement=p.replacement_files.map(f=>{
        const file=path.resolve(root,'patches',f);
        if(!file.startsWith(path.resolve(root)+path.sep)) throw Error('Payload outside repository');
        return fs.readFileSync(file,'utf8');
      }).join('\n');
      if (spec.payload_bindings) {
        const bindingsPath = path.resolve(root, 'patches', spec.payload_bindings);
        if (!bindingsPath.startsWith(path.resolve(root) + path.sep)) throw Error('Bindings outside repository');
        p.replacement = translate(p.replacement, JSON.parse(fs.readFileSync(bindingsPath, 'utf8')));
      }
      delete p.replacement_files;
    }
    p.replacement=rewrite(p.replacement,names);
    if(p.assert_contains) p.assert_contains=rewrite(p.assert_contains,names);
  }
  result.base_sha256=digest(after);
  delete result.payload_bindings;
  result.remapping={method:'whole-program-token-equivalence',baseline_sha256:spec.base_sha256,identifiers:names.size};
  return result;
}
function remapChecks(before, after, spec) {
  if(digest(before)!==spec.base_sha256) throw Error('Reviewed baseline hash mismatch');
  const {a,b,names}=equivalence(before,after);
  const starts=new Map(a.map((t,i)=>[t.start,i])), ends=new Map(a.map((t,i)=>[t.end,i]));
  const candidates=[];
  function visit(n) {
    if(!n||typeof n!=='object') return;
    if(Array.isArray(n)){n.forEach(visit);return;}
    if(n.type==='VariableDeclarator'&&n.init) candidates.push({node:n.init,kind:'variable-initializer',name:n.id.name});
    if(n.type==='BlockStatement') candidates.push({node:n,kind:'encoded-block'});
    for(const v of Object.values(n)) if(v&&typeof v==='object') visit(v);
  }
  visit(acorn.parse(before,{ecmaVersion:'latest'}));
  const result=structuredClone(spec);
  for(const check of result.checks) {
    const found=candidates.filter(c=>c.kind===check.kind&&(!check.name||check.kind==='encoded-block'||c.name===check.name)&&digest(before.slice(c.node.start,c.node.end))===check.sha256);
    if(found.length!==1) throw Error('Reviewed check is missing or ambiguous: '+check.id);
    const node=found[0].node, lo=starts.get(node.start),hi=ends.get(node.end);
    if(lo===undefined||hi===undefined) throw Error('Reviewed check token boundary');
    const target=after.slice(b[lo].start,b[hi].end);
    check.sha256=digest(target);check.characters=target.length;
    if(check.name)check.name=names.get(check.name)||check.name;
  }
  result.base_sha256=digest(after);
  if(result.integrity_name)result.integrity_name=names.get(result.integrity_name)||result.integrity_name;
  return result;
}
module.exports={equivalence,remap,rewrite,remapChecks};
if(require.main===module) {
  try {
    const [baseline,current,manifest,out,checksPath,checksOut]=process.argv.slice(2);
    const spec=JSON.parse(fs.readFileSync(manifest,'utf8'));
    const result=remap(zlib.gunzipSync(fs.readFileSync(baseline)).toString('utf8'),fs.readFileSync(current,'utf8'),spec,path.dirname(path.dirname(path.resolve(manifest))));
    fs.writeFileSync(out,JSON.stringify(result,null,2));
    if(checksPath||checksOut) {
      if(!checksPath||!checksOut)throw Error('Both reviewed-check paths are required');
      const checks=remapChecks(zlib.gunzipSync(fs.readFileSync(baseline)).toString('utf8'),fs.readFileSync(current,'utf8'),JSON.parse(fs.readFileSync(checksPath,'utf8')));
      fs.writeFileSync(checksOut,JSON.stringify(checks,null,2));
    }
  } catch(e) {console.error('REMAP REFUSED: '+e.message);process.exitCode=1;}
}
