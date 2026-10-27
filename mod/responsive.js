function __installDevastMod(B) {
  const ᅟࠅ８ = B.world;
  const рᄇ͡ = B.network;
  function calculateDistance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
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
      return this.players[pID];
    }
    getGhoulByUid(uID) {
      return this.ghouls[uID];
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
      AimbotRefresh();
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
      if (!ᅟࠅ８.ᅠᏧ‍ || ᅟࠅ８.ᅠᏧ‍.id === 0) return true;
      if (!GetAllTargets.getPlayerById(ᅟࠅ８.ᅠᏧ‍.id)) return true;
      this.dead = false;
      return false;
    }
    refresh() {
      GetAllTargets.lines.forEach(line => line.reset(-1, -1, -1, -1));
      if (this.isDead()) {
        this.targetPlayer = null;
        return;
      }
      GetAllTargets.lastId = ᅟࠅ８.ᅠᏧ‍.id;
      if (!MOD.AimBotEnabled) {
        this.targetPlayer = null;
        return;
      }
      if (MOD.jitterActive) {
        const aimAngle = this.resolve();
        const now = performance.now();
        if (this.mouseDown && now - this.lastHitTs >= MOD.jitterHitCd) this.lastHitTs = now;
        if (this.targetPlayer && now - this.lastHitTs < MOD.jitterAimHold) {
          __send(window.JSON.stringify([6, aimAngle]));
        } else if (this.targetPlayer || this.mouseDown || !MOD.stopJittersOnStop || GetAllTargets.myLastMoveDirection !== 0) {
          __send(window.JSON.stringify([6, Jitter.getJitterAngle()]));
        }
      } else {
        const angleToSend = this.resolve();
        if (this.targetPlayer) __send(window.JSON.stringify([6, angleToSend]));
        if (MOD.autoFire && this.wannaFire()) {
          __send(window.JSON.stringify([4]));
          __send(window.JSON.stringify([5]));
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
        const myPlayer = GetAllTargets.getPlayerById(ᅟࠅ８.ᅠᏧ‍.id);
        let target = null;
        if (MOD.lockId > -1) {
          target = GetAllTargets.getPlayerById(MOD.lockId);
        } else if (MOD.mouseFovEnable) {
          target = this.findNearestPlayerTo(GetAllTargets.mouseMapCords, MOD.mouseFov);
        } else {
          target = this.findNearestPlayerTo(GetAllTargets.mouseMapCords, Infinity);
        }
        this.targetPlayer = target;
        if (!target || !target.active || !myPlayer || !myPlayer.active || target === myPlayer || myPlayer.x < 0) {
          this.targetPlayer = null;
          return this.lastAngle;
        }
        if (MOD.resolverType === 'trygonometrical') {
          const rx = target.x - myPlayer.x, ry = target.y - myPlayer.y;
          const vx = target.prevX[0] === -1 ? 0 : target.x - target.prevX[0];
          const vy = target.prevY[0] === -1 ? 0 : target.y - target.prevY[0];
          const velocitySquared = vx * vx + vy * vy;
          let interceptTime = 0;
          if (velocitySquared > 1e-12) {
            const speedSquared = velocitySquared * MOD.bulletSpeedCoefficient ** 2;
            const a = velocitySquared - speedSquared;
            const b = 2 * (rx * vx + ry * vy), c = rx * rx + ry * ry;
            if (Math.abs(a) < 1e-12) {
              if (Math.abs(b) > 1e-12) interceptTime = Math.max(0, -c / b);
            } else {
              const discriminant = b * b - 4 * a * c;
              if (discriminant >= 0) {
                const root = Math.sqrt(discriminant);
                const positive = [(-b - root) / (2 * a), (-b + root) / (2 * a)].filter(t => Number.isFinite(t) && t >= 0);
                if (positive.length) interceptTime = Math.min(...positive);
              }
            }
          }
          const x = target.x + vx * interceptTime, y = target.y + vy * interceptTime;
          if (MOD.visualizeResolving) GetAllTargets.lines[0].reset(myPlayer.x, myPlayer.y, x, y);
          if (MOD.ShowAimTrace) {
            GetAllTargets.lines[2].color = MOD.visualizeResolvingColor || '#FFFFFF';
            GetAllTargets.lines[2].reset(myPlayer.x, myPlayer.y, x, y);
          }
          const angle = (Math.atan2(y - myPlayer.y, x - myPlayer.x) * 180 / Math.PI + 360) % 360;
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
          if (!player || !player.active || player.id === ᅟࠅ８.ᅠᏧ‍.id) continue;
          const wp = ᅟࠅ８.ᴎ︃ᄉ[player.id];
          if (sameClan(player.id)) continue;
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
  const MOD = new HackCon();
  Object.assign(MOD, {
    predictionEnabled: true,
    autoProjectileSpeed: true,
    projectileSpeed: 1800,
    predictionHorizonMs: 800,
    predictionLatencyMs: 0,
    zoomFactor: 1,
    showFunctionList: true
  });
  function updateMotion(previous, x, y, time) {
    const fresh = () => ({
      x,
      y,
      time,
      vx: 0,
      vy: 0,
      intervalMs: 100,
      ready: false
    });
    if (![x, y, time].every(Number.isFinite)) return null;
    if (!previous || time < previous.time || time - previous.time > 1000) return fresh();
    const dx = x - previous.x, dy = y - previous.y;
    if (dx === 0 && dy === 0) return previous;
    const dt = (time - previous.time) / 1000;
    // Position interpolation can advance several times within a frame.  Use a
    // short sampling window rather than treating each tiny update as velocity.
    if (dt < .035) return previous;
    const vx = dx / dt, vy = dy / dt;
    if (Math.hypot(dx, dy) > 300 || Math.hypot(vx, vy) > 2500) return fresh();
    const oldSpeed = Math.hypot(previous.vx, previous.vy), newSpeed = Math.hypot(vx, vy);
    const reversed = previous.vx * vx + previous.vy * vy < .5 * oldSpeed * newSpeed;
    const speedChanged = Math.abs(newSpeed - oldSpeed) > Math.max(40, oldSpeed * .35);
    const weight = !previous.ready || reversed || speedChanged ? 1 : 1 - Math.exp(-dt / .09);
    return {
      x,
      y,
      time,
      intervalMs: previous.ready ? previous.intervalMs * .5 + (time - previous.time) * .5 : time - previous.time,
      vx: previous.vx + (vx - previous.vx) * weight,
      vy: previous.vy + (vy - previous.vy) * weight,
      ready: true
    };
  }
  function motionVelocity(motion, time) {
    if (!motion?.ready || !Number.isFinite(time) || time < motion.time) return {
      x: 0,
      y: 0
    };
    const interval = motion.intervalMs || 50;
    const hold = Math.max(100, Math.min(350, interval * 1.1 + 50)), fadeTime = Math.max(100, Math.min(200, interval));
    const fade = Math.max(0, Math.min(1, (hold + fadeTime - (time - motion.time)) / fadeTime));
    return {
      x: motion.vx * fade,
      y: motion.vy * fade
    };
  }
  function predictIntercept(origin, target, time, settings) {
    const direct = {
      x: target.x,
      y: target.y,
      flightTime: 0,
      status: 'direct'
    };
    const speed = settings.projectileSpeed, horizon = Math.max(0, Math.min(2, settings.predictionHorizonMs / 1000));
    if (![origin.x, origin.y, target.x, target.y, speed, horizon].every(Number.isFinite) || speed <= 0) return direct;
    const v = motionVelocity(target.motion, time), latency = Math.max(0, Math.min(.3, settings.predictionLatencyMs / 1000 || 0));
    if (v.x === 0 && v.y === 0) return direct;
    const x = target.x + v.x * latency, y = target.y + v.y * latency, rx = x - origin.x, ry = y - origin.y;
    const a = v.x * v.x + v.y * v.y - speed * speed, b = 2 * (rx * v.x + ry * v.y), c = rx * rx + ry * ry;
    let roots = [];
    if (Math.abs(a) < 1e-10 * Math.max(speed * speed, 1)) {
      if (Math.abs(b) > 1e-10) roots = [-c / b];
    } else {
      const discriminant = b * b - 4 * a * c;
      if (discriminant >= 0) {
        const root = Math.sqrt(discriminant), q = -.5 * (b + (b >= 0 ? root : -root));
        roots = q === 0 ? [0] : [q / a, c / q];
      }
    }
    roots = roots.filter(t => Number.isFinite(t) && t >= 0);
    if (!roots.length) return {
      ...direct,
      status: 'no-intercept'
    };
    const solution = Math.min(...roots), flightTime = Math.min(solution, horizon);
    return {
      x: x + v.x * flightTime,
      y: y + v.y * flightTime,
      flightTime,
      status: solution > horizon ? 'limited' : 'intercept'
    };
  }
  function createWeaponCalibration() {
    const profiles = new Map(), tracks = new Map();
    let active = null, changedAt = 0, projectileKind = null;
    const median = a => {
      const b = [...a].sort((x, y) => x - y);
      return b[Math.floor(b.length / 2)];
    };
    return {
      observe(records, owner, weapon, kind, time) {
        if (active !== weapon) {
          active = weapon;
          changedAt = time;
          projectileKind = null;
          tracks.clear();
        }
        const seen = new Set();
        if (!Number.isInteger(weapon)) return;
        for (const e of records) {
          if (e.ᴘ४１ !== owner || !Number.isInteger(e.Іࡈ５) || e.е̝ހ !== 0 || ![e.x, e.y].every(Number.isFinite)) continue;
          if (time - changedAt < 350) continue;
          if (projectileKind === null) projectileKind = e.Іࡈ５;
          if (e.Іࡈ５ !== projectileKind) continue;
          const key = e;
          seen.add(key);
          let t = tracks.get(key);
          if (!t || t.generation !== e.ոᚄރ) {
            if (time - changedAt < 350) continue;
            tracks.set(key, {
              x: e.x,
              y: e.y,
              time,
              generation: e.ոᚄރ,
              speeds: [],
              done: false
            });
            // The current game's projectile initializer decodes its movement
            // speed from the high byte of state in world units per millisecond.
            const nativeSpeed = Number.isInteger(e.state) ? (e.state >>> 8) * 10 : 0;
            if (nativeSpeed >= 100 && nativeSpeed <= 2550) {
              const profileKey = weapon + ':' + projectileKind;
              const samples = profiles.get(profileKey) || [];
              samples.push(nativeSpeed);
              if (samples.length > 15) samples.shift();
              profiles.set(profileKey, samples);
              tracks.get(key).done = true;
            }
            continue;
          }
          const dt = (time - t.time) / 1000;
          if (dt < .016) continue;
          const dx = e.x - t.x, dy = e.y - t.y, speed = Math.hypot(dx, dy) / dt;
          if (dx === 0 && dy === 0) {
            if (dt > .2) tracks.delete(key);
            continue;
          }
          if (dt > .2 || speed < 100 || speed > 12000) {
            tracks.delete(key);
            continue;
          }
          if (t.dx !== undefined && dx * t.dx + dy * t.dy < .98 * Math.hypot(dx, dy) * Math.hypot(t.dx, t.dy)) {
            tracks.delete(key);
            continue;
          }
          Object.assign(t, {
            x: e.x,
            y: e.y,
            time,
            dx,
            dy
          });
          t.speeds.push(speed);
          if (t.speeds.length > 6) t.speeds.shift();
          if (!t.done && t.speeds.length >= 3) {
            const measured = median(t.speeds);
            if (t.speeds.every(v => Math.abs(v - measured) <= measured * .12)) {
              const profileKey = weapon + ':' + projectileKind;
              const p = profiles.get(profileKey) || [];
              p.push(measured);
              if (p.length > 15) p.shift();
              profiles.set(profileKey, p);
              t.done = true;
            }
          }
        }
        for (const key of tracks.keys()) if (!seen.has(key)) tracks.delete(key);
      },
      get(weapon) {
        const p = profiles.get(weapon + ':' + projectileKind) || [];
        if (p.length < 3) return null;
        const center = median(p), good = p.filter(x => Math.abs(x - center) <= center * .15);
        if (good.length < 3) return null;
        return {
          speed: good.reduce((a, b) => a + b, 0) / good.length,
          samples: good.length
        };
      },
      reset() {
        profiles.clear();
        tracks.clear();
        active = null;
        projectileKind = null;
        changedAt = 0;
      }
    };
  }
  const weaponCalibration = createWeaponCalibration();
  let weaponInfo = {
    id: null,
    label: "Manual",
    speed: MOD.projectileSpeed,
    samples: 0
  };
  let predictionTime = performance.now();
  const defaults = JSON.parse(JSON.stringify(MOD));
  const SAVE = 'BestModMenuConfig';
  const transient = new Set(['Token', 'token', 'tokenId', 'userId']);
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE) || '{}');
    for (const key of Object.keys(defaults)) {
      if (!transient.has(key) && typeof saved[key] === typeof defaults[key] && (typeof saved[key] !== 'number' || Number.isFinite(saved[key]))) MOD[key] = saved[key];
    }
  } catch (_) {}
  MOD.zoomFactor = 1;
  if (MOD.SAutoLootEnabled) MOD.FAutoLootEnabled = false;
  const lootItems = [{
    "name": "smallwood",
    "acquire": false,
    "id": 0
  }, {
    "name": "mediumwood",
    "acquire": false,
    "id": 1
  }, {
    "name": "bigwood",
    "acquire": false,
    "id": 2
  }, {
    "name": "smallstone",
    "acquire": false,
    "id": 3
  }, {
    "name": "mediumstone",
    "acquire": false,
    "id": 4
  }, {
    "name": "bigstone",
    "acquire": false,
    "id": 5
  }, {
    "name": "steel",
    "acquire": true,
    "id": 6
  }, {
    "name": "animalfat",
    "acquire": false,
    "id": 7
  }, {
    "name": "animaltendon",
    "acquire": false,
    "id": 8
  }, {
    "name": "string",
    "acquire": false,
    "id": 9
  }, {
    "name": "leatherboar",
    "acquire": false,
    "id": 10
  }, {
    "name": "shapedmetal",
    "acquire": true,
    "id": 11
  }, {
    "name": "rawsteak",
    "acquire": false,
    "id": 12
  }, {
    "name": "cookedsteak",
    "acquire": true,
    "id": 13
  }, {
    "name": "rottensteak",
    "acquire": false,
    "id": 14
  }, {
    "name": "orange",
    "acquire": false,
    "id": 15
  }, {
    "name": "rottenorange",
    "acquire": false,
    "id": 16
  }, {
    "name": "seedorange",
    "acquire": false,
    "id": 17
  }, {
    "name": "hachet",
    "acquire": false,
    "id": 18
  }, {
    "name": "stonepickaxe",
    "acquire": false,
    "id": 19
  }, {
    "name": "steelpickaxe",
    "acquire": false,
    "id": 20
  }, {
    "name": "stoneaxe",
    "acquire": false,
    "id": 21
  }, {
    "name": "workbench",
    "acquire": false,
    "id": 22
  }, {
    "name": "woodspear",
    "acquire": false,
    "id": 23
  }, {
    "name": "woodbow",
    "acquire": false,
    "id": 24
  }, {
    "name": "9mm",
    "acquire": true,
    "id": 25
  }, {
    "name": "deserteagle",
    "acquire": true,
    "id": 26
  }, {
    "name": "shotgun",
    "acquire": true,
    "id": 27
  }, {
    "name": "ak51",
    "acquire": true,
    "id": 28
  }, {
    "name": "sniper",
    "acquire": true,
    "id": 29
  }, {
    "name": "woodwall",
    "acquire": false,
    "id": 30
  }, {
    "name": "stonewall",
    "acquire": true,
    "id": 31
  }, {
    "name": "steelwall",
    "acquire": true,
    "id": 32
  }, {
    "name": "wooddoor",
    "acquire": false,
    "id": 33
  }, {
    "name": "stonedoor",
    "acquire": true,
    "id": 34
  }, {
    "name": "steeldoor",
    "acquire": true,
    "id": 35
  }, {
    "name": "campfire",
    "acquire": false,
    "id": 36
  }, {
    "name": "bullet9mm",
    "acquire": true,
    "id": 37
  }, {
    "name": "bulletshotgun",
    "acquire": true,
    "id": 38
  }, {
    "name": "bulletsniper",
    "acquire": true,
    "id": 39
  }, {
    "name": "medikit",
    "acquire": false,
    "id": 40
  }, {
    "name": "bandage",
    "acquire": false,
    "id": 41
  }, {
    "name": "soda",
    "acquire": false,
    "id": 42
  }, {
    "name": "mp5",
    "acquire": true,
    "id": 43
  }, {
    "name": "headscarf",
    "acquire": false,
    "id": 44
  }, {
    "name": "chapka",
    "acquire": true,
    "id": 45
  }, {
    "name": "wintercoat",
    "acquire": true,
    "id": 46
  }, {
    "name": "gazmask",
    "acquire": false,
    "id": 47
  }, {
    "name": "gazprotection",
    "acquire": true,
    "id": 48
  }, {
    "name": "radiationsuit",
    "acquire": true,
    "id": 49
  }, {
    "name": "woodarrow",
    "acquire": false,
    "id": 50
  }, {
    "name": "campfirebbq",
    "acquire": true,
    "id": 51
  }, {
    "name": "smelter",
    "acquire": true,
    "id": 52
  }, {
    "name": "woodbigdoor",
    "acquire": false,
    "id": 53
  }, {
    "name": "stonebigdoor",
    "acquire": false,
    "id": 54
  }, {
    "name": "steelbigdoor",
    "acquire": false,
    "id": 55
  }, {
    "name": "sulfur",
    "acquire": true,
    "id": 56
  }, {
    "name": "shapeduranium",
    "acquire": true,
    "id": 57
  }, {
    "name": "workbench2",
    "acquire": true,
    "id": 58
  }, {
    "name": "uranium",
    "acquire": true,
    "id": 59
  }, {
    "name": "weaving",
    "acquire": false,
    "id": 60
  }, {
    "name": "gasoline",
    "acquire": true,
    "id": 61
  }, {
    "name": "sulfurpickaxe",
    "acquire": true,
    "id": 62
  }, {
    "name": "chest",
    "acquire": false,
    "id": 63
  }, {
    "name": "fridge",
    "acquire": false,
    "id": 64
  }, {
    "name": "woodfloor",
    "acquire": false,
    "id": 65
  }, {
    "name": "hammer",
    "acquire": true,
    "id": 66
  }, {
    "name": "sleepingbag",
    "acquire": false,
    "id": 67
  }, {
    "name": "repairhammer",
    "acquire": false,
    "id": 68
  }, {
    "name": "nails",
    "acquire": false,
    "id": 69
  }, {
    "name": "woodlightfloor",
    "acquire": false,
    "id": 70
  }, {
    "name": "woodsmallwall",
    "acquire": false,
    "id": 71
  }, {
    "name": "stonesmallwall",
    "acquire": false,
    "id": 72
  }, {
    "name": "steelsmallwall",
    "acquire": false,
    "id": 73
  }, {
    "name": "tomatosoup",
    "acquire": true,
    "id": 74
  }, {
    "name": "syringe",
    "acquire": false,
    "id": 75
  }, {
    "name": "chemicalcomponent",
    "acquire": false,
    "id": 76
  }, {
    "name": "radaway",
    "acquire": false,
    "id": 77
  }, {
    "name": "seedtomato",
    "acquire": false,
    "id": 78
  }, {
    "name": "tomato",
    "acquire": false,
    "id": 79
  }, {
    "name": "rottentomato",
    "acquire": false,
    "id": 80
  }, {
    "name": "can",
    "acquire": false,
    "id": 81
  }, {
    "name": "woodcrossbow",
    "acquire": false,
    "id": 82
  }, {
    "name": "woodcrossarrow",
    "acquire": false,
    "id": 83
  }, {
    "name": "nailgun",
    "acquire": false,
    "id": 84
  }, {
    "name": "sawedoffshotgun",
    "acquire": true,
    "id": 85
  }, {
    "name": "stonefloor",
    "acquire": false,
    "id": 86
  }, {
    "name": "tilingfloor",
    "acquire": false,
    "id": 87
  }, {
    "name": "crisps",
    "acquire": false,
    "id": 88
  }, {
    "name": "rottencrisps",
    "acquire": false,
    "id": 89
  }, {
    "name": "electronics",
    "acquire": true,
    "id": 90
  }, {
    "name": "junk",
    "acquire": true,
    "id": 91
  }, {
    "name": "bigwire",
    "acquire": true,
    "id": 92
  }, {
    "name": "energycells",
    "acquire": true,
    "id": 93
  }, {
    "name": "laserpistol",
    "acquire": true,
    "id": 94
  }, {
    "name": "tesla",
    "acquire": true,
    "id": 95
  }, {
    "name": "alloys",
    "acquire": true,
    "id": 96
  }, {
    "name": "sulfuraxe",
    "acquire": true,
    "id": 97
  }, {
    "name": "landmine",
    "acquire": true,
    "id": 98
  }, {
    "name": "dynamite",
    "acquire": true,
    "id": 99
  }, {
    "name": "c4",
    "acquire": true,
    "id": 100
  }, {
    "name": "c4trigger",
    "acquire": false,
    "id": 101
  }, {
    "name": "compost",
    "acquire": false,
    "id": 102
  }, {
    "name": "armorphysic1",
    "acquire": false,
    "id": 103
  }, {
    "name": "armorphysic2",
    "acquire": true,
    "id": 104
  }, {
    "name": "armorphysic3",
    "acquire": true,
    "id": 105
  }, {
    "name": "armorfire1",
    "acquire": false,
    "id": 106
  }, {
    "name": "armorfire2",
    "acquire": true,
    "id": 107
  }, {
    "name": "armorfire3",
    "acquire": true,
    "id": 108
  }, {
    "name": "armordeminer",
    "acquire": false,
    "id": 109
  }, {
    "name": "armortesla1",
    "acquire": true,
    "id": 110
  }, {
    "name": "armortesla2",
    "acquire": true,
    "id": 111
  }, {
    "name": "woodspike",
    "acquire": false,
    "id": 112
  }, {
    "name": "lasersubmachine",
    "acquire": true,
    "id": 113
  }, {
    "name": "grenade",
    "acquire": true,
    "id": 114
  }, {
    "name": "superhammer",
    "acquire": true,
    "id": 115
  }, {
    "name": "ghoulblood",
    "acquire": false,
    "id": 116
  }, {
    "name": "camouflagegear",
    "acquire": false,
    "id": 117
  }, {
    "name": "agitator",
    "acquire": false,
    "id": 118
  }, {
    "name": "ghouldrug",
    "acquire": false,
    "id": 119
  }, {
    "name": "mushroom1",
    "acquire": false,
    "id": 120
  }, {
    "name": "mushroom2",
    "acquire": false,
    "id": 121
  }, {
    "name": "mushroom3",
    "acquire": false,
    "id": 122
  }, {
    "name": "rottenmushroom1",
    "acquire": false,
    "id": 123
  }, {
    "name": "rottenmushroom2",
    "acquire": false,
    "id": 124
  }, {
    "name": "rottenmushroom3",
    "acquire": false,
    "id": 125
  }, {
    "name": "lapadone",
    "acquire": false,
    "id": 126
  }, {
    "name": "lapabotrepair",
    "acquire": true,
    "id": 127
  }, {
    "name": "smallwire",
    "acquire": true,
    "id": 128
  }, {
    "name": "pumpkin",
    "acquire": true,
    "id": 129
  }, {
    "name": "rottenpumpkin",
    "acquire": false,
    "id": 130
  }, {
    "name": "seedghoul",
    "acquire": true,
    "id": 131
  }, {
    "name": "äáäctor",
    "acquire": false,
    "id": 132
  }, {
    "name": "antidote",
    "acquire": false,
    "id": 133
  }, {
    "name": "antidoteflower",
    "acquire": false,
    "id": 134
  }, {
    "name": "seedtree",
    "acquire": false,
    "id": 135
  }, {
    "name": "acorn",
    "acquire": false,
    "id": 136
  }, {
    "name": "rottenacorn",
    "acquire": false,
    "id": 137
  }, {
    "name": "lasersniper",
    "acquire": true,
    "id": 138
  }, {
    "name": "halbot",
    "acquire": true,
    "id": 139
  }, {
    "name": "teslabot",
    "acquire": true,
    "id": 140
  }, {
    "name": "cable0",
    "acquire": false,
    "id": 141
  }, {
    "name": "cable1",
    "acquire": false,
    "id": 142
  }, {
    "name": "cable2",
    "acquire": false,
    "id": 143
  }, {
    "name": "cable3",
    "acquire": false,
    "id": 144
  }, {
    "name": "switch",
    "acquire": false,
    "id": 145
  }, {
    "name": "gateor",
    "acquire": false,
    "id": 146
  }, {
    "name": "gateand",
    "acquire": false,
    "id": 147
  }, {
    "name": "gatenot",
    "acquire": false,
    "id": 148
  }, {
    "name": "lamp",
    "acquire": false,
    "id": 149
  }, {
    "name": "cablewall",
    "acquire": false,
    "id": 150
  }, {
    "name": "automaticdoor",
    "acquire": false,
    "id": 151
  }, {
    "name": "platform",
    "acquire": false,
    "id": 152
  }, {
    "name": "stonecave",
    "acquire": true,
    "id": 153
  }, {
    "name": "bunkerwall",
    "acquire": true,
    "id": 154
  }, {
    "name": "goldfloor",
    "acquire": false,
    "id": 155
  }, {
    "name": "redfloor",
    "acquire": false,
    "id": 156
  }, {
    "name": "weldingmachine",
    "acquire": false,
    "id": 157
  }, {
    "name": "cable4",
    "acquire": false,
    "id": 158
  }, {
    "name": "gatetimer",
    "acquire": false,
    "id": 159
  }, {
    "name": "gatexorcounter",
    "acquire": false,
    "id": 160
  }, {
    "name": "feeder",
    "acquire": true,
    "id": 161
  }];
  const LootData = Object.fromEntries(lootItems.map(item => [item.name, {
    acquire: item.acquire,
    id: item.id
  }]));
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE + ':loot') || '{}');
    for (const key of Object.keys(LootData)) if (typeof saved[key] === 'boolean') LootData[key].acquire = saved[key];
  } catch (_) {}
  const GetAllTargets = new GetAllTargetsCon();
  const Aimbot = new AimbotCon();
  const Jitter = new JitterCon();
  const _players_list = [];
  const removers = [];
  const originalSender = B.network.ᴎᚂρ.bind(B.network);
  const originals = {};
  const diagnostics = {
    frames: 0,
    errors: [],
    commands: 0,
    deduplicatedAngles: 0
  };
  let overlay, overlayHost, ctx, menu, functionList, zoomControl, nextFrame, stopped = false, waitingKey = null;
  let lastStep = -Infinity, lastLoot = -Infinity, lastBuild = -Infinity;
  let lastTake = -Infinity, lastKeepAlive = -Infinity, lastChat = -Infinity, nextChatAt = -Infinity;
  const chatState = {
    status: 'Off',
    sent: 0
  };
  let previousPlayer = 0, records = [], mouse = null;
  const functionRows = new Map();
  // Column order matches the compact status list in the supplied screenshot.
  const functionLabels = [
    ['SAutoLootEnabled', 'SAutoLoot'],
    ['AimBotEnabled', 'AimBot'],
    ['AutoBuiledEnabled', 'AutoBuild'],
    ['AntiKickEnabled', 'AntiKick'],
    ['FAutoLootEnabled', 'FAutoLoot'],
    ['XrayBuildings', 'Xray'],
    ['AutoTakeEnabled', 'AutoTake'],
    [null, 'AutoEat']
  ];
  const pendingLoot = new Map(), playerLabelCache = new WeakMap();
  function listen(target, event, callback, options) {
    target.addEventListener(event, callback, options);
    removers.push(() => target.removeEventListener(event, callback, options));
  }
  function playing() {
    return B.network.state === 1 && B.world.ᅠᏧ‍ && B.world.ᅠᏧ‍.id > 0;
  }
  let lastSentAngle = null;
  function __send(value, forceAngle = false) {
    if (!playing()) return false;
    const packet = typeof value === 'string' ? JSON.parse(value) : value;
    if (!Array.isArray(packet) || packet.length === 0 || packet.some(x => typeof x !== 'number' || !Number.isFinite(x))) return false;
    if (packet[0] === 6) {
      if (packet.length !== 2) return false;
      packet[1] = (Math.round(packet[1]) % 360 + 360) % 360;
      if (!forceAngle && packet[1] === lastSentAngle) {
        diagnostics.deduplicatedAngles++;
        return true;
      }
    }
    originalSender(JSON.stringify(packet));
    if (packet[0] === 6) lastSentAngle = packet[1];
    diagnostics.commands++;
    return true;
  }
  function persist() {
    const saved = {};
    for (const key of Object.keys(defaults)) if (!transient.has(key)) saved[key] = MOD[key];
    try {
      localStorage.setItem(SAVE, JSON.stringify(saved));
      localStorage.setItem(SAVE + ':loot', JSON.stringify(Object.fromEntries(Object.entries(LootData).map(([k, v]) => [k, v.acquire]))));
    } catch (_) {}
  }
  function setSetting(key, value) {
    if (!Object.prototype.hasOwnProperty.call(defaults, key) || typeof value !== typeof defaults[key]) throw new Error('Invalid setting: ' + key);
    if (typeof value === 'number' && !Number.isFinite(value)) throw new Error('Invalid numeric setting');
    MOD[key] = value;
    if (key === 'SpamChatEnabled') {
      chatState.status = value ? 'Waiting for game' : 'Off';
      if (value) {
        lastChat = -Infinity;
        nextChatAt = -Infinity;
      }
    }
    if (key === 'SAutoLootEnabled' && value) MOD.FAutoLootEnabled = false;
    if (key === 'FAutoLootEnabled' && value) MOD.SAutoLootEnabled = false;
    if (key === 'AimBotEnabled' && !value) {
      Aimbot.targetPlayer = null;
      GetAllTargets.lines.forEach(l => l.reset(-1, -1, -1, -1));
    }
    persist();
    if (menu) menu.updateDisplay();
  }
  function report(error) {
    const message = String(error && error.message || error);
    if (!diagnostics.errors.includes(message)) {
      diagnostics.errors.push(message);
      console.error('[Devast mod]', message);
    }
  }
  GetTarget.prototype.update = function (x, y, time = predictionTime) {
    this.motion = updateMotion(this.motion, x, y, time);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    this.prevX = [this.active ? this.x : -1, this.prevX[0], this.prevX[1]];
    this.prevY = [this.active ? this.y : -1, this.prevY[0], this.prevY[1]];
    this.x = x;
    this.y = y;
    this.active = true;
  };
  GetTarget.prototype.setInactive = function () {
    this.motion = null;
    this.x = -1;
    this.y = -1;
    this.active = false;
    this.prevX = [-1, -1, -1];
    this.prevY = [-1, -1, -1];
  };
  function AimbotRefresh() {}
  Aimbot.__nextFire = 0;
  Aimbot.lastHitTs = -Infinity;
  Aimbot.wannaFire = function (target = this.targetPlayer) {
    const now = performance.now();
    if (!target || !target.active || now < this.__nextFire) return false;
    this.__nextFire = now + 150;
    return true;
  };
  Aimbot.findNearestPlayerTo = function (coords, limit) {
    const can = view().ctx?.canvas || document.getElementById('can'), rect = can?.getBoundingClientRect();
    const sx = can && rect?.width ? rect.width / can.width : 1, sy = can && rect?.height ? rect.height / can.height : 1;
    let chosen = null, best = Infinity;
    const consider = target => {
      if (!target || !target.active || !Number.isFinite(target.x) || !Number.isFinite(target.y)) return;
      const dx = target.x - coords.x, dy = target.y - coords.y, worldDistance = Math.hypot(dx, dy);
      if (worldDistance >= limit) return;
      const screenDistance = Math.hypot(dx * sx, dy * sy);
      if (screenDistance < best || screenDistance === best && target === this.targetPlayer) {
        best = screenDistance;
        chosen = target;
      }
    };
    if (MOD.target === 'players' || MOD.target === 'all') for (const target of GetAllTargets.players) if (target && target.id !== B.world.ᅠᏧ‍.id && !sameClan(target.id)) consider(target);
    if (MOD.target === 'ghouls' || MOD.target === 'all') for (const target of GetAllTargets.ghouls) consider(target);
    return chosen;
  };
  const legacyResolve = Aimbot.resolve.bind(Aimbot);
  Aimbot.resolve = function () {
    const fallback = legacyResolve();
    this.prediction = null;
    if (!this.targetPlayer) return fallback;
    const self = GetAllTargets.getPlayerById(B.world.ᅠᏧ‍.id), target = this.targetPlayer;
    // Use the same visible origin for prediction, the line, and the angle.
    const origin = self;
    const point = MOD.predictionEnabled ? predictIntercept(origin, target, predictionTime, {
      ...MOD,
      projectileSpeed: weaponInfo.speed
    }) : {
      x: target.x,
      y: target.y,
      flightTime: 0,
      status: 'direct'
    };
    this.prediction = point;
    if (MOD.visualizeResolving) GetAllTargets.lines[0].reset(self.x, self.y, point.x, point.y);
    if (MOD.ShowAimTrace) GetAllTargets.lines[2].reset(self.x, self.y, point.x, point.y);
    this.lastAngle = (Math.atan2(point.y - origin.y, point.x - origin.x) * 180 / Math.PI + 360) % 360;
    return this.lastAngle;
  };
  function alignAimLines(self, angle) {
    const direction = (Math.round(angle) % 360 + 360) % 360 * Math.PI / 180;
    for (const line of GetAllTargets.lines) {
      if (line.x1 < 0 || line.y1 < 0 || line.x2 < 0 || line.y2 < 0) continue;
      const distance = Math.hypot(line.x2 - self.x, line.y2 - self.y);
      line.reset(self.x, self.y, self.x + Math.cos(direction) * distance, self.y + Math.sin(direction) * distance);
    }
  }
  function prepareManualShot() {
    if (!playing() || !MOD.AimBotEnabled || B.chatActive && B.chatActive()) return;
    predictionTime = performance.now();
    records = collect();
    updateTargets();
    updateMouse();
    updateWeaponCalibration(predictionTime);
    const self = GetAllTargets.getPlayerById(B.world.ᅠᏧ‍.id);
    if (!self || !self.active) return;
    GetAllTargets.lines.forEach(line => line.reset(-1, -1, -1, -1));
    const angle = Aimbot.resolve();
    if (!Aimbot.targetPlayer || !Number.isFinite(angle)) return;
    alignAimLines(self, angle);
    __send([6, angle], true);
  }
  Aimbot.refresh = function () {
    GetAllTargets.lines.forEach(line => line.reset(-1, -1, -1, -1));
    const self = GetAllTargets.getPlayerById(B.world.ᅠᏧ‍.id);
    if (!playing() || !MOD.AimBotEnabled || !self || !self.active || this.isDead()) {
      this.targetPlayer = null;
      lastSentAngle = null;
      return;
    }
    const angle = this.resolve(), now = performance.now();
    if (!this.targetPlayer) lastSentAngle = null; else alignAimLines(self, angle);
    const fire = MOD.autoFire && this.wannaFire();
    if (fire || this.mouseDown && now - this.lastHitTs >= MOD.jitterHitCd) this.lastHitTs = now;
    if (MOD.jitterActive && !this.targetPlayer) {
      if (this.targetPlayer && now - this.lastHitTs < MOD.jitterAimHold) __send([6, angle], fire); else if (this.targetPlayer || this.mouseDown || !MOD.stopJittersOnStop || GetAllTargets.myLastMoveDirection !== 0) __send([6, Jitter.getJitterAngle()]);
    } else if (this.targetPlayer) __send([6, angle], fire);
    if (fire) {
      __send([4]);
      __send([5]);
    }
  };
  function playerMeta(id) {
    return B.world.ᴎ︃ᄉ[id];
  }
  function nickname(id) {
    const p = playerMeta(id), value = p && p.ο̏︇;
    return String(typeof value === 'string' ? value : _players_list[id] || '');
  }
  function playerLabel(meta, id) {
    const known = playerLabelCache.get(meta);
    if (!Number.isInteger(id)) id = known ? known.id : B.world.ᴎ︃ᄉ.indexOf(meta);
    const name = String(meta?.ο̏︇ || '');
    return MOD.ShowNamesOnMap && Number.isInteger(id) && id > 0 ? name + ' #' + id : name;
  }
  function preparePlayerLabel(meta, id) {
    const signature = String(MOD.ShowNamesOnMap) + '|' + id + '|' + String(meta.ο̏︇ || '');
    if (playerLabelCache.get(meta)?.signature !== signature) {
      meta.а༠٥ = null;
      playerLabelCache.set(meta, {
        id,
        signature
      });
    }
  }
  function zoomOffset(nativeOffset) {
    const base = Number.isFinite(nativeOffset) ? nativeOffset : 0;
    return Math.max(-.95, Math.min(3, (1 + base) * MOD.zoomFactor - 1));
  }
  function validClan(id) {
    const p = playerMeta(id), index = p && p.а༤̘;
    if (!Number.isInteger(index) || index < 0) return null;
    const clan = B.world.ﾠࡅ‍[index];
    return clan && Number.isInteger(clan.ոᚄރ) && p.ᴌ̗ⲟ === clan.ոᚄރ ? clan : null;
  }
  function sameClan(id) {
    const own = validClan(B.world.ᅠᏧ‍.id);
    return !!own && own === validClan(id);
  }
  function clanColor(id) {
    return id === B.world.ᅠᏧ‍.id || sameClan(id) ? MOD.TeamClanColor : MOD.EnemyClanColor;
  }
  const clanTagColors = new WeakMap();
  function prepareClanTag(clan, id) {
    const color = clanColor(id);
    if (clanTagColors.get(clan) !== color) {
      clan.ᴌ५ᚂ = null;
      clanTagColors.set(clan, color);
    }
  }
  function collect() {
    const result = [];
    for (let type = 0; type < B.entities.border.length; type++) {
      const border = B.entities.border[type], group = B.entities.ᴎ̂２[type];
      if (!border || !group) continue;
      for (let i = 0; i < border.border; i++) {
        const e = group[border.ⲣᴑᴏ[i]];
        if (e && e.е̝ހ === 0 && Number.isFinite(e.x) && Number.isFinite(e.y)) result.push({
          type,
          e
        });
      }
    }
    return result;
  }
  function updateTargets() {
    const players = new Set(), ghouls = new Set();
    for (const {type, e} of records) {
      if (type !== B.categories.player && type !== 13) continue;
      const isPlayer = type === B.categories.player, id = isPlayer ? e.ᴘ४１ : e.ոᚄރ;
      if (!Number.isInteger(id) || id < 1 || id > 65535) continue;
      const group = isPlayer ? GetAllTargets.players : GetAllTargets.ghouls;
      if (!group[id]) group[id] = new GetTarget(id);
      // The renderer smooths x/y behind rx/ry. Use the simulated target
      // position for tracking when it is available and close to the sprite.
      const isSelf = isPlayer && id === B.world.ᅠᏧ‍.id;
      const simulated = !isSelf && Number.isFinite(e.rx) && Number.isFinite(e.ry) && Math.hypot(e.rx - e.x, e.ry - e.y) <= 300;
      group[id].update(simulated ? e.rx : e.x, simulated ? e.ry : e.y);
      (isPlayer ? players : ghouls).add(id);
      if (isPlayer && playerMeta(id) && typeof playerMeta(id).ο̏︇ === 'string') _players_list[id] = playerMeta(id).ο̏︇;
    }
    for (const [group, seen] of [[GetAllTargets.players, players], [GetAllTargets.ghouls, ghouls]]) {
      for (const p of group) if (p && p.active && !seen.has(p.id)) p.setInactive();
    }
    const self = GetAllTargets.getPlayerById(B.world.ᅠᏧ‍.id);
    GetAllTargets.myLastMoveDirection = self && (self.x !== self.prevX[0] || self.y !== self.prevY[0]) ? 1 : 0;
  }
  function updateWeaponCalibration(now) {
    const me = B.world.ᅠᏧ‍, self = records.find(r => r.type === B.categories.player && r.e.ᴘ४１ === me.id);
    const id = self ? self.e.Іࡈ５ >> 8 & 255 : null, weapon = B.types?.[B.categories.player]?.р︎̇?.[id];
    const kind = weapon?.type;
    if (MOD.autoProjectileSpeed) weaponCalibration.observe(records.filter(r => r.type === B.categories.projectile).map(r => r.e), me.id, id, kind, now);
    const measured = MOD.autoProjectileSpeed ? weaponCalibration.get(id) : null;
    const labels = {
      10: 'AK47',
      34: 'Laser Pistol',
      37: 'Laser Submachine',
      53: 'Laser Sniper'
    };
    weaponInfo = {
      id,
      label: labels[id] || 'Weapon ' + (id ?? '?'),
      speed: measured ? measured.speed : MOD.projectileSpeed,
      samples: measured?.samples || 0
    };
  }
  function view() {
    const v = B.view(), ratio = B.graphics.options && B.graphics.options.еߎ༢;
    return {
      ...v,
      scale: v.scale * (Number.isFinite(ratio) && ratio > 0 ? ratio : 1)
    };
  }
  function updateMouse() {
    const v = view(), can = v.ctx?.canvas || document.getElementById('can');
    if (!can || !(v.scale > 0)) return;
    const r = can.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const cursor = mouse || ({
      x: r.left + r.width / 2,
      y: r.top + r.height / 2
    });
    GetAllTargets.mouseMapCords = {
      x: (cursor.x - r.left) * can.width / r.width / v.scale - v.x,
      y: (cursor.y - r.top) * can.height / r.height / v.scale - v.y
    };
  }
  function automate(now) {
    const me = B.world.ᅠᏧ‍;
    if (MOD.FAutoLootEnabled) scanFastLoot(now); else pendingLoot.clear();
    if (MOD.SAutoLootEnabled && !MOD.FAutoLootEnabled && now - lastLoot >= 200) {
      lastLoot = now;
      const allowed = new Set(Object.values(LootData).filter(x => x.acquire).map(x => x.id));
      const loot = records.filter(r => r.type === B.categories.loot && (r.e.x - me.x) ** 2 + (r.e.y - me.y) ** 2 < 50000 && (!MOD.LootDataEnabled || allowed.has(r.e.Іࡈ５)));
      loot.sort((a, b) => (a.e.x - me.x) ** 2 + (a.e.y - me.y) ** 2 - ((b.e.x - me.x) ** 2 + (b.e.y - me.y) ** 2));
      for (const {e} of loot.slice(0, 1)) __send([12, e.id]);
    }
    if (MOD.AutoBuiledEnabled && me.ε︁ᚂ === 1 && me.օⲥᚁ === 1 && now - lastBuild >= 120) {
      const packet = [14, me.α०ᚂ, me.ρⲅ️, me.ᴎ︆ࡉ];
      if (packet.every(Number.isFinite)) {
        __send(packet);
        lastBuild = now;
      }
    }
    if (MOD.AutoTakeEnabled && Aimbot.mouseDown && now - lastTake >= 200) {
      for (let slot = 0; slot < 4; slot++) __send([27, slot]);
      lastTake = now;
    }
    if (MOD.AntiKickEnabled && now - lastKeepAlive >= 7000) {
      __send([0]);
      lastKeepAlive = now;
    }
    updateChat(now);
  }
  function updateChat(now) {
    if (!MOD.SpamChatEnabled) {
      chatState.status = 'Off';
      return;
    }
    const input = document.getElementById('chatInput'), limit = input && input.maxLength > 0 ? input.maxLength : 100;
    const text = String(MOD.SpamChatText).replace(/[\r\n]+/g, ' ').trim().slice(0, limit);
    if (!text) {
      chatState.status = 'Enter a message';
      return;
    }
    if (B.chatActive && B.chatActive()) {
      chatState.status = 'Paused while typing';
      return;
    }
    if (now < nextChatAt) {
      chatState.status = 'Chat cooldown: ' + Math.ceil((nextChatAt - now) / 1000) + 's';
      return;
    }
    if (now - lastChat < 5000) {
      chatState.status = 'Next message: ' + Math.ceil((5000 - now + lastChat) / 1000) + 's';
      return;
    }
    const wait = B.network.іߐ̸(text);
    if (wait === 0) {
      lastChat = now;
      nextChatAt = -Infinity;
      chatState.sent++;
      chatState.status = 'Sent (' + chatState.sent + ')';
      const local = playerMeta(B.world.ᅠᏧ‍.id);
      if (local && local.text && typeof local.text.push === 'function') local.text.push(text);
    } else if (Number.isFinite(wait) && wait > 0) {
      nextChatAt = now + Math.max(100, wait + 100);
      chatState.status = 'Chat cooldown: ' + Math.ceil(wait / 1000) + 's';
    } else {
      nextChatAt = now + 5000;
      chatState.status = 'Send not confirmed';
    }
  }
  function scanFastLoot(now) {
    if (!playing() || !MOD.FAutoLootEnabled) {
      pendingLoot.clear();
      return;
    }
    const me = B.world.ᅠᏧ‍, type = B.categories.loot, border = B.entities.border[type], group = B.entities.ᴎ̂２[type];
    const seen = new Set(), candidates = [];
    if (border && group) for (let i = 0; i < border.border; i++) {
      const e = group[border.ⲣᴑᴏ[i]];
      if (!e || e.е̝ހ !== 0 || !Number.isInteger(e.id) || !Number.isFinite(e.x) || !Number.isFinite(e.y)) continue;
      const distance = (e.x - me.x) ** 2 + (e.y - me.y) ** 2;
      if (distance >= 50000) continue;
      seen.add(e.id);
      let state = pendingLoot.get(e.id);
      if (state && (state.entity !== e || state.resource !== e.Іࡈ５)) {
        pendingLoot.delete(e.id);
        state = null;
      }
      if (!state || now - state.sentAt >= 250 || now < state.sentAt) candidates.push({
        e,
        state,
        distance
      });
    }
    for (const id of pendingLoot.keys()) if (!seen.has(id)) pendingLoot.delete(id);
    candidates.sort((a, b) => Number(!!a.state) - Number(!!b.state) || (a.state?.sentAt || 0) - (b.state?.sentAt || 0) || a.distance - b.distance);
    for (const {e} of [...candidates.filter(x => !x.state), ...candidates.filter(x => x.state).slice(0, 4)]) if (__send([12, e.id])) pendingLoot.set(e.id, {
      entity: e,
      resource: e.Іࡈ５,
      sentAt: now
    });
  }
  function building(r) {
    if ([B.categories.player, B.categories.loot, 13].includes(r.type)) return null;
    const descriptor = B.items[r.e.Іࡈ５ >> 7];
    return descriptor && Number.isInteger(descriptor.ࡀ︂̄) && descriptor.ࡀ︂̄ > 0 ? descriptor : null;
  }
  function openUnderMouse() {
    if (!playing() || !MOD.OpenEverythingByClick) return false;
    updateMouse();
    const x = Math.floor(GetAllTargets.mouseMapCords.x / 100), y = Math.floor(GetAllTargets.mouseMapCords.y / 100);
    for (const r of records) {
      const d = building(r);
      if (d && r.e.αބ̞ === x && r.e.ᴀܛ٤ === y) return __send([d.ࡀ︂̄, r.e.id, r.e.ᴘ४１]);
    }
    return false;
  }
  function ensureOverlay() {
    const can = view().ctx?.canvas || document.getElementById('can');
    if (!can) return false;
    if (!overlay) {
      overlay = document.createElement('canvas');
      overlay.id = 'devast-mod-overlay';
      overlayHost = document.createElement('div');
      overlayHost.id = 'devast-mod-layer';
      overlayHost.style.cssText = 'position:fixed;pointer-events:none;z-index:100000;background:transparent;';
      overlay.style.cssText = 'display:block;width:100%;height:100%;background:transparent;';
      overlayHost.attachShadow({
        mode: 'open'
      }).appendChild(overlay);
      document.body.appendChild(overlayHost);
      ctx = overlay.getContext('2d');
    }
    const r = can.getBoundingClientRect();
    if (overlay.width !== can.width) overlay.width = can.width;
    if (overlay.height !== can.height) overlay.height = can.height;
    for (const [key, value] of Object.entries({
      left: r.left + 'px',
      top: r.top + 'px',
      width: r.width + 'px',
      height: r.height + 'px'
    })) if (overlayHost.style[key] !== value) overlayHost.style[key] = value;
    return !!ctx;
  }
  function syncFunctionList() {
    if (!overlayHost) return;
    if (!functionList) {
      functionList = document.createElement('div');
      functionList.id = 'devast-mod-functions';
      functionList.style.cssText = 'position:absolute;left:8px;top:50%;transform:translateY(-50%);background:rgba(6,25,36,.88);pointer-events:none;display:grid;grid-auto-flow:column;column-gap:12px;padding:2px 5px;font-family:system-ui,sans-serif;font-weight:800;white-space:nowrap;';
      for (const [key, label] of functionLabels) {
        const row = document.createElement('div');
        row.dataset.function = key || 'unavailable';
        row.textContent = '• ' + label;
        if (!key) row.title = 'Unavailable in this script';
        functionRows.set(label, { key, row });
        functionList.appendChild(row);
      }
      overlayHost.shadowRoot.appendChild(functionList);
    }
    functionList.style.display = MOD.showFunctionList ? 'grid' : 'none';
    if (!MOD.showFunctionList) return;
    const height = parseFloat(overlayHost.style.height) || window.innerHeight, rows = Math.ceil(functionRows.size / 2), font = Math.max(8, Math.min(14, (height - 16) / rows - 3)), line = Math.ceil(font + 3);
    functionList.style.fontSize = font + 'px';
    functionList.style.lineHeight = line + 'px';
    functionList.style.gridTemplateRows = 'repeat(' + rows + ', ' + line + 'px)';
    for (const { key, row } of functionRows.values()) {
      const on = key !== null && MOD[key] === true;
      if (row.dataset.enabled === String(on)) continue;
      row.dataset.enabled = String(on);
      row.style.color = on ? '#ffff00' : '#fff';
      row.style.opacity = '1';
      row.style.textShadow = on ? '0 0 7px rgba(255,255,0,.9)' : 'none';
    }
  }
  function draw() {
    if (!playing()) {
      if (ctx && overlay) ctx.clearRect(0, 0, overlay.width, overlay.height);
      if (functionList) functionList.style.display = 'none';
      return;
    }
    if (!ensureOverlay()) return;
    syncFunctionList();
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    const v = view(), me = B.world.ᅠᏧ‍;
    function at(e) {
      return {
        x: (v.x + e.x) * v.scale,
        y: (v.y + e.y) * v.scale
      };
    }
    function text(value, x, y, color = '#fff', size = 14) {
      ctx.font = size + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#000';
      ctx.fillStyle = color;
      ctx.strokeText(String(value), x, y);
      ctx.fillText(String(value), x, y);
    }
    ctx.save();
    if (MOD.ShowPosition) text('[' + Math.floor(me.x / 100) + ':' + Math.floor(me.y / 100) + ']', 100, 32, '#fff', 18);
    if (MOD.ShowGauges) {
      const gauges = B.world.ᴘρࡀ;
      if (gauges) {
        const pairs = [['HP', gauges.ᴇ༤ᚆ], ['Food', gauges.ոߎᚉ], ['Water', gauges.օᴑ̸], ['Warmth', gauges.ᴏ︀ރ]];
        text(pairs.filter(x => x[1] && Number.isFinite(x[1].value)).map(x => x[0] + ': ' + Math.floor(x[1].value)).join('  '), overlay.width / 2, overlay.height - 24);
      }
    }
    for (const r of records) {
      if (r.type === B.categories.player) {
        const id = r.e.ᴘ४１, p = at(r.e), self = id === me.id, color = self && !validClan(id) ? '#00ffff' : clanColor(id);
        if (MOD.ShowNamesOnMap && !B.nativePlayerLabels && Number.isInteger(id) && id > 0) text('#' + id, p.x, p.y - 56 * v.scale, color);
        if (MOD.ShowPlayerHitbox) {
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 38 * v.scale, 0, Math.PI * 2);
          ctx.stroke();
          ctx.strokeRect(p.x - 30 * v.scale, p.y - 30 * v.scale, 60 * v.scale, 60 * v.scale);
          const origin = GetAllTargets.getPlayerById(me.id), player = GetAllTargets.getPlayerById(id);
          if (!self && MOD.predictionEnabled && origin?.active && player?.active) {
            const predicted = predictIntercept(origin, player, predictionTime, {
              ...MOD,
              projectileSpeed: weaponInfo.speed
            });
            if (['intercept', 'limited'].includes(predicted.status)) {
              const lead = at(predicted);
              ctx.save();
              ctx.strokeStyle = '#ff55ff';
              ctx.setLineDash([5, 4]);
              ctx.beginPath();
              ctx.arc(lead.x, lead.y, 38 * v.scale, 0, Math.PI * 2);
              ctx.stroke();
              ctx.strokeRect(lead.x - 30 * v.scale, lead.y - 30 * v.scale, 60 * v.scale, 60 * v.scale);
              ctx.restore();
            }
          }
        }
        if (MOD.KarmaAboveHead) {
          const meta = playerMeta(id), sprite = meta && B.karma[meta.ᴑᴄ̉];
          if (sprite && B.graphics.ᴑ̸ᴘ) B.graphics.ᴑ̸ᴘ(sprite, v.x + r.e.x, v.y + r.e.y - 85, 0, 0, 0, 0.6);
        }
      } else if (MOD.ShowBuildingOwner && building(r)) {
        const x = Math.floor(GetAllTargets.mouseMapCords.x / 100), y = Math.floor(GetAllTargets.mouseMapCords.y / 100);
        if (r.e.αބ̞ === x && r.e.ᴀܛ٤ === y) {
          const p = at(r.e), id = r.e.ᴘ४１;
          text((nickname(id) || 'Owner') + ' #' + id, p.x, p.y - 35, clanColor(id), 16);
        }
      }
    }
    const target = Aimbot.targetPlayer;
    const selfRecord = records.find(r => r.type === B.categories.player && r.e.ᴘ४１ === me.id);
    const targetRecord = target && records.find(r => r.type === B.categories.player && r.e.ᴘ४１ === target.id && GetAllTargets.players[target.id] === target || r.type === 13 && r.e.ոᚄރ === target.id && GetAllTargets.ghouls[target.id] === target);
    if (MOD.AimBotEnabled && selfRecord && targetRecord && target.active && selfRecord.e.е̝ހ === 0 && targetRecord.e.е̝ހ === 0) {
      const start = at(selfRecord.e);
      for (const [i, line] of GetAllTargets.lines.entries()) {
        if (i === 0 && !MOD.visualizeResolving || i === 2 && !MOD.ShowAimTrace) continue;
        if (![line.x1, line.y1, line.x2, line.y2].every(Number.isFinite) || line.x1 < 0 || line.y1 < 0 || line.x2 < 0 || line.y2 < 0) continue;
        const distance = Math.hypot(line.x2 - line.x1, line.y2 - line.y1);
        const heading = (Math.round(Aimbot.lastAngle) % 360 + 360) % 360 * Math.PI / 180;
        const end = at({
          x: selfRecord.e.x + Math.cos(heading) * distance,
          y: selfRecord.e.y + Math.sin(heading) * distance
        });
        ctx.globalAlpha = line.alpha;
        ctx.strokeStyle = line.color;
        ctx.lineWidth = line.width;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    if (MOD.AimBotEnabled && MOD.predictionEnabled && MOD.visualizeResolving && selfRecord && targetRecord && targetRecord.e.е̝ހ === 0 && Aimbot.prediction && ['intercept', 'limited'].includes(Aimbot.prediction.status)) {
      // Match the displayed impact marker to the rounded angle sent to the game.
      const distance = Math.hypot(Aimbot.prediction.x - selfRecord.e.x, Aimbot.prediction.y - selfRecord.e.y);
      const heading = (Math.round(Aimbot.lastAngle) % 360 + 360) % 360 * Math.PI / 180;
      const point = at({x:selfRecord.e.x + Math.cos(heading) * distance, y:selfRecord.e.y + Math.sin(heading) * distance});
      ctx.save();
      ctx.strokeStyle = '#ff55ff';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
      ctx.stroke();
      text(Math.round(Aimbot.prediction.flightTime * 1000) + ' ms', point.x, point.y - 12, '#ff88ff', 12);
      ctx.restore();
    }
    if (MOD.PlayersListEnabled) {
      ctx.fillStyle = 'rgba(0,0,0,.8)';
      ctx.fillRect(0, 0, overlay.width, overlay.height);
      let i = 0;
      B.world.ᴎ︃ᄉ.forEach((p, id) => {
        if (!p || !nickname(id) || id === 0 || id === 120) return;
        const clan = p.а༤̘ !== -1 && B.world.ﾠࡅ‍[p.а༤̘], col = Math.floor(i / 30), row = i % 30;
        text(nickname(id) + ' #' + id + (clan && clan.name ? ' [' + clan.name + ']' : ''), 120 + col * (overlay.width / 4), 35 + row * ((overlay.height - 70) / 30), clanColor(id), 13);
        i++;
      });
      text('Players: ' + i, overlay.width - 100, overlay.height - 22);
    }
    ctx.restore();
  }
  const reconnect = {
    status: 'Ready',
    attempts: 0,
    armed: false,
    next: 0,
    pending: false,
    generation: 0
  };
  function updateReconnect(now) {
    const n = B.network;
    if (n.state === 1) {
      reconnect.status = 'Connected';
      reconnect.attempts = 0;
      reconnect.armed = true;
      reconnect.pending = false;
      reconnect.next = 0;
      reconnect.generation++;
      return;
    }
    if ((n.state & 2) !== 0) {
      reconnect.armed = true;
      reconnect.pending = false;
    }
    if (n.state !== 64 || !reconnect.armed || stopped) return;
    if (typeof n.ⲅ︊ᄃ !== 'function' || typeof B.reconnect !== 'function') return;
    if (reconnect.pending) {
      if (now < reconnect.deadline) return;
      reconnect.pending = false;
      reconnect.generation++;
      reconnect.status = 'Refresh timed out';
      return;
    }
    if (reconnect.attempts >= 3) {
      reconnect.status = 'Connection failed after 3 retries';
      return;
    }
    if (!reconnect.next) {
      reconnect.next = now + [1000, 3000, 7000][reconnect.attempts];
      reconnect.status = 'Retry scheduled; saved login kept';
      return;
    }
    if (now < reconnect.next) return;
    const selected = n.ԁᴄࡃ;
    if (!Array.isArray(selected)) {
      reconnect.status = 'Select a server';
      return;
    }
    const lobby = selected[0], region = selected[4], mode = selected[6], generation = ++reconnect.generation;
    reconnect.pending = true;
    reconnect.attempts++;
    reconnect.next = 0;
    reconnect.deadline = now + 12000;
    reconnect.status = 'Refreshing servers / retry ' + reconnect.attempts;
    try {
      n.ⲅ︊ᄃ('https://devast.io/list?reconnect=' + Date.now(), () => {
        if (stopped || generation !== reconnect.generation) return;
        reconnect.pending = false;
        if (n.state !== 64) return;
        const row = n.ոߒ४?.find(r => r[0] === lobby && r[4] === region && r[6] === mode);
        if (!row) {
          reconnect.status = 'Selected server unavailable';
          return;
        }
        n.ԁᴄࡃ = row;
        reconnect.status = 'Connecting / retry ' + reconnect.attempts;
        try {
          B.reconnect();
          reconnect.pending = true;
          reconnect.deadline = now + 12000;
        } catch (_) {
          reconnect.status = 'Retry could not start';
        }
      });
    } catch (_) {
      reconnect.pending = false;
      reconnect.status = 'Server refresh failed';
    }
  }
  function step(now = performance.now()) {
    diagnostics.frames++;
    predictionTime = now;
    updateReconnect(now);
    if (!playing()) {
      lastSentAngle = null;
      pendingLoot.clear();
      if (previousPlayer) {
        Aimbot.onDeath();
        previousPlayer = 0;
        records = [];
        _players_list.length = 0;
      }
      chatState.status = MOD.SpamChatEnabled ? 'Waiting for game' : 'Off';
      draw();
      return;
    }
    if (previousPlayer !== B.world.ᅠᏧ‍.id) {
      lastSentAngle = null;
      weaponCalibration.reset();
      Aimbot.onDeath();
      previousPlayer = B.world.ᅠᏧ‍.id;
      lastLoot = lastBuild = lastTake = now;
      lastChat = nextChatAt = -Infinity;
      lastKeepAlive = now;
    }
    records = collect();
    updateTargets();
    updateMouse();
    updateWeaponCalibration(now);
    if (MOD.AimBotEnabled) Aimbot.refresh(); else lastSentAngle = null;
    if (MOD.ShowRealAngles === 'always' || MOD.ShowRealAngles === 'withAim' && MOD.AimBotEnabled) {
      const self = records.find(r => r.type === B.categories.player && r.e.ᴘ४１ === B.world.ᅠᏧ‍.id);
      if (self && Number.isFinite(self.e.ࡀօ̙)) self.e.angle = self.e.ࡀօ̙;
    }
    automate(now);
    if (!B.synchronizedRender) draw();
  }
  function tick(now) {
    if (stopped) return;
    if (now - lastStep >= 16) {
      lastStep = now;
      try {
        step(now);
      } catch (e) {
        report(e);
      }
    }
    nextFrame = window.requestAnimationFrame(tick);
  }
  for (const key of ["ѕ᠋༢", "ρ٨٨"]) {
    if (typeof B.network[key] !== 'function') throw new Error('Missing native angle handler');
    originals[key] = B.network[key];
    B.network[key] = function (...args) {
      if (playing() && MOD.AimBotEnabled && Aimbot.targetPlayer) return;
      lastSentAngle = null;
      return originals[key].apply(this, args);
    };
  }
  // The game can start or repeat an attack during its own update loop,
  // independently of mouse events. Send the current lead before that attack.
  if (typeof B.network.ῐ︆ === 'function') {
    originals.ῐ︆ = B.network.ῐ︆;
    B.network.ῐ︆ = function (...args) {
      try {
        prepareManualShot();
      } catch (error) {
        report(error);
      }
      return originals.ῐ︆.apply(this, args);
    };
  }
  function keyboard(e) {
    if (waitingKey) {
      e.preventDefault();
      e.stopImmediatePropagation();
      MOD[waitingKey] = e.code;
      waitingKey = null;
      persist();
      menu.updateDisplay();
      return;
    }
    const t = e.target;
    if (e.repeat || t && (t.isContentEditable || (/^(INPUT|TEXTAREA|SELECT)$/).test(t.tagName)) || B.chatActive && B.chatActive()) return;
    const bindings = {
      AimbotKey: 'AimBotEnabled',
      AutoBuiledKey: 'AutoBuiledEnabled',
      SAutoLootKey: 'SAutoLootEnabled',
      FAutoLootKey: 'FAutoLootEnabled',
      AutoTakeKey: 'AutoTakeEnabled',
      XrayKey: 'XrayBuildings',
      PlayersListKey: 'PlayersListEnabled',
      JitterKey: 'jitterActive'
    };
    if (e.code === MOD.ModMenuKey) {
      if (menu) menu.domElement.style.display = menu.domElement.style.display === 'none' ? '' : 'none';
      return;
    }
    for (const [key, setting] of Object.entries(bindings)) if (e.code === MOD[key]) {
      setSetting(setting, !MOD[setting]);
      break;
    }
  }
  listen(window, 'keydown', keyboard, true);
  listen(window, 'mousemove', e => {
    mouse = {
      x: e.clientX,
      y: e.clientY
    };
    if (e.target !== document.getElementById('can') || !playing() || !MOD.AimBotEnabled || B.chatActive && B.chatActive() || Aimbot.isDead()) return;
    predictionTime = performance.now();
    records = collect();
    updateTargets();
    const self = GetAllTargets.getPlayerById(B.world.ᅠᏧ‍.id);
    if (!self?.active) return;
    updateMouse();
    GetAllTargets.lines.forEach(line => line.reset(-1, -1, -1, -1));
    const angle = Aimbot.resolve();
    if (Aimbot.targetPlayer && Number.isFinite(angle)) {
      alignAimLines(self, angle);
      __send([6, angle]);
    }
  }, true);
  listen(window, 'mousedown', e => {
    if (e.target.closest && e.target.closest('.dg')) return;
    mouse = {
      x: e.clientX,
      y: e.clientY
    };
    if (e.button === 0) {
      Aimbot.mouseDown = true;
      if (e.target === document.getElementById('can')) prepareManualShot();
    }
    if (e.button === 2 && openUnderMouse()) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }, true);
  listen(window, 'mouseup', e => {
    if (e.button === 0) Aimbot.mouseDown = false;
  }, true);
  listen(window, 'blur', () => {
    Aimbot.mouseDown = false;
  });
  const canvas = document.getElementById('can');
  if (canvas) {
    listen(canvas, 'contextmenu', e => {
      if (MOD.OpenEverythingByClick && playing()) e.preventDefault();
    });
    listen(canvas, 'wheel', e => {
      if (!playing()) return;
      if (e.ctrlKey || !Number.isFinite(e.deltaY) || e.deltaY === 0) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      const delta = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? canvas.getBoundingClientRect().height : 1);
      MOD.zoomFactor = Math.max(.33, Math.min(2, MOD.zoomFactor * Math.exp(-Math.max(-100, Math.min(100, delta)) * .001)));
      zoomControl?.updateDisplay();
    }, {
      capture: true,
      passive: false
    });
  }
  function createMenu() {
    if (stopped || menu) return;
    if (!window.dat || !window.dat.GUI) throw new Error('dat.GUI did not load');
    menu = new window.dat.GUI({
      width: 310
    });
    window.removeEventListener('keydown', window.dat.GUI._keydownHandler, false);
    const style = document.createElement('style');
    style.textContent = '.dg.main{position:fixed!important;top:10px!important;right:10px!important;max-height:92vh;overflow:auto;z-index:2147483647!important;background:#190707!important;border:1px solid #a22;border-radius:6px}.dg .title{color:#ffaaaa}.dg .slider-fg{background:#a22!important}.dg .cr{background:#190d0d}';
    document.head.appendChild(style);
    removers.push(() => style.remove());
    // dat.GUI ends numeric drags with window-level mouseup/touchend handlers.
    // Let move and release events reach those handlers, even inside the menu.
    for (const event of ['mousedown', 'click', 'dblclick', 'wheel', 'touchstart']) listen(menu.domElement, event, e => e.stopPropagation());
    function add(folder, key, label, ...range) {
      const c = folder.add(MOD, key, ...range).name(label || key);
      c.onChange(v => setSetting(key, v));
      return c;
    }
    const visual = menu.addFolder('Visuals');
    for (const key of ['ShowPosition', 'ShowGauges', 'ShowNamesOnMap', 'ShowMines', 'ShowPlayerHitbox', 'KarmaAboveHead', 'ShowBuildingOwner', 'XrayBuildings', 'PlayersListEnabled', 'showFunctionList']) add(visual, key);
    add(visual, 'Xraytransparency', 'Building opacity', .05, 1, .05);
    for (const key of ['TeamClanColor', 'EnemyClanColor']) visual.addColor(MOD, key).onChange(persist);
    const aim = menu.addFolder('Aim bot');
    for (const key of ['AimBotEnabled', 'hideAimbotAngle', 'autoFire', 'visualizeResolving', 'ShowAimTrace']) add(aim, key);
    add(aim, 'predictionEnabled', 'Motion prediction');
    add(aim, 'autoProjectileSpeed', 'Measure own bullets');
    const speedStatus = {
      get status() {
        return weaponInfo.label + ' / ' + Math.round(weaponInfo.speed) + ' u/s / ' + (weaponInfo.samples ? weaponInfo.samples + ' shots' : 'manual fallback');
      }
    };
    const speedInfo = aim.add(speedStatus, 'status').name('Bullet speed source').listen();
    speedInfo.domElement.querySelector('input').readOnly = true;
    const predictionStatus = {
      get status() {
        const p = Aimbot.prediction;
        if (!MOD.predictionEnabled) return 'Off';
        if (!Aimbot.targetPlayer) return 'No target';
        if (!p) return 'Waiting for samples';
        return p.status + ' / ' + Math.round(p.flightTime * 1000) + ' ms';
      }
    };
    const predictionInfo = aim.add(predictionStatus, 'status').name('Lead status').listen();
    predictionInfo.domElement.querySelector('input').readOnly = true;
    add(aim, 'projectileSpeed', 'Manual / fallback speed', 100, 6000, 50);
    add(aim, 'predictionHorizonMs', 'Maximum lead (ms)', 0, 2000, 25);
    add(aim, 'predictionLatencyMs', 'Extra latency (ms)', 0, 300, 5);
    add(aim, 'resolverType', 'Legacy fallback', ['linear', 'trygonometrical']);
    add(aim, 'ShowRealAngles', 'Show real angles', ['always', 'withAim']);
    add(aim, 'distanceCoefficient', 'Distance coefficient', 10, 1000, 10);
    add(aim, 'bulletSpeedCoefficient', 'Bullet speed', 1, 15, .25);
    add(aim, 'offsetCoefficient', 'Prediction offset', 0, 3, .1);
    aim.addColor(MOD, 'visualizeResolvingColor').onChange(persist);
    const jitter = aim.addFolder('Jitter');
    for (const key of ['jitterActive', 'stopJittersOnStop']) add(jitter, key);
    add(jitter, 'jitterOffset', 'Offset', 0, 180, 1);
    add(jitter, 'jitterHitCd', 'Hit interval', 50, 2000, 50);
    add(jitter, 'jitterAimHold', 'Aim hold', 0, 1000, 10);
    const zoom = menu.addFolder('Zoom');
    zoomControl = add(zoom, 'zoomFactor', 'View scale', .33, 2, .01);
    zoom.add({
      Reset: () => setSetting('zoomFactor', 1)
    }, 'Reset');
    const automation = menu.addFolder('Automation');
    for (const key of ['SAutoLootEnabled', 'FAutoLootEnabled', 'LootDataEnabled', 'AutoBuiledEnabled', 'AutoTakeEnabled', 'AntiKickEnabled', 'OpenEverythingByClick']) add(automation, key);
    const filter = automation.addFolder('Loot filter');
    for (const [name, item] of Object.entries(LootData)) filter.add(item, 'acquire').name(name).onChange(persist);
    const keys = menu.addFolder('Keyboard');
    for (const key of ['AimbotKey', 'AutoBuiledKey', 'SAutoLootKey', 'FAutoLootKey', 'AutoTakeKey', 'XrayKey', 'PlayersListKey', 'JitterKey', 'ModMenuKey']) {
      const c = keys.add(MOD, key), input = c.domElement.querySelector('input');
      input.readOnly = true;
      listen(input, "click", () => {
        waitingKey = key;
        input.blur();
        input.value = 'Press a key';
      });
    }
    const players = menu.addFolder('Players');
    add(players, 'PlayerId', 'Player ID');
    players.add({
      CopyNick: () => navigator.clipboard.writeText(nickname(parseInt(MOD.PlayerId, 10)) || '')
    }, 'CopyNick').name('Copy nickname');
    players.add({
      CopyAll: () => navigator.clipboard.writeText(B.world.ᴎ︃ᄉ.map((p, id) => p ? nickname(id) : '').filter(Boolean).join('\n'))
    }, 'CopyAll').name('Copy all nicknames');
    const token = menu.addFolder('Token changer');
    token.add(MOD, 'Token').name('Token');
    token.add({
      Copy: () => navigator.clipboard.writeText(['token', 'tokenId', 'userId'].map(k => JSON.stringify(localStorage.getItem(k) || '')).join(' '))
    }, 'Copy');
    const tokenStatus = {
      status: 'Changes apply on next connection'
    };
    token.add({
      Change: () => {
        let parsed;
        try {
          const raw = String(MOD.Token).trim();
          let i = 0;
          parsed = [];
          while (i < raw.length) {
            if (raw.charCodeAt(i) !== 34) throw Error();
            const start = i++;
            for (; i < raw.length; i++) {
              if (raw.charCodeAt(i) === 92) {
                i++;
                continue;
              }
              if (raw.charCodeAt(i) === 34) {
                i++;
                break;
              }
            }
            parsed.push(JSON.parse(raw.slice(start, i)));
            if (i < raw.length && raw[i].trim() !== '') throw Error();
            while (i < raw.length && raw[i].trim() === '') i++;
          }
          if (parsed.length !== 3 || parsed.some(x => typeof x !== 'string' || !x.trim())) throw Error();
        } catch (_) {
          tokenStatus.status = 'Invalid input; nothing changed';
          alert('Expected exactly three nonempty quoted strings: token tokenId userId');
          return;
        }
        const keys = ['token', 'tokenId', 'userId'];
        let previous;
        try {
          previous = keys.map(k => localStorage.getItem(k));
          keys.forEach((k, i) => localStorage.setItem(k, parsed[i]));
        } catch (_) {
          if (previous) keys.forEach((k, i) => {
            try {
              previous[i] === null ? localStorage.removeItem(k) : localStorage.setItem(k, previous[i]);
            } catch (_) {}
          });
          tokenStatus.status = 'Storage error; update not confirmed';
          alert('Could not save token fields');
          return;
        }
        MOD.Token = '';
        tokenStatus.status = 'Saved all 3 fields; reconnect to apply';
        menu.updateDisplay();
      }
    }, 'Change');
    const tokenInfo = token.add(tokenStatus, 'status').name('Status').listen();
    tokenInfo.domElement.querySelector('input').readOnly = true;
    const chat = menu.addFolder('Chat');
    add(chat, 'SpamChatText', 'Text');
    add(chat, 'SpamChatEnabled', 'Repeat message');
    const chatStatus = chat.add(chatState, 'status').name('Status').listen();
    chatStatus.domElement.querySelector('input').readOnly = true;
    const connection = menu.addFolder('Connection');
    const connectionStatus = connection.add(reconnect, 'status').name('Status').listen();
    connectionStatus.domElement.querySelector('input').readOnly = true;
    const config = menu.addFolder('Config');
    config.add({
      Save: persist
    }, 'Save');
    config.add({
      Reset: () => {
        Object.assign(MOD, defaults);
        for (const item of lootItems) LootData[item.name].acquire = item.acquire;
        persist();
        menu.updateDisplay();
      }
    }, 'Reset');
  }
  if (document.readyState === 'loading') listen(window, 'DOMContentLoaded', () => {
    try {
      createMenu();
    } catch (e) {
      report(e);
    }
  }); else createMenu();
  nextFrame = window.requestAnimationFrame(tick);
  return {
    settings: MOD,
    targets: GetAllTargets,
    aim: Aimbot,
    loot: LootData,
    diagnostics,
    chat: chatState,
    reconnect,
    step,
    setSetting,
    openUnderMouse,
    clanColor,
    prepareClanTag,
    playerLabel,
    preparePlayerLabel,
    zoomOffset,
    render(now = performance.now()) {
      if (stopped) return;
      try {
        scanFastLoot(now);
        draw();
      } catch (e) {
        report(e);
      }
    },
    get records() {
      return records;
    },
    get menu() {
      return menu;
    },
    get overlay() {
      return overlay;
    },
    get functionList() {
      return functionList;
    },
    get weaponInfo() {
      return {
        ...weaponInfo
      };
    },
    dispose() {
      MOD.zoomFactor = 1;
      MOD.AimBotEnabled = false;
      stopped = true;
      pendingLoot.clear();
      window.cancelAnimationFrame(nextFrame);
      removers.forEach(f => f());
      if (menu) menu.destroy();
      if (overlayHost) overlayHost.remove();
      Object.assign(B.network, originals);
    }
  };
}
