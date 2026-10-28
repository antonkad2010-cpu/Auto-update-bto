const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../mod/responsive.js'), 'utf8');
function fixture() {
  let retries=0, refreshes=0;
  const row=['osakasurvival1','Osaka',1,1,'osaka',0,'survival'];
  const network={state:2,ԁᴄࡃ:row,ոߒ४:[row],ᴎᚂρ(){},ѕ᠋༢(){},ρ٨٨(){},ⲅ︊ᄃ(url,cb){assert.equal(url,"https://devast.io/list");refreshes++;cb()}};
  const window={addEventListener(){},removeEventListener(){},requestAnimationFrame(){return 1},setInterval(){return 1},clearInterval(){},cancelAnimationFrame(){}};
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
