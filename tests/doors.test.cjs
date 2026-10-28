const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const runtime=fs.readFileSync(path.join(__dirname,'../mod/responsive.js'),'utf8');
function setup(v={x:0,y:0,scale:1},rect={left:0,top:0,width:1000,height:1000}){
 const sent=[],listeners={};let chatting=false;
 const can={width:1000,height:1000,getBoundingClientRect(){return rect},addEventListener(){},removeEventListener(){}};
 const door=(id,x,y)=>({id,ᴘ४１:7,x,y,αބ̞:Math.floor(x/100),ᴀܛ٤:Math.floor(y/100),Іࡈ５:5<<7,е̝ހ:0});
 const doors=[door(10,250,250),door(11,350,250)];
 const B={network:{state:1,ᴎᚂρ(s){sent.push(JSON.parse(s))},ѕ᠋༢(){},ρ٨٨(){}},world:{ᅠᏧ‍:{id:1,x:250,y:250}},categories:{player:0,loot:1},entities:{border:[null,null,{border:2,ⲣᴑᴏ:[0,1]}],ᴎ̂２:[null,null,doors]},items:[],graphics:{options:{}},view:()=>({...v,ctx:{canvas:can}}),chatActive:()=>chatting};
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
 const f=setup();f.B.items[6]={ࡀ︂̄:16};f.doors.unshift({...f.doors[1],id:20,Іࡈ５:6<<7});f.B.entities.border[2]={border:3,ⲣᴑᴏ:[0,1,2]};
 f.api.openUnderMouse(f.event());assert.deepEqual(f.sent,[[15,11,7]]);
});

test('rendered panel is selected after moving outside its original tile, including rotation',()=>{
 const f=setup(),frame={};f.B.renderFrame=()=>frame;
 f.api.captureDoor(f.doors[1],frame,{},450,250,Math.PI/2,0,0,100,50);
 assert.equal(f.api.openUnderMouse(f.event(425,300)),true);assert.deepEqual(f.sent,[[15,11,7]]);
});
test('transparent old tile and stale rendered door region do not select or toggle a different door',()=>{
 const f=setup(),frame={};f.B.renderFrame=()=>frame;
 f.api.captureDoor(f.doors[1],frame,{},450,250,0,-50,-50,100,100);
 assert.equal(f.api.openUnderMouse(f.event(350,250)),false);
 f.B.renderFrame=()=>({});assert.equal(f.api.openUnderMouse(f.event(450,250)),false);assert.equal(f.sent.length,0);
});
test('a cursor miss is consumed so native nearest-door fallback cannot affect the door under the player',()=>{
 const f=setup();const e=f.event(850,850);f.listeners.mousedown(e);assert.equal(e.stopped,true);assert.equal(f.sent.length,0);
});
test('pending toggle is not resent; server state change is required to report success',()=>{
 const f=setup();f.doors[1].state=0;
 f.api.openUnderMouse(f.event());f.api.openUnderMouse(f.event());assert.equal(f.sent.length,1);
 assert.match(f.api.interaction.status,/ожидается сервер/);
 // Exercise the acknowledgement logic through the actual runtime step without connecting.
 f.B.entities.border=[];f.B.view=()=>({x:0,y:0,scale:1,ctx:null});f.B.graphics.options={};
 f.doors[1].state=16;
 // Missing overlay DOM is fine: no canvas is available to draw in this fixture.
 f.B.synchronizedRender=true;f.api.settings.ShowBuildingOwner=false;f.api.step(100);
 assert.equal(f.api.interaction.status,'Дверь открыта');assert.equal(f.api.interaction.pending,null);
});

test('actual patched native door renderer forwards the exact sprite transform used for drawing',()=>{
 const draw=[],capture=[],frame={},entity={state:0,ᴘ४１:0,ܐρ͡:0,ᴉ७٥:0,ᴉⲅᄄ:0,ⲅ̂ࠅ:0,x:350,y:250};
 const image={width:200,height:200,ԁ༩̝:1};
 const descriptor={angle:Math.PI/2,ᴑ๗օ:{р᠌٧:image},с๘ᴄ:10,ρⲟ७:20};
 const context=vm.createContext({...require('./fixtures/native-door-constants.json'),console,
  __responsiveView:frame,__responsiveMod:{captureDoor(...args){capture.push(args)}},
  ϲᄉ᠋(){return 0},αߑކ:{ο५ࡇ:{ᴌܗހ:x=>x}},
  ᴎ︁ࠁ:16,ρ̟０:1.5,і̉е:20,а᠋ᄄ:30,р️ߓ:Math.PI/2,
  ܐ४ⲅ:[1,0,-1,0],ᴘ７ܙ:[0,1,0,-1],
  ᴘᚉ٦:{Ꮷᄄ︎(...args){draw.push(args)}},descriptor,entity});
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../mod/native-door-renderer.js'),'utf8')+'\nᅟ३༦(descriptor,entity,0,0,1,1)',context);
 assert.equal(draw.length,1);assert.equal(capture.length,1);assert.equal(capture[0][0],entity);assert.equal(capture[0][1],frame);assert.deepEqual(capture[0].slice(2),draw[0]);
});

test('overlapping painted panels choose the visible top door, not the one nearer the player',()=>{
 const f=setup(),frame={};f.B.renderFrame=()=>frame;
 f.api.captureDoor(f.doors[0],frame,{},350,250,0,-50,-50,100,100);
 f.api.captureDoor(f.doors[1],frame,{},350,250,0,-50,-50,100,100);
 f.api.openUnderMouse(f.event());assert.deepEqual(f.sent,[[15,11,7]]);
});
