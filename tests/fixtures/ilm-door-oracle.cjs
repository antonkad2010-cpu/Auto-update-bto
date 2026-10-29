// Exact callback extracted from user-supplied ILM 1.0. No full game execution.
module.exports=function(network,settings,targets,tiles){
const _0x2e4a2b=network,_0x2ea565=settings,_0x6cc5f2=targets,_0x1d7416=tiles,_0x28da1a=()=>'';
return (function (_0x34f369) {
    var _0x5ec71b = _0x28da1a;
    if (_0x2e4a2b['state'] === 0x1) {
      if (_0x34f369["button"] === 0x2 && _0x2ea565["OpenAndCloseDoors"]) {
        var _0x192f18 = 0x64, _0x3dd1d4 = Math['round'](_0x6cc5f2["mouseMapCords"]['x']), _0x271849 = Math["round"](_0x6cc5f2['mouseMapCords']['y']), _0x2b8d58 = Math['floor'](_0x3dd1d4 / _0x192f18) * _0x192f18, _0x543ccb = Math["floor"](_0x271849 / _0x192f18) * _0x192f18, _0x4b4b45 = _0x2b8d58 / 0x64, _0x3ee324 = _0x543ccb / 0x64, _0x2b695b = _0x4b4b45 + ':' + _0x3ee324;
        (_0x2b695b in _0x1d7416) && _0x2e4a2b['SendWsMessage']([0xf, _0x1d7416[_0x2b695b][0x0], _0x1d7416[_0x2b695b][0x1]]);
      }
    }
  });
};
