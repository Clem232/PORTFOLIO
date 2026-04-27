import * as THREE from 'three';

// URL du back Symfony (dev)
const BACK_URL = 'http://localhost:8000';

/* =====================================================
   BLOXORZ-LIKE — Brain Cube
   ===================================================== */

// ─── CONSTANTES COULEURS ─────────────────────────────
const COLORS = {
  BG: 0xFFEEE4,
  TILE_NORMAL: 0xFFFBF2,
  BORDER_NORMAL: 0xD8C8B1,
  TILE_FRAGILE: 0xFFD1A9,
  BORDER_FRAGILE: 0xBF8F68,
  TILE_SWITCH: 0xB2FFF7,
  BORDER_SWITCH: 0x6CC8BF,
  TILE_HEAVY_SW: 0xD9CFFF,
  BORDER_HEAVY: 0x907BBA,
  TILE_BRIDGE: 0xDAF7A6,
  BORDER_BRIDGE: 0x8CB260,
  TILE_GOAL: 0xFFBEEF,
  BORDER_GOAL: 0xD47EB6,
  PLAYER: 0xFF5C5C,
  PLAYER_WIN: 0xFFBEEF
};

// ─── COULEURS DE FOND PAR NIVEAU ───────────────────────
const LEVEL_BG_COLORS = [
  new THREE.Color(0xFFEEE4), // 1 - crème pêche douce
  new THREE.Color(0xE4EEFF), // 2 - bleu ciel pastel
  new THREE.Color(0xE4F8EE), // 3 - vert menthe douce
  new THREE.Color(0xF0E4FF), // 4 - lavande douce
  new THREE.Color(0xFFF8E4), // 5 - jaune beurre doux
  new THREE.Color(0xE4FFF5), // 6 - cyan aqua doux
  new THREE.Color(0xFFE4F2), // 7 - rose tendre
  new THREE.Color(0xF2FFE4), // 8 - vert citron doux
];

// ─── LEVEL DATA ───────────────────────────────────────
const LEVEL_DATA = {
  TILE_TYPES: {
    EMPTY: 0,
    NORMAL: 1,
    FRAGILE: 2,
    SWITCH_SOFT: 3,
    GOAL: 4,
    BRIDGE: 5,
    SWITCH_HEAVY: 6,
    TELEPORT: 7
  },
  BLOCK_STATES: {
    STANDING: 0,
    LYING_X: 1,
    LYING_Z: 2
  },
  LEVELS: [
    {
      id: 1,
      grid: [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [0, 1, 1, 1, 1, 1, 4, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0]
      ],
      start: { x: 1, z: 1, state: 0 }
    },
    {
      id: 2,
      grid: [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 0, 0, 0],
        [0, 1, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 4, 0],
        [0, 0, 0, 0, 0, 0, 0]
      ],
      start: { x: 1, z: 1, state: 0 }
    },
    {
      id: 3,
      grid: [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 3, 0],
        [0, 1, 1, 1, 1, 1, 0],
        [0, 0, 0, 5, 0, 0, 0],
        [0, 0, 0, 5, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 0],
        [0, 4, 1, 1, 1, 1, 0],
        [0, 0, 0, 0, 0, 0, 0]
      ],
      start: { x: 1, z: 1, state: 0 },
      bridges: [{ trigger: { x: 5, z: 1 }, tiles: [{ x: 3, z: 3 }, { x: 3, z: 4 }], type: "toggle" }]
    },
    {
      id: 4,
      grid: [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 2, 2, 1, 0],
        [0, 1, 1, 2, 2, 1, 0],
        [0, 1, 2, 2, 2, 1, 0],
        [0, 1, 2, 2, 2, 1, 0],
        [0, 1, 1, 1, 1, 4, 0],
        [0, 0, 0, 0, 0, 0, 0]
      ],
      start: { x: 1, z: 1, state: 0 }
    },
    {
      id: 5,
      grid: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 0, 1, 1, 1, 0, 0],
        [0, 1, 0, 1, 1, 1, 0, 1, 0, 0],
        [0, 1, 0, 0, 0, 1, 0, 1, 1, 0],
        [0, 1, 1, 1, 0, 1, 0, 0, 1, 0],
        [0, 0, 0, 1, 1, 1, 1, 1, 4, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      ],
      start: { x: 1, z: 1, state: 0 }
    },
    {
      id: 6,
      grid: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0],
        [0, 1, 1, 1, 0, 0, 0, 0, 1, 4, 0],
        [0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0],
        [0, 1, 7, 1, 0, 6, 1, 6, 0, 0, 0],
        [0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      ],
      start: { x: 1, z: 1, state: 0 },
      splitters: [{ x: 2, z: 6, spawns: [{ x: 5, z: 9 }, { x: 6, z: 9 }] }]
    }
  ]
};

