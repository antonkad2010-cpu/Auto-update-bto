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
