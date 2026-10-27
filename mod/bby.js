// Ported from the user-supplied BBY_1.js. Game-specific names live in the versioned adapter.
function createBBY(game) {
function calculateDistance(point1, point2) {
  return window.Math.floor(window.Math.sqrt(window.Math.pow(point1.x - point2.x, 2) + window.Math.pow(point1.y - point2.y, 2)));
}
class HackCon {
  constructor() {
    this.SAutoLootEnabled = false;
    this.FAutoLootEnabled = false;
    this.LootDataEnabled = false;
    this.AutoTakeEnabled = false;
    this.AutoBuiledEnabled = false;
    this.AntiKickEnabled = true;
    this.resolverType = "linear";
    this.ShowRealAngles = "withAim";
    this.target = "players";
    this.AimBotEnabled = false;
    this.hideAimbotAngle = false;
    this.mouseFovEnable = true;
    this.distanceCoefficient = 100;
    this.bulletSpeedCoefficient = 4;
    this.offsetCoefficient = 0.1;
    this.visualizeResolving = true;
    this.visualizeResolvingColor = "#FFF200";
    this.autoFire = false;
    this.jitterActive = false;
    this.jitterOffset = 85;
    this.stopJittersOnStop = false;
    this.jitterHitCd = 500;
    this.jitterAimHold = 150;
    this.JitterKey = "KeyJ";
    this.ShowAimTrace = false;
    this.lockId = -1;
    this.mouseFov = 131313;
    this.OpenEverythingByClick = true;
    this.ShowBuildingOwner = true;
    this.AimbotKey = "KeyZ";
    this.AutoBuiledKey = "KeyB";
    this.SAutoLootKey = "KeyX";
    this.FAutoLootKey = "KeyQ";
    this.AutoTakeKey = "KeyT";
    this.ShowMines = true;
    this.ShowPlayerHitbox = false;
    this.XrayBuildings = false;
    this.Xraytransparency = 0.4;
    this.XrayKey = "KeyN";
    this.PlayersListKey = "KeyL";
    this.PlayersListEnabled = false;
    this.SpamChatEnabled = false;
    this.SpamChatText = "";
    this.PlayerId = "";
    this.ModMenuKey = "KeyH";
    this.ModMenuKeyCode = 72;
    this.hit = true;
    this.ShowPosition = true;
    this.ShowNamesOnMap = true;
    this.KarmaAboveHead = true;
    this.ShowGauges = true;
    this.TeamClanColor = "#83F6A4";
    this.EnemyClanColor = "#FF0000";
    this.AutoOpenSlotsInv = true;
    this.token = "";
    this.userId = 0;
    this.tokenId = 0;
    this.Token = "";
  }
}
class GetAllTargetsCon {
  constructor() {
    this.players = [];
    this.ghouls = [];
    for (let player = 1; player < 121; player++) {
      this.players[player] = new GetTarget(player);
    }
    for (let ghoul = 1; ghoul < 999; ghoul++) {
      this.ghouls[ghoul] = new GetTarget(ghoul);
    }
    this.obstacles = [];
    this.lines = [];
    this.lines.push(new LinesCon(0.6, 1, "#FFF200"));
    this.lines.push(new LinesCon(0.8, 3, "#FF0000"));
    this.lines.push(new LinesCon(0.8, 3, "#00FF00"));
    this.lines.push(new LinesCon(0.8, 2, "#0000FF"));
    this.mousePosition = {
      x: 0,
      y: 0
    };
    this.mouseMapCords = {
      x: 0,
      y: 0
    };
    this.shifting = false;
    this.menuActive = false;
    this.menuX = 0;
    this.menuY = 0;
    this.menuWidth = 0;
    this.menuHeight = 0;
    this.lastId = 0;
    this.myLastMoveDirection = 0;
  }
  getPlayerById(pID) {
    if (!Number.isInteger(pID) || pID < 1) return undefined;
return this.players[pID] || (this.players[pID] = new GetTarget(pID));
  }
  getGhoulByUid(uID) {
    if (!Number.isInteger(uID) || uID < 1) return undefined;
return this.ghouls[uID] || (this.ghouls[uID] = new GetTarget(uID));
  }
}
class GetTarget {
  constructor(ids) {
    this.id = ids;
    this.x = -1;
    this.y = -1;
    this.prevX = [];
    this.prevY = [];
    this.active = false;
    this.weapon = -1;
    this.gear = -1;
    for (let lastpos = 0; lastpos < 3; lastpos++) {
      this.prevX.push(-1);
      this.prevY.push(-1);
    }
  }
  update(ux, uy, xy) {
    if (this.x !== ux || this.y !== uy) {
      this.active = true;
      this.prevX[2] = this.prevX[1];
      this.prevX[1] = this.prevX[0];
      this.prevX[0] = this.x;
      this.x = ux;
      this.prevY[2] = this.prevY[1];
      this.prevY[1] = this.prevY[0];
      this.prevY[0] = this.y;
      this.y = uy;
      this.weapon = xy;
      AimbotRefresh();
    }
  }
  setInactive() {
    this.x = -1;
    this.y = -1;
    for (let lastposs = 0; lastposs < 3; lastposs++) {
      this.prevX[lastposs] = -1;
      this.prevY[lastposs] = -1;
    }
    this.active = false;
    this.weapon = -1;
    if (!Aimbot.dead) AimbotRefresh();
  }
}
function _lineIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
  const d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (d === 0) return null;
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / d;
  return {
    x: x1 + t * (x2 - x1),
    y: y1 + t * (y2 - y1)
  };
}
class AimbotCon {
  constructor() {
    this.lastAngle = 0;
    this.targetPlayer = null;
    this.dead = false;
    this.mouseDown = false;
    this.lastHitTs = 0;
  }
  onDeath() {
    this.dead = true;
    this.targetPlayer = null;
    this.lastAngle = 0;
    this.mouseDown = false;
    GetAllTargets.lines.forEach(line => line.reset(-1, -1, -1, -1));
    GetAllTargets.lastId = 0;
    for (let i = 1; i < GetAllTargets.players.length; i++) {
      const p = GetAllTargets.getPlayerById(i);
      if (p && p.active) p.setInactive();
    }
    for (let i = 1; i < GetAllTargets.ghouls.length; i++) {
      const g = GetAllTargets.getGhoulByUid(i);
      if (g && g.active) g.setInactive();
    }
  }
  scheduleRefresh() {
    if (this.isDead()) return;
    this.refresh();
  }
  isDead() {
    if (!(game.state & 1) || !game.self || game.self.id === 0) return true;
    if (!GetAllTargets.getPlayerById(game.self.id)) return true;
    this.dead = false;
    return false;
  }
  refresh() {
    if (this.isDead()) {
      this.targetPlayer = null;
      return;
    }
    GetAllTargets.lastId = game.self.id;
    if (!MOD.AimBotEnabled) {
      this.targetPlayer = null;
      GetAllTargets.lines.forEach(line => line.reset(-1, -1, -1, -1));
      return;
    }
    GetAllTargets.lines.forEach(line => line.reset(-1, -1, -1, -1));
    if (MOD.jitterActive) {
      const aimAngle = this.resolve();
      const now = performance.now();
      if (this.mouseDown && now - this.lastHitTs >= MOD.jitterHitCd) this.lastHitTs = now;
      if (this.targetPlayer && (this.mouseDown || now - this.lastHitTs < MOD.jitterAimHold)) {
        game.sendJSON(window.JSON.stringify([6, aimAngle]));
      } else if (this.targetPlayer || this.mouseDown || !MOD.stopJittersOnStop || GetAllTargets.myLastMoveDirection !== 0) {
        game.sendJSON(window.JSON.stringify([6, Jitter.getJitterAngle()]));
      }
    } else {
      const angleToSend = this.resolve();
      if (this.targetPlayer) game.sendJSON(window.JSON.stringify([6, angleToSend]));
      if (MOD.autoFire && this.wannaFire()) {
        game.sendJSON(window.JSON.stringify([4]));
        game.sendJSON(window.JSON.stringify([5]));
      }
    }
  }
  wannaFire(watarget = this.targetPlayer) {
    if (!watarget) return false;
    const dx = watarget.x - watarget.prevX[0], dy = watarget.y - watarget.prevY[0];
    const dxPrev = watarget.prevX[0] - watarget.prevX[1], dyPrev = watarget.prevY[0] - watarget.prevY[1];
    return dx > 0 != dxPrev > 0 || dy > 0 != dyPrev > 0;
  }
  resolve() {
    try {
      const trackedSelf = GetAllTargets.getPlayerById(game.self.id);
      const myPlayer = Number.isFinite(game.self.x) && Number.isFinite(game.self.y) ? game.self : trackedSelf;
      let target = null;
      if (MOD.lockId > -1) {
        target = GetAllTargets.getPlayerById(MOD.lockId);
      } else if (MOD.mouseFovEnable) {
        target = this.findNearestPlayerTo(GetAllTargets.mouseMapCords, MOD.mouseFov);
      } else {
        target = this.findNearestPlayerTo(myPlayer, 2500);
      }
      this.targetPlayer = target;
      if (!target || !target.active || !myPlayer || myPlayer.x < 0) {
        this.targetPlayer = null;
        return this.lastAngle;
      }
      if (MOD.resolverType === "trygonometrical") {
        let angle;
        if (target.prevX[0] === -1) {
          if (MOD.visualizeResolving) GetAllTargets.lines[0].reset(myPlayer.x, myPlayer.y, target.x, target.y);
          if (MOD.ShowAimTrace) {
            GetAllTargets.lines[2].color = MOD.visualizeResolvingColor || "#1e78c8";
            GetAllTargets.lines[2].reset(myPlayer.x, myPlayer.y, target.x, target.y);
          } else GetAllTargets.lines[2].reset(-1, -1, -1, -1);
          angle = window.Math.atan2(target.y - myPlayer.y, target.x - myPlayer.x) * 180 / window.Math.PI;
        } else {
          const dist = window.Math.sqrt(window.Math.pow(target.y - target.prevY[0], 2) + window.Math.pow(target.x - target.prevX[0], 2));
          const normY = dist > 0 ? (target.y - target.prevY[0]) / dist : 0;
          const normX = dist > 0 ? (target.x - target.prevX[0]) / dist : 0;
          const d = calculateDistance(myPlayer, target);
          const cosArg = (normY * (target.x - myPlayer.x) - normX * (target.y - myPlayer.y)) / (d * MOD.bulletSpeedCoefficient);
          const clampedArg = window.Math.max(-1, window.Math.min(1, cosArg));
          angle = (window.Math.atan2(target.y - myPlayer.y, target.x - myPlayer.x) + window.Math.acos(clampedArg)) * 180 / window.Math.PI;
          const intersection = _lineIntersect(target.x, target.y, target.x + (target.x - target.prevX[0]) * 50, target.y + (target.y - target.prevY[0]) * 50, myPlayer.x, myPlayer.y, myPlayer.x + window.Math.cos(angle * window.Math.PI / 180) * 3000, myPlayer.y + window.Math.sin(angle * window.Math.PI / 180) * 3000);
          const radians = angle * window.Math.PI / 180;
          const forward = intersection && (intersection.x - myPlayer.x) * window.Math.cos(radians) + (intersection.y - myPlayer.y) * window.Math.sin(radians) > 0;
          const rayLength = Math.max(1, d);
          if (MOD.visualizeResolving) GetAllTargets.lines[0].reset(myPlayer.x, myPlayer.y,
            forward ? intersection.x : myPlayer.x + window.Math.cos(radians) * rayLength,
            forward ? intersection.y : myPlayer.y + window.Math.sin(radians) * rayLength);
          if (MOD.ShowAimTrace) {
            GetAllTargets.lines[2].color = MOD.visualizeResolvingColor || "#FFFFFF";
            GetAllTargets.lines[2].reset(myPlayer.x, myPlayer.y, target.x, target.y);
          } else GetAllTargets.lines[2].reset(-1, -1, -1, -1);
        }
        if (MOD.hideAimbotAngle) game.sendJSON(window.JSON.stringify([6, angle]));
        angle = (angle % 360 + 360) % 360;
        this.lastAngle = angle;
        return angle;
      }
      let targetX, targetY;
      if (target.prevX[0] === -1) {
        targetX = target.x;
        targetY = target.y;
      } else {
        const factor = calculateDistance(myPlayer, target) / MOD.distanceCoefficient + MOD.offsetCoefficient;
        targetX = target.x + factor * (target.x - target.prevX[0]);
        targetY = target.y + factor * (target.y - target.prevY[0]);
      }
      if (MOD.visualizeResolving) GetAllTargets.lines[0].reset(myPlayer.x, myPlayer.y, targetX, targetY);
      if (MOD.ShowAimTrace) {
        GetAllTargets.lines[2].color = MOD.visualizeResolvingColor || "#FFFFFF";
        GetAllTargets.lines[2].reset(myPlayer.x, myPlayer.y, targetX, targetY);
      } else GetAllTargets.lines[2].reset(-1, -1, -1, -1);
      const angle = (window.Math.atan2(targetY - myPlayer.y, targetX - myPlayer.x) * (180 / window.Math.PI) % 360 + 360) % 360;
      if (MOD.hideAimbotAngle) game.sendJSON(window.JSON.stringify([6, angle]));
      this.lastAngle = angle;
      return angle;
    } catch (e) {
      return this.lastAngle;
    }
  }
  findNearestPlayerTo(cords, Fov) {
    let fov = Fov, selected = null;
    if (MOD.target === "players" || MOD.target === "all") {
      for (let id = 1; id < GetAllTargets.players.length; id++) {
        const player = GetAllTargets.getPlayerById(id);
        if (!player || !player.active || player.id === game.self.id) continue;
        const wp = game.players[player.id];
        if (wp && game.self[game.teamKey] !== -1 && wp[game.teamKey] === game.self[game.teamKey]) continue;
        const dist = calculateDistance(cords, player);
        if (dist < fov) {
          selected = player;
          fov = dist;
        }
      }
    }
    if (MOD.target === "ghouls" || MOD.target === "all") {
      for (let uid = 1; uid < GetAllTargets.ghouls.length; uid++) {
        const ghoul = GetAllTargets.getGhoulByUid(uid);
        if (!ghoul || !ghoul.active) continue;
        const dist = calculateDistance(cords, ghoul);
        if (dist < fov) {
          selected = ghoul;
          fov = dist;
        }
      }
    }
    return selected;
  }
}
class JitterCon {
  constructor() {
    this.jitterStep = false;
  }
  getJitterAngle() {
    this.jitterStep = !this.jitterStep;
    let base = Aimbot.lastAngle;
    let angle = this.jitterStep ? base + MOD.jitterOffset : base - MOD.jitterOffset;
    angle = (angle % 360 + 360) % 360;
    return angle;
  }
}
class LinesCon {
  constructor(alpha, width, color) {
    this.x1 = -10;
    this.x2 = -10;
    this.y1 = -10;
    this.y2 = -10;
    this.alpha = alpha;
    this.width = width;
    this.color = color;
  }
  reset(x1, y1, x2, y2) {
    this.x1 = x1;
    this.x2 = x2;
    this.y1 = y1;
    this.y2 = y2;
  }
}
function AimbotRefresh() {
  Aimbot.refresh();
}
var GetAllTargets = new GetAllTargetsCon();
var MOD = new HackCon();
var _players_list = [];
var _spam_chat_interval = null;
function _clanFreeNick(_p) {
  var _n = String(_p[game.nameKey]);
  var _t = _p[game.teamKey] !== -1 ? game.clans[_p[game.teamKey]] : null;
  if (_t && _t.name) {
    var _tag = "[" + _t.name + "]";
    var _i = _n.toLowerCase().indexOf(_tag.toLowerCase());
    if (_i !== -1) _n = (_n.slice(0, _i) + _n.slice(_i + _tag.length)).replace(/^\s+/, "");
  }
  return _n;
}
function _onlineNick(_id) {
  var _p = game.players[_id];
  var _n_b1 = _p ? _p[game.nameKey] : undefined;
  if (typeof _n_b1 !== "string" || _n_b1 === "") _n_b1 = _players_list[_id];
  return typeof _n_b1 === "string" && _n_b1 !== "" ? _n_b1 : null;
}
function _nickOf(_id) {
  var _p_b1 = game.players[parseInt(_id, 10)];
  var _n_b1_b1 = _p_b1 && typeof _p_b1[game.nameKey] === "string" ? _p_b1[game.nameKey] : typeof _players_list[_id] === "string" ? _players_list[_id] : "";
  return String(_n_b1_b1).replace(/#\d+$/, "");
}
async function CopyNickname(_id) {
  const id = Number(_id);
  if (!Number.isInteger(id) || id < 1) throw new Error('Введите положительный ID игрока');
  const nick = _nickOf(id);
  if (!nick) throw new Error('Игрок #' + id + ' не найден');
  await navigator.clipboard.writeText(nick);
  return nick;
}
function CopyAllNicknames() {
  var result = [];
  for (var _id = 1; _id < Math.max(game.players.length, _players_list.length); _id++) {
    if (_onlineNick(_id) !== null) {
      var _n_b1_b1_b1 = _nickOf(_id);
      if (_n_b1_b1_b1) result.push(_n_b1_b1_b1);
    }
  }
  if (result.length > 0) navigator.clipboard.writeText(result.join("\n"));
}
var Aimbot = new AimbotCon();
var Jitter = new JitterCon();
var _spam_chat_interval;

  const buildings = new Map();
  const camera = { x: 0, y: 0, ready: false };
  const listeners = [];
  const pressed = new Set();
  let panel, playerList, statusPanel, overlay, context, frame, heartbeat, chat;
  let running = false, wasAlive = false;
  let lastError = null;
  let lastPickup = -Infinity;
  let lastPickupId = -1;

  function listen(target, name, fn, options) {
    target.addEventListener(name, fn, options);
    listeners.push(() => target.removeEventListener(name, fn, options));
  }
  function send(value) {
    if (game.state & 1) game.sendJSON(JSON.stringify(value));
  }
  function pickupNearby(id) {
    if (!(MOD.AutoTakeEnabled || MOD.FAutoLootEnabled) || !(game.state & 1) || !Number.isInteger(id) || id < 0) return;
    const now = performance.now();
    if (id === lastPickupId && now - lastPickup < 250) return;
    send([12, id]);
    lastPickup = now;
    lastPickupId = id;
  }
  function track(entity, playerId, uid, type, alive) {
    if (type !== 0 && type !== 13) return;
    const target = type === 0 ? GetAllTargets.getPlayerById(playerId) : GetAllTargets.getGhoulByUid(uid);
    if (!target) return;
    if (!alive) target.setInactive();
    else if (entity && Number.isFinite(entity.x) && Number.isFinite(entity.y)) target.update(entity.x, entity.y);
  }
  function hasAim() {
    return !!(MOD.AimBotEnabled && (game.state & 1) && !Aimbot.isDead() && (Aimbot.targetPlayer?.active ||
      (MOD.jitterActive && (Aimbot.mouseDown || !MOD.stopJittersOnStop || pressed.size > 0))));
  }
  function hoveredBuilding() {
    const x = Math.floor(GetAllTargets.mouseMapCords.x / 100);
    const y = Math.floor(GetAllTargets.mouseMapCords.y / 100);
    const b = buildings.get(x + ':' + y);
    return b && performance.now() - b.time < 250 ? b : null;
  }
  function openBuilding() {
    const b = hoveredBuilding();
    if (!b || !(game.state & 1) || !Number.isInteger(b.action) || b.action < 0) return false;
    send([b.action, b.id, b.owner]);
    return true;
  }
  function step() {
    const alive = !!(game.state & 1) && game.self?.id > 0;
    if (!alive) {
      if (wasAlive) { Aimbot.onDeath(); buildings.clear(); _players_list.length = 0; }
      wasAlive = false;
      return;
    }
    wasAlive = true;
    MOD.userId = game.self.id;
    pickupNearby(game.nearbyItem);
    if (camera.ready) {
      GetAllTargets.mouseMapCords.x = game.mouse.x - camera.x;
      GetAllTargets.mouseMapCords.y = game.mouse.y - camera.y;
    }
    GetAllTargets.myLastMoveDirection = pressed.size;
    Aimbot.refresh();
    for (const [key, b] of buildings) if (performance.now() - b.time > 1000) buildings.delete(key);
  }
  function draw() {
    if (!context) return;
    if (overlay.width !== window.innerWidth) overlay.width = window.innerWidth;
    if (overlay.height !== window.innerHeight) overlay.height = window.innerHeight;
    context.clearRect(0, 0, overlay.width, overlay.height);
    if (!(game.state & 1) || !camera.ready) return;
    context.save();
    try {
      for (const line of GetAllTargets.lines) {
        if (line.x1 < 0 || line.x2 < 0) continue;
        context.globalAlpha = line.alpha;
        context.lineWidth = line.width;
        context.strokeStyle = line.color;
        context.beginPath();
        context.moveTo((camera.x + line.x1) * game.scaleX, (camera.y + line.y1) * game.scaleY);
        context.lineTo((camera.x + line.x2) * game.scaleX, (camera.y + line.y2) * game.scaleY);
        context.stroke();
      }
      for (const target of GetAllTargets.players) {
        if (!target?.active || target.id === game.self.id) continue;
        const player = game.players[target.id];
        if (!player) continue;
        const friendly = game.self[game.teamKey] !== -1 && player[game.teamKey] === game.self[game.teamKey];
        context.globalAlpha = 1;
        context.fillStyle = friendly ? MOD.TeamClanColor : MOD.EnemyClanColor;
        context.strokeStyle = '#000000'; context.lineWidth = 3;
        context.font = 'bold 14px sans-serif'; context.textAlign = 'center';
        const x = (camera.x + target.x) * game.scaleX, y = (camera.y + target.y) * game.scaleY - 35;
        const label = '#' + target.id;
        context.strokeText(label, x, y); context.fillText(label, x, y);
        if (MOD.ShowPlayerHitbox && Number.isFinite(game.playerRadius) && game.playerRadius > 0) {
          context.beginPath();
          context.strokeStyle = friendly ? MOD.TeamClanColor : MOD.EnemyClanColor;
          context.lineWidth = 2;
          context.ellipse((camera.x + target.x) * game.scaleX, (camera.y + target.y) * game.scaleY, game.playerRadius * Math.abs(game.scaleX), game.playerRadius * Math.abs(game.scaleY), 0, 0, Math.PI * 2);
          context.stroke();
        }
      }
      const b = MOD.ShowBuildingOwner && hoveredBuilding();
      if (b && b.owner) {
        const owner = game.players[b.owner];
        const friendly = b.owner === game.self.id || (owner && owner[game.teamKey] !== -1 && owner[game.teamKey] === game.self[game.teamKey]);
        context.globalAlpha = 1;
        context.fillStyle = friendly ? MOD.TeamClanColor : MOD.EnemyClanColor;
        context.strokeStyle = '#000000'; context.lineWidth = 4;
        context.font = 'bold 16px sans-serif'; context.textAlign = 'center';
        const x = (camera.x + b.x) * game.scaleX, y = (camera.y + b.y) * game.scaleY;
        const nick = typeof owner?.[game.nameKey] === 'string' ? owner[game.nameKey] : '';
        const builder = '#' + b.owner + (nick ? ' ' + nick : '');
        context.strokeText(builder, x, y); context.fillText(builder, x, y);
      }
    } finally { context.restore(); }
  }
  function setOption(name, value) {
    if (!Object.hasOwn(MOD, name)) throw new Error('Unknown BBY option: ' + name);
    MOD[name] = value;
    if (name === 'AimBotEnabled' && !value) {
      Aimbot.targetPlayer = null;
      GetAllTargets.lines.forEach(line => line.reset(-1, -1, -1, -1));
    }
    refreshPanel();
  }
  function makePanel() {
    panel = document.createElement('section'); panel.id = 'bby-menu';
    panel.style.cssText = 'position:fixed;right:15px;top:0;width:245px;max-height:90vh;overflow:auto;background:#1a1a1a;color:#eee;z-index:2147483647;font:11px Lucida Grande,sans-serif;box-shadow:0 1px 4px #0008';
    const title = document.createElement('strong'); title.textContent = 'BBY · H: меню · Z: Aim · J: Jitter'; title.style.cssText = 'display:block;padding:8px;background:#000;border-bottom:1px solid #333'; panel.append(title);
    function option(key, title, choices, min, max) {
      const row = document.createElement('label'); row.style.cssText = 'display:flex;align-items:center;min-height:27px;padding:0 5px;border-bottom:1px solid #2c2c2c;border-left:3px solid #2fa1d6;background:#1a1a1a;gap:4px';
      const caption = document.createElement('span'); caption.textContent = title; caption.style.cssText = 'flex:1;overflow:hidden;text-overflow:ellipsis'; row.append(caption);
      const input = document.createElement(choices ? 'select' : 'input');
      if (choices) for (const value of choices) { const opt = document.createElement('option'); opt.value = value; opt.textContent = value; input.append(opt); }
      else input.type = typeof MOD[key] === 'boolean' ? 'checkbox' : typeof MOD[key] === 'number' ? 'number' : 'text';
      if (min !== undefined) input.min = min;
      if (max !== undefined) input.max = max;
      input.style.cssText = 'max-width:95px;min-width:0;background:#303030;color:#2fa1d6;border:0;font:11px Lucida Grande,sans-serif'; input.dataset.bbyOption = key;
      if (input.type === 'checkbox') input.checked = MOD[key]; else input.value = MOD[key];
      const state = document.createElement('span');
      const updateState = () => { if (input.type === 'checkbox') { state.textContent = input.checked ? ' ВКЛ' : ' ВЫКЛ'; state.style.color = input.checked ? '#83F6A4' : '#ff7777'; } };
      updateState();
      listen(input, 'change', () => {
        let value = input.type === 'checkbox' ? input.checked : typeof MOD[key] === 'number' ? Number(input.value) : input.value;
        if (typeof value === 'number') {
          if (!Number.isFinite(value)) return;
          if (min !== undefined) value = Math.max(min, value);
          if (max !== undefined) value = Math.min(max, value);
          input.value = value;
        }
        setOption(key, value);
        updateState();
        refreshPanel();
      });
      row.append(input, state); panel.append(row);
    }
    option('AimBotEnabled', 'Aimbot'); option('target', 'Цели', ['players', 'ghouls', 'all']);
    option('resolverType', 'Упреждение', ['linear', 'trygonometrical']);
    option('mouseFovEnable', 'Выбор около мыши'); option('mouseFov', 'Радиус', null, 1);
    option('lockId', 'ID цели (-1: авто)', null, -1, 65535);
    option('distanceCoefficient', 'Дистанция / скорость', null, 1);
    option('bulletSpeedCoefficient', 'Скорость снаряда', null, 0.1);
    option('offsetCoefficient', 'Смещение', null, 0);
    option('visualizeResolving', 'Линия упреждения'); option('ShowAimTrace', 'Линия цели'); option('hideAimbotAngle', 'Скрыть угол (повторная отправка)');
    option('jitterActive', 'Jitter'); option('jitterOffset', 'Jitter: угол', null, 0, 180);
    option('stopJittersOnStop', 'Jitter: только в движении');
    option('jitterHitCd', 'Jitter: интервал, мс', null, 50);
    option('jitterAimHold', 'Jitter: удержание, мс', null, 0);
    option('autoFire', 'Стрельба при смене направления');
    option('OpenEverythingByClick', 'Взаимодействие ПКМ'); option('ShowBuildingOwner', 'Владелец здания');
    option('AutoTakeEnabled', 'Автоподбор рядом (T)');
    option('FAutoLootEnabled', 'Быстрый подбор рядом (Q)');
    option('ShowPlayerHitbox', 'Радиус игрока');
    option('AntiKickEnabled', 'Поддерживать соединение');
    option('PlayersListEnabled', 'Список игроков (L)');
    option('SpamChatEnabled', 'Повторять сообщение (5 с)'); option('SpamChatText', 'Текст');
    playerList = document.createElement('pre'); panel.append(playerList);
    const copy = document.createElement('button'); copy.textContent = 'Копировать имена';
    listen(copy, 'click', CopyAllNicknames); panel.append(copy);
    panel.style.cssText = 'position:fixed;right:12px;top:50%;transform:translateY(-50%);width:576px;max-width:calc(100vw - 24px);max-height:90vh;overflow:auto;background:#16091f;color:#ff78f7;z-index:2147483647;font:20px Arial,sans-serif;border:1px solid #5a136c;box-shadow:inset 3px 0 #9900bc,0 0 14px #0008';
    title.replaceChildren();
    title.style.cssText = 'display:block;text-align:center;padding:15px 6px 17px;background:linear-gradient(110deg,#190723,#0e0315);border-bottom:2px solid #51105e;color:#ff76f6;text-shadow:0 0 5px #e400ef;font-size:27px;letter-spacing:3px';
    const heading = document.createElement('div'); heading.textContent = '⬡ DEVAST BEST SCRIPT';
    const subtitle = document.createElement('div'); subtitle.textContent = 'PREMIUM MOD MENU'; subtitle.style.cssText = 'font-size:15px;color:#a51bbd;letter-spacing:6px;margin-top:5px;font-weight:normal';
    title.append(heading, subtitle);
    const categories = [
      ['Visuals', ['ShowBuildingOwner','ShowPlayerHitbox','PlayersListEnabled','visualizeResolving','ShowAimTrace']],
      ['Automation', ['AutoTakeEnabled','FAutoLootEnabled']],
      ['Spam Chat', ['SpamChatEnabled','SpamChatText']],
      ['Copy Nicknames', []], ['Afk', ['AntiKickEnabled']],
      ['♛ Best Aim Bot #1 ♛', ['AimBotEnabled','target','resolverType','mouseFovEnable','mouseFov','lockId','distanceCoefficient','bulletSpeedCoefficient','offsetCoefficient','hideAimbotAngle','autoFire']],
      ['⚔ Dynamic Aim (Test)', ['jitterActive','jitterOffset','stopJittersOnStop','jitterHitCd','jitterAimHold']],
      ['Skins', []], ['Best Raiders Things #1', ['OpenEverythingByClick']],
      ['Keyboard', []], ['Token Changer', []], ['Config', []]
    ];
    for (const [name, keys] of categories) {
      const section = document.createElement('details');
      const summary = document.createElement('summary'); summary.textContent = name;
      summary.style.cssText = 'cursor:pointer;padding:14px 17px;border-bottom:1px solid #36103f;color:#ff83f5;text-shadow:0 0 2px #e600e7;font-size:21px;line-height:26px';
      const content = document.createElement('div'); content.style.cssText = 'padding:6px 12px 12px;background:#1b0b26;font-size:14px';
      section.append(summary,content);
      for (const key of keys) {
        const input = panel.querySelector('[data-bby-option="' + key + '"]');
        const row = input.parentElement;
        row.style.cssText = 'display:flex;align-items:center;min-height:32px;padding:3px 5px;border-bottom:1px solid #35113e;gap:7px';
        input.style.cssText = 'max-width:140px;min-width:0;background:#32123e;color:#ff9bf8;border:1px solid #682277;font:14px Arial,sans-serif;accent-color:#d83feb';
        content.append(row);
      }
      if (name === 'Copy Nicknames') {
        const id = document.createElement('input'); id.type = 'number'; id.min = '1'; id.placeholder = 'ID игрока'; id.id = 'bby-copy-id';
        const one = document.createElement('button'); one.textContent = 'Копировать по ID'; one.id = 'bby-copy-one';
        const message = document.createElement('div'); message.setAttribute('role','status');
        listen(one, 'click', async () => { try { const nick = await CopyNickname(id.value); message.textContent = 'Скопировано: ' + nick; } catch (error) { message.textContent = error.message; } });
        content.append(id, one, copy, message);
      }
      else if (name === 'Visuals') content.append(playerList);
      else if (name === 'Keyboard') {
        for (const [key,label] of [['ModMenuKey','Меню'],['AimbotKey','Aimbot'],['JitterKey','Jitter'],['PlayersListKey','Игроки'],['AutoTakeKey','Автоподбор'],['FAutoLootKey','Быстрый подбор']]) {
          const row = document.createElement('div'); row.style.padding = '5px';
          const button = document.createElement('button'); button.textContent = MOD[key]; button.dataset.bbyBind = key;
          listen(button,'click', () => { button.textContent = 'Нажмите клавишу'; button.focus(); });
          listen(button,'keydown', e => {
            e.preventDefault(); e.stopPropagation();
            if (e.code === 'Escape') { button.textContent = MOD[key]; return; }
            if (e.repeat || /^(Shift|Control|Alt|Meta)/.test(e.code)) return;
            const other = ['ModMenuKey','AimbotKey','JitterKey','PlayersListKey','AutoTakeKey','FAutoLootKey'].find(k => k !== key && MOD[k] === e.code);
            if (other) { button.textContent = 'Уже занято: ' + e.code; return; }
            setOption(key,e.code); button.textContent = e.code;
          });
          row.append(document.createTextNode(label + ': '),button); content.append(row);
        }
      }
      else if (name === 'Config') {
        const reset = document.createElement('button'); reset.textContent = 'Reset settings';
        listen(reset, 'click', () => { const defaults = new HackCon(); for (const key of Object.keys(defaults)) setOption(key, defaults[key]); refreshPanel(); }); content.append(reset);
      } else if (!keys.length) content.textContent = 'Недоступно: обработчик не восстановлен из исходного файла.';
      panel.append(section);
    }
    listen(panel, 'keydown', e => e.stopPropagation());
    listen(panel, 'keyup', e => e.stopPropagation());
    listen(panel, 'mousedown', e => e.stopPropagation());
    listen(panel, 'mouseup', e => e.stopPropagation());
    listen(panel, 'click', e => e.stopPropagation());
    document.body.append(panel);
  }
  function refreshPanel() {
    if (!panel) return;
    for (const input of panel.querySelectorAll('[data-bby-option]')) {
      if (input === document.activeElement) continue;
      const value = MOD[input.dataset.bbyOption];
      if (input.type === 'checkbox') { input.checked = value; const state = input.nextElementSibling; if (state) { state.textContent = value ? ' ВКЛ' : ' ВЫКЛ'; state.style.color = value ? '#83F6A4' : '#ff7777'; } } else input.value = value;
    }
    playerList.hidden = !MOD.PlayersListEnabled;
    if (MOD.PlayersListEnabled) playerList.textContent = Object.entries(game.players).filter(([, p]) => typeof p?.[game.nameKey] === 'string' && p[game.nameKey]).map(([id, p]) => id + ': ' + _clanFreeNick(p)).join('\n');
    if (statusPanel) {
      const labels = [['SAutoLoot', null], ['FAutoLoot', 'FAutoLootEnabled'], ['AimBot', 'AimBotEnabled'], ['Xray', null], ['AutoBuild', null], ['AutoTake', 'AutoTakeEnabled'], ['AntiKick', 'AntiKickEnabled'], ['AutoEat', null]];
      statusPanel.replaceChildren();
      for (const [label, key] of labels) {
        const row = document.createElement('div');
        row.textContent = '• ' + label;
        row.style.color = key && MOD[key] ? '#efff00' : '#fff';
        row.style.opacity = key ? '1' : '0.45';
        row.title = key ? (MOD[key] ? 'Включено' : 'Выключено') : 'Не реализовано';
        statusPanel.append(row);
      }
    }
  }
  function start() {
    if (running) return;
    running = true;
    overlay = document.createElement('canvas'); overlay.id = 'bby-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483646';
    document.body.append(overlay); context = overlay.getContext('2d');
    makePanel();
    statusPanel = document.createElement('aside'); statusPanel.id = 'bby-status';
    statusPanel.style.cssText = 'position:fixed;left:8px;top:50%;transform:translateY(-50%);z-index:2147483647;padding:3px 6px;background:#06202ad9;color:#fff;font:bold 18px Arial,sans-serif;display:grid;grid-template-columns:auto auto;column-gap:12px;line-height:24px;text-shadow:0 0 2px #fff8;max-width:calc(100vw - 16px)';
    document.body.append(statusPanel); refreshPanel();
    listen(window, 'keydown', e => {
      if (e.repeat || e.ctrlKey || e.altKey || e.metaKey || e.target?.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName)) return;
      if (['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) pressed.add(e.code);
      if (e.code === MOD.ModMenuKey) panel.hidden = !panel.hidden;
      if (e.code === MOD.AimbotKey) setOption('AimBotEnabled', !MOD.AimBotEnabled);
      if (e.code === MOD.JitterKey) setOption('jitterActive', !MOD.jitterActive);
      if (e.code === MOD.PlayersListKey) setOption('PlayersListEnabled', !MOD.PlayersListEnabled);
      if (e.code === MOD.AutoTakeKey) setOption('AutoTakeEnabled', !MOD.AutoTakeEnabled);
      if (e.code === MOD.FAutoLootKey) setOption('FAutoLootEnabled', !MOD.FAutoLootEnabled);
      refreshPanel();
    });
    listen(window, 'keyup', e => pressed.delete(e.code));
    listen(window, 'blur', () => { pressed.clear(); Aimbot.mouseDown = false; });
    listen(window, 'mousedown', e => {
      if (panel.contains(e.target)) return;
      if (e.button === 0) { Aimbot.mouseDown = true; Aimbot.refresh(); }
      if (e.button === 2 && MOD.OpenEverythingByClick && openBuilding()) e.preventDefault();
    }, true);
    listen(window, 'mouseup', e => { if (e.button === 0) Aimbot.mouseDown = false; });
    heartbeat = setInterval(() => { if (MOD.AntiKickEnabled && (game.state & 1)) send([0]); }, 7000);
    chat = setInterval(() => { if (MOD.SpamChatEnabled && MOD.SpamChatText) send([9, MOD.SpamChatText]); }, 5000);
    function loop() {
      if (!running) return;
      try { step(); draw(); } catch (error) {
        if (lastError !== error.message) console.error('[BBY]', error);
        lastError = error.message;
      }
      frame = requestAnimationFrame(loop);
    }
    frame = requestAnimationFrame(loop);
  }
  function dispose() {
    running = false; cancelAnimationFrame(frame);
    clearInterval(heartbeat); clearInterval(chat);
    listeners.splice(0).forEach(remove => remove());
    panel?.remove(); statusPanel?.remove(); overlay?.remove();
    Aimbot.onDeath(); buildings.clear(); pressed.clear();
  }
  return {
    options: MOD, targets: GetAllTargets, aim: Aimbot,
    setOption, start, dispose, step, track, hasAim, openBuilding, pickupNearby,
    copyNickname: CopyNickname, copyAllNicknames: CopyAllNicknames,
    camera(x, y) { camera.x = x; camera.y = y; camera.ready = true; },
    building(x, y, action, id, owner, worldX, worldY) {
      if (![x, y, action, id, owner].every(Number.isInteger)) return;
      buildings.set(x + ':' + y, { x: worldX, y: worldY, action, id, owner, time: performance.now() });
    }
  };
}
