const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),source=fs.readFileSync(path.join(root,'mod/responsive.js'),'utf8');
function setup(){
 const sent=[],self={id:1,x:500,y:500},network={state:1,ᴎᚂρ(s){sent.push(JSON.parse(s))},ѕ᠋༢(){},ρ٨٨(){}};
 const B={network,world:{ᅠᏧ‍:self},categories:{loot:1,player:0}};
 const context=vm.createContext({B,window:{addEventListener(){},removeEventListener(){},requestAnimationFrame(){},setInterval(){}},document:{readyState:'loading',getElementById(){}},localStorage:{getItem(){},setItem(){}},performance:{now:()=>0},console});
 const api=vm.runInContext(source+'\n__installDevastMod(B)',context);api.setSetting('FAutoLootEnabled',true);
 return {api,self,sent,network,context,entity:(id=0,x=500,y=500,extra=0)=>({id,x,y,Іࡈ５:extra,е̝ހ:0})};
}
test('current fast loot matches the original ILM callback across radius, filter and connection cases',()=>{
 const f=setup(),legacySent=[];
 const oracle=require('./fixtures/ilm-fast-loot-oracle.cjs');
 const reference=oracle(f.api.settings,f.self,{get state(){return f.network.state},sendPacket(s){legacySent.push(JSON.parse(s))}},Object.fromEntries(Object.entries(f.api.loot).map(([k,v])=>[k,{get acquire(){return v.acquire},extra:v.id}])));
 // The original callback uses browser JSON directly.
 const saved=global.window;global.window={JSON};
 try{
 let seed=83;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 for(let i=0;i<500;i++){
  f.api.setSetting('FAutoLootEnabled',i%7!==0);f.api.setSetting('LootDataEnabled',i%2===0);f.api.loot.smallwood.acquire=i%3===0;f.network.state=i%13===0?64:1;
  const e=f.entity(i,500+Math.floor(rand()*500)-250,500+Math.floor(rand()*500)-250,i%4);
  f.api.fastLoot(e);reference({id:e.id,x:e.x,y:e.y,extra:e.Іࡈ５});
 }
 assert.deepEqual(f.sent,legacySent);
 }finally{global.window=saved}
});
test('exact ILM squared radius, whitelist filtering, removed objects and disabled mode',()=>{
 const f=setup();assert.equal(f.api.fastLoot(f.entity(0,690,570)),false);assert.equal(f.api.fastLoot(f.entity(0,690,569)),true);
 f.api.setSetting('LootDataEnabled',true);f.api.loot.smallwood.acquire=false;assert.equal(f.api.fastLoot(f.entity(1)),false);
 f.api.loot.smallwood.acquire=true;assert.equal(f.api.fastLoot(f.entity(1)),true);assert.equal(f.api.fastLoot(f.entity(2,500,500,99999)),false);
 assert.equal(f.api.fastLoot({...f.entity(3),е̝ހ:1}),false);f.api.setSetting('FAutoLootEnabled',false);assert.equal(f.api.fastLoot(f.entity(4)),false);
 f.api.setSetting('FAutoLootEnabled',true);f.network.state=64;assert.equal(f.api.fastLoot(f.entity(4)),false);f.network.state=1;f.self.id=0;assert.equal(f.api.fastLoot(f.entity(4)),false);
 assert.deepEqual(f.sent,[[12,0],[12,1]]);
});
test('native loop picks up every active item immediately after its native update and retries next cycle',()=>{
 const f=setup();const manifest=JSON.parse(fs.readFileSync(path.join(root,'patches/responsive.json'),'utf8'));
 const patch=manifest.patches.find(p=>p.id==='ilm-fast-loot-native-cycle');assert.ok(patch);
 const entities=Array.from({length:8},(_,i)=>f.entity(i));let updates=0;
 const context=vm.createContext({__responsiveMod:f.api,ᴉр︁:entities.length,ԁ̷４:entities,ܐࠅ́:{ⲣᴑᴏ:[7,3,6,1,5,0,4,2]},ㅤࡇ᠋(e){updates++;e.x=500;e.y=500}});
 // All entities start out of range; the hook must see the updated positions.
 for(const e of entities)e.x=10000;
 vm.runInContext(patch.replacement,context);assert.equal(updates,8);assert.deepEqual(f.sent.map(p=>p[1]),[7,3,6,1,5,0,4,2]);
 vm.runInContext(patch.replacement,context);assert.equal(f.sent.length,16);
 // Reuse a slot/ID: no pending timer can suppress the new drop.
 entities[0]=f.entity(0);vm.runInContext(patch.replacement,context);assert.equal(f.sent.length,24);
 f.api.setSetting('FAutoLootEnabled',false);vm.runInContext(patch.replacement,context);assert.equal(f.sent.length,24);
});