// ─── DIMENSIONS ──────────────────────────────────────
const CELL       = 0.8;
const TILE_H     = 0.25;
const ROLL_SPEED = 0.18;   // secondes par bascule
const FALL_DURATION = 0.6;

// ─── TILE TYPES ──────────────────────────────────────
const T = {
  VOID:     0,
  NORMAL:   1,
  GOAL:     2,
  FRAGILE:  3,
  SWITCH:   4,   // switch léger (n'importe quelle partie)
  BRIDGE:   5,
  HEAVY_SW: 6,   // switch lourd (STANDING only)
};

// ─── BLOCK STATES ────────────────────────────────────
const STATE = {
  STANDING: 'standing',
  LYING_X:  'lying_x',
  LYING_Z:  'lying_z',
};

// ─── NIVEAUX ─────────────────────────────────────────
// Tous les niveaux ont été validés par un solveur BFS.
// Difficulté progressive : mouvement → orientation → fragile → switch → combo.

const LEVELS = [
  {
    // Niveau 1 — "Premiers pas"  (solution optimale : 4 coups)
    tiles: [
      [0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 2, 0],
      [0, 0, 0, 0, 0, 0],
    ],
    start: [1, 1],
    bridges: [],
  },
  {
    // Niveau 2 — "Le virage en L"  (optimal : 7 coups)
    tiles: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 1, 1, 1, 0],
      [0, 0, 0, 0, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 2, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    start: [1, 1],
    bridges: [],
  },
  {
    // Niveau 3 — "La fourche"  (optimal : 6 coups)
    tiles: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 0, 0, 0],
      [0, 1, 1, 0, 1, 1, 0, 0],
      [0, 0, 0, 0, 1, 1, 0, 0],
      [0, 0, 0, 0, 1, 2, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    start: [1, 1],
    bridges: [],
  },
  {
    // Niveau 4 — "Cases fragiles"  (optimal : 5 coups)
    tiles: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 3, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 3, 1, 0, 0],
      [0, 0, 0, 1, 1, 2, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    start: [1, 1],
    bridges: [],
  },
  {
    // Niveau 5 — "Le pont"  (optimal : 12 coups)
    tiles: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 0, 1, 1, 0],
      [0, 1, 4, 1, 0, 1, 1, 0],
      [0, 1, 1, 1, 5, 1, 2, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    start: [1, 1],
    bridges: [
      { switchId: 0, tiles: [[4, 3]], mode: 'toggle' },
    ],
  },
  {
    // Niveau 6 — "L'ascenseur"  (optimal : 6 coups)
    tiles: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 4, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 5, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 0, 2, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    start: [1, 1],
    bridges: [
      { switchId: 0, tiles: [[4, 4]], mode: 'toggle' },
    ],
  },
  {
    // Niveau 7 — "Switch lourd"  (optimal : 11 coups)
    tiles: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 0, 0, 0],
      [0, 1, 6, 1, 1, 0, 0, 0],
      [0, 1, 1, 1, 5, 5, 1, 0],
      [0, 0, 0, 1, 0, 0, 1, 0],
      [0, 0, 0, 1, 1, 1, 2, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    start: [1, 1],
    bridges: [
      { switchId: 0, tiles: [[4, 3], [5, 3]], mode: 'toggle' },
    ],
  },
  {
    // Niveau 8 — "Labyrinthe final"  (optimal : 13 coups)
    tiles: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 0, 0, 0],
      [0, 1, 6, 1, 3, 1, 0, 0, 0],
      [0, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 1, 5, 5, 1, 0, 0],
      [0, 0, 0, 1, 1, 4, 1, 0, 0],
      [0, 0, 0, 0, 0, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 2, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    start: [1, 1],
    bridges: [
      { switchId: 0, tiles: [[4, 4], [5, 4]], mode: 'toggle' },
    ],
  },
];
// ─── SCENE / CAMERA / RENDERER ───────────────────────
// ─── TRANSITION FOND ────────────────────────────────────
const _bgStart   = new THREE.Color(COLORS.BG);
const _bgTarget  = new THREE.Color(COLORS.BG);
const _bgCurrent = new THREE.Color(COLORS.BG);
let   _bgElapsed = 1;        // starts at 1 = no transition pending
const BG_DURATION = 1.4;     // secondes

