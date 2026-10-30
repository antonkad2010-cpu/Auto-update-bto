const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const crypto=require('node:crypto');
const zlib=require('node:zlib');
const acorn=require('acorn');
const fixture=require('./fixtures/native-aim-codec.json');
const root=path.join(__dirname,'..');
const runtime=fs.readFileSync(path.join(root,'mod/responsive.js'),'utf8');

async function context(mod){
 const c=vm.createContext({...fixture.constants,WebAssembly,atob:s=>Buffer.from(s,'base64').toString('binary'),ԁᚊᄇ:{Date:{now:()=>1793389000000}},օ१̍:[],ԁԁᄅ:undefined});
 vm.runInContext('window=globalThis;ⲥ︍ߊ=globalThis;',c);
 for(const d of fixture.definitions.filter(d=>d.kind==='function'))vm.runInContext(d.source,c);
 vm.runInContext('var '+fixture.definitions.filter(d=>d.kind==='variable').map(d=>d.name).join(',')+';',c);
 for(const d of fixture.definitions.filter(d=>d.kind==='variable').sort((a,b)=>a.position-b.position))vm.runInContext(d.source,c);
 await vm.runInContext(fixture.bootstrap,c,{timeout:2000});vm.runInContext(fixture.encoder,c);
 // Capture after the real native encoder, before the final cipher/socket.
 vm.runInContext('var captured=[],clock=0,оࠄ٠=0,ϲ１٤=0;function ᴄ༨७(value){captured.push(Array.from(value));}',c);
 vm.runInContext(fixture.nativeSender,c);vm.runInContext(fixture.nativeAngles,c);
 if(mod){
  vm.runInContext(`document={readyState:'loading',getElementById(){return null}};localStorage={getItem(){return null},setItem(){}};performance={now:()=>clock};window.addEventListener=()=>{};window.removeEventListener=()=>{};window.requestAnimationFrame=()=>1;window.cancelAnimationFrame=()=>{};window.setInterval=()=>1;window.clearInterval=()=>{};window.setTimeout=()=>{throw Error('Unexpected deadline')};window.clearTimeout=()=>{};fetch=()=>{throw Error('Unexpected HTTP')};XMLHttpRequest=()=>{throw Error('Unexpected HTTP')};navigator={sendBeacon(){throw Error('Unexpected beacon')}};var B={network:{state:1,ᴎᚂρ,ѕ᠋༢,ρ٨٨},world:{ᅠᏧ‍:{id:1},ᴎ︃ᄉ:[null,{а༤̘:-1},{а༤̘:-1}],ﾠࡅ‍:[]},categories:{player:0}};`,c);
  vm.runInContext(runtime+'\nvar api=__installDevastMod(B);api.setSetting("autoFire",false);api.setSetting("mouseFovEnable",false);api.setSetting("lockId",2);api.trackPacket(0,1,0,5000,5000,true);Ꮷρ༧=1;р̄９={};',c);
 }else vm.runInContext('var __responsiveMod=null,Ꮷρ༧=0,ρ̃५={angle:0},о̟̏=0,օ‌އ=0,ﾠܓࡃ=150,ο̗̇=60;',c);
 return c;
}

test('aim encoder and WASM bootstrap are unchanged native source, with only a clock import',()=>{
 const baseline=zlib.gunzipSync(fs.readFileSync(path.join(root,'baselines/current.js.gz'))).toString();
 assert.equal(crypto.createHash('sha256').update(baseline).digest('hex'),fixture.base_sha256);
 assert.equal(fixture.base_sha256,require('../patches/responsive.json').base_sha256);
 assert.ok(baseline.includes(fixture.encoder));assert.ok(baseline.includes(fixture.bootstrap));
 let bytes;
 function visit(n){if(!n||typeof n!=='object')return;if(Array.isArray(n)){for(const x of n)visit(x);return}if(n.type==='Literal'&&typeof n.value==='string'&&n.value.startsWith('AGFzbQEAAA'))bytes=Buffer.from(n.value,'base64');for(const x of Object.values(n))if(x&&typeof x==='object')visit(x)}
 visit(acorn.parse(fixture.bootstrap,{ecmaVersion:'latest'}));
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),fixture.wasm_sha256);
 assert.deepEqual(WebAssembly.Module.imports(new WebAssembly.Module(bytes)),[{module:'Date',name:'now',kind:'function'}]);
});

test('aim toggles produce no separate encoded message, with and without a known target',async()=>{
 const c=await context(true);
 vm.runInContext('api.setSetting("AimBotEnabled",true);api.aim.refresh();api.setSetting("AimBotEnabled",false);api.aim.refresh();',c);
 assert.equal(c.captured.length,0);assert.equal(c.api.settings.autoFire,false);assert.equal(c.Ꮷρ༧,1);
 assert.equal(c.api.snapshotDiagnostics().aimTransport,'native-intervals-v1');
 assert.equal(typeof c.api.snapshotDiagnostics().deferredAimUpdates,'number');
 vm.runInContext('api.trackPacket(0,2,0,5300,5000,true);api.setSetting("AimBotEnabled",true)',c);
 assert.equal(c.captured.length,0);
 vm.runInContext('clock=200;api.aim.refresh()',c);assert.equal(c.captured.length,1);
 vm.runInContext('api.setSetting("AimBotEnabled",false);clock+=200;api.aim.refresh()',c);
 assert.equal(c.captured.length,1);
});

test('aim-only output matches native mouse rotation through original WASM for all 360 angles',async()=>{
 const [normal,mod]=await Promise.all([context(false),context(true)]);
 vm.runInContext('api.setSetting("AimBotEnabled",true)',mod);
 for(let angle=0;angle<360;angle++){
  normal.testAngle=angle;mod.testAngle=angle;
  vm.runInContext('clock=(testAngle+1)*200;ϲ１٤=clock;о̟̏=clock-151;ρ̃५.angle=(testAngle+.25)*Math.PI/180;օ‌އ=ρ̃५.angle-10*Math.PI/180;ѕ᠋༢();',normal);
  vm.runInContext('clock=(testAngle+1)*200;ϲ１٤=clock;var ax=5000+1000*Math.cos((testAngle+.25)*Math.PI/180),ay=5000+1000*Math.sin((testAngle+.25)*Math.PI/180);api.trackPacket(0,2,0,ax,ay,true);api.trackPacket(0,2,0,ax,ay,true);api.aim.refresh();',mod);
  assert.equal(normal.captured.length,angle+1);assert.equal(mod.captured.length,angle+1);
  assert.deepEqual(Array.from(mod.captured[angle]),Array.from(normal.captured[angle]),'angle '+angle);
 }
 assert.equal(mod.api.settings.autoFire,false);assert.equal(mod.api.diagnostics.errors.length,0);
 vm.runInContext('api.setSetting("AimBotEnabled",false);clock+=200;api.aim.refresh()',mod);
 assert.equal(mod.captured.length,360);
});
