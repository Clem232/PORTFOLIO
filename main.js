import * as THREE from 'three';

// URL du back Symfony (dev)
const BACK_URL = 'http://localhost:8000';

/* =====================================================
   BLOXORZ-LIKE — Brain Cube
   ===================================================== */

// ─── AUDIO (Web Audio API) ────────────────────────────
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function _playNote(freq, type, vol, start, duration) {
  const osc  = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(vol, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.start(start);
  osc.stop(start + duration);
}

function playMove() {
  if (audioCtx.state === 'suspended') return;
  const t = audioCtx.currentTime;
  _playNote(440, 'sine', 0.12, t, 0.08);
  _playNote(330, 'sine', 0.07, t + 0.04, 0.07);
}

function playFall() {
  if (audioCtx.state === 'suspended') return;
  const t = audioCtx.currentTime;
  const osc  = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain); gain.connect(audioCtx.destination);
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(280, t);
  osc.frequency.exponentialRampToValueAtTime(45, t + 0.55);
  gain.gain.setValueAtTime(0.18, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
  osc.start(t); osc.stop(t + 0.6);
}

function playWin() {
  if (audioCtx.state === 'suspended') return;
  const t = audioCtx.currentTime;
  [523.25, 659.25, 783.99, 1046.50].forEach((f, i) =>
    _playNote(f, 'triangle', 0.18, t + i * 0.12, 0.32)
  );
}

function playGameOver() {
  if (audioCtx.state === 'suspended') return;
  const t = audioCtx.currentTime;
  [220, 196, 174.61, 130.81].forEach((f, i) =>
    _playNote(f, 'sawtooth', 0.16, t + i * 0.2, 0.45)
  );
}

function playSwitch() {
  if (audioCtx.state === 'suspended') return;
  const t = audioCtx.currentTime;
  _playNote(880, 'square', 0.09, t, 0.06);
  _playNote(660, 'square', 0.06, t + 0.06, 0.08);
}

function playLoseLife() {
  if (audioCtx.state === 'suspended') return;
  const t = audioCtx.currentTime;
  _playNote(330, 'sawtooth', 0.14, t, 0.12);
  _playNote(220, 'sawtooth', 0.10, t + 0.14, 0.2);
}

// Background music – arpège doux en boucle
let _bgMusicScheduled = false;
let _bgMusicNextAt = 0;

function tickBgMusic() {
  if (!_bgMusicScheduled || audioCtx.state === 'suspended') return;
  const now = audioCtx.currentTime;
  if (now < _bgMusicNextAt - 0.3) return; // schedule ahead by 0.3 s

  const notes  = [261.63, 329.63, 392, 523.25, 392, 329.63, 261.63, 196];
  const step   = 0.38;
  const offset = _bgMusicNextAt <= now ? now + 0.05 : _bgMusicNextAt;
  notes.forEach((f, i) => _playNote(f, 'sine', 0.055, offset + i * step, step * 0.85));
  _bgMusicNextAt = offset + notes.length * step;
}

function startBgMusic() {
  if (_bgMusicScheduled) return;
  _bgMusicScheduled = true;
  _bgMusicNextAt = audioCtx.currentTime;
}

function resumeAudio() {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  startBgMusic();
}

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
  PLAYER: 0xE03878,
  PLAYER_EMISSIVE: 0x8B1040,
  PLAYER_WIN: 0xFF9EDA,
  PLAYER_WIN_EMISSIVE: 0xC24D8E,
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

// ─── DIMENSIONS ──────────────────────────────────────
// (LEVEL_DATA legacy removed)
const _UNUSED_LEGACY = [[
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
  ]];
void _UNUSED_LEGACY;

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
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.physicallyCorrectLights = true;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type    = THREE.PCFSoftShadowMap;

// ─── LUMIERES ────────────────────────────────────────
scene.add(new THREE.AmbientLight(0xffffff, 0.45));
scene.add(new THREE.HemisphereLight(0xfff4fb, 0xbcc3d8, 0.55));
const dirLight = new THREE.DirectionalLight(0xfff0f8, 1.2);
dirLight.position.set(6, 14, 8);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(2048, 2048);
dirLight.shadow.radius = 3.5;
dirLight.shadow.bias = -0.00025;
dirLight.shadow.normalBias = 0.02;
Object.assign(dirLight.shadow.camera, {
  left: -16, right: 16, bottom: -16, top: 16, near: 0.5, far: 60,
});
scene.add(dirLight);

const rimLight = new THREE.DirectionalLight(0xb9e3ff, 0.33);
rimLight.position.set(-8, 9, -6);
scene.add(rimLight);

const contactShadowPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 1),
  new THREE.ShadowMaterial({ opacity: 0.22 }),
);
contactShadowPlane.rotation.x = -Math.PI / 2;
contactShadowPlane.receiveShadow = true;
contactShadowPlane.position.y = -TILE_H / 2 - 0.02;
scene.add(contactShadowPlane);