const scene    = new THREE.Scene();
scene.background = _bgCurrent;
scene.fog      = new THREE.Fog(COLORS.BG, 22, 50);
scene.fog.color = _bgCurrent; // same reference → auto-updated

const camera   = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 100);

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('canvas'),
  antialias: true,
});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type    = THREE.PCFSoftShadowMap;

// ─── LUMIERES ────────────────────────────────────────
scene.add(new THREE.AmbientLight(0xffffff, 0.8));
const dirLight = new THREE.DirectionalLight(0xfff0f8, 1.2);
dirLight.position.set(6, 14, 8);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(1024, 1024);
Object.assign(dirLight.shadow.camera, {
  left: -16, right: 16, bottom: -16, top: 16, near: 0.5, far: 60,
});
scene.add(dirLight);

// ─── TEXTURES ────────────────────────────────────────
const _texLoader  = new THREE.TextureLoader();
const _TEX_PREFIX = '/Poliigon_BoucleFabricBubbly_7827/2K/Poliigon_BoucleFabricBubbly_7827_';
function _loadTex(suffix, sRGB = false) {
  const t = _texLoader.load(_TEX_PREFIX + suffix);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1, 1);
  if (sRGB) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const fabricColorMap  = _loadTex('BaseColor.jpg', true);
const fabricNormalMap = _loadTex('Normal.png');
const fabricRoughMap  = _loadTex('Roughness.jpg');

// ─── ETAT DU JEU ─────────────────────────────────────
let levelIdx  = 0;
let gridW, gridH;
let tileData;          // tileData[row][col] = type courant (for bridges)
let originalTiles;     // tileData original (pour reset)
let bridgeDefs;        // definitions des ponts
let switchCounter;     // combien de switches ont été trouvés pendant le build
let bridgeStates;      // true/false per bridge def
let switchTileMap;     // map: "col,row" -> switchId

let block = { x: 0, z: 0, state: STATE.STANDING };
let won       = false;
let lost      = false;
let moveCount = 0;

// Roll animation
let isRolling  = false;
let rollPivot  = null;
let rollState  = null;  // { axis, angle, elapsed, snapBlock }

// Fall animation (perte)
let isFalling     = false;
let fallElapsed   = 0;
let fallStartY    = 0;

// Win animation
let isWinAnim  = false;
let winElapsed = 0;

// Meshes
let gridGroup   = null;
let blockGroup  = null;  // contient le mesh du bloc
let blockMesh   = null;
let blockMat    = null;
let bridgeMeshes = {};   // "col,row" -> mesh

// DOM
const $moves      = document.getElementById('moves');
const $levelNum   = document.getElementById('level-num');
const $winOverlay = document.getElementById('win-overlay');
const $winMoves   = document.getElementById('win-moves');
const $winScore   = document.getElementById('win-score');
const $loseOverlay = document.getElementById('lose-overlay');
const $scoreForm  = document.getElementById('score-form');
const $inputUsername = document.getElementById('input-username');
const $btnNext    = document.getElementById('btn-next');
const $leaderboard = document.getElementById('leaderboard');

// Charger le pseudo sauvegardé
$inputUsername.value = localStorage.getItem('bc_username') || '';

$btnNext.addEventListener('click', () => {
  levelIdx++;
  buildLevel();
});
const $btnRetry = document.getElementById('btn-retry');
if ($btnRetry) $btnRetry.addEventListener('click', () => buildLevel());

document.getElementById('btn-submit-score').addEventListener('click', async () => {
  const username = $inputUsername.value.trim();
  if (!username || username.length < 3) {
    $inputUsername.classList.add('error');
    $inputUsername.focus();
    return;
  }
  $inputUsername.classList.remove('error');
  localStorage.setItem('bc_username', username);
  document.getElementById('btn-submit-score').disabled = true;
  await submitScore(username);
  showLeaderboard();
});

document.getElementById('btn-skip-score').addEventListener('click', () => {
  showLeaderboard();
});

// ─── HELPERS ─────────────────────────────────────────
function cellWorld(col, row) {
  return new THREE.Vector3(
    (col - (gridW - 1) / 2) * CELL,
    0,
    (row - (gridH - 1) / 2) * CELL,
  );
}

function tileExists(col, row) {
  if (row < 0 || row >= gridH || col < 0 || col >= gridW) return false;
  return tileData[row][col] !== T.VOID;
}

function tileType(col, row) {
  if (row < 0 || row >= gridH || col < 0 || col >= gridW) return T.VOID;
  return tileData[row][col];
}

