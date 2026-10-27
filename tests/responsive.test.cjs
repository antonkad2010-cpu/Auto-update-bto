const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../mod/responsive.js'), 'utf8');
function fixture() {
  let retries=0, refreshes=0;
  const row=['osakasurvival1','Osaka',1,1,'osaka',0,'survival'];
  const network={state:2,ԁᴄࡃ:row,ոߒ४:[row],ᴎᚂρ(){},ѕ᠋༢(){},ρ٨٨(){},ⲅ︊ᄃ(url,cb){refreshes++;cb()}};
  const window={addEventListener(){},removeEventListener(){},requestAnimationFrame(){return 1},cancelAnimationFrame(){}};
  const document={readyState:'loading',getElementById(){return null}};
  const localStorage={getItem(){return null},setItem(){},removeItem(){throw Error('unexpected deletion')}};
  const B={network,world:{},reconnect(){retries++}};
  const context=vm.createContext({window,document,localStorage,performance:{now:()=>0},console,B});
  const api=vm.runInContext(source+'\n__installDevastMod(B)',context);
  return {api,network,get retries(){return retries},get refreshes(){return refreshes}};
}
test('reconnect refreshes the selected server and invokes the game login without clearing storage',()=>{
  const f=fixture(); f.api.step(0); f.network.state=64; f.api.step(100); f.api.step(1101);
  assert.equal(f.refreshes,1); assert.equal(f.retries,1); assert.equal(f.api.reconnect.attempts,1);
});
test('reconnect does not start if the selected server disappeared',()=>{
  const f=fixture(); f.api.step(0); f.network.state=64; f.network.ոߒ४=[]; f.api.step(100); f.api.step(1101);
  assert.equal(f.retries,0); assert.equal(f.api.reconnect.status,'Selected server unavailable');
});
test('a connection lost after entering the game is also eligible for retry',()=>{
  const f=fixture();
  // The UI may see the connected state before it sees a disconnect.
  f.network.state=1; f.api.step(0); f.network.state=64; f.api.step(100); f.api.step(1101);
  assert.equal(f.refreshes,1); assert.equal(f.retries,1);
});

test('camera snapshot keeps the render scale after the game restores its scale',()=>{
  const adapter=fs.readFileSync(require('node:path').join(__dirname,'../mod/responsive-adapter.js'),'utf8');
  const context=vm.createContext({window:{},document:{},__installDevastMod:b=>b});
  vm.runInContext('var а०̅={},εᚇ๓={},еܞ︌={},о̃༩={},ρ̃५={},ι‌̵={},ᴇ️̅={},ιᄅᴄ={},ᴘᚉ٦={},ᴉ२ߋ={},ρⲅ̶=0,ιܒ̷=1,ⲟ２ܖ=2,ρ̟０=1;',context);
  vm.runInContext(adapter,context);
  vm.runInContext('__responsiveView={x:50,y:80,scale:2,ctx:а०̅};ρ̟０=1;',context);
  const view=vm.runInContext('window.__devastMod.view()',context);
  assert.equal(view.x,50); assert.equal(view.y,80); assert.equal(view.scale,2);
});

test('bullet calibration uses projectile IDs independently of the weapon class',()=>{
  const instrumented=source.replace('settings: MOD,','calibration: weaponCalibration, predict: predictIntercept, motion: updateMotion, settings: MOD,');
  const network={state:0,ᴎᚂρ(){},ѕ᠋༢(){},ρ٨٨(){}};
  const window={addEventListener(){},removeEventListener(){},requestAnimationFrame(){return 1}};
  const B={network,world:{}};
  const ctx=vm.createContext({window,document:{readyState:'loading',getElementById(){return null}},localStorage:{getItem(){return null}},performance:{now:()=>0},console,B});
  const api=vm.runInContext(instrumented+'\n__installDevastMod(B)',ctx);
  const c=api.calibration;c.observe([],1,10,2,0);
  for(let i=0;i<3;i++){
    const e={ᴘ४１:1,Іࡈ５:4,е̝ހ:0,ոᚄރ:i,x:0,y:0}, t=400+i*250;
    for(let j=0;j<4;j++){e.x=j*50;c.observe([e],1,10,2,t+j*50)}
  }
  assert.equal(c.get(10).samples,3);assert.equal(c.get(10).speed,1000);
  c.reset();c.observe([],1,10,2,0);for(let i=0;i<3;i++)c.observe([{ᴘ४１:1,Іࡈ５:4,е̝ހ:0,ոᚄރ:i,x:i,y:0,state:120<<8}],1,10,2,400+i*50);
  assert.equal(c.get(10).speed,1200);assert.equal(c.get(10).samples,3);
  const p=api.predict({x:0,y:0},{x:1000,y:0,motion:{ready:true,vx:0,vy:100,time:0,intervalMs:100}},0,{projectileSpeed:1000,predictionHorizonMs:2000,predictionLatencyMs:0});
  assert.equal(p.status,'intercept');assert.ok(p.y>100 && p.y<102);
  const faster=api.predict({x:0,y:0},{x:1000,y:0,motion:{ready:true,vx:0,vy:100,time:0,intervalMs:100}},0,{projectileSpeed:2000,predictionHorizonMs:2000,predictionLatencyMs:0});assert.ok(faster.y<p.y);
  let m=api.motion(null,0,0,0);m=api.motion(m,10,0,100);const fast=api.motion(m,11,0,100.5);assert.equal(fast.ready,true);assert.equal(fast.vx,100);
  const reversed=api.motion(fast,5,0,150);assert.ok(reversed.vx<0);
});