// ─── TEXTURES ────────────────────────────────────────
const _texLoader  = new THREE.TextureLoader();
const _TEX_PREFIX = '/Poliigon_BoucleFabricBubbly_7827/2K/Poliigon_BoucleFabricBubbly_7827_';
const _MAX_ANISO = renderer.capabilities.getMaxAnisotropy();
function _loadTex(suffix, sRGB = false) {
  const t = _texLoader.load(_TEX_PREFIX + suffix);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1, 1);
  t.anisotropy = Math.min(8, _MAX_ANISO);
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
let isPaused  = false;
let levelTimeSeconds = 0;
let maxUnlockedLevel = 1;

// ─── VIES ────────────────────────────────────────────
const MAX_LIVES = 3;
let lives = MAX_LIVES;

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
let gridGroup      = null;
let blockGroup     = null;  // contient le mesh du bloc
let blockMesh      = null;
let blockMat       = null;
let blockEdgeLines = null;  // arêtes du bloc
let bridgeMeshes   = {};    // "col,row" -> mesh
let goalMeshes     = [];    // tuiles objectif pour animation pulse
let winParticles   = [];    // particules burst victoire

// DOM
const $moves      = document.getElementById('moves');
const $levelNum   = document.getElementById('level-num');
const $timer      = document.getElementById('timer');
const $hudScore   = document.getElementById('hud-score');
const $winOverlay = document.getElementById('win-overlay');
const $winMoves   = document.getElementById('win-moves');
const $winScore   = document.getElementById('win-score');
const $loseOverlay = document.getElementById('lose-overlay');
const $gameoverOverlay = document.getElementById('gameover-overlay');
const $pauseMenu = document.getElementById('pause-menu');
const $mainMenu = document.getElementById('main-menu');
const $scoreForm  = document.getElementById('score-form');
const $scoreMessage = document.getElementById('score-message');
const $inputUsername = document.getElementById('input-username');
const $btnSubmitScore = document.getElementById('btn-submit-score');
const $btnSkipScore = document.getElementById('btn-skip-score');
const $btnNext    = document.getElementById('btn-next');
const $btnPauseResume = document.getElementById('btn-pause-resume');
const $btnPauseRestart = document.getElementById('btn-pause-restart');
const $btnPauseMain = document.getElementById('btn-pause-main');
const $btnMenuContinue = document.getElementById('btn-menu-continue');
const $btnMenuRestart = document.getElementById('btn-menu-restart');
const $btnMenuReset = document.getElementById('btn-menu-reset');
const $menuProgress = document.getElementById('menu-progress');
const $levelTrack = document.getElementById('level-track');
const $levelViewport = document.getElementById('level-viewport');
const $levelPrev = document.getElementById('level-prev');
const $levelNext = document.getElementById('level-next');
const $levelPage = document.getElementById('level-page');
const $leaderboard = document.getElementById('leaderboard');
const $heartsEl   = document.querySelectorAll('#lives-display .heart');

const MENU_UNLOCK_KEY = 'bc_max_unlocked_level';

// Charger le pseudo sauvegardé
$inputUsername.value = localStorage.getItem('bc_username') || '';

$btnNext.addEventListener('click', () => {
  levelIdx++;
  buildLevel();
});
const $btnRetry = document.getElementById('btn-retry');
if ($btnRetry) $btnRetry.addEventListener('click', () => buildLevel());

