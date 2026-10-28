const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
function setup(){
 const textures=[],draws=[];
 const world={ᅠᏧ‍:{id:1,р︋ܚ:0},ᴎ︃ᄉ:[null,{id:1,ο̏︇:'Alice',а༤̘:0,ᴌ̗ⲟ:7},{id:2,ο̏︇:0,а༤̘:1,ᴌ̗ⲟ:8}],ﾠࡅ‍:[{name:'Friendly',ոᚄރ:7,Ꮷ८ᚅ:null},{name:'Enemy',ոᚄރ:8,Ꮷ८ᚅ:null}]};
 const B={world,network:{state:0,ᴎᚂρ(){},ѕ᠋༢(){},ρ٨٨(){}}};
 const context=vm.createContext({...require('./fixtures/native-label-constants.json'),е２ܓ:undefined,Іࠂߑ:undefined,ρߓߑ:undefined,ᴀࡁࡆ:undefined,ε̷٢:"#FF0000",а̉ᴑ:undefined,Ꮷո̉:undefined,ⲣ︊̉:undefined,ⲥ८๘:296,B,window:{addEventListener(){},requestAnimationFrame(){},setInterval(){}},document:{readyState:'loading',getElementById(){}},localStorage:{getItem(){}},performance:{now:()=>0},console});
 Object.assign(context,{еܞ︌:world,а०̅:{drawImage(...a){draws.push(a)}},і̉е:100,а᠋ᄄ:100,ρ̟０:1,ᴏࡁᄀ:{а١༠(...args){textures.push(args);return {width:100,height:40,αᚊ༠:100,ࡀࠃ͢:40}}}});
 vm.runInContext(fs.readFileSync(path.join(root,'mod/responsive.js'),'utf8')+'\nvar __responsiveMod=__installDevastMod(B);',context);
 vm.runInContext(fs.readFileSync(path.join(root,'mod/native-player-label.js'),'utf8')+'\n'+fs.readFileSync(path.join(root,'mod/native-player-renderer.js'),'utf8')+'\n'+fs.readFileSync(path.join(root,'mod/native-leaderboard-label.js'),'utf8'),context);
 return {world,api:context.__responsiveMod,textures,draws,board(id,color='#ffffff'){context.boardMeta=world.ᴎ︃ᄉ[id];context.boardColor=color;vm.runInContext('εⲥߏ(boardMeta,boardColor)',context)},render(id){context.entity={ᴘ४１:id,x:300,y:400,Іࡈ５:0};vm.runInContext('ࡀܙܐ(entity)',context)}};
}
test('actual native player renderer builds nick+ID and ID-only, without a duplicate admin suffix',()=>{
 const f=setup();f.render(1);f.render(2);
 assert.equal(f.textures[0][0],'Alice #1');assert.equal(f.textures[2][0],'#2');
 assert.equal(f.textures[0][15],undefined);assert.equal(f.draws.length,4);
});
test('native textures are reused; only nickname, ID toggle or relevant clan color invalidates them',()=>{
 const f=setup();f.render(1);const first=f.world.ᴎ︃ᄉ[1].εⲅᄄ;
 for(let i=0;i<100;i++)f.render(1);assert.equal(f.textures.length,2);assert.equal(f.world.ᴎ︃ᄉ[1].εⲅᄄ,first);
 f.api.setSetting('TeamClanColor','#123456');f.render(1);assert.equal(f.textures.length,4);assert.equal(f.textures[2][2],'#123456');assert.equal(f.textures[3][2],'#123456');
 f.api.setSetting('EnemyClanColor','#654321');f.render(1);assert.equal(f.textures.length,4);
 f.render(2);assert.equal(f.textures[4][2],'#654321');assert.equal(f.textures[5][2],'#654321');
 f.world.ᴎ︃ᄉ[1].ο̏︇='Renamed';f.render(1);assert.equal(f.textures.at(-1)[0],'Renamed #1');
 f.api.setSetting('ShowNamesOnMap',false);f.render(1);assert.equal(f.textures.at(-1)[0],'Renamed');
});
test('line color is taken from the current setting and removed gauges/tags have no draw path',()=>{
 const source=fs.readFileSync(path.join(root,'mod/responsive.js'),'utf8');
 assert.match(source,/ctx.strokeStyle = i === 0 \? MOD.visualizeResolvingColor : line.color/);
 assert.doesNotMatch(source,/text\('HP|\[\['HP'|B.karma\[|!B.nativePlayerLabels/);
 const f=setup();assert.equal(f.api.settings.ShowGauges,false);assert.equal(f.api.settings.KarmaAboveHead,false);
});

test('native scoreboard displays nick+ID and ID-only while preserving the local-player color',()=>{
 const f=setup();f.board(1,'#D6C823');f.board(2);
 assert.equal(f.textures[0][0],'Alice #1');assert.equal(f.textures[0][2],'#D6C823');
 assert.equal(f.textures[1][0],'#2');assert.equal(f.textures[1][2],'#ffffff');
 assert.equal(f.textures[0][15],undefined);
 f.api.setSetting('ShowNamesOnMap',false);f.board(1);assert.equal(f.textures.at(-1)[0],'Alice #1');
});
