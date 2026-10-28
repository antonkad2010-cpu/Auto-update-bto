// ILM 1.0 decoded aim class, isolated for behavioral comparisons.
module.exports = function(settings, world, targets) {
const _0x2ea565=settings, _0x10898e=world, _0x6cc5f2=targets, _0x225287=()=>{}, _0x349c=()=>{};
class _0x4b5d6f {
  constructor() {
    var _0x3d596d = _0x225287;
    (this["lastAngle"] = 0x0, this["targetPlayer"] = null);
  }
  ["wannaFire"](_0x51d67e = this["targetPlayer"]) {
    var _0x2fdb94 = _0x225287;
    if (!_0x51d67e) return ![];
    const [_0x4c3eaf, _0x4d399f, _0x54230e] = _0x51d67e['prevX'], [_0x440651, _0x3f96, _0x2d4ab1] = _0x51d67e["prevY"];
    return _0x51d67e['x'] - _0x4c3eaf > 0x0 !== _0x4c3eaf - _0x4d399f > 0x0 || _0x51d67e['y'] - _0x440651 > 0x0 !== _0x440651 - _0x3f96 > 0x0;
  }
  ['resolve']() {
    var _0x53e549 = _0x225287;
    const _0x302a15 = _0x6cc5f2['getPlayerById'](_0x10898e['PLAYER']['id']);
    let _0x32f84a;
    _0x2ea565["lockId"] > -0x1 ? _0x32f84a = _0x6cc5f2["getPlayerById"](_0x2ea565["lockId"]) : _0x32f84a = _0x2ea565["mouseFovEnable"] ? this["findNearestPlayerTo"](_0x6cc5f2["mouseMapCords"], _0x2ea565["mouseFov"]) : this['findNearestPlayerTo'](_0x302a15, 0x9c4);
    this["targetPlayer"] = _0x32f84a;
    if (!_0x32f84a) return this["lastAngle"];
    const _0x294d42 = Math["hypot"](_0x302a15['x'] - _0x32f84a['x'], _0x302a15['y'] - _0x32f84a['y']), _0x545191 = _0x294d42 / _0x2ea565["distanceCoefficient"] + _0x2ea565['offsetCoefficient'], _0x116788 = _0x32f84a["prevX"][0x0] === -0x1 ? _0x32f84a['x'] : _0x32f84a['x'] + _0x545191 * (_0x32f84a['x'] - _0x32f84a["prevX"][0x0]), _0x5af3a6 = _0x32f84a['prevY'][0x0] === -0x1 ? _0x32f84a['y'] : _0x32f84a['y'] + _0x545191 * (_0x32f84a['y'] - _0x32f84a['prevY'][0x0]), _0x3f6465 = Math["atan2"](_0x5af3a6 - _0x302a15['y'], _0x116788 - _0x302a15['x']) * (0xb4 / Math['PI']);
    return (this['lastAngle'] = _0x3f6465, _0x2ea565["visualizeResolving"] && _0x6cc5f2['lines'][0x0]["reset"](_0x302a15['x'], _0x302a15['y'], _0x116788, _0x5af3a6), Math['round'](_0x3f6465));
  }
  ["findNearestPlayerTo"](_0x1b0ea4, _0x27daba) {
    var _0x3912f1 = _0x225287;
    let _0x54dddc = null, _0x3dfe2b = _0x27daba;
    const _0x44dc5a = _0x4d9bd2 => {
      var _0x1eea76 = _0x349c;
      for (let _0x53f889 of _0x4d9bd2) {
        if (_0x53f889['active'] && _0x53f889['id'] !== _0x10898e['PLAYER']['id'] && (_0x10898e["players"][_0x53f889['id']]["team"] !== _0x10898e["PLAYER"]["team"] || _0x10898e["PLAYER"]["team"] === -0x1)) {
          const _0xed1853 = Math['hypot'](_0x1b0ea4['x'] - _0x53f889['x'], _0x1b0ea4['y'] - _0x53f889['y']);
          _0xed1853 < _0x3dfe2b && (_0x54dddc = _0x53f889, _0x3dfe2b = _0xed1853);
        }
      }
    };
    return ((_0x2ea565["target"] === 'players' || _0x2ea565["target"] === 'all') && _0x44dc5a(_0x6cc5f2["players"]), (_0x2ea565["target"] === "ghouls" || _0x2ea565["target"] === "all") && _0x44dc5a(_0x6cc5f2["ghouls"]), _0x54dddc);
  }
}
return new _0x4b5d6f();
};
