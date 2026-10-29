// Extracted ILM 1.0 fast-loot function; adapter inputs only.
module.exports = function(settings, self, network, loot) {
 const _0x507242=()=>{}, _0x2ea565=settings, _0x10898e={PLAYER:self}, _0x52b402=loot;
 const _0x4c45bf={fastDist:(ax,ay,bx,by)=>(ax-bx)**2+(ay-by)**2};
 const _0x2e4a2b=network;
  function _0x4e0e1c(_0x272cac) {
    var _0x17eeb5 = _0x507242;
    if (_0x4c45bf["fastDist"](_0x10898e['PLAYER']['x'], _0x10898e['PLAYER']['y'], _0x272cac['x'], _0x272cac['y']) < 0xa028 && _0x2ea565["FAutoLootEnabled"] && _0x2e4a2b["state"] === 0x1) {
      if (_0x2ea565["LootDataEnabled"]) for (let _0x53f132 in _0x52b402) {
        if (_0x52b402["hasOwnProperty"](_0x53f132) && _0x52b402[_0x53f132]["acquire"] && _0x272cac['extra'] === _0x52b402[_0x53f132]["extra"]) {
          _0x2e4a2b["sendPacket"](window["JSON"]["stringify"]([0xc, _0x272cac['id']]));
          break;
        }
      } else _0x2e4a2b["sendPacket"](window['JSON']['stringify']([0xc, _0x272cac['id']]));
    }
  }
return _0x4e0e1c;
};
