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
      this.mouseFovEnable = true;
      this.distanceCoefficient = 300;
      this.bulletSpeedCoefficient = 4;
      this.offsetCoefficient = 0.1;
      this.visualizeResolving = true;
      this.visualizeResolvingColor = "#EEEEEE";
      this.autoFire = false;
      this.lockId = -1;
      this.mouseFov = 12345;
      this.OpenEverythingByClick = true;
      this.ShowBuildingOwner = true;
      this.AimbotKey = "Space";
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
      this.KarmaAboveHead = false;
      this.ShowGauges = false;
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
      this.lines.push(new LinesCon(0.6, 1, "#EEEEEE"));
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
    resetLines() {
      this.lines.forEach(line => line.reset(-1, -1, -1, -1));
    }
  }
  class GetTarget {
    constructor(id) { this.id=id; this.x=-1; this.y=-1; this.prevX=[-1,-1,-1]; this.prevY=[-1,-1,-1]; this.active=false; this.weapon=-1; this.gear=-1; }
    update(x,y) {
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      this.prevX[2]=this.prevX[1]; this.prevX[1]=this.prevX[0]; this.prevX[0]=this.x;
      this.prevY[2]=this.prevY[1]; this.prevY[1]=this.prevY[0]; this.prevY[0]=this.y;
      this.x=x; this.y=y; this.active=true;
    }
    setInactive() { this.x=-1; this.y=-1; this.prevX.fill(-1); this.prevY.fill(-1); this.active=false; GetAllTargets.resetLines(); }
  }
  class LinesCon {
    constructor(alpha, width, color) { this.alpha=alpha; this.width=width; this.color=color; this.reset(-1,-1,-1,-1); }
    reset(x1,y1,x2,y2) { this.x1=x1; this.y1=y1; this.x2=x2; this.y2=y2; }
  }
  class AimbotCon {
    constructor() { this.lastAngle = 0; this.targetPlayer = null; this.mouseDown = false; }
    onDeath() {
      this.targetPlayer = null; this.mouseDown = false; GetAllTargets.lastId = 0;
      for (const group of [activePlayers, activeGhouls]) {
        for (const target of group.values()) target.setInactive();
        group.clear();
      }
      activePlayerCache = activeGhoulCache = null;
      GetAllTargets.lines.forEach(line => line.reset(-1, -1, -1, -1));
    }
    isDead() { return !B.world.ᅠᏧ‍ || B.world.ᅠᏧ‍.id === 0; }
  }
  const MOD = new HackCon();
  Object.assign(MOD, {zoomFactor:1, showFunctionList:true});
  const defaults = JSON.parse(JSON.stringify(MOD));
  const SAVE = 'BestModMenuConfig';
  const transient = new Set(['Token', 'token', 'tokenId', 'userId']);
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE) || '{}');
    for (const key of Object.keys(defaults)) {
      if (!transient.has(key) && typeof saved[key] === typeof defaults[key] && (typeof saved[key] !== 'number' || Number.isFinite(saved[key]))) MOD[key] = saved[key];
    }
    if (localStorage.getItem(SAVE + ':ilm1') !== '1') {
      for (const key of ['AimBotEnabled', 'AimbotKey', 'autoFire', 'target', 'mouseFovEnable', 'mouseFov', 'lockId', 'distanceCoefficient', 'offsetCoefficient', 'visualizeResolving', 'visualizeResolvingColor', 'ShowRealAngles']) MOD[key] = defaults[key];
      const migrated = {};
      for (const key of Object.keys(defaults)) if (!transient.has(key)) migrated[key] = MOD[key];
      localStorage.setItem(SAVE, JSON.stringify(migrated));
      localStorage.setItem(SAVE + ':ilm1', '1');
    }
  } catch (_) {}
  MOD.zoomFactor = 1;
  MOD.ShowGauges = false;
  MOD.KarmaAboveHead = false;
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
  const activePlayers = new Map(), activeGhouls = new Map();
  let activePlayerCache = null, activeGhoulCache = null;
  function activeTargets(players) {
    if (players) return activePlayerCache || (activePlayerCache = [...activePlayers.values()].sort((a,b)=>a.id-b.id));
    return activeGhoulCache || (activeGhoulCache = [...activeGhouls.values()].sort((a,b)=>a.id-b.id));
  }
  const GetAllTargets = new GetAllTargetsCon();
  const Aimbot = new AimbotCon();
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
  // ILM 1.0 aim logic: packet position history, distance-based lead and
  // direction-change auto fire. The network adapter converts its angle format.
  Aimbot.wannaFire = function (target = this.targetPlayer) {
    if (!target) return false;
    const [x0, x1] = target.prevX, [y0, y1] = target.prevY;
    return (target.x - x0 > 0) !== (x0 - x1 > 0) || (target.y - y0 > 0) !== (y0 - y1 > 0);
  };
  Aimbot.findNearestPlayerTo = function (coords, limit) {
    let selected = null, nearest = limit;
    const consider = targets => {
      for (const target of targets) {
        if (!target || !target.active || target.id === B.world.ᅠᏧ‍.id || sameClan(target.id)) continue;
        const distance = Math.hypot(coords.x - target.x, coords.y - target.y);
        if (distance < nearest) { selected = target; nearest = distance; }
      }
    };
    if (MOD.target === 'players' || MOD.target === 'all') consider(activeTargets(true));
    if (MOD.target === 'ghouls' || MOD.target === 'all') consider(activeTargets(false));
    return selected;
  };
  Aimbot.resolve = function () {
    const self = GetAllTargets.getPlayerById(B.world.ᅠᏧ‍.id);
    if (!self || !self.active) { this.targetPlayer = null; return this.lastAngle; }
    const target = MOD.lockId > -1 ? GetAllTargets.getPlayerById(MOD.lockId) :
      MOD.mouseFovEnable ? this.findNearestPlayerTo(GetAllTargets.mouseMapCords, MOD.mouseFov) : this.findNearestPlayerTo(self, 2500);
    this.targetPlayer = target && target.active ? target : null;
    if (!this.targetPlayer) return this.lastAngle;
    const factor = Math.hypot(self.x - target.x, self.y - target.y) / MOD.distanceCoefficient + MOD.offsetCoefficient;
    const x = target.prevX[0] === -1 ? target.x : target.x + factor * (target.x - target.prevX[0]);
    const y = target.prevY[0] === -1 ? target.y : target.y + factor * (target.y - target.prevY[0]);
    this.lastAngle = Math.atan2(y - self.y, x - self.x) * (180 / Math.PI);
    if (MOD.visualizeResolving) GetAllTargets.lines[0].reset(self.x, self.y, x, y);
    return Math.round(this.lastAngle);
  };
  Aimbot.refresh = function () {
    if (!playing() || this.isDead()) return;
    GetAllTargets.lastId = B.world.ᅠᏧ‍.id;
    if (!MOD.AimBotEnabled) return;
    const angle = this.resolve();
    __send([6, angle], true);
    if (MOD.autoFire && this.wannaFire()) { __send([4]); __send([5]); }
  };
  function trackPacket(type, playerId, uid, x, y, active) {
    const group = type === B.categories.player ? GetAllTargets.players : type === 13 ? GetAllTargets.ghouls : null;
    const id = type === B.categories.player ? playerId : uid;
    if (!group || !Number.isInteger(id) || id < 1 || id > 65535) return;
    if (!group[id]) group[id] = new GetTarget(id);
    const players = type === B.categories.player, index = players ? activePlayers : activeGhouls;
    if (!active) {
      if (index.delete(id)) { if (players) activePlayerCache = null; else activeGhoulCache = null; }
      group[id].setInactive(); return;
    }
    if (Number.isFinite(x) && Number.isFinite(y)) {
      group[id].update(x, y);
      if (!index.has(id)) {
        index.set(id, group[id]);
        if (players) activePlayerCache = null; else activeGhoulCache = null;
      }
    }
  }
  function playerMeta(id) {
    return B.world.ᴎ︃ᄉ[id];
  }
  function nickname(id) {
    const p = playerMeta(id), value = p && p.ο̏︇;
    return typeof value === 'string' ? value : '';
  }
  function playerRows() {
    const rows = [];
    B.world.ᴎ︃ᄉ.forEach((meta, id) => {
      const name = nickname(id);
      if (!meta || !name || id === 0) return;
      rows.push({id, name, clan: validClan(id)?.name || ''});
    });
    return rows;
  }
  function playerLabel(meta, id) {
    const known = playerLabelCache.get(meta);
    if (!Number.isInteger(id)) id = known ? known.id : B.world.ᴎ︃ᄉ.indexOf(meta);
    const name = String(meta?.ο̏︇ || '');
    return MOD.ShowNamesOnMap && Number.isInteger(id) && id > 0 ? (name ? name + ' #' : '#') + id : name;
  }
  function preparePlayerLabel(meta, id) {
    const cached = playerLabelCache.get(meta), name = meta.ο̏︇, color = clanColor(id);
    if (!cached || cached.id !== id || cached.name !== name || cached.color !== color || cached.show !== MOD.ShowNamesOnMap) {
      meta.εⲅᄄ = null;
      playerLabelCache.set(meta, {id, name, color, show:MOD.ShowNamesOnMap});
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
    const color = clanColor(id), previous = clanTagColors.get(clan);
    if (!previous || previous.color !== color || previous.name !== clan.name || previous.generation !== clan.ոᚄރ) {
      clan.Ꮷ८ᚅ = null;
      clanTagColors.set(clan, {color, name:clan.name, generation:clan.ոᚄރ});
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
  function view() {
    const v = B.view(), ratio = B.graphics.options && B.graphics.options.еߎ༢;
    return {
      ...v,
      scale: v.scale * (Number.isFinite(ratio) && ratio > 0 ? ratio : 1)
    };
  }
  function updateMouse() {
    const v = view(), can = v.ctx?.canvas || document.getElementById('can');
    if (!can || !(v.scale > 0)) return false;
    const r = can.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    const cursor = mouse || ({
      x: r.left + r.width / 2,
      y: r.top + r.height / 2
    });
    GetAllTargets.mouseMapCords = {
      x: (cursor.x - r.left) * can.width / r.width / v.scale - v.x,
      y: (cursor.y - r.top) * can.height / r.height / v.scale - v.y
    };
    return Number.isFinite(GetAllTargets.mouseMapCords.x) && Number.isFinite(GetAllTargets.mouseMapCords.y);
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
    if (r.type === B.categories.player || r.type === B.categories.loot || r.type === 13) return null;
    const descriptor = B.items[r.e.Іࡈ５ >> 7];
    return descriptor && Number.isInteger(descriptor.ࡀ︂̄) && descriptor.ࡀ︂̄ > 0 ? descriptor : null;
  }
  const doorRegions = new WeakMap(), doorPixels = new WeakMap();
  let doorFrame = null, doorDrawOrder = 0;
  const interaction = {status:'', until:0, pending:null};
  function captureDoor(entity, frame, image, x, y, angle, ox, oy, width, height) {
    if (frame !== doorFrame) { doorFrame = frame; doorDrawOrder = 0; }
    let region = doorRegions.get(entity);
    if (!region) { region = {}; doorRegions.set(entity, region); }
    region.order=++doorDrawOrder; region.frame=frame; region.image=image; region.x=x; region.y=y; region.angle=angle;
    region.ox=ox; region.oy=oy; region.width=width; region.height=height;
  }
  function hitsDoor(region, cursor, can, rect) {
    if (!region || B.renderFrame && region.frame !== B.renderFrame()) return false;
    const ratio = B.graphics.options?.еߎ༢ || 1;
    const x = (cursor.x - rect.left) * can.width / rect.width / ratio - region.x;
    const y = (cursor.y - rect.top) * can.height / rect.height / ratio - region.y;
    const angle = Number.isFinite(region.angle) ? region.angle : 0;
    const cos = Math.cos(angle), sin = Math.sin(angle);
    const px = (x * cos + y * sin - region.ox) / region.width;
    const py = (-x * sin + y * cos - region.oy) / region.height;
    if (!(px >= 0 && py >= 0 && px < 1 && py < 1)) return false;
    // Sample alpha only on click, caching pixels per sprite instead of per door/frame.
    let pixels = doorPixels.get(region.image);
    if (pixels === undefined) {
      try {
        const image = region.image, c = document.createElement('canvas');
        c.width = image.width; c.height = image.height;
        const context = c.getContext('2d', {willReadFrequently:true});
        context.drawImage(image, 0, 0);
        pixels = {width:c.width, height:c.height, data:context.getImageData(0, 0, c.width, c.height).data};
      } catch (_) { pixels = null; }
      doorPixels.set(region.image, pixels);
    }
    if (!pixels) return true;
    return pixels.data[(Math.floor(py * pixels.height) * pixels.width + Math.floor(px * pixels.width)) * 4 + 3] > 16;
  }
  function interactionStatus(message, now = performance.now()) {
    interaction.status = message; interaction.until = now + 3000;
  }
  function checkInteraction(now) {
    const pending = interaction.pending;
    if (!pending) return;
    if (pending.entity.е̝ހ !== 0 || pending.entity.id !== pending.id || pending.entity.ᴘ४１ !== pending.owner) {
      interaction.pending = null; interactionStatus('Дверь больше недоступна', now);
    } else if ((pending.entity.state & 16) !== pending.open) {
      interaction.pending = null;
      interactionStatus(pending.entity.state & 16 ? 'Дверь открыта' : 'Дверь закрыта', now);
    } else if (now >= pending.deadline) {
      interaction.pending = null; interactionStatus('Сервер не подтвердил переключение двери', now);
    }
  }
  function openUnderMouse(event) {
    if (!playing() || !MOD.OpenEverythingByClick || B.chatActive && B.chatActive()) return false;
    const cursor = event ? {x:event.clientX, y:event.clientY} : mouse;
    const can = view().ctx?.canvas || document.getElementById('can');
    if (!cursor || !can) return false;
    const rect = can.getBoundingClientRect();
    if (!rect.width || !rect.height || cursor.x < rect.left || cursor.y < rect.top || cursor.x >= rect.left + rect.width || cursor.y >= rect.top + rect.height) return false;
    mouse = cursor;
    if (!updateMouse()) return false;
    const point = GetAllTargets.mouseMapCords, x = Math.floor(point.x / 100), y = Math.floor(point.y / 100);
    let selected = null, descriptor = null, best = Infinity, selectedOrder = -1;
    for (const r of collect()) {
      const d = building(r);
      if (!d) continue;
      const door = d.ࡀ︂̄ === 15, region = door && doorRegions.get(r.e);
      // Rendered door panels move and rotate away from their original tile.
      const hit = door && region ? hitsDoor(region, cursor, can, rect) : r.e.αބ̞ === x && r.e.ᴀܛ٤ === y;
      if (!hit) continue;
      const distance = (r.e.x - point.x) ** 2 + (r.e.y - point.y) ** 2;
      const selectedDoor = descriptor?.ࡀ︂̄ === 15, order = region ? region.order : -1;
      const nearer = door && selectedDoor && (order >= 0 || selectedOrder >= 0) ? order > selectedOrder : distance < best;
      if (!selected || door && !selectedDoor || door === selectedDoor && nearer) {
        selected = r.e; descriptor = d; best = distance; selectedOrder = order;
      }
    }
    if (!selected) { interactionStatus('Под курсором нет доступного объекта'); return false; }
    const now = performance.now();
    // A double-click while a toggle is unacknowledged must not toggle twice.
    if (interaction.pending?.entity === selected && now < interaction.pending.deadline) return true;
    const sent = __send([descriptor.ࡀ︂̄, selected.id, selected.ᴘ४１]);
    if (sent && descriptor.ࡀ︂̄ === 15) {
      interaction.pending = {entity:selected,id:selected.id,owner:selected.ᴘ४１,open:selected.state & 16,deadline:now+1500};
      interactionStatus('Запрос двери отправлен; ожидается сервер', now);
    }
    return sent;
  }
  let lastOverlayLayout = -Infinity;
  let lastCollect = -Infinity;
  let lastListUpdate = -Infinity, cachedPlayerRows = [];
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
    const now = performance.now();
    if (overlay.width === can.width && overlay.height === can.height && now - lastOverlayLayout < 250) return !!ctx;
    lastOverlayLayout = now;
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
  let lastOverlayDraw = -Infinity;
  function draw(now = performance.now()) {
    // Keep aim feedback at the previous render cadence; throttle only when aim is off.
    if (!MOD.AimBotEnabled && now - lastOverlayDraw < 1000 / 30) return;
    lastOverlayDraw = now;
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
    const hoverX = Math.floor(GetAllTargets.mouseMapCords.x / 100), hoverY = Math.floor(GetAllTargets.mouseMapCords.y / 100);
    for (const r of records) {
      if (r.type === B.categories.player) {
        if (!MOD.ShowPlayerHitbox) continue;
        const id = r.e.ᴘ४１, p = at(r.e), self = id === me.id, color = self && !validClan(id) ? '#00ffff' : clanColor(id);
        if (MOD.ShowPlayerHitbox) {
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 38 * v.scale, 0, Math.PI * 2);
          ctx.stroke();
          ctx.strokeRect(p.x - 30 * v.scale, p.y - 30 * v.scale, 60 * v.scale, 60 * v.scale);

        }
      } else if (MOD.ShowBuildingOwner && r.e.αބ̞ === hoverX && r.e.ᴀܛ٤ === hoverY && building(r)) {
        {
          const p = at(r.e), id = r.e.ᴘ४１;
          text((nickname(id) || 'Owner') + ' #' + id, p.x, p.y - 35, clanColor(id), 16);
        }
      }
    }
    if (MOD.AimBotEnabled) {
      for (const [i, line] of GetAllTargets.lines.entries()) {
        if (i === 0 && !MOD.visualizeResolving) continue;
        if (![line.x1, line.y1, line.x2, line.y2].every(Number.isFinite) || line.x1 === -1 && line.y1 === -1 && line.x2 === -1 && line.y2 === -1) continue;
        const start = at({x:line.x1, y:line.y1});
        const end = at({x:line.x2, y:line.y2});
        ctx.globalAlpha = line.alpha;
        ctx.strokeStyle = i === 0 ? MOD.visualizeResolvingColor : line.color;
        ctx.lineWidth = line.width;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    if (now < interaction.until) text(interaction.status, overlay.width / 2, 62, '#fff', 14);
    if (MOD.PlayersListEnabled) {
      ctx.fillStyle = 'rgba(0,0,0,.8)';
      ctx.fillRect(0, 0, overlay.width, overlay.height);
      const now = performance.now();
      if (now - lastListUpdate >= 250) { cachedPlayerRows = playerRows(); lastListUpdate = now; }
      const columns = Math.max(1, Math.floor(overlay.width / 260));
      const rowsPerColumn = Math.max(1, Math.floor((overlay.height - 70) / 22));
      let i = 0;
      for (const {id, name, clan} of cachedPlayerRows.slice(0, columns * rowsPerColumn)) {
        const col = Math.floor(i / rowsPerColumn), row = i % rowsPerColumn;
        const width = overlay.width / columns;
        ctx.save(); ctx.beginPath(); ctx.rect(col * width, 0, width, overlay.height); ctx.clip();
        text('#' + id + ' ' + name + (clan ? ' [' + clan + ']' : ' [No clan]'), (col + .5) * width, 35 + row * 22, clanColor(id), 13);
        ctx.restore(); i++;
      }
      text('Players: ' + cachedPlayerRows.length, overlay.width - 100, overlay.height - 22);
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
    updateReconnect(now);
    checkInteraction(now);
    if (!playing()) {
      lastSentAngle = null;
      pendingLoot.clear();
      interaction.pending = null;
      if (previousPlayer) {
        Aimbot.onDeath();
        previousPlayer = 0;
        records = [];
      }
      chatState.status = MOD.SpamChatEnabled ? 'Waiting for game' : 'Off';
      draw();
      return;
    }
    if (previousPlayer !== B.world.ᅠᏧ‍.id) {
      lastSentAngle = null;
      if (previousPlayer) Aimbot.onDeath();
      previousPlayer = B.world.ᅠᏧ‍.id;
      lastLoot = lastBuild = lastTake = now;
      lastChat = nextChatAt = -Infinity;
      lastKeepAlive = now;
    }
    if (now - lastCollect >= 50) {
      records = collect();
      lastCollect = now;
    }
    updateMouse();
    if (!MOD.AimBotEnabled) lastSentAngle = null;
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
  // ILM executes its aim loop every 50 ms, independently of rendering.
  const aimTimer = window.setInterval(() => {
    if (stopped) return;
    try { Aimbot.refresh(); } catch (error) { report(error); }
  }, 50);
  for (const key of ["ѕ᠋༢", "ρ٨٨"]) {
    if (typeof B.network[key] !== 'function') throw new Error('Missing native angle handler');
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
  listen(window, 'mousemove', e => { mouse = {x:e.clientX, y:e.clientY}; }, true);
  let interceptedRightClick = false;
  listen(window, 'mousedown', e => {
    if (e.target.closest && e.target.closest('.dg,input,textarea,select,button,a,[contenteditable=true]')) return;
    mouse = {
      x: e.clientX,
      y: e.clientY
    };
    if (e.button === 0) {
      Aimbot.mouseDown = true;

    }
    if (e.button === 2) {
      interceptedRightClick = false;
      const can = view().ctx?.canvas || document.getElementById('can'), rect = can?.getBoundingClientRect();
      if (playing() && MOD.OpenEverythingByClick && !(B.chatActive && B.chatActive()) && rect && e.clientX >= rect.left && e.clientY >= rect.top && e.clientX < rect.left + rect.width && e.clientY < rect.top + rect.height) {
        openUnderMouse(e);
        // A missed cursor hit must never fall through to a nearest-door action.
        interceptedRightClick = true;
        e.preventDefault(); e.stopImmediatePropagation();
      }
    }
  }, true);
  listen(window, 'mouseup', e => {
    if (e.button === 2 && interceptedRightClick) {
      interceptedRightClick = false; e.preventDefault(); e.stopImmediatePropagation();
    }
    if (e.button === 0) Aimbot.mouseDown = false;
  }, true);
  listen(window, 'blur', () => {
    interceptedRightClick = false;
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
    for (const key of ['ShowPosition', 'ShowNamesOnMap', 'ShowMines', 'ShowPlayerHitbox', 'ShowBuildingOwner', 'XrayBuildings', 'PlayersListEnabled', 'showFunctionList']) add(visual, key);
    add(visual, 'Xraytransparency', 'Building opacity', .05, 1, .05);
    for (const key of ['TeamClanColor', 'EnemyClanColor']) visual.addColor(MOD, key).onChange(persist);
    const aim = menu.addFolder('Aim bot');
    for (const key of ['AimBotEnabled', 'autoFire', 'visualizeResolving']) add(aim, key);
    add(aim, 'ShowRealAngles', 'Show real angles', ['always', 'withAim']);
    add(aim, 'target', 'Target', ['players', 'ghouls', 'all']);
    add(aim, 'mouseFovEnable', 'Target near cursor');
    add(aim, 'mouseFov', 'Cursor range', 1, 20000, 1);
    add(aim, 'lockId', 'Lock player ID', -1, 65535, 1);
    add(aim, 'distanceCoefficient', 'Distance coefficient', 10, 1000, 10);
    add(aim, 'bulletSpeedCoefficient', 'Bullet speed (ILM legacy)', 1, 15, .25);
    add(aim, 'offsetCoefficient', 'Prediction offset', 0, 3, .1);
    aim.addColor(MOD, 'visualizeResolvingColor').onChange(persist);
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
    for (const key of ['AimbotKey', 'AutoBuiledKey', 'SAutoLootKey', 'FAutoLootKey', 'AutoTakeKey', 'XrayKey', 'PlayersListKey', 'ModMenuKey']) {
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
    trackPacket,
    aim: Aimbot,
    loot: LootData,
    diagnostics,
    chat: chatState,
    reconnect,
    step,
    setSetting,
    openUnderMouse,
    captureDoor,
    interaction,
    clanColor,
    prepareClanTag,
    playerLabel,
    playerRows,
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
    dispose() {
      MOD.zoomFactor = 1;
      MOD.AimBotEnabled = false;
      stopped = true;
      window.clearInterval(aimTimer);
      pendingLoot.clear();
      window.cancelAnimationFrame(nextFrame);
      removers.forEach(f => f());
      if (menu) menu.destroy();
      if (overlayHost) overlayHost.remove();
      Object.assign(B.network, originals);
    }
  };
}
