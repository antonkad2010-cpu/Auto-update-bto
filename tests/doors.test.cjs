const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const runtime=fs.readFileSync(path.join(__dirname,'../mod/responsive.js'),'utf8');
function setup(v={x:0,y:0,scale:1},rect={left:0,top:0,width:1000,height:1000}){
 const sent=[],listeners={};let chatting=false;
 const can={width:1000,height:1000,getBoundingClientRect(){return rect},addEventListener(){},removeEventListener(){}};
 const door=(id,x,y)=>({id,ᴘ४１:7,x,y,αބ̞:Math.floor(x/100),ᴀܛ٤:Math.floor(y/100),Іࡈ５:5<<7,е̝ހ:0});
 const doors=[door(10,250,250),door(11,350,250)];
 const B={network:{state:1,ᴎᚂρ(s){sent.push(JSON.parse(s))},ѕ᠋༢(){},ρ٨٨(){}},world:{ᅠᏧ‍:{id:1,x:250,y:250}},categories:{player:0,loot:1},entities:{border:[null,null,null,{border:2,ⲣᴑᴏ:[0,1]}],ᴎ̂２:[null,null,null,doors]},items:[],graphics:{options:{}},view:()=>({...v,ctx:{canvas:can}}),chatActive:()=>chatting};
 B.items[5]={ࡀ︂̄:15};
 const context=vm.createContext({B,window:{addEventListener(n,f){listeners[n]=f},removeEventListener(){},requestAnimationFrame(){},setInterval(){}},document:{readyState:'loading',getElementById(){return can}},localStorage:{getItem(){}},performance:{now:()=>0},console});
 const api=vm.runInContext(runtime+'\n__installDevastMod(B)',context);
 return {api,sent,doors,B,listeners,chat(v){chatting=v},event(x=350,y=250,button=2){return {clientX:x,clientY:y,button,target:{closest(){return null}},preventDefault(){this.prevented=true},stopImmediatePropagation(){this.stopped=true}}}};
}
test('right click selects adjacent door while player stands inside a different door, before first entity collection',()=>{
 const f=setup();assert.equal(f.api.records.length,0);const e=f.event();f.listeners.mousedown(e);
 assert.deepEqual(f.sent,[[15,11,7]]);assert.equal(e.stopped,true);
 const up=f.event();f.listeners.mouseup(up);assert.equal(up.stopped,true);assert.equal(f.sent.length,1);
});
test('click targeting respects camera, zoom, CSS offset and backing resolution',()=>{
 const f=setup({x:-100,y:-200,scale:2},{left:20,top:40,width:500,height:500});
 assert.equal(f.api.openUnderMouse(f.event(270,90)),true);assert.deepEqual(f.sent,[[15,11,7]]);
});
test('live removal, chat, disabled setting and clicks outside canvas never open the previous door',()=>{
 const f=setup();f.doors[1].е̝ހ=1;assert.equal(f.api.openUnderMouse(f.event()),false);
 f.doors[1].е̝ހ=0;f.chat(true);assert.equal(f.api.openUnderMouse(f.event()),false);f.chat(false);
 f.api.setSetting('OpenEverythingByClick',false);assert.equal(f.api.openUnderMouse(f.event()),false);f.api.setSetting('OpenEverythingByClick',true);
 assert.equal(f.api.openUnderMouse(f.event(1200,250)),false);assert.equal(f.sent.length,0);
});
test('door under cursor takes precedence over a container on the same tile',()=>{
 const f=setup();f.B.items[6]={ࡀ︂̄:16};f.doors.unshift({...f.doors[1],id:20,Іࡈ５:6<<7});f.B.entities.border[3]={border:3,ⲣᴑᴏ:[0,1,2]};
 f.api.openUnderMouse(f.event());assert.deepEqual(f.sent,[[15,11,7]]);
});

test('resource subtype bits cannot impersonate doors or shadow a real door',()=>{
 for(const type of [0,1,2,7,8,9,10,11,12,13]){
  const f=setup();f.B.entities.border[3]=null;f.B.entities.border[type]={border:2,ⲣᴑᴏ:[0,1]};f.B.entities.ᴎ̂２[type]=f.doors;
  assert.equal(f.api.openUnderMouse(f.event()),false,'non-construction type '+type);assert.equal(f.sent.length,0);
 }
 const f=setup();f.B.entities.border[8]={border:1,ⲣᴑᴏ:[0]};f.B.entities.ᴎ̂２[8]=[{...f.doors[1],id:999}];
 f.api.openUnderMouse(f.event());assert.deepEqual(f.sent,[[15,11,7]]);
});
test('native construction layers and ILM rounded tile boundaries select the intended door',()=>{
 for(const type of [3,4,5,6]){
  const f=setup();f.B.entities.border[type]=f.B.entities.border[3];f.B.entities.ᴎ̂２[type]=f.doors;if(type!==3)f.B.entities.border[3]=null;
  f.api.openUnderMouse(f.event(299.49,250));f.api.openUnderMouse(f.event(299.51,250));
  assert.deepEqual(f.sent,[[15,10,7],[15,11,7]],'construction layer '+type);
 }
});

test('door packets match the original ILM callback across empty cells and pixel boundaries',()=>{
 const oracle=require('./fixtures/ilm-door-oracle.cjs');
 for(const x of [100,249.49,250,299.49,299.5,299.51,300,350,399.49,399.51,700]){
  const f=setup(),expected=[];
  oracle({state:1,SendWsMessage:p=>expected.push(p)},{OpenAndCloseDoors:true},{mouseMapCords:{x,y:250}},{'2:2':[10,7],'3:2':[11,7]})({button:2});
  f.api.openUnderMouse(f.event(x,250));assert.deepEqual(f.sent,expected,'cursor x='+x);
 }
});
