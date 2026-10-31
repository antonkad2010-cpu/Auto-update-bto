const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const zlib = require('node:zlib');
const crypto = require('node:crypto');
const vm = require('node:vm');
const path = require('node:path');
const {translate} = require('../tools/translate_payload.cjs');
const root = path.join(__dirname, '..');
const profile = require('../patches/current.json');
const bindings = require('../patches/current-bindings.json');
const native = require('./fixtures/current-native.json');
const canonical = fs.readFileSync(path.join(root, 'mod/responsive.js'), 'utf8');
const runtime = translate(canonical, bindings);
const constants = Object.fromEntries(Object.entries(native.constants).map(([k,v]) => [k, v?.__undefined ? undefined : v]));

function setup() {
  const sent = [], timers = [], world = {і३α: {id: 1}, ﾠ᠌ܔ: Array.from({length:121}, () => ({ε͢͠:-1})), ⲣ︉ߑ: []};
  let transport;
  const B = {world, network: {state:1, ɑ༣ᄆ(s){if(transport)return transport(s);sent.push(JSON.parse(s));}, օ︃２(){}, ᴄ९ܐ(){}}, categories: {player:0,loot:1,projectile:2}, buildInfo:{source_sha256:profile.base_sha256,source_url:profile.source_url}};
  let now = 0;
  const window = {addEventListener(){},removeEventListener(){},requestAnimationFrame(){},setInterval(fn, ms){timers.push({fn,ms});},clearInterval(){},setTimeout(){throw Error('Aim-only must not queue stale angles');},clearTimeout(){}};
  const context = vm.createContext({...constants, window, B, console, document:{readyState:'loading',getElementById(){}},localStorage:{getItem(){},setItem(){}},performance:{now:()=>now}});
  const api = vm.runInContext(runtime + '\n__installDevastMod(B)', context);
  let decoder = native.functions.packet;
  for (const id of ['ilm-track-entity-removal','ilm-track-entity-update']) {
    const patch = profile.patches.find(p => p.id === id);
    assert.equal(decoder.split(patch.anchor).length, 2);
    decoder = decoder.replace(patch.anchor, patch.mode === 'after' ? patch.anchor + patch.replacement : patch.replacement);
  }
  Object.assign(context, {__responsiveMod:api,ᴘոᚄ:{get(){return {};},remove(){},с̠︌(){}},ⲥܞո:Array.from({length:30},()=>({І๑̡(){}})),ᴏބވ(){}});
  const decode = vm.runInContext('(' + decoder + ')', context);
  function packet(rows) {
    const buffer = new ArrayBuffer(2 + rows.length * 20), bytes = new Uint8Array(buffer), words = new Uint16Array(buffer), key = 37;
    rows.forEach((r,i)=>{const j=1+i*10,k=2+i*20;bytes[k]=r.pid;bytes[k+1]=r.uid||0;bytes[k+3]=r.type||0;words[j+2]=r.active===false?0:1;words[j+3]=r.id||0;words[j+4]=r.x||0;words[j+5]=r.y||0;words[j+6]=r.x||0;words[j+7]=r.y||0;});
    for(let i=1;i<bytes.length;i++)bytes[i]^=key;
    decode(buffer,bytes,key);
  }
  return {api,B,sent,context,packet,useTransport(fn){transport=fn;},refresh(){now+=50;timers.find(t=>t.ms===50).fn();}};
}

test('active profile, baseline, native packet fixture and all 15 hooks target the same new client', () => {
  const base = zlib.gunzipSync(fs.readFileSync(path.join(root,'baselines/active.js.gz'))).toString();
  const hash = crypto.createHash('sha256').update(base).digest('hex');
  assert.equal(hash, profile.base_sha256); assert.equal(hash, native.base_sha256); assert.equal(hash, bindings.base_sha256);
  assert.equal(profile.patches.length,15);
  for(const patch of profile.patches) assert.equal(base.split(patch.anchor).length,2,patch.id);
  assert.ok(base.includes(native.functions.packet)); assert.ok(base.includes(native.functions.sender));
});

test('new native decoder feeds moving targets and sends the direction drawn by the unchanged ILM formula', () => {
  const f=setup();f.api.setSetting('AimBotEnabled',true);
  f.packet([{pid:1,x:500,y:500},{pid:2,x:800,y:500}]);
  for(let i=1;i<=1000;i++){
    const x=800+i%31,y=500+i%17;
    f.packet([{pid:2,x,y}]); f.api.targets.mouseMapCords={x,y}; f.refresh();
    assert.equal(f.api.aim.targetPlayer.id,2);
    const line=f.api.targets.lines[0],packet=f.sent.at(-1);
    assert.equal(packet[0],6);
    assert.equal(packet[1],(Math.round(Math.atan2(line.y2-line.y1,line.x2-line.x1)*180/Math.PI)+360)%360);
  }
  const report=f.api.snapshotDiagnostics();assert.equal(report.aimTransport,'ilm-direct-v1');assert.equal(report.sourceSha256,profile.base_sha256);assert.equal(report.errorCount,0);
  f.packet([{pid:2,active:false}]);assert.equal(f.api.targets.players[2].active,false);
});

test('new angle exports preserve native manual aim and yield ownership only while a live aim target exists',()=>{
  const f=setup(),wire=[];
  Object.assign(f.context,{ᴉ̡̂:1000,ѕܓ́:0,εࡀߌ:150,ᴎᄉࡁ:60,ⲅᚂߌ:0,ㅤ๘މ:{angle:1.2},ιܕ︅:p=>wire.push(p),еϲᄄ:{ᴎ︅ހ:p=>p}});
  const patch=profile.patches.find(p=>p.id==='ilm-preserve-native-angle-state');
  vm.runInContext(patch.replacement+';օ︃２();',f.context);assert.equal(wire.length,1);
  f.api.setSetting('AimBotEnabled',true);f.packet([{pid:1,x:500,y:500},{pid:2,x:800,y:500}]);f.api.targets.mouseMapCords={x:800,y:500};f.refresh();
  vm.runInContext('ᴉ̡̂=2000;ㅤ๘މ.angle=2;օ︃２();',f.context);assert.equal(wire.length,1);
  f.api.setSetting('AimBotEnabled',false);vm.runInContext('ᴉ̡̂=3000;ㅤ๘މ.angle=3;ᴄ९ܐ();',f.context);assert.equal(wire.length,2);
});

test('translated fast loot and native sender remain connected to current entity fields and commands',()=>{
  const f=setup();f.api.setSetting('FAutoLootEnabled',true);f.B.world.і३α.x=500;f.B.world.і३α.y=500;
  assert.equal(f.api.fastLoot({id:9,x:500,y:500,с४̉:0,ѕа๓:0}),true);assert.deepEqual(f.sent,[[12,9]]);
  const wire=[];Object.assign(f.context,{ᴉ̡̂:123,ﾠࠂ̶:0,ιܕ︅:p=>wire.push(JSON.parse(JSON.stringify(p))),еϲᄄ:{ᴎ︅ހ:p=>p}});
  f.useTransport(vm.runInContext('('+native.functions.sender+')',f.context));
  f.api.setSetting('AimBotEnabled',true);f.packet([{pid:1,x:500,y:500},{pid:2,x:800,y:800}]);f.api.targets.mouseMapCords={x:800,y:800};f.refresh();assert.deepEqual(wire,[[6,45]]);
});
