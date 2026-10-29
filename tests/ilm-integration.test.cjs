const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const runtime=fs.readFileSync(path.join(root,'mod/responsive.js'),'utf8');
const packetFixture=require('./fixtures/ilm-current-packet.json');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'patches/responsive.json'),'utf8'));

function setup(){
  const sent=[],timers=[];let nativeCalls=0;
  const network={state:1,ᴎᚂρ(s){sent.push(JSON.parse(s))},ѕ᠋༢(){nativeCalls++},ρ٨٨(){nativeCalls++}};
  const world={ᅠᏧ‍:{id:1},ᴎ︃ᄉ:Array.from({length:121},()=>({а༤̘:-1})),ﾠࡅ‍:[]};
  const B={network,world,categories:{player:0,loot:1,projectile:2}};
  const window={addEventListener(){},removeEventListener(){},requestAnimationFrame(){return 1},cancelAnimationFrame(){},setInterval(f,ms){timers.push({f,ms});return timers.length},clearInterval(){}};
  const context=vm.createContext({window,B,console,performance:{now:()=>0},localStorage:{getItem(){return null},setItem(){}},document:{readyState:'loading',getElementById(){return null}}});
  const api=vm.runInContext(runtime+'\n__installDevastMod(B)',context);
  let decoder=packetFixture.source;
  assert.equal(packetFixture.base_sha256,manifest.base_sha256);
  for(const id of ['ilm-track-entity-removal','ilm-track-entity-update']){
    const patch=manifest.patches.find(p=>p.id===id);assert.ok(patch);assert.equal(decoder.split(patch.anchor).length,2);
    decoder=decoder.replace(patch.anchor,patch.mode==='after'?patch.anchor+patch.replacement:patch.replacement);
  }
  const noOp=()=>{};
  Object.assign(context,packetFixture.constants,{
    __responsiveMod:api,
    ι‌̵:{get(){return {}},remove:noOp,е︀ࡉ:noOp},
    εᚇ๓:Array.from({length:30},()=>({ο６ᴎ:noOp})),
    ոހߑ:noOp,
    ᅟ̝́:noOp
  });
  const decode=vm.runInContext('('+decoder+')',context);
  function packet(rows,key=37){
    const buffer=new ArrayBuffer(2+rows.length*20),bytes=new Uint8Array(buffer),words=new Uint16Array(buffer);
    rows.forEach((r,i)=>{let j=1+i*10,k=2+i*20;bytes[k]=r.pid;bytes[k+1]=r.uid||0;bytes[k+3]=r.type||0;words[j+2]=r.active===false?0:1;words[j+3]=r.id||0;words[j+4]=r.drawX??0;words[j+5]=r.drawY??0;words[j+6]=r.x||0;words[j+7]=r.y||0;});
    for(let i=1;i<bytes.length;i++)bytes[i]^=key;
    decode(buffer,bytes,key);
  }
  api.setSetting('AimBotEnabled',true);
  return {api,B,sent,packet,tick:timers[0].f,network,get nativeCalls(){return nativeCalls}};
}

test('current encrypted game packets feed ILM destination history and outgoing aim',()=>{
  const f=setup();
  f.packet([{pid:1,x:500,y:500,drawX:490,drawY:490},{pid:2,x:800,y:500,drawX:100,drawY:100}]);
  f.packet([{pid:2,x:820,y:510,drawX:110,drawY:110}]);
  const p=f.api.targets.players[2];assert.equal(p.x,820);assert.deepEqual(Array.from(p.prevX),[800,-1,-1]);
  f.api.targets.mouseMapCords={x:820,y:510};f.tick();
  assert.equal(f.api.aim.targetPlayer.id,2);assert.equal(f.sent[0][0],6);
  const line=f.api.targets.lines[0],factor=Math.hypot(320,10)/300+.1;
  assert.equal(line.x2,820+factor*20);assert.equal(line.y2,510+factor*10);
  assert.equal(f.sent[0][1],(Math.round(Math.atan2(line.y2-500,line.x2-500)*180/Math.PI)+360)%360);
});