test('moving target leads the sent angle and a reversal changes the lead',()=>{
  const instrumented=source.replace('settings: MOD,','setPredictionTime: t => { predictionTime = t; }, settings: MOD,');
  const sent=[];const network={state:1,ᴎᚂρ(s){sent.push(JSON.parse(s))},ѕ᠋༢(){},ρ٨٨(){}};
  const canvas={width:1000,height:1000,addEventListener(){},removeEventListener(){},getBoundingClientRect(){return {width:1000,height:1000,left:0,top:0}}};
  const B={network,world:{ᅠᏧ‍:{id:1},ᴎ︃ᄉ:[null,{а༤̘:-1},{а༤̘:-1}],ﾠࡅ‍:[]},graphics:{options:{}},view:()=>({ctx:{canvas},x:0,y:0,scale:1})};
  const window={Math,JSON,addEventListener(){},removeEventListener(){},requestAnimationFrame(){return 1}};
  const ctx=vm.createContext({window,document:{readyState:'loading',getElementById(){return canvas}},localStorage:{getItem(){return null},setItem(){}},performance:{now:()=>100},console,B});
  const api=vm.runInContext(instrumented+'\n__installDevastMod(B)',ctx);
  api.settings.AimBotEnabled=true;api.settings.predictionEnabled=true;api.settings.mouseFovEnable=true;
  const self=api.targets.players[1],enemy=api.targets.players[2];self.update(0,0,0);enemy.update(1000,0,0);enemy.update(1000,20,100);api.setPredictionTime(100);api.targets.mouseMapCords={x:1000,y:20};api.aim.refresh();
  const lead=api.aim.prediction;assert.ok(lead.y>20);assert.equal(sent.at(-1)[0],6);assert.equal(sent.at(-1)[1],Math.round(api.aim.lastAngle)%360);
  enemy.update(1000,0,200);api.setPredictionTime(200);api.aim.refresh();assert.ok(api.aim.prediction.y<0);assert.ok(sent.at(-1)[1]>180);
});

test('native attack sends the lead angle immediately before the attack',()=>{
  const src=source.replace('settings: MOD,','setPredictionTime: t => { predictionTime = t; }, settings: MOD,');
  const sent=[]; const network={state:1,ᴎᚂρ(s){sent.push(JSON.parse(s))},ѕ᠋༢(){},ρ٨٨(){},ῐ︆(){sent.push([4])}};
  const canvas={width:1000,height:1000,addEventListener(){},removeEventListener(){},getBoundingClientRect(){return {width:1000,height:1000,left:0,top:0}}};
  const self={ᴘ४１:1,Іࡈ５:0,е̝ހ:0,x:0,y:0},enemy={ᴘ४１:2,Іࡈ５:0,е̝ހ:0,x:1000,y:20};
  const B={network,world:{ᅠᏧ‍:{id:1},ᴎ︃ᄉ:[null,{а༤̘:-1},{а༤̘:-1}],ﾠࡅ‍:[]},entities:{border:[null,{border:2,ⲣᴑᴏ:[0,1]}],ᴎ̂２:[null,[self,enemy]]},categories:{loot:0,player:1,projectile:2},graphics:{options:{}},view:()=>({ctx:{canvas},x:0,y:0,scale:1})};
  const window={Math,JSON,addEventListener(){},removeEventListener(){},requestAnimationFrame(){return 1}};
  const ctx=vm.createContext({window,document:{readyState:'loading',getElementById(){return canvas}},localStorage:{getItem(){return null},setItem(){}},performance:{now:()=>100},console,B});
  const api=vm.runInContext(src+'\n__installDevastMod(B)',ctx);api.settings.AimBotEnabled=true;
  api.targets.players[1].update(0,0,0);api.targets.players[2].update(1000,0,0);api.targets.players[2].update(1000,20,100);api.setPredictionTime(100);api.targets.mouseMapCords={x:1000,y:20};
  network.ῐ︆();assert.deepEqual(sent.map(x=>x[0]),[6,4]);assert.ok(api.aim.prediction.y>enemy.y);assert.equal(sent[0][1],Math.round(api.aim.lastAngle)%360);
  sent.length=0;self.rx=0;self.ry=100;enemy.y=0;api.targets.players[2].setInactive();api.targets.players[2].update(1000,0,100);network.ῐ︆();
  assert.deepEqual(sent.map(x=>x[0]),[6,4]);assert.equal(sent[0][1],0);
  const line=api.targets.lines[0];const lineAngle=(Math.round(Math.atan2(line.y2-line.y1,line.x2-line.x1)*180/Math.PI)+360)%360;assert.equal(lineAngle,sent[0][1]);
  sent.length=0;enemy.rx=1000;enemy.ry=30;network.ῐ︆();assert.equal(api.aim.targetPlayer.y,30);assert.equal(sent[0][1],2);
  sent.length=0;enemy.ry=500;network.ῐ︆();assert.equal(api.aim.targetPlayer.y,0);
});
