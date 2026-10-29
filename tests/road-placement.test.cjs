const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..'),manifest=JSON.parse(fs.readFileSync(path.join(root,'patches/responsive.json'),'utf8')),fixture=require('./fixtures/native-road-placement.json');
const patch=manifest.patches.find(p=>p.id==='ilm-road-placement-collision');
function setup(enabled=true){
 assert.equal(fixture.base_sha256,manifest.base_sha256);assert.equal(patch.anchor,fixture.prefix);
 const cell={о‍༢:0,εѕ̉:0,ⲅо᠌:null},items=[];items[7]={detail:{ⲅо᠌:'road'}};items[8]={detail:{ⲅо᠌:'wall'}};
 const context=vm.createContext({...fixture.constants,__responsiveMod:{settings:{BuildOnRoadEnabled:enabled}},ﾠ᠌ᴘ:{ﾠރ͡:7},ㅤ༤༡:[[cell]],ιᄅᴄ:items,οᚃո:12});
 // Execute the unchanged native collision prefix or its replacement; all
 // renderer code following this prefix is left byte-for-byte unchanged.
 const render=vm.runInContext('('+patch.replacement+'})',context),original=vm.runInContext('('+fixture.prefix+'})',context);
 const entity=(id,pid=0)=>({Іࡈ５:id<<7,ᴀܛ٤:0,αބ̞:0,ᴘ४１:pid});
 return {cell,context,render,original,entity};
}
test('road coverage does not mark an otherwise empty cell occupied when enabled',()=>{
 const f=setup();f.render(f.entity(7));assert.equal(f.cell.о‍༢,0);assert.equal(f.cell.εѕ̉,0);assert.equal(f.cell.ⲅо᠌,null);
});
test('walls and owners remain blocking with or without a road and in either order',()=>{
 for(const order of [[7,8],[8,7]]){const f=setup();for(const id of order)f.render(f.entity(id,id===8?22:0));assert.equal(f.cell.о‍༢,12);assert.equal(f.cell.εѕ̉,22);assert.equal(f.cell.ⲅо᠌,'wall');}
});
test('turning the feature off restores the original native road bookkeeping',()=>{
 const f=setup(false);f.render(f.entity(7));const patched={...f.cell};f.cell.о‍༢=0;f.cell.εѕ̉=0;f.cell.ⲅо᠌=null;f.original(f.entity(7));assert.deepEqual(f.cell,patched);
 f.context.__responsiveMod.settings.BuildOnRoadEnabled=true;f.cell.о‍༢=0;f.render(f.entity(7));assert.equal(f.cell.о‍༢,0);
});

test('full native preview and mouse handler send construction only for allowed road cells',()=>{
 const native=require('./fixtures/native-build-control.json');assert.equal(native.base_sha256,manifest.base_sha256);
 for(const zid of [0,1,2])for(const scenario of ['allowed-road','disabled-road','road-with-wall']){
  const enabled=scenario!=='disabled-road',self={id:1,ε︁ᚂ:1,ⲟ１ߒ:10,ᴑ６ࠄ:0,α०ᚂ:0,ⲣ٢ܜ:0,ι٦օ:0,а༤̘:-1,click:0},sent=[];
  const cell={о‍༢:0,εѕ̉:0,ⲅо᠌:null,ᴘ४１:0,ᴉⲅ１:0},item={І१ᄃ:0,ᴀᚃ६:0,Іࠃո:[0,0,0,0],ε٠ᄀ:[0,0,0,0],ᴉᴎ๗:zid,detail:{ⲅо᠌:0},с०ᄃ:undefined,ᴏ٠ࡃ:'red',ⲟ１ߒ:'green'};
  const context=vm.createContext({...native.constants,...fixture.constants,__responsiveMod:{settings:{BuildOnRoadEnabled:enabled}},ﾠ᠌ᴘ:{ﾠރ͡:7},еܞ︌:{ᅠᏧ‍:self,ᴎ︃ᄉ:[]},ρ̃५:{angle:0,state:1,ᅟࡉ︊:1,ⲣ９͡:2},ιᄅᴄ:{7:{detail:{ⲅо᠌:'road'}},10:item},ㅤ༤༡:[[{},cell,{}],[{},{},{}],[{},{},{}]],р️ߓ:Math.PI/2,ϲ̇ܓ:100,օ̞͠:50,і̉е:0,а᠋ᄄ:0,ᅟո༣:3,еᚁࠂ:3,οᚃո:123,е१ᚇ:{ᴄ๔ϲ:99},ᅟމ༣:[0,0,0,0],і̏ᴏ:{ԁ༩̝:0},αރᄈ:'stub',ᴘᚉ٦:{ᴑ̸ᴘ(){},ѕ༩ރ(){return{ԁ༩̝:0}}},οܙ̊:undefined,о̃༩:{ᴎᚂρ(s){sent.push(JSON.parse(s))}}});
  const stamp=vm.runInContext('('+patch.replacement+'})',context);
  stamp({Іࡈ５:7<<7,ᴀܛ٤:0,αބ̞:1,ᴘ४１:0});
  if(scenario==='road-with-wall')stamp({Іࡈ５:10<<7,ᴀܛ٤:0,αބ̞:1,ᴘ४１:22});
  vm.runInContext('('+native.previewSource+')()',context);
  vm.runInContext('('+native.clickSource+')()',context);
  // Native layer-2 furniture can overlap a wall; retaining its occupied
  // cell must preserve that native layering rule rather than invent a ban.
  const allowed=scenario==='allowed-road'||(zid===2&&scenario==='road-with-wall');
  assert.equal(self.օⲥᚁ,allowed?1:0,scenario+' zid='+zid);
  assert.deepEqual(sent,allowed?[[14,0,0,1]]:[],scenario+' zid='+zid);
 }
});