test('stationary packet, native angle ownership, removal and shutdown behave correctly',()=>{
  const f=setup();f.packet([{pid:1,x:500,y:500},{pid:2,x:800,y:500}]);f.packet([{pid:2,x:820,y:510}]);f.packet([{pid:2,x:820,y:510}]);
  f.api.targets.mouseMapCords={x:820,y:510};f.tick();assert.equal(f.api.targets.lines[0].x2,820);assert.equal(f.api.targets.lines[0].y2,510);
  // Suppression is tested against the actual native angle handlers below.
  f.packet([{pid:2,active:false}]);assert.equal(f.api.targets.players[2].active,false);assert.equal(f.api.targets.lines[0].x1,-1);
  f.api.setSetting('AimBotEnabled',false);const n=f.sent.length;f.tick();assert.equal(f.sent.length,n);f.network.ѕ᠋༢();assert.equal(f.nativeCalls,1);
  f.api.dispose();f.network.ρ٨٨();assert.equal(f.nativeCalls,2);
});

test('ghoul UID uses the same native packet bridge',()=>{
  const f=setup();f.packet([{pid:1,x:500,y:500},{pid:0,uid:7,type:13,x:550,y:600}]);f.api.setSetting('target','ghouls');f.api.targets.mouseMapCords={x:550,y:600};f.tick();assert.equal(f.api.aim.targetPlayer.id,7);f.packet([{pid:0,uid:7,type:13,active:false}]);assert.equal(f.api.targets.ghouls[7].active,false);
});

test('500 packet-driven ILM scenarios match the original selection, lead line and autofire condition',()=>{
  const oracle=require('./fixtures/ilm-aim-oracle');const f=setup();
  f.packet([{pid:1,x:1000,y:1000},{pid:2,x:1300,y:1000},{pid:3,x:900,y:1500},{pid:0,uid:7,type:13,x:600,y:800}]);
  const targets={...f.api.targets,players:Array.from(f.api.targets.players,x=>x||{active:false}),ghouls:Array.from(f.api.targets.ghouls,x=>x||{active:false}),getPlayerById(id){return this.players[id]}};
  const originalWorld={PLAYER:{id:1,team:-1},players:Array.from({length:121},()=>({team:-1}))};
  const original=oracle(f.api.settings,originalWorld,targets);
  let seed=211;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
  for(let i=0;i<500;i++){
    const rows=[{pid:2,x:500+Math.floor(random()*1000),y:500+Math.floor(random()*1000)},{pid:3,x:500+Math.floor(random()*1000),y:500+Math.floor(random()*1000)},{pid:0,uid:7,type:13,x:500+Math.floor(random()*1000),y:500+Math.floor(random()*1000)}];
    f.packet(rows);f.api.settings.target=['players','ghouls','all'][i%3];f.api.settings.lockId=i%5===0?2:-1;f.api.settings.mouseFovEnable=i%2===0;f.api.settings.mouseFov=i%7===0?50:12345;f.api.settings.distanceCoefficient=10+Math.floor(random()*991);f.api.settings.offsetCoefficient=random()*3;f.api.targets.mouseMapCords={x:random()*2000,y:random()*2000};
    targets.mouseMapCords=f.api.targets.mouseMapCords;const expected=original.resolve();const expectedLine=Array.from(['x1','y1','x2','y2'],k=>f.api.targets.lines[0][k]);
    const actual=f.api.aim.resolve();assert.equal(actual,expected,'angle case '+i);assert.equal(f.api.aim.targetPlayer,original.targetPlayer,'target case '+i);assert.equal(f.api.aim.wannaFire(),original.wannaFire(),'fire case '+i);assert.deepEqual(['x1','y1','x2','y2'].map(k=>f.api.targets.lines[0][k]),original.targetPlayer ? expectedLine : [-1,-1,-1,-1],'line case '+i);
  }
});

test('clan exclusion preserves the original team filter with current clan generations',()=>{
  const oracle=require('./fixtures/ilm-aim-oracle');const f=setup();f.packet([{pid:1,x:1000,y:1000},{pid:2,x:1100,y:1000},{pid:3,x:1200,y:1000}]);
  f.B.world.ﾠࡅ‍[5]={ոᚄރ:99};for(const id of [1,2])Object.assign(f.B.world.ᴎ︃ᄉ[id],{а༤̘:5,ᴌ̗ⲟ:99});
  f.api.targets.mouseMapCords={x:1100,y:1000};const targets={...f.api.targets,players:Array.from(f.api.targets.players,x=>x||{active:false}),getPlayerById(id){return this.players[id]}};
  const world={PLAYER:{id:1,team:5},players:Array.from({length:121},(_,i)=>({team:i===1||i===2?5:-1}))};const original=oracle(f.api.settings,world,targets);
  assert.equal(f.api.aim.resolve(),original.resolve());assert.equal(f.api.aim.targetPlayer.id,3);
});