function getOccupiedTiles() {
  const { x, z, state } = block;
  if (state === STATE.STANDING) return [{ x, z }];
  if (state === STATE.LYING_X)  return [{ x, z }, { x: x + 1, z }];
  if (state === STATE.LYING_Z)  return [{ x, z }, { x, z: z + 1 }];
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ─── COULEUR / BORDURE PAR TYPE ──────────────────────
function tileColor(type) {
  switch (type) {
    case T.FRAGILE:  return COLORS.TILE_FRAGILE;
    case T.SWITCH:   return COLORS.TILE_SWITCH;
    case T.HEAVY_SW: return COLORS.TILE_HEAVY_SW;
    case T.BRIDGE:   return COLORS.TILE_BRIDGE;
    case T.GOAL:     return COLORS.TILE_GOAL;
    default:         return COLORS.TILE_NORMAL;
  }
}

function borderColor(type) {
  switch (type) {
    case T.FRAGILE:  return COLORS.BORDER_FRAGILE;
    case T.SWITCH:   return COLORS.BORDER_SWITCH;
    case T.HEAVY_SW: return COLORS.BORDER_HEAVY;
    case T.BRIDGE:   return COLORS.BORDER_BRIDGE;
    case T.GOAL:     return COLORS.BORDER_GOAL;
    default:         return COLORS.BORDER_NORMAL;
  }
}

// ─── CONSTRUCTION DU NIVEAU ──────────────────────────
function buildLevel() {
  // Cleanup
  if (rollPivot) { scene.remove(rollPivot); rollPivot = null; }
  if (blockGroup) scene.remove(blockGroup);
  if (gridGroup)  scene.remove(gridGroup);
  blockMesh = null; rollState = null; isRolling = false;
  isFalling = false; isWinAnim = false;

  const def = LEVELS[levelIdx % LEVELS.length];
  originalTiles = def.tiles.map(r => [...r]);
  tileData = def.tiles.map(r => [...r]);
  gridH = tileData.length;
  gridW = tileData[0].length;
  bridgeDefs = def.bridges || [];

  // Build switch map: assign switchId to switches in order of appearance
  switchCounter = 0;
  switchTileMap = {};
  for (let row = 0; row < gridH; row++) {
    for (let col = 0; col < gridW; col++) {
      const t = tileData[row][col];
      if (t === T.SWITCH || t === T.HEAVY_SW) {
        switchTileMap[col + ',' + row] = switchCounter++;
      }
    }
  }

  // Bridge states: all OFF initially, bridges start as VOID
  bridgeStates = bridgeDefs.map(() => false);
  bridgeMeshes = {};
  bridgeDefs.forEach((bd, i) => {
    if (!bridgeStates[i]) {
      bd.tiles.forEach(([c, r]) => { tileData[r][c] = T.VOID; });
    }
  });

  // Block init
  block = { x: def.start[0], z: def.start[1], state: STATE.STANDING };
  won = false; lost = false;
  moveCount = 0;
  $moves.textContent = '0';
  $levelNum.textContent = levelIdx + 1;
  $winOverlay.classList.remove('show');
  $loseOverlay.classList.remove('show');
  // Réinitialise le formulaire de score
  $scoreForm.style.display = '';
  $leaderboard.style.display = 'none';
  $btnNext.style.display = 'none';
  $inputUsername.classList.remove('error');
  document.getElementById('btn-submit-score').disabled = false;

  // ─ Transition couleur de fond
  _bgStart.copy(_bgCurrent);
  _bgTarget.copy(LEVEL_BG_COLORS[levelIdx % LEVEL_BG_COLORS.length]);
  _bgElapsed = 0;
  document.body.style.background = '#' + _bgTarget.getHexString();

  // ─── Build grid meshes ───
  gridGroup = new THREE.Group();
  const tileGeo = new THREE.BoxGeometry(CELL, TILE_H, CELL);
  const edgeGeo = new THREE.EdgesGeometry(tileGeo);

  for (let row = 0; row < gridH; row++) {
    for (let col = 0; col < gridW; col++) {
      const t = tileData[row][col];
      if (t === T.VOID) continue;
      addTileMesh(col, row, t);
    }
  }

  // Also pre-create bridge tile meshes (hidden) for tiles currently VOID
  bridgeDefs.forEach((bd, i) => {
    bd.tiles.forEach(([c, r]) => {
      if (!bridgeStates[i]) {
        addTileMesh(c, r, T.BRIDGE, false);
      }
    });
  });

  scene.add(gridGroup);

  // ─── Block mesh (1x1x2) ───
  blockMat   = new THREE.MeshStandardMaterial({ color: COLORS.PLAYER, roughness: 0.3, metalness: 0.1 });
  const geo  = new THREE.BoxGeometry(CELL * 0.92, CELL * 2 * 0.96, CELL * 0.92);
  blockMesh  = new THREE.Mesh(geo, blockMat);
  blockMesh.castShadow = true;

  blockGroup = new THREE.Group();
  blockGroup.add(blockMesh);
  scene.add(blockGroup);
  positionBlock();

  // ─── Camera ───
  let sumX = 0, sumZ = 0, cnt = 0;
  for (let r = 0; r < gridH; r++) {
    for (let c = 0; c < gridW; c++) {
      if (originalTiles[r][c] !== T.VOID) {
        const p = cellWorld(c, r);
        sumX += p.x; sumZ += p.z; cnt++;
      }
    }
  }
  const cx = sumX / cnt;
  const cz = sumZ / cnt;
  const span = Math.max(gridW, gridH) * CELL;
  camera.position.set(cx + span * 0.2, span * 0.7 + 3, cz + span * 0.8 + 2);
  camera.lookAt(cx, 0, cz);
}

function addTileMesh(col, row, type, visible = true) {
  const tileGeo = new THREE.BoxGeometry(CELL, TILE_H, CELL);
  const edgeGeo = new THREE.EdgesGeometry(tileGeo);

  const mat  = type === T.NORMAL
    ? new THREE.MeshStandardMaterial({
        map:         fabricColorMap,
        normalMap:   fabricNormalMap,
        roughnessMap: fabricRoughMap,
        roughness:   1.0,
        metalness:   0.0,
      })
    : new THREE.MeshStandardMaterial({ color: tileColor(type), roughness: 0.6, metalness: 0.05 });
  const mesh = new THREE.Mesh(tileGeo, mat);
  const wp   = cellWorld(col, row);
  mesh.position.set(wp.x, 0, wp.z);
  mesh.receiveShadow = true;
  mesh.visible = visible;
  gridGroup.add(mesh);

  const lineMat = new THREE.LineBasicMaterial({ color: borderColor(type) });
  const lines   = new THREE.LineSegments(edgeGeo, lineMat);
  lines.position.copy(mesh.position);
  lines.position.y += 0.001;
  lines.visible = visible;
  gridGroup.add(lines);

  // Track bridge meshes
  const key = col + ',' + row;
  const isBridge = bridgeDefs.some(bd => bd.tiles.some(([c,r]) => c === col && r === row));
  if (isBridge) {
    bridgeMeshes[key] = { mesh, lines };
  }

  // Indicateur visuel pour switch léger (petit disque)
  if (type === T.SWITCH) {
    const disc = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 0.02, 16),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 }),
    );
    disc.position.set(wp.x, TILE_H / 2 + 0.02, wp.z);
    gridGroup.add(disc);
  }

  // Indicateur pour switch lourd (X en relief)
  if (type === T.HEAVY_SW) {
    const bar1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.03, 0.08),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 }),
    );
    bar1.position.set(wp.x, TILE_H / 2 + 0.02, wp.z);
    bar1.rotation.y = Math.PI / 4;
    gridGroup.add(bar1);

    const bar2 = bar1.clone();
    bar2.rotation.y = -Math.PI / 4;
    gridGroup.add(bar2);
  }
}