$btnSubmitScore.addEventListener('click', async () => {
  if ($scoreMessage) {
    $scoreMessage.textContent = '';
    $scoreMessage.style.color = '#c24d8e';
  }

  const username = $inputUsername.value.trim();
  if (!username || username.length < 3) {
    $inputUsername.classList.add('error');
    if ($scoreMessage) $scoreMessage.textContent = 'Pseudo trop court (min. 3 caractères)';
    $inputUsername.focus();
    return;
  }

  $inputUsername.classList.remove('error');
  localStorage.setItem('bc_username', username);
  $btnSubmitScore.disabled = true;
  if ($btnSkipScore) $btnSkipScore.disabled = true;

  const ok = await submitScore(username);
  if (!ok) {
    if ($scoreMessage) $scoreMessage.textContent = 'Erreur lors de l\'enregistrement du score.';
    $btnSubmitScore.disabled = false;
    if ($btnSkipScore) $btnSkipScore.disabled = false;
    return;
  }

  if ($scoreMessage) {
    $scoreMessage.style.color = '#2f8f5d';
    $scoreMessage.textContent = 'Score enregistré !';
  }
  setTimeout(() => {
    showLeaderboard();
    $btnSubmitScore.disabled = false;
    if ($btnSkipScore) $btnSkipScore.disabled = false;
  }, 650);
});

$btnSkipScore.addEventListener('click', () => {
  if ($scoreMessage) {
    $scoreMessage.textContent = '';
    $scoreMessage.style.color = '#c24d8e';
  }
  showLeaderboard();
});

document.getElementById('btn-gameover-restart').addEventListener('click', () => {
  $gameoverOverlay.classList.remove('show');
  lives = MAX_LIVES;
  levelIdx = 0;
  updateLivesDisplay();
  buildLevel();
});

if ($btnPauseResume) {
  $btnPauseResume.addEventListener('click', () => {
    setPause(false);
  });
}

if ($btnPauseRestart) {
  $btnPauseRestart.addEventListener('click', () => {
    setPause(false);
    buildLevel();
  });
}

if ($btnPauseMain) {
  $btnPauseMain.addEventListener('click', () => {
    setPause(false);
    openMainMenu();
  });
}

if ($btnMenuContinue) {
  $btnMenuContinue.addEventListener('click', () => {
    closeMainMenu();
  });
}

if ($btnMenuRestart) {
  $btnMenuRestart.addEventListener('click', () => {
    closeMainMenu();
    buildLevel();
  });
}

if ($btnMenuReset) {
  $btnMenuReset.addEventListener('click', () => {
    lives = MAX_LIVES;
    levelIdx = 0;
    maxUnlockedLevel = 1;
    localStorage.setItem(MENU_UNLOCK_KEY, '1');
    updateLivesDisplay();
    updateMenuProgress();
    closeMainMenu();
    buildLevel();
  });
}

if ($levelPrev && $levelViewport) {
  $levelPrev.addEventListener('click', () => {
    $levelViewport.scrollBy({ left: -$levelViewport.clientWidth, behavior: 'smooth' });
  });
}

if ($levelNext && $levelViewport) {
  $levelNext.addEventListener('click', () => {
    $levelViewport.scrollBy({ left: $levelViewport.clientWidth, behavior: 'smooth' });
  });
}

if ($levelViewport) {
  $levelViewport.addEventListener('scroll', () => {
    updateCarouselUi();
  });
}

// ─── START SCREEN / AUTH ────────────────────────────
const $startScreen  = document.getElementById('start-screen');
const $startForm    = document.getElementById('start-form');
const $startUser    = document.getElementById('input-start-user');
const $startPass    = document.getElementById('input-start-pass');
const $startError   = document.getElementById('start-error');
const $startSuccess = document.getElementById('start-success');
const $btnGuest     = document.getElementById('btn-start-guest');
const $tabLogin     = document.getElementById('tab-login');
const $tabRegister  = document.getElementById('tab-register');
let _authTab = 'login'; // 'login' | 'register'

// Pre-fill saved username
$startUser.value = localStorage.getItem('bc_username') || '';

[$tabLogin, $tabRegister].forEach(btn => {
  btn.addEventListener('click', () => {
    _authTab = btn.dataset.tab;
    $tabLogin.classList.toggle('active', _authTab === 'login');
    $tabRegister.classList.toggle('active', _authTab === 'register');
    $startError.textContent = '';
    if ($startSuccess) $startSuccess.textContent = '';
    $startUser.classList.remove('error');
    $startPass.classList.remove('error');
    $startPass.value = '';
  });
});

$startForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  resumeAudio();

  $startError.textContent = '';
  if ($startSuccess) $startSuccess.textContent = '';
  $startUser.classList.remove('error');
  $startPass.classList.remove('error');

  const username = $startUser.value.trim();
  const password = $startPass.value;
  if (username.length < 3) {
    $startUser.classList.add('error');
    $startError.textContent = 'Pseudo trop court (min. 3 caractères)';
    return;
  }
  if (password.length < 6) {
    $startPass.classList.add('error');
    $startError.textContent = 'Mot de passe trop court (min. 6 caractères)';
    return;
  }

  const endpoint = _authTab === 'login' ? '/api/login' : '/api/register';
  const $submitBtn = document.getElementById('btn-start-play');
  $submitBtn.disabled = true;

  try {
    const res = await fetch(`${BACK_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      $startError.textContent = data.message || (_authTab === 'login' ? 'Identifiants incorrects.' : 'Inscription impossible.');
      $submitBtn.disabled = false;
      return;
    }

    const data = await res.json().catch(() => ({}));
    if (data.token) localStorage.setItem('bc_token', data.token);
    localStorage.setItem('bc_username', username);
    $inputUsername.value = username;

    if (_authTab === 'register') {
      if ($startSuccess) $startSuccess.textContent = 'Inscription réussie ! Connecte-toi pour jouer.';
      _authTab = 'login';
      $tabLogin.classList.add('active');
      $tabRegister.classList.remove('active');
      $startPass.value = '';
      $submitBtn.disabled = false;
      return;
    }

    if ($startSuccess) $startSuccess.textContent = 'Connexion réussie !';
    setTimeout(() => _dismissStartScreen(), 420);
  } catch {
    // Backend indisponible -> jouer quand même
    localStorage.setItem('bc_username', username);
    $inputUsername.value = username;
    if ($startSuccess) $startSuccess.textContent = 'Mode local activé (back indisponible).';
    setTimeout(() => _dismissStartScreen(), 420);
  } finally {
    $submitBtn.disabled = false;
  }
});

$btnGuest.addEventListener('click', () => {
  resumeAudio();
  _dismissStartScreen();
});

function _dismissStartScreen() {
  $startScreen.classList.add('hidden');
  setTimeout(() => {
    $startScreen.style.display = 'none';
    openMainMenu();
  }, 520);
}

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

function formatTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const secs = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function computeHudScore() {
  const base = computeScore();
  const timePenalty = Math.floor(levelTimeSeconds * 0.8);
  return Math.max(10, base - timePenalty);
}

function updateHUD() {
  $moves.textContent = String(moveCount);
  $levelNum.textContent = String(levelIdx + 1);
  if ($timer) $timer.textContent = formatTime(levelTimeSeconds);
  if ($hudScore) $hudScore.textContent = String(computeHudScore());
}

function hasBlockingOverlay() {
  if ($startScreen.style.display !== 'none' && !$startScreen.classList.contains('hidden')) return true;
  if ($winOverlay.classList.contains('show')) return true;
  if ($gameoverOverlay.classList.contains('show')) return true;
  if ($pauseMenu.classList.contains('show')) return true;
  if ($mainMenu.classList.contains('show')) return true;
  return false;
}

function isTypingField(target) {
  if (!target) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  return target.isContentEditable === true;
}

function getUnlockedCount() {
  return Math.max(1, Math.min(LEVELS.length, maxUnlockedLevel));
}

function updateMenuProgress() {
  if (!$menuProgress) return;
  const done = Math.max(0, getUnlockedCount() - 1);
  const pct  = Math.round((done / LEVELS.length) * 100);
  const $txt = document.getElementById('menu-progress-text');
  if ($txt) $txt.textContent = `Progression: ${done} / ${LEVELS.length} niveaux terminés`;
  const bar = document.getElementById('menu-progress-bar');
  if (bar) bar.style.width = pct + '%';
}

function createShapePreview(def) {
  const wrapper = document.createElement('div');
  wrapper.className = 'shape-preview';

  const rows = def.tiles.length;
  const cols = def.tiles[0].length;
  const grid = document.createElement('div');
  grid.className = 'shape-grid';
  grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  grid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

  const startCol = def.start[0];
  const startRow = def.start[1];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement('span');
      const t = def.tiles[r][c];
      cell.className = 'shape-cell';

      if (t === T.VOID) {
        cell.classList.add('void');
      } else {
        cell.classList.add('active');
        if (t === T.GOAL) cell.classList.add('goal');
        if (c === startCol && r === startRow) cell.classList.add('start');
      }
      grid.appendChild(cell);
    }
  }

  wrapper.appendChild(grid);
  return wrapper;
}

function createLevelCard(def, idx) {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'level-card';

  const unlocked = idx < getUnlockedCount();
  const done = idx + 1 < getUnlockedCount();

  if (!unlocked) card.classList.add('locked');
  if (idx === (levelIdx % LEVELS.length)) card.classList.add('current');

  const header = document.createElement('div');
  header.className = 'level-card-header';
  const title = document.createElement('span');
  title.textContent = `Niveau ${idx + 1}`;
  const badge = document.createElement('span');
  badge.className = 'level-badge';

  if (!unlocked) {
    badge.classList.add('locked');
    badge.textContent = 'Verrouille';
  } else if (done) {
    badge.classList.add('done');
    badge.textContent = 'Termine';
  } else {
    badge.textContent = 'Disponible';
  }

  header.appendChild(title);
  header.appendChild(badge);
  card.appendChild(header);
  card.appendChild(createShapePreview(def));

  const meta = document.createElement('div');
  meta.className = 'level-meta';
  const cols = def.tiles[0].length;
  const rows = def.tiles.length;
  meta.textContent = `Plateforme: ${cols} x ${rows}`;
  card.appendChild(meta);

  card.addEventListener('click', () => {
    if (!unlocked) return;
    levelIdx = idx;
    lives = MAX_LIVES;
    updateLivesDisplay();
    closeMainMenu();
    buildLevel();
  });

  return card;
}

function updateCarouselUi() {
  if (!$levelViewport || !$levelPage || !$levelPrev || !$levelNext) return;
  const maxScrollLeft = Math.max(1, $levelViewport.scrollWidth - $levelViewport.clientWidth);
  const ratio = $levelViewport.scrollLeft / maxScrollLeft;
  const pages = Math.max(1, Math.round($levelViewport.scrollWidth / Math.max(1, $levelViewport.clientWidth)));
  const page = Math.min(pages, Math.max(1, Math.round(ratio * (pages - 1)) + 1));
  $levelPage.textContent = `Page ${page} / ${pages}`;
  $levelPrev.disabled = $levelViewport.scrollLeft <= 6;
  $levelNext.disabled = $levelViewport.scrollLeft >= maxScrollLeft - 6;
}

function renderLevelCarousel() {
  if (!$levelTrack) return;
  $levelTrack.innerHTML = '';
  LEVELS.forEach((def, idx) => {
    $levelTrack.appendChild(createLevelCard(def, idx));
  });
  updateMenuProgress();
  requestAnimationFrame(() => {
    updateCarouselUi();
  });
}

function openMainMenu() {
  setPause(false);
  renderLevelCarousel();
  $mainMenu.classList.add('show');
  $mainMenu.setAttribute('aria-hidden', 'false');
}

function closeMainMenu() {
  $mainMenu.classList.remove('show');
  $mainMenu.setAttribute('aria-hidden', 'true');
}

function setPause(shouldPause) {
  if (won || lost || isFalling || isWinAnim) return;
  isPaused = shouldPause;
  $pauseMenu.classList.toggle('show', shouldPause);
  $pauseMenu.setAttribute('aria-hidden', shouldPause ? 'false' : 'true');
}

function togglePause() {
  if (hasBlockingOverlay() && !isPaused) return;
  setPause(!isPaused);
}

function updateLivesDisplay() {
  $heartsEl.forEach((h, i) => {
    h.classList.toggle('filled', i < lives);
    h.classList.toggle('empty', i >= lives);
  });
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
  isPaused = false;
  levelTimeSeconds = 0;
  $winOverlay.classList.remove('show');
  $loseOverlay.classList.remove('show');
  $pauseMenu.classList.remove('show');
  updateLivesDisplay();
  updateHUD();
  renderLevelCarousel();
  // Réinitialise le formulaire de score
  $scoreForm.style.display = '';
  $leaderboard.style.display = 'none';
  $btnNext.style.display = 'none';
  $inputUsername.classList.remove('error');
  $btnSubmitScore.disabled = false;
  if ($btnSkipScore) $btnSkipScore.disabled = false;
  if ($scoreMessage) {
    $scoreMessage.textContent = '';
    $scoreMessage.style.color = '#c24d8e';
  }

  // ─ Transition couleur de fond
  _bgStart.copy(_bgCurrent);
  _bgTarget.copy(LEVEL_BG_COLORS[levelIdx % LEVEL_BG_COLORS.length]);
  _bgElapsed = 0;
  document.body.style.background = '#' + _bgTarget.getHexString();

  // ─── Build grid meshes ───
  gridGroup = new THREE.Group();

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
  blockMat = new THREE.MeshStandardMaterial({
    color: COLORS.PLAYER,
    emissive: COLORS.PLAYER_EMISSIVE,
    emissiveIntensity: 0.18,
    roughness: 0.22,
    metalness: 0.18,
  });
  const blockGeo = new THREE.BoxGeometry(CELL * 0.92, CELL * 2 * 0.96, CELL * 0.92);
  blockMesh = new THREE.Mesh(blockGeo, blockMat);
  blockMesh.castShadow = true;
  blockMesh.visible = true;

  const blockEdgeGeo = new THREE.EdgesGeometry(blockGeo);
  blockEdgeLines = new THREE.LineSegments(
    blockEdgeGeo,
    new THREE.LineBasicMaterial({ color: 0xFFB0CF, transparent: true, opacity: 0.55 }),
  );
  blockEdgeLines.position.y = 0.001;

  goalMeshes = [];
  winParticles = [];

  blockGroup = new THREE.Group();
  blockGroup.add(blockMesh);
  blockGroup.add(blockEdgeLines);

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
  const shadowSpan = Math.max(span * 2.1, 8);
  contactShadowPlane.scale.set(shadowSpan, shadowSpan, 1);
  contactShadowPlane.position.set(cx, -TILE_H / 2 - 0.02, cz);
  camera.position.set(cx + span * 0.2, span * 0.7 + 3, cz + span * 0.8 + 2);
  camera.lookAt(cx, 0, cz);
}

function addTileMesh(col, row, type, visible = true) {
  const wp = cellWorld(col, row);
  let mesh = null;
  let lines = null;

  const tileGeo = new THREE.BoxGeometry(CELL, TILE_H, CELL);
  const edgeGeo = new THREE.EdgesGeometry(tileGeo);

  const tileEmissives = {
    [T.GOAL]:     { color: 0xD47EB6, intensity: 0.22 },
    [T.SWITCH]:   { color: 0x4DBFB8, intensity: 0.12 },
    [T.HEAVY_SW]: { color: 0x6B52C0, intensity: 0.12 },
    [T.FRAGILE]:  { color: 0xC07030, intensity: 0.08 },
    [T.BRIDGE]:   { color: 0x5A9C20, intensity: 0.08 },
  };
  const emissiveInfo = tileEmissives[type];

  const mat = type === T.NORMAL
    ? new THREE.MeshStandardMaterial({
        map: fabricColorMap,
        normalMap: fabricNormalMap,
        roughnessMap: fabricRoughMap,
        roughness: 1.0,
        metalness: 0.0,
      })
    : new THREE.MeshStandardMaterial({
        color: tileColor(type),
        roughness: 0.5,
        metalness: 0.08,
        emissive: emissiveInfo ? emissiveInfo.color : 0x000000,
        emissiveIntensity: emissiveInfo ? emissiveInfo.intensity : 0,
      });

  mesh = new THREE.Mesh(tileGeo, mat);
  mesh.position.set(wp.x, 0, wp.z);
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  mesh.visible = visible;
  gridGroup.add(mesh);

  const lineMat = new THREE.LineBasicMaterial({ color: borderColor(type) });
  lines = new THREE.LineSegments(edgeGeo, lineMat);
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

  // Track goal meshes for pulse animation
  if (type === T.GOAL) {
    goalMeshes.push(mesh);
  }

  // Indicateur visuel pour switch léger (petit disque)
  if (type === T.SWITCH) {
    const disc = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 0.02, 16),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 }),
    );
    disc.position.set(wp.x, TILE_H / 2 + 0.02, wp.z);
    disc.castShadow = true;
    disc.receiveShadow = true;
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
    bar1.castShadow = true;
    bar1.receiveShadow = true;
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

  const _setBlockGeo = (w, h, d) => {
    blockMesh.geometry.dispose();
    blockMesh.geometry = new THREE.BoxGeometry(w, h, d);
    if (blockEdgeLines) {
      blockEdgeLines.geometry.dispose();
      blockEdgeLines.geometry = new THREE.EdgesGeometry(blockMesh.geometry);
    }
  };

  if (block.state === STATE.STANDING) {
    blockMesh.scale.set(1, 1, 1);
    _setBlockGeo(CELL * 0.92, CELL * 2 * 0.96, CELL * 0.92);
    blockGroup.position.set(wp.x, TILE_H / 2 + CELL, wp.z);
  }
  else if (block.state === STATE.LYING_X) {
    _setBlockGeo(CELL * 2 * 0.96, CELL * 0.92, CELL * 0.92);
    const cx = (cellWorld(block.x, block.z).x + cellWorld(block.x + 1, block.z).x) / 2;
    blockGroup.position.set(cx, TILE_H / 2 + CELL * 0.5, wp.z);
  }
  else if (block.state === STATE.LYING_Z) {
    _setBlockGeo(CELL * 0.92, CELL * 0.92, CELL * 2 * 0.96);
    const cz = (cellWorld(block.x, block.z).z + cellWorld(block.x, block.z + 1).z) / 2;
    blockGroup.position.set(wp.x, TILE_H / 2 + CELL * 0.5, cz);
  }
}

// ─── LOGIQUE DE DEPLACEMENT ──────────────────────────
function move(dir) {
  if (isRolling || won || lost || isFalling || isWinAnim || isPaused) return;

  // Save state pour rollback
  const prevBlock = { ...block };

  const { state } = block;

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
    updateHUD();
    playMove();
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
    updateHUD();
    playMove();
    return;
  }

  moveCount++;
  updateHUD();
  playMove();

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
      playSwitch();
    }

    // Heavy switch: STANDING only
    if (type === T.HEAVY_SW && block.state === STATE.STANDING) {
      toggleBridge(sid);
      playSwitch();
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
            if (bridgeMeshes[key].lines) bridgeMeshes[key].lines.visible = true;
          }
        } else {
          tileData[r][c] = T.VOID;
          if (bridgeMeshes[key]) {
            bridgeMeshes[key].mesh.visible  = false;
            if (bridgeMeshes[key].lines) bridgeMeshes[key].lines.visible = false;
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
  playFall();
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

    lives--;
    updateLivesDisplay();

    if (lives <= 0) {
      lives = 0;
      playGameOver();
      $gameoverOverlay.classList.add('show');
    } else {
      playLoseLife();
      // Affiche overlay brièvement puis relance automatiquement
      $loseOverlay.classList.add('show');
      setTimeout(() => {
        $loseOverlay.classList.remove('show');
        setTimeout(() => buildLevel(), 380);
      }, 950);
    }
  }
}

// ─── PARTICULES VICTOIRE ─────────────────────────────
const PARTICLE_COLORS = [0xFFBEEF, 0xB2FFF7, 0xDAF7A6, 0xFFD1A9, 0xD9CFFF, 0xFFF7A0];

function spawnWinParticles() {
  const origin = blockGroup.position.clone();
  for (let i = 0; i < 22; i++) {
    const size = 0.08 + Math.random() * 0.13;
    const geo  = Math.random() > 0.5
      ? new THREE.BoxGeometry(size, size, size)
      : new THREE.SphereGeometry(size * 0.6, 6, 6);
    const mat = new THREE.MeshStandardMaterial({
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      roughness: 0.4,
      emissive: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      emissiveIntensity: 0.3,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = false;
    mesh.position.copy(origin);
    mesh.position.y += 0.5;
    const theta = (Math.random() * Math.PI * 2);
    const vx = Math.cos(theta) * (1.5 + Math.random() * 2.5);
    const vz = Math.sin(theta) * (1.5 + Math.random() * 2.5);
    const vy = 2.5 + Math.random() * 3.5;
    mesh.userData = { vx, vy, vz, life: 0, maxLife: 0.85 + Math.random() * 0.4 };
    scene.add(mesh);
    winParticles.push(mesh);
  }
}

function tickWinParticles(delta) {
  for (let i = winParticles.length - 1; i >= 0; i--) {
    const p = winParticles[i];
    const d = p.userData;
    d.life += delta;
    p.position.x += d.vx * delta;
    p.position.y += (d.vy - 9.8 * d.life) * delta;
    p.position.z += d.vz * delta;
    p.rotation.x += delta * 3;
    p.rotation.z += delta * 2;
    p.material.opacity = Math.max(0, 1 - d.life / d.maxLife);
    p.material.transparent = true;
    if (d.life >= d.maxLife) {
      scene.remove(p);
      p.geometry.dispose();
      p.material.dispose();
      winParticles.splice(i, 1);
    }
  }
}

// ─── VICTOIRE ────────────────────────────────────────
function triggerWin() {
  won = true;
  isWinAnim = true;
  winElapsed = 0;
  blockMat.color.setHex(COLORS.PLAYER_WIN);
  blockMat.emissive.setHex(COLORS.PLAYER_WIN_EMISSIVE);
  blockMat.emissiveIntensity = 0.45;
  spawnWinParticles();
  playWin();
  // Gagner une vie (jusqu'au max)
  if (lives < MAX_LIVES) {
    lives = Math.min(lives + 1, MAX_LIVES);
    updateLivesDisplay();
  }

  const nextUnlocked = Math.min(LEVELS.length, Math.max(getUnlockedCount(), (levelIdx % LEVELS.length) + 2));
  if (nextUnlocked !== maxUnlockedLevel) {
    maxUnlockedLevel = nextUnlocked;
    localStorage.setItem(MENU_UNLOCK_KEY, String(maxUnlockedLevel));
    updateMenuProgress();
  }
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
    $btnNext.style.display = '';  // Montrer immédiatement le bouton "Niveau suivant"
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
    const res = await fetch(`${BACK_URL}/api/scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        points: computeScore(),
        levelReached: levelIdx + 1,
      }),
    });
    return res.ok;
  } catch {
    return false;
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
  if (e.repeat) return;
  if (isTypingField(e.target)) return;
  resumeAudio();

  if (e.key === 'Enter') {
    if ($winOverlay.classList.contains('show')) {
      e.preventDefault();
      levelIdx++;
      buildLevel();
      return;
    }
    if ($mainMenu.classList.contains('show')) {
      e.preventDefault();
      closeMainMenu();
      return;
    }
  }

  if (e.key === 'Escape') {
    e.preventDefault();
    if ($mainMenu.classList.contains('show')) {
      closeMainMenu();
      return;
    }
    togglePause();
    return;
  }

  if (e.key === 'm' || e.key === 'M') {
    e.preventDefault();
    togglePause();
    return;
  }

  if (e.key === 'n' || e.key === 'N') {
    if ($winOverlay.classList.contains('show')) {
      e.preventDefault();
      levelIdx++;
      buildLevel();
    }
    return;
  }

  if (e.key === 'r' || e.key === 'R') {
    e.preventDefault();
    buildLevel();
    return;
  }

  if (hasBlockingOverlay()) return;

  if (e.key === 'ArrowUp')    { e.preventDefault(); move('UP'); }
  if (e.key === 'ArrowDown')  { e.preventDefault(); move('DOWN'); }
  if (e.key === 'ArrowLeft')  { e.preventDefault(); move('LEFT'); }
  if (e.key === 'ArrowRight') { e.preventDefault(); move('RIGHT'); }
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
  const t = clock.elapsedTime;

  if (!won && !lost && !isPaused && !isFalling && !isWinAnim) {
    levelTimeSeconds += delta;
    updateHUD();
  }

  // Idle bob + subtle emissive pulse on block
  if (!won && !lost && !isRolling && !isFalling && !isPaused && blockGroup) {
    const idleY = block.state === STATE.STANDING
      ? TILE_H / 2 + CELL
      : TILE_H / 2 + CELL * 0.5;
    blockGroup.position.y = idleY + Math.sin(t * 2.5) * 0.02;
    if (blockMat) {
      blockMat.emissiveIntensity = 0.14 + Math.sin(t * 2.8) * 0.06;
    }
  }

  // Pulse emissive on goal tiles
  if (goalMeshes.length > 0) {
    const goalPulse = 0.18 + Math.sin(t * 3.5) * 0.12;
    for (const gm of goalMeshes) {
      if (gm.material && gm.visible) {
        gm.material.emissiveIntensity = goalPulse;
      }
    }
  }

  tickRoll(delta);
  tickFall(delta);
  tickWin(delta);
  tickWinParticles(delta);
  tickBg(delta);
  tickBgMusic();
  renderer.render(scene, camera);
});

// ─── DEMARRAGE ───────────────────────────────────────
buildLevel();
{
  const storedUnlocked = Number.parseInt(localStorage.getItem(MENU_UNLOCK_KEY) || '1', 10);
  if (Number.isFinite(storedUnlocked)) {
    maxUnlockedLevel = Math.max(1, Math.min(LEVELS.length, storedUnlocked));
  }
}
renderLevelCarousel();