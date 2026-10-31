var __responsiveView = {x:0,y:0,scale:1,ctx:а०̅};
var __responsiveMod = __installDevastMod({
  buildInfo:typeof __devastBuildInfo==='undefined'?{}:__devastBuildInfo,
  synchronizedRender:false,nativePlayerLabels:true,
  types:εᚇ๓,world:еܞ︌,network:о̃༩,input:ρ̃५,entities:ι‌̵,
  renderer:ᴇ️̅,items:ιᄅᴄ,graphics:ᴘᚉ٦,karma:ᴉ२ߋ,
  nativeIntegrity:()=>Ꮷρ༧,
  nativeExportPresent:()=>typeof р̄９!=='undefined',
  aimSendInterval:firing=>firing ? ο̗̇ : ﾠܓࡃ,
  categories:{loot:ρⲅ̶,player:ιܒ̷,projectile:ⲟ２ܖ},
  reconnect:()=>{
    if (typeof о̃༩.ᅠϲ᠍ !== 'function') throw new Error('Game login is not ready');
    о̃༩.ᅠϲ᠍();
  },
  view:()=>({...__responsiveView,ctx:а०̅}),
  chatActive:()=>document.activeElement?.id==='chatInput'
});
window.__devastMod=__responsiveMod;