// ─── POSITION DU BLOC (SNAP) ─────────────────────────
function positionBlock() {
  const wp = cellWorld(block.x, block.z);

  blockGroup.position.set(0, 0, 0);
  blockGroup.quaternion.identity();
  blockMesh.position.set(0, 0, 0);
  blockMesh.quaternion.identity();

  if (block.state === STATE.STANDING) {
    blockMesh.scale.set(1, 1, 1);
    blockMesh.geometry.dispose();
    blockMesh.geometry = new THREE.BoxGeometry(CELL * 0.92, CELL * 2 * 0.96, CELL * 0.92);
    blockGroup.position.set(wp.x, TILE_H / 2 + CELL, wp.z);
  }
  else if (block.state === STATE.LYING_X) {
    blockMesh.geometry.dispose();
    blockMesh.geometry = new THREE.BoxGeometry(CELL * 2 * 0.96, CELL * 0.92, CELL * 0.92);
    const cx = (cellWorld(block.x, block.z).x + cellWorld(block.x + 1, block.z).x) / 2;
    blockGroup.position.set(cx, TILE_H / 2 + CELL * 0.5, wp.z);
  }
  else if (block.state === STATE.LYING_Z) {
    blockMesh.geometry.dispose();
    blockMesh.geometry = new THREE.BoxGeometry(CELL * 0.92, CELL * 0.92, CELL * 2 * 0.96);
    const cz = (cellWorld(block.x, block.z).z + cellWorld(block.x, block.z + 1).z) / 2;
    blockGroup.position.set(wp.x, TILE_H / 2 + CELL * 0.5, cz);
  }
}