test('native angle functions update their cache while only their send is suppressed',()=>{
  const native=fs.readFileSync(path.join(root,'mod/ilm-native-angle.js'),'utf8');
  const fixture=require('./fixtures/ilm-native-angle.json');const sent=[];
  const context=vm.createContext({...fixture.constants,__responsiveMod:{settings:{AimBotEnabled:true},aim:{targetPlayer:{active:true}}},ρ̃५:{angle:.5},ϲ１٤:1000,о̟̏:0,օ‌އ:0,оࠄ٠:0,ﾠܓࡃ:0,ο̗̇:0,ᴄ༨७:x=>sent.push(x),ᴇ٣٠:{ոᄃо:x=>x}});
  vm.runInContext(native,context);vm.runInContext('ѕ᠋༢()',context);
  assert.equal(context.օ‌އ,.5);assert.equal(context.о̟̏,1000);assert.equal(sent.length,0);
  context.__responsiveMod.aim.targetPlayer=null;context.ρ̃५.angle=1;context.ϲ１٤=2000;vm.runInContext('ρ٨٨()',context);assert.equal(sent.length,1);assert.equal(sent[0][0],6);
  context.__responsiveMod.settings.AimBotEnabled=false;context.ρ̃५.angle=1.5;context.ϲ１٤=3000;vm.runInContext('ρ٨٨()',context);assert.equal(sent.length,2);
});

test('large sparse IDs do not cause array scans during aim; ties keep original order',()=>{
  const f=setup();
  f.api.trackPacket(0,1,0,500,500,true);
  f.api.trackPacket(13,0,65000,600,500,true);
  f.api.trackPacket(13,0,7,400,500,true);
  f.api.settings.target='ghouls';f.api.settings.mouseFovEnable=false;
  f.api.targets.ghouls[Symbol.iterator]=()=>{throw Error('scanned sparse ghoul array')};
  f.api.aim.resolve();assert.equal(f.api.aim.targetPlayer.id,7);
  const target=f.api.targets.ghouls[7],history=target.prevX;
  f.api.trackPacket(13,0,7,390,500,true);assert.equal(target.prevX,history);assert.equal(history[0],400);
  f.api.trackPacket(13,0,7,0,0,false);f.api.aim.resolve();assert.equal(f.api.aim.targetPlayer.id,65000);
  f.api.aim.onDeath();f.api.aim.resolve();assert.equal(f.api.aim.targetPlayer,null);
});

test('bullet speed scales lead monotonically; line and sent angle use the same prediction',()=>{
  const f=setup();f.packet([{pid:1,x:500,y:500},{pid:2,x:1000,y:500}]);f.packet([{pid:2,x:1000,y:520}]);
  f.api.settings.lockId=2;const leads=[];let lastNetworkAngle=null;
  for(const speed of [1,2,4,8,15]){
    f.api.setSetting('bulletSpeedCoefficient',speed);f.sent.length=0;f.tick();
    const line=f.api.targets.lines[0],lead=line.y2-520;
    assert.ok(lead>0);leads.push(lead);assert.equal(line.x1,500);assert.equal(line.y1,500);
    // Use the actual distance, including the latest target Y.
    const expected=(Math.hypot(500,20)/300*(4/speed)+.1)*20;
    assert.ok(Math.abs(lead-expected)<1e-9);
    const networkAngle=(Math.round(Math.atan2(line.y2-line.y1,line.x2-line.x1)*180/Math.PI)+360)%360;
    assert.deepEqual(f.sent,networkAngle===lastNetworkAngle?[]:[[6,networkAngle]]);lastNetworkAngle=networkAngle;
  }
  assert.ok(leads.every((value,i)=>i===0||value<leads[i-1]));
});

