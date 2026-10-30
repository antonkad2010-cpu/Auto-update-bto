const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../mod/responsive.js'), 'utf8');
function fixture() {
  let retries=0, refreshes=0;const listeners={};
  const row=['osakasurvival1','Osaka',1,1,'osaka',0,'survival'];
  const network={state:2,ԁᴄࡃ:row,ոߒ४:[row],ᴎᚂρ(){},ѕ᠋༢(){},ρ٨٨(){},ⲅ︊ᄃ(url,cb){assert.equal(url,"https://devast.io/list");refreshes++;cb()}};
  const window={addEventListener(name,fn){listeners[name]=fn},removeEventListener(){},requestAnimationFrame(){return 1},setInterval(){return 1},clearInterval(){},cancelAnimationFrame(){}};
  const document={readyState:'loading',getElementById(){return null}};
  const localStorage={getItem(){return null},setItem(){},removeItem(){throw Error('unexpected deletion')}};
  const B={network,world:{},reconnect(){retries++}};
  const context=vm.createContext({window,document,localStorage,performance:{now:()=>0},console,B});
  const api=vm.runInContext(source+'\n__installDevastMod(B)',context);
  return {api,network,B,listeners,get retries(){return retries},get refreshes(){return refreshes}};
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

test('diagnostics reads the native integrity flag without changing it or starting connections',()=>{
  const f=fixture(); let flag=0, reads=0;
  f.B.nativeIntegrity=()=>{reads++;return flag};
  assert.equal(f.api.snapshotDiagnostics().nativeIntegrityFlag,0);
  flag=1;
  assert.equal(f.api.snapshotDiagnostics().nativeIntegrityFlag,1);
  assert.equal(flag,1);assert.ok(reads>=2);assert.equal(f.retries,0);assert.equal(f.refreshes,0);
  f.B.nativeIntegrity=()=>{throw Error('unavailable')};
  assert.equal(f.api.snapshotDiagnostics().nativeIntegrityFlag,null);
});

test('diagnostics distinguishes absent, present and unavailable native export without exporting its contents',()=>{
  const f=fixture();let present=false;
  assert.equal(f.api.snapshotDiagnostics().nativeExportPresent,null);
  f.B.nativeExportPresent=()=>present;
  assert.equal(f.api.snapshotDiagnostics().nativeExportPresent,false);
  present=true;f.B.network.exported={secret:'PRIVATE_EXPORT_CONTENT'};
  const report=f.api.snapshotDiagnostics();
  assert.equal(report.nativeExportPresent,true);
  assert.ok(report.events.some(e=>e.event==='state'&&e.nativeExportPresent===true));
  assert.ok(!JSON.stringify(report).includes('PRIVATE_EXPORT_CONTENT'));
  f.api.onServerDeath();
  assert.equal(f.api.snapshotDiagnostics().events.findLast(e=>e.event==='native-death').nativeExportPresent,true);
  f.B.nativeExportPresent=()=>{throw Error('not available')};
  assert.equal(f.api.snapshotDiagnostics().nativeExportPresent,null);
  assert.equal(f.retries,0);assert.equal(f.refreshes,0);
});

test('diagnostic reports retain death context and bound memory while excluding credentials and chat',()=>{
  const f=fixture();
  f.B.network.token='PRIVATE_NETWORK_TOKEN';f.api.settings.Token='PRIVATE_TOKEN_INPUT';
  f.api.settings.SpamChatText='PRIVATE_CHAT';f.api.diagnostics.errors.push('PRIVATE_ERROR');
  for(let i=0;i<1200;i++)f.api.setSetting('AimBotEnabled',i%2===0);
  f.api.setSetting('AimBotEnabled',true);f.api.setSetting('autoFire',true);
  f.api.onServerDeath();
  const report=f.api.snapshotDiagnostics(),text=JSON.stringify(report);
  assert.ok(report.events.length<=256);assert.ok(report.events.some(x=>x.event==='native-death'&&x.aimEnabled&&x.autoFire));
  assert.equal(report.reconnectEndedByServer,true);
  for(const secret of ['PRIVATE_NETWORK_TOKEN','PRIVATE_TOKEN_INPUT','PRIVATE_CHAT','PRIVATE_ERROR'])assert.ok(!text.includes(secret));
  report.events[0].event='changed';assert.notEqual(f.api.snapshotDiagnostics().events[0].event,'changed');
});

test('production adapter exposes a live read-only integrity status',()=>{
  const adapter=fs.readFileSync(require('node:path').join(__dirname,'../mod/responsive-adapter.js'),'utf8');
  const context=vm.createContext({window:{},document:{},__installDevastMod:b=>b});
  vm.runInContext('var а०̅={},εᚇ๓={},еܞ︌={},о̃༩={},ρ̃५={},ι‌̵={},ᴇ️̅={},ιᄅᴄ={},ᴘᚉ٦={},ᴉ२ߋ={},ρⲅ̶=0,ιܒ̷=1,ⲟ２ܖ=2,Ꮷρ༧=0;',context);
  vm.runInContext(adapter,context);
  assert.equal(vm.runInContext('window.__devastMod.nativeIntegrity()',context),0);
  vm.runInContext('Ꮷρ༧=1;',context);
  assert.equal(vm.runInContext('window.__devastMod.nativeIntegrity()',context),1);
  assert.equal(vm.runInContext('Ꮷρ༧',context),1);
  assert.equal(vm.runInContext('window.__devastMod.nativeExportPresent()',context),false);
  vm.runInContext('var р̄９={secret:42};',context);
  assert.equal(vm.runInContext('window.__devastMod.nativeExportPresent()',context),true);
  assert.equal(vm.runInContext('р̄９.secret',context),42);
});

test('ILM target selection, angles and auto fire match extracted original',()=>{
  const oracle=require('./fixtures/ilm-aim-oracle');
  const sent=[];const network={state:1,ᴎᚂρ(x){sent.push(JSON.parse(x))},ѕ᠋༢(){},ρ٨٨(){}};
  const canvas={width:1000,height:1000,addEventListener(){},removeEventListener(){},getBoundingClientRect(){return {width:1000,height:1000,left:0,top:0}}};
  const B={network,world:{ᅠᏧ‍:{id:1},ᴎ︃ᄉ:[null,{а༤̘:-1},{а༤̘:-1},{а༤̘:-1}],ﾠࡅ‍:[]},categories:{player:0},graphics:{options:{}},view:()=>({ctx:{canvas},x:0,y:0,scale:1})};
  let aimTick, aimInterval, cleared=false;const window={Math,JSON,addEventListener(){},removeEventListener(){},requestAnimationFrame(){return 1},cancelAnimationFrame(){},setInterval(fn,ms){aimTick=fn;aimInterval=ms;return 42},clearInterval(id){cleared=id===42}};
  const ctx=vm.createContext({window,document:{readyState:'loading',getElementById(){return canvas}},localStorage:{getItem(){return null},setItem(){}},performance:{now:()=>100},console,B});
  const api=vm.runInContext(source+'\n__installDevastMod(B)',ctx);
  api.trackPacket(0,1,0,500,500,true);api.trackPacket(0,2,0,800,500,true);api.trackPacket(0,2,0,820,510,true);api.trackPacket(0,3,0,600,800,true);
  api.targets.mouseMapCords={x:810,y:505};
  const originalWorld={PLAYER:{id:1,team:-1},players:Array.from({length:4},()=>({team:-1}))};
  const oracleTargets={...api.targets,players:Array.from(api.targets.players,x=>x||{active:false}),getPlayerById(id){return this.players[id]},getGhoulByUid(id){return this.ghouls[id]}};const reference=oracle(api.settings,originalWorld,oracleTargets);
  for (const config of [{mouseFovEnable:true,lockId:-1},{mouseFovEnable:false,lockId:-1},{mouseFovEnable:true,lockId:2}]) {
    Object.assign(api.settings,config);const expected=reference.resolve(),actual=api.aim.resolve();assert.equal(actual,expected);assert.equal(api.aim.targetPlayer.id,reference.targetPlayer.id);assert.equal(api.aim.wannaFire(),reference.wannaFire());
  }
  api.settings.AimBotEnabled=true;api.settings.autoFire=true;api.trackPacket(0,2,0,780,510,true);assert.equal(aimInterval,50);aimTick();assert.deepEqual(sent.map(packet=>packet[0]),[6,4,5]);
  sent.length=0;api.settings.autoFire=false;api.trackPacket(0,2,0,780,100,true);const negative=reference.resolve();assert.ok(negative<0);assert.equal(api.aim.resolve(),negative);aimTick();assert.equal(sent[0][1],(negative%360+360)%360);
  api.trackPacket(0,2,0,0,0,false);assert.equal(api.targets.players[2].active,false);api.dispose();assert.equal(cleared,true);
});

test('migration restores ILM aim defaults without resetting other settings',()=>{
  const data=new Map([['BestModMenuConfig',JSON.stringify({distanceCoefficient:100,AimbotKey:'KeyZ',AutoTakeEnabled:true})]]);
  const localStorage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};
  const window={addEventListener(){},removeEventListener(){},requestAnimationFrame(){return 1},setInterval(){return 1},clearInterval(){}};
  const B={network:{state:0,ᴎᚂρ(){},ѕ᠋༢(){},ρ٨٨(){}},world:{}};
  const ctx=vm.createContext({window,document:{readyState:'loading',getElementById(){return null}},localStorage,performance:{now:()=>0},console,B});
  const api=vm.runInContext(source+'\n__installDevastMod(B)',ctx);
  assert.equal(api.settings.distanceCoefficient,300);assert.equal(api.settings.AimbotKey,'Space');assert.equal(api.settings.AutoTakeEnabled,true);
  api.setSetting('distanceCoefficient',400);const again=vm.runInContext(source+'\n__installDevastMod(B)',ctx);assert.equal(again.settings.distanceCoefficient,400);assert.equal(again.settings.AutoTakeEnabled,true);
});