// ─── LOGIQUE DE DEPLACEMENT ──────────────────────────
function move(dir) {
  if (isRolling || won || lost || isFalling || isWinAnim) return;

  // Save state pour rollback
  const prevBlock = { ...block };

  const { x, z, state } = block;

  if (state === STATE.STANDING) {
    if (dir === 'UP')    { block.z -= 2; block.state = STATE.LYING_Z; }
    if (dir === 'DOWN')  { block.z += 1; block.state = STATE.LYING_Z; }
    if (dir === 'LEFT')  { block.x -= 2; block.state = STATE.LYING_X; }
    if (dir === 'RIGHT') { block.x += 1; block.state = STATE.LYING_X; }
  }
  else if (state === STATE.LYING_Z) {
    if (dir === 'UP')    { block.z -= 1; block.state = STATE.STANDING; }
    if (dir === 'DOWN')  { block.z += 2; block.state = STATE.STANDING; }
    if (dir === 'LEFT')  { block.x -= 1; }
    if (dir === 'RIGHT') { block.x += 1; }
  }
  else if (state === STATE.LYING_X) {
    if (dir === 'LEFT')  { block.x -= 1; block.state = STATE.STANDING; }
    if (dir === 'RIGHT') { block.x += 2; block.state = STATE.STANDING; }
    if (dir === 'UP')    { block.z -= 1; }
    if (dir === 'DOWN')  { block.z += 1; }
  }

  // Check validity
  const tiles = getOccupiedTiles();
  const allValid = tiles.every(t => tileExists(t.x, t.z));

  if (!allValid) {
    // Animate roll then fall
    startRollAnimation(prevBlock, block, () => {
      triggerFall();
    });
    moveCount++;
    $moves.textContent = moveCount;
    return;
  }

  // Check fragile tile + STANDING
  const standingOnFragile = block.state === STATE.STANDING &&
    tiles.some(t => tileType(t.x, t.z) === T.FRAGILE);

  if (standingOnFragile) {
    startRollAnimation(prevBlock, block, () => {
      triggerFall();
    });
    moveCount++;
    $moves.textContent = moveCount;
    return;
  }

  moveCount++;
  $moves.textContent = moveCount;

  // Normal roll animation
  startRollAnimation(prevBlock, block, () => {
    // Handle switches
    handleSwitches();

    // Check win
    if (block.state === STATE.STANDING && tileType(block.x, block.z) === T.GOAL) {
      triggerWin();
    }
  });
}

// ─── SWITCH HANDLING ─────────────────────────────────
function handleSwitches() {
  const tiles = getOccupiedTiles();

  tiles.forEach(({ x, z }) => {
    const type = tileType(x, z);
    const key  = x + ',' + z;
    const sid  = switchTileMap[key];

    if (sid === undefined) return;

    // Light switch: any contact
    if (type === T.SWITCH) {
      toggleBridge(sid);
    }

    // Heavy switch: STANDING only
    if (type === T.HEAVY_SW && block.state === STATE.STANDING) {
      toggleBridge(sid);
    }
  });
}

function toggleBridge(switchId) {
  bridgeDefs.forEach((bd, i) => {
    if (bd.switchId === switchId) {
      bridgeStates[i] = !bridgeStates[i];

      bd.tiles.forEach(([c, r]) => {
        const key = c + ',' + r;
        if (bridgeStates[i]) {
          tileData[r][c] = T.BRIDGE;
          if (bridgeMeshes[key]) {
            bridgeMeshes[key].mesh.visible  = true;
            bridgeMeshes[key].lines.visible = true;
          }
        } else {
          tileData[r][c] = T.VOID;
          if (bridgeMeshes[key]) {
            bridgeMeshes[key].mesh.visible  = false;
            bridgeMeshes[key].lines.visible = false;
          }
        }
      });
    }
  });
}