test('losing the cursor target clears the line and stops stale angle/autofire packets',()=>{
  const f=setup();f.packet([{pid:1,x:500,y:500},{pid:2,x:800,y:500}]);f.packet([{pid:2,x:800,y:520}]);
  f.api.targets.mouseMapCords={x:800,y:520};f.tick();assert.equal(f.api.aim.targetPlayer.id,2);
  f.api.setSetting('autoFire',true);f.api.setSetting('mouseFov',1);f.api.targets.mouseMapCords={x:0,y:0};
  f.sent.length=0;f.tick();assert.equal(f.api.aim.targetPlayer,null);assert.equal(f.sent.length,0);assert.equal(f.api.targets.lines[0].x1,-1);
});

test('ghoul UIDs are independent of player IDs and player clans',()=>{
  const f=setup();f.packet([{pid:1,x:500,y:500},{pid:0,uid:1,type:13,x:600,y:500}]);
  f.api.setSetting('target','ghouls');f.api.settings.mouseFovEnable=false;f.tick();assert.equal(f.api.aim.targetPlayer.id,1);assert.equal(f.api.aim.targetPlayer,f.api.targets.ghouls[1]);
});

test('invalid aim coefficients cannot introduce infinite or inverted predictions',()=>{
  const f=setup();for(const [key,values]of Object.entries({distanceCoefficient:[0,-1,1001],bulletSpeedCoefficient:[0,-1,16],offsetCoefficient:[-1,4]})){
    const previous=f.api.settings[key];for(const value of values)assert.throws(()=>f.api.setSetting(key,value));assert.equal(f.api.settings[key],previous);
  }
});

test('unchanged aim is sent once, while changed prediction still updates the network angle',()=>{
 const f=setup();f.packet([{pid:1,x:500,y:500},{pid:2,x:800,y:500}]);
 f.api.targets.mouseMapCords={x:800,y:500};
 for(let i=0;i<20;i++)f.tick();
 assert.deepEqual(f.sent,[[6,0]]);assert.equal(f.api.diagnostics.deduplicatedAngles,19);
 f.packet([{pid:2,x:800,y:520}]);f.tick();
 const line=f.api.targets.lines[0];
 assert.equal(f.sent.length,2);assert.equal(f.sent[1][1],(Math.round(Math.atan2(line.y2-line.y1,line.x2-line.x1)*180/Math.PI)+360)%360);
});

test('manual aim handoff invalidates cached angle before identical prediction is reacquired',()=>{
 const f=setup();f.packet([{pid:1,x:500,y:500},{pid:2,x:800,y:500}]);f.api.targets.mouseMapCords={x:800,y:500};f.tick();
 // Native mouse input can change the server angle after a target disappears.
 // Remove and re-add between ticks, so no inactive tick can reset the cache.
 f.packet([{pid:2,active:false}]);f.sent.push([6,90]);f.packet([{pid:2,x:800,y:500}]);f.tick();
 assert.deepEqual(f.sent,[[6,0],[6,90],[6,0]]);
 f.api.setSetting('AimBotEnabled',false);f.sent.push([6,180]);f.api.setSetting('AimBotEnabled',true);f.tick();
 assert.deepEqual(f.sent.slice(-2),[[6,180],[6,0]]);
 f.api.targets.mouseMapCords={x:0,y:0};f.api.setSetting('mouseFov',1);f.tick();f.sent.push([6,270]);
 f.api.targets.mouseMapCords={x:800,y:500};f.tick();assert.deepEqual(f.sent.slice(-2),[[6,270],[6,0]]);
});

test('autofire consumes a direction-change update once, without suppressing a later change',()=>{
 const f=setup();f.packet([{pid:1,x:500,y:500},{pid:2,x:800,y:500}]);f.packet([{pid:2,x:820,y:500}]);f.packet([{pid:2,x:800,y:500}]);
 f.api.targets.mouseMapCords={x:800,y:500};f.api.setSetting('autoFire',true);
 assert.equal(f.api.aim.resolve(),0);assert.equal(f.api.aim.wannaFire(),true);
 for(let i=0;i<20;i++)f.tick();
 assert.deepEqual(f.sent,[[6,0],[4],[5]]);
 f.packet([{pid:2,x:820,y:500}]);f.tick();assert.deepEqual(f.sent.slice(-2),[[4],[5]]);assert.equal(f.sent.length,5);
 f.packet([{pid:2,x:840,y:500}]);f.tick();assert.equal(f.sent.length,5);
});