test('player list uses current nicknames and valid clan generation, including player 120',()=>{
  const f=fixture();
  // Fixture exposes its world through a fresh installation below.
  const B={network:{state:0,ᴎᚂρ(){},ѕ᠋༢(){},ρ٨٨(){}},world:{ᴎ︃ᄉ:[],ﾠࡅ‍:[{name:'Clan',ոᚄރ:7}]}};
  B.world.ᴎ︃ᄉ[1]={ο̏︇:'Alice',а༤̘:0,ᴌ̗ⲟ:7};
  B.world.ᴎ︃ᄉ[2]={ο̏︇:'Bob',а༤̘:0,ᴌ̗ⲟ:6};
  B.world.ᴎ︃ᄉ[120]={ο̏︇:'Carol',а༤̘:-1};
  const context=vm.createContext({B,window:{addEventListener(){},requestAnimationFrame(){},setInterval(){}},document:{readyState:'loading',getElementById(){}},localStorage:{getItem(){}},performance:{now:()=>0},console});
  const api=vm.runInContext(source+'\n__installDevastMod(B)',context);
  assert.deepEqual(JSON.parse(JSON.stringify(api.playerRows())),[{id:1,name:'Alice',clan:'Clan'},{id:2,name:'Bob',clan:''},{id:120,name:'Carol',clan:''}]);
  B.world.ᴎ︃ᄉ[1].ο̏︇=0;
  assert.equal(api.playerRows().length,2);
});


test('manual login after exhausted retries receives a fresh retry budget',()=>{
  const f=fixture();f.api.step(0);f.network.state=64;f.api.step(100);
  f.api.reconnect.attempts=3;f.api.step(1000);assert.equal(f.retries,0);
  f.network.state=2;f.api.step(1100);assert.equal(f.api.reconnect.attempts,0);
  f.network.state=64;f.api.step(1200);f.api.step(2201);assert.equal(f.retries,1);
});

test('connecting frame ticks do not unlock a pending server refresh or run stale callbacks',()=>{
  const f=fixture();let callback;f.network.ⲅ︊ᄃ=(url,cb)=>{callback=cb};
  f.api.step(0);f.network.state=64;f.api.step(100);f.api.step(1101);
  assert.equal(f.api.reconnect.pending,true);
  f.network.state=2;f.api.step(1200);f.api.step(1250);
  assert.equal(f.api.reconnect.pending,true);
  f.network.state=64;f.api.step(1300);assert.equal(f.api.reconnect.attempts,1);
  f.api.step(14000);assert.equal(f.api.reconnect.pending,false);
  callback();assert.equal(f.retries,0);
});


test('legacy mod settings migrate without touching survivor or account credentials',()=>{
  const data=new Map([['BestModMenuConfig',JSON.stringify({distanceCoefficient:420,AimbotKey:'KeyZ'})],['BestModMenuConfig:ilm1','1'],['BestModMenuConfig:loot','{"smallwood":true}'],['token','saved-token'],['tokenId','12'],['userId','31'],['accountToken','saved-account']]);
  const writes=[],deleted=[];const localStorage={getItem:k=>data.get(k)??null,setItem:(k,v)=>{writes.push(k);data.set(k,v)},removeItem:k=>{deleted.push(k);data.delete(k)}};
  const B={network:{state:0,ᴎᚂρ(){},ѕ᠋༢(){},ρ٨٨(){}},world:{}};
  const context=vm.createContext({B,window:{addEventListener(){},requestAnimationFrame(){},setInterval(){}},document:{readyState:'loading',getElementById(){}},localStorage,performance:{now:()=>0},console});
  const api=vm.runInContext(source+'\n__installDevastMod(B)',context);
  assert.equal(api.settings.distanceCoefficient,420);assert.equal(api.settings.AimbotKey,'KeyZ');
  assert.equal(data.get('DevastClientPreferences:loot'),'{"smallwood":true}');
  assert.deepEqual(deleted,['BestModMenuConfig','BestModMenuConfig:ilm1','BestModMenuConfig:loot']);
  assert.ok(writes.every(k=>k.startsWith('DevastClientPreferences')));
  assert.equal(data.get('token'),'saved-token');assert.equal(data.get('tokenId'),'12');assert.equal(data.get('userId'),'31');assert.equal(data.get('accountToken'),'saved-account');
});

test('migration keeps every legacy entry if copying to the new namespace fails',()=>{
  const data=new Map([['BestModMenuConfig','{"distanceCoefficient":420}'],['BestModMenuConfig:ilm1','1'],['BestModMenuConfig:loot','{}']]);
  const localStorage={getItem:k=>data.get(k)??null,setItem(k,v){if(k==='DevastClientPreferences:ilm1')throw Error('quota');data.set(k,v)},removeItem(){assert.fail('must not remove legacy data after a failed copy')}};
  const B={network:{state:0,ᴎᚂρ(){},ѕ᠋༢(){},ρ٨٨(){}},world:{}};
  const context=vm.createContext({B,window:{addEventListener(){},requestAnimationFrame(){},setInterval(){}},document:{readyState:'loading',getElementById(){}},localStorage,performance:{now:()=>0},console:{error(){}}});
  vm.runInContext(source+'\n__installDevastMod(B)',context);
  assert.equal(data.get('BestModMenuConfig'),' {"distanceCoefficient":420}'.trim());
  assert.equal(data.get('BestModMenuConfig:ilm1'),'1');assert.equal(data.get('BestModMenuConfig:loot'),'{}');
});

test('native server-death handler preserves removal and XP but disables reconnect after the socket closes',()=>{
 const f=fixture(),path=require('node:path'),native=require('./fixtures/native-server-death.json');
 const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'../patches/responsive.json'),'utf8'));
 const patch=manifest.patches.find(p=>p.id==='native-server-death-event');
 assert.equal(native.base_sha256,manifest.base_sha256);assert.equal(patch.anchor,native.source);
 f.network.state=1;f.api.step(0);f.B.world.ᅠᏧ‍={id:7};
 const calls=[],entity={ᴘ४１:7,id:0,ոᚄރ:3,type:0};
 const context=vm.createContext({...native.constants,__responsiveMod:f.api,еܞ︌:f.B.world,о̃༩:{αᏧ̣(){calls.push('native-end');f.network.state=0}},ιܒ̷:0,ι‌̵:{іܛρ(type,pid,uid){assert.deepEqual([type,pid,uid],[0,7,0]);return entity},remove(...args){calls.push(args)}}});
 vm.runInContext('('+patch.replacement+')',context)(new Uint8Array([5,1,1]));
 assert.deepEqual(calls,[[7,0,3,0,1],'native-end']);assert.equal(f.B.world.ᅠᏧ‍.а́６,257);
 assert.equal(f.api.reconnect.armed,false);assert.equal(f.api.reconnect.endedByServer,true);
 f.api.step(10);f.network.state=64;for(const t of [100,1101,5000,20000,60000])f.api.step(t);
 assert.equal(f.refreshes,0);assert.equal(f.retries,0);assert.match(f.api.reconnect.status,/use Play/);
});

test('manual Play after server death restores ordinary connection-error recovery',()=>{
 const f=fixture();f.network.state=1;f.api.step(0);f.api.onServerDeath();f.network.state=64;f.api.step(100);
 assert.equal(f.retries,0);assert.equal(f.api.reconnect.endedByServer,true);
 f.network.state=2;f.api.step(200);assert.equal(f.api.reconnect.armed,true);assert.equal(f.api.reconnect.endedByServer,false);
 f.network.state=64;f.api.step(300);f.api.step(1301);assert.equal(f.retries,1);
});

test('server death cancels an in-flight server-list callback and pending aim commands',()=>{
 const f=fixture();let callback;f.network.ⲅ︊ᄃ=(url,cb)=>{callback=cb};
 f.api.step(0);f.network.state=64;f.api.step(100);f.api.step(1101);assert.equal(f.api.reconnect.pending,true);
 f.api.targets.players[1]={active:true};f.api.aim.targetPlayer=f.api.targets.players[1];f.api.aim.mouseDown=true;
 f.api.onServerDeath();callback();assert.equal(f.api.reconnect.pending,false);assert.equal(f.retries,0);assert.equal(f.api.aim.targetPlayer,null);assert.equal(f.api.aim.mouseDown,false);
 f.api.step(50000);assert.equal(f.retries,0);
});

function keyEvent(code,repeat=false,tagName='CANVAS'){
 return {code,repeat,target:{tagName},preventDefault(){this.prevented=true},stopImmediatePropagation(){this.stopped=true}};
}
test('aim Space and its repeats do not fall through to native interaction',()=>{
 const f=fixture();let nativeInteractions=0;
 function dispatch(e){f.listeners.keydown(e);if(!e.stopped&&e.code==='Space')nativeInteractions++;}
 const first=keyEvent('Space');dispatch(first);assert.equal(f.api.settings.AimBotEnabled,true);assert.equal(first.prevented,true);assert.equal(first.stopped,true);
 for(let i=0;i<20;i++)dispatch(keyEvent('Space',true));
 assert.equal(f.api.settings.AimBotEnabled,true);assert.equal(nativeInteractions,0);
 dispatch(keyEvent('Space'));assert.equal(f.api.settings.AimBotEnabled,false);assert.equal(nativeInteractions,0);
});
test('rebinding restores native Space while the new mod key stays exclusive',()=>{
 const f=fixture();f.api.setSetting('AimbotKey','KeyZ');
 const space=keyEvent('Space');f.listeners.keydown(space);assert.equal(space.stopped,undefined);assert.equal(f.api.settings.AimBotEnabled,false);
 const z=keyEvent('KeyZ');f.listeners.keydown(z);assert.equal(z.stopped,true);assert.equal(f.api.settings.AimBotEnabled,true);
 const e=keyEvent('KeyE');f.listeners.keydown(e);assert.equal(e.stopped,undefined);
});
test('typing, native button activation and editing never toggle the aim binding',()=>{
 const f=fixture();for(const tag of ['INPUT','TEXTAREA','SELECT','BUTTON'])for(const repeat of [false,true]){
  const e=keyEvent('Space',repeat,tag);f.listeners.keydown(e);assert.equal(e.stopped,undefined);assert.equal(e.prevented,undefined);assert.equal(f.api.settings.AimBotEnabled,false);
 }
 const e=keyEvent('Space');e.target.isContentEditable=true;f.listeners.keydown(e);assert.equal(e.stopped,undefined);assert.equal(f.api.settings.AimBotEnabled,false);
});

test('only keyup events belonging to consumed mod presses are intercepted, with blur cleanup',()=>{
 const f=fixture();f.listeners.keydown(keyEvent('Space'));
 const release=keyEvent('Space');f.listeners.keyup(release);assert.equal(release.stopped,true);
 const unrelated=keyEvent('Space');f.listeners.keyup(unrelated);assert.equal(unrelated.stopped,undefined);
 f.listeners.keydown(keyEvent('Space',false,'INPUT'));const typedRelease=keyEvent('Space',false,'INPUT');f.listeners.keyup(typedRelease);assert.equal(typedRelease.stopped,undefined);
 f.listeners.keydown(keyEvent('Space'));f.listeners.blur();const afterBlur=keyEvent('Space');f.listeners.keyup(afterBlur);assert.equal(afterBlur.stopped,undefined);
});