// ─── ANIMATION DE ROULEMENT ──────────────────────────
function startRollAnimation(prevBlock, newBlock, onComplete) {
  isRolling = true;

  // Determine pivot edge position and rotation axis/angle
  const { pivotWorld, axis, angle } = computeRollParams(prevBlock, newBlock);

  rollPivot = new THREE.Object3D();
  rollPivot.position.copy(pivotWorld);
  scene.add(rollPivot);

  // Reparent blockGroup under pivot
  const invPivot = pivotWorld.clone().negate();
  blockGroup.position.add(invPivot);
  scene.remove(blockGroup);
  rollPivot.add(blockGroup);

  rollState = {
    axis,
    angle,
    elapsed: 0,
    onComplete,
  };
}

function computeRollParams(prev, next) {
  // Direction of movement
  let dx = 0, dz = 0;

  // Figure out direction from state transitions
  if (prev.state === STATE.STANDING) {
    if (next.state === STATE.LYING_Z) {
      dz = (next.z === prev.z + 1) ? 1 : -1;
    } else {
      dx = (next.x === prev.x + 1) ? 1 : -1;
    }
  } else if (prev.state === STATE.LYING_Z) {
    if (next.state === STATE.STANDING) {
      dz = (next.z === prev.z + 2) ? 1 : -1;
    } else {
      if (next.x !== prev.x) dx = next.x > prev.x ? 1 : -1;
      else dz = next.z > prev.z ? 1 : -1;
    }
  } else if (prev.state === STATE.LYING_X) {
    if (next.state === STATE.STANDING) {
      dx = (next.x === prev.x + 2) ? 1 : -1;
    } else {
      if (next.z !== prev.z) dz = next.z > prev.z ? 1 : -1;
      else dx = next.x > prev.x ? 1 : -1;
    }
  }

  // Pivot is on the bottom edge of the block in the movement direction
  const groupPos = blockGroup.parent === rollPivot
    ? rollPivot.position.clone().add(blockGroup.position)
    : blockGroup.position.clone();

  let halfExtX, halfExtZ;
  if (prev.state === STATE.STANDING)  { halfExtX = CELL * 0.46; halfExtZ = CELL * 0.46; }
  else if (prev.state === STATE.LYING_X) { halfExtX = CELL * 0.96; halfExtZ = CELL * 0.46; }
  else { halfExtX = CELL * 0.46; halfExtZ = CELL * 0.96; }

  const pivotWorld = new THREE.Vector3(
    blockGroup.position.x + dx * halfExtX,
    TILE_H / 2,
    blockGroup.position.z + dz * halfExtZ,
  );

  // Rotation axis is perpendicular to movement direction, lying on ground plane
  let axis, angle;
  if (dx !== 0) {
    axis = new THREE.Vector3(0, 0, -dx);
    angle = Math.PI / 2;
  } else {
    axis = new THREE.Vector3(dz, 0, 0);
    angle = Math.PI / 2;
  }

  return { pivotWorld, axis, angle };
}

function tickRoll(delta) {
  if (!rollState) return;
  rollState.elapsed += delta;

  const t    = Math.min(rollState.elapsed / ROLL_SPEED, 1);
  const ease = easeInOutCubic(t);
  rollPivot.quaternion.setFromAxisAngle(rollState.axis, ease * rollState.angle);

  if (t < 1) return;

  // Snap: reparent blockGroup back to scene
  rollPivot.updateWorldMatrix(true, true);
  const wPos = new THREE.Vector3();
  blockGroup.getWorldPosition(wPos);

  rollPivot.remove(blockGroup);
  scene.remove(rollPivot);
  rollPivot = null;
  scene.add(blockGroup);

  const cb = rollState.onComplete;
  rollState = null;
  isRolling = false;

  // Snap position
  positionBlock();

  if (cb) cb();
}

// ─── CHUTE (PERTE) ──────────────────────────────────
function triggerFall() {
  lost = true;
  isFalling = true;
  fallElapsed = 0;
  fallStartY = blockGroup.position.y;
}

function tickFall(delta) {
  if (!isFalling) return;
  fallElapsed += delta;
  const t = Math.min(fallElapsed / FALL_DURATION, 1);

  // Chute accélérée (gravité)
  blockGroup.position.y = fallStartY - 11 * t * t;

  // Rotation en chute (culbute réaliste)
  blockGroup.rotation.x += delta * 5.5;
  blockGroup.rotation.z += delta * 3.8;

  // Légère réduction de scale
  const sc = 1 - t * 0.25;
  blockGroup.scale.set(sc, sc, sc);

  // Fondu rapide
  blockMat.transparent = true;
  blockMat.opacity = Math.max(0, 1 - t * 1.8);

  if (t >= 1) {
    isFalling = false;
    blockMat.opacity = 1;
    blockMat.transparent = false;
    blockGroup.rotation.set(0, 0, 0);
    blockGroup.scale.set(1, 1, 1);

    // Affiche overlay brièvement puis relance automatiquement
    $loseOverlay.classList.add('show');
    setTimeout(() => {
      $loseOverlay.classList.remove('show');
      setTimeout(() => buildLevel(), 380);
    }, 950);
  }
}

// ─── VICTOIRE ────────────────────────────────────────
function triggerWin() {
  won = true;
  isWinAnim = true;
  winElapsed = 0;
  blockMat.color.setHex(COLORS.PLAYER_WIN);
}

function tickWin(delta) {
  if (!isWinAnim) return;
  winElapsed += delta;
  const t = Math.min(winElapsed / 0.5, 1);
  const ease = 1 - Math.pow(1 - t, 3);

  // Sink into the hole
  const startY = TILE_H / 2 + CELL;
  const endY   = TILE_H / 2 - CELL * 0.5;
  blockGroup.position.y = THREE.MathUtils.lerp(startY, endY, ease);

  if (t >= 1) {
    isWinAnim = false;
    $winMoves.textContent = moveCount;
    const pts = computeScore();
    $winScore.textContent = pts;
    $winOverlay.classList.add('show');
  }
}

// ─── SCORE & LEADERBOARD ─────────────────────────────
const $lbList = document.getElementById('lb-list');

function computeScore() {
  // Score basé sur le niveau et le nombre de mouvements — moins de coups = meilleur score
  return Math.max(10, (levelIdx + 1) * 500 - moveCount * 10);
}

function showLeaderboard() {
  $scoreForm.style.display = 'none';
  $leaderboard.style.display = '';
  $btnNext.style.display = '';
  fetchLeaderboard();
}

async function submitScore(username) {
  try {
    await fetch(`${BACK_URL}/api/scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        points: computeScore(),
        levelReached: levelIdx + 1,
      }),
    });
  } catch {
    // Le back n'est pas dispo — on continue quand même
  }
}

async function fetchLeaderboard() {
  $lbList.innerHTML = '<li class="lb-empty">Chargement…</li>';
  try {
    const res = await fetch(`${BACK_URL}/api/scores/top`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const scores = await res.json();

    if (scores.length === 0) {
      $lbList.innerHTML = '<li class="lb-empty">Aucun score enregistré.</li>';
      return;
    }

    $lbList.innerHTML = scores
      .slice(0, 5)
      .map((s, i) => `<li><span>${i + 1}. ${s.username}</span><span>${s.points} pts</span></li>`)
      .join('');
  } catch {
    $lbList.innerHTML = '<li class="lb-empty">Back non disponible.</li>';
  }
}

// ─── CONTROLES CLAVIER ──────────────────────────────
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp')    { e.preventDefault(); move('UP'); }
  if (e.key === 'ArrowDown')  { e.preventDefault(); move('DOWN'); }
  if (e.key === 'ArrowLeft')  { e.preventDefault(); move('LEFT'); }
  if (e.key === 'ArrowRight') { e.preventDefault(); move('RIGHT'); }
  if (e.key === 'r' || e.key === 'R') { e.preventDefault(); buildLevel(); }
});

// ─── RESIZE ──────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
// ─── TRANSITION COULEUR DE FOND ────────────────────────────
function tickBg(delta) {
  if (_bgElapsed >= BG_DURATION) return;
  _bgElapsed = Math.min(_bgElapsed + delta, BG_DURATION);
  const ease = easeInOutCubic(_bgElapsed / BG_DURATION);
  _bgCurrent.copy(_bgStart).lerp(_bgTarget, ease);
  // scene.background et scene.fog.color pointent sur _bgCurrent → mis à jour automatiquement
}
// ─── BOUCLE PRINCIPALE ──────────────────────────────
const clock = new THREE.Clock();

renderer.setAnimationLoop(() => {
  const delta = clock.getDelta();

  // Idle bob
  if (!won && !lost && !isRolling && !isFalling && blockGroup) {
    const idleY = block.state === STATE.STANDING
      ? TILE_H / 2 + CELL
      : TILE_H / 2 + CELL * 0.5;
    blockGroup.position.y = idleY + Math.sin(clock.elapsedTime * 2.5) * 0.02;
  }

  tickRoll(delta);
  tickFall(delta);
  tickWin(delta);
  tickBg(delta);
  renderer.render(scene, camera);
});

// ─── DEMARRAGE ───────────────────────────────────────
buildLevel();