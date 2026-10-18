import { normalizeWeatherOverlayId } from './scene-sprites.js';
import {
  DEFAULT_PARTY_ERA_ID,
  SKIN_TONES,
  createMemberAppearance,
  getEraById,
  summarizeMemberOutfit,
  syncAllPartyAppearancesToEra
} from './character-designer.js?v=pixi_final_11';

export const CLOUD_NARRATION_STORAGE_KEY = 'immutable-trail-cloud-narration';
export const LLM_NARRATION_STORAGE_KEY = 'immutable-trail-llm-narration';
export const AUTO_READ_STORAGE_KEY = 'immutable-trail-auto-read';
export const START_TILE_ID = 'independence';
export const FINISH_TILE_ID = 'willamette-valley';
export const MAX_STRANGENESS_LEVEL = 10;
export const STARTING_CASH = 1000;
export const WAGON_CAPACITY = 2400;
export const TOTAL_TRAIL_MILES = 2000;
export const ACTION_TYPES = ['press-on', 'camp', 'hunt', 'gather', 'treat', 'trade', 'repair', 'scout'];

export function getStartingCashForState(state) {
  const bankerCount = (state?.wagon?.party ?? []).filter((m) => m.role === 'Banker' && (m.health ?? 100) > 0).length;
  return STARTING_CASH + bankerCount * 250;
}
export const OUTFITTING_CATALOG = [
  { key: 'oxenYokes', id: 'oxen', name: 'Yoke of oxen', unit: 'yoke', price: 40, cargoWeight: 0, displayWeight: '1,000 lbs draft', detail: '2 oxen per yoke; at least 2 yokes required to travel.' },
  { key: 'foodSacks', id: 'food', name: 'Food sack (25 lb)', unit: 'sack', price: 5, cargoWeight: 25, detail: '25 food rations.' },
  { key: 'waterCasks', id: 'water', name: 'Fresh water cask (10 gal)', unit: 'cask', price: 2, cargoWeight: 80, detail: '10 gallons of water.' },
  { key: 'firewoodBundles', id: 'wood', name: 'Firewood bundle', unit: 'bundle', price: 2, cargoWeight: 30, detail: '10 logs for warmth, boiling, and repairs.' },
  { key: 'ammunitionBoxes', id: 'ammunition', name: 'Ammunition box (20)', unit: 'box', price: 2, cargoWeight: 3, detail: '20 cartridges for hunting.' },
  { key: 'medicalKits', id: 'medicine', name: 'Medical kit (4 doses)', unit: 'kit', price: 8, cargoWeight: 2, detail: '4 field-treatment doses.' },
  { key: 'spareAxles', id: 'axle', name: 'Spare axle', unit: 'each', price: 10, cargoWeight: 45, detail: 'Running-gear replacement.' },
  { key: 'spareWheels', id: 'wheel', name: 'Spare wheel', unit: 'each', price: 12, cargoWeight: 50, detail: 'Running-gear replacement.' },
  { key: 'spareTongues', id: 'tongue', name: 'Spare tongue', unit: 'each', price: 8, cargoWeight: 40, detail: 'Running-gear replacement.' },
  { key: 'clothingSets', id: 'clothing', name: 'Warm clothing & bedding', unit: 'set', price: 10, cargoWeight: 15, detail: 'One set of wool clothing and bedding.' }
];
export const RECOMMENDED_OUTFIT = Object.freeze({
  oxenYokes: 3,
  foodSacks: 16,
  waterCasks: 8,
  firewoodBundles: 6,
  ammunitionBoxes: 8,
  medicalKits: 3,
  spareAxles: 1,
  spareWheels: 2,
  spareTongues: 1,
  clothingSets: 4
});

export function createOutfittingCart() {
  return Object.fromEntries(OUTFITTING_CATALOG.map((item) => [item.key, 0]));
}

export function getOutfittingTotals(cart) {
  return OUTFITTING_CATALOG.reduce((totals, item) => {
    const quantity = Math.max(0, Math.floor(Number(cart?.[item.key]) || 0));
    totals.cost += quantity * item.price;
    totals.cargoWeight += quantity * item.cargoWeight;
    return totals;
  }, { cost: 0, cargoWeight: 0 });
}

export function getCargoWeightTier(weight) {
  if (weight < 1400) return 'light';
  if (weight <= 2100) return 'nominal';
  if (weight <= WAGON_CAPACITY) return 'overburdened';
  return 'overloaded';
}

export const fallbackWorld = {
  id: 'fallback-world',
  worldSeed: 'otgame-v1-seed',
  epochStart: '1848-01-01T00:00:00Z',
  rulesVersion: 'v1',
  createdAt: '1848-01-01T00:00:00Z'
};

export const trailMilestones = [
  {
    id: START_TILE_ID,
    name: 'Independence, MO',
    shortName: 'Independence',
    mile: 0,
    biome: 'grassland',
    elevation: 820,
    weather: { rain: 32, tempC: 7, windKph: 18 },
    resources: [
      { resourceType: 'water', remaining: 31 },
      { resourceType: 'wood', remaining: 72 },
      { resourceType: 'forage', remaining: 45 },
      { resourceType: 'herd', remaining: 37 }
    ]
  },
  {
    id: 'kansas-river',
    name: 'Kansas River Crossing',
    shortName: 'Kansas River',
    mile: 102,
    biome: 'river',
    elevation: 910,
    weather: { rain: 41, tempC: 8, windKph: 20 },
    river: { depthFt: 2.8, flowRate: 205 },
    resources: [
      { resourceType: 'water', remaining: 48 },
      { resourceType: 'wood', remaining: 38 },
      { resourceType: 'forage', remaining: 32 },
      { resourceType: 'herd', remaining: 16 }
    ]
  },
  {
    id: 'fort-kearny',
    name: 'Fort Kearny',
    shortName: 'Fort Kearny',
    mile: 319,
    biome: 'plains',
    elevation: 1260,
    weather: { rain: 24, tempC: 11, windKph: 25 },
    resources: [
      { resourceType: 'water', remaining: 28 },
      { resourceType: 'wood', remaining: 20 },
      { resourceType: 'forage', remaining: 34 },
      { resourceType: 'herd', remaining: 22 }
    ]
  },
  {
    id: 'chimney-rock',
    name: 'Chimney Rock',
    shortName: 'Chimney Rock',
    mile: 554,
    biome: 'badlands',
    elevation: 1410,
    weather: { rain: 18, tempC: 14, windKph: 31 },
    resources: [
      { resourceType: 'water', remaining: 18 },
      { resourceType: 'wood', remaining: 12 },
      { resourceType: 'forage', remaining: 26 },
      { resourceType: 'herd', remaining: 18 }
    ]
  },
  {
    id: 'fort-laramie',
    name: 'Fort Laramie',
    shortName: 'Fort Laramie',
    mile: 640,
    biome: 'plains',
    elevation: 1510,
    weather: { rain: 20, tempC: 13, windKph: 27 },
    resources: [
      { resourceType: 'water', remaining: 24 },
      { resourceType: 'wood', remaining: 22 },
      { resourceType: 'forage', remaining: 28 },
      { resourceType: 'herd', remaining: 19 }
    ]
  },
  {
    id: 'independence-rock',
    name: 'Independence Rock',
    shortName: 'Independence Rock',
    mile: 815,
    biome: 'plains',
    elevation: 1680,
    weather: { rain: 17, tempC: 11, windKph: 22 },
    resources: [
      { resourceType: 'water', remaining: 26 },
      { resourceType: 'wood', remaining: 16 },
      { resourceType: 'forage', remaining: 24 },
      { resourceType: 'herd', remaining: 14 }
    ]
  },
  {
    id: 'south-pass',
    name: 'South Pass / Continental Divide',
    shortName: 'South Pass',
    mile: 932,
    biome: 'mountain',
    elevation: 7412,
    weather: { rain: 36, tempC: 1, windKph: 34 },
    resources: [
      { resourceType: 'water', remaining: 21 },
      { resourceType: 'wood', remaining: 14 },
      { resourceType: 'forage', remaining: 18 },
      { resourceType: 'herd', remaining: 10 }
    ]
  },
  {
    id: 'fort-bridger',
    name: 'Fort Bridger',
    shortName: 'Fort Bridger',
    mile: 1070,
    biome: 'mountain',
    elevation: 6670,
    weather: { rain: 28, tempC: 5, windKph: 29 },
    resources: [
      { resourceType: 'water', remaining: 22 },
      { resourceType: 'wood', remaining: 18 },
      { resourceType: 'forage', remaining: 20 },
      { resourceType: 'herd', remaining: 11 }
    ]
  },
  {
    id: 'soda-springs',
    name: 'Soda Springs',
    shortName: 'Soda Springs',
    mile: 1220,
    biome: 'forest',
    elevation: 5759,
    weather: { rain: 31, tempC: 6, windKph: 24 },
    resources: [
      { resourceType: 'water', remaining: 34 },
      { resourceType: 'wood', remaining: 26 },
      { resourceType: 'forage', remaining: 24 },
      { resourceType: 'herd', remaining: 15 }
    ]
  },
  {
    id: 'snake-river',
    name: 'Snake River Crossing',
    shortName: 'Snake River',
    mile: 1390,
    biome: 'river',
    elevation: 3310,
    weather: { rain: 27, tempC: 9, windKph: 26 },
    river: { depthFt: 3.6, flowRate: 292 },
    resources: [
      { resourceType: 'water', remaining: 42 },
      { resourceType: 'wood', remaining: 16 },
      { resourceType: 'forage', remaining: 20 },
      { resourceType: 'herd', remaining: 12 }
    ]
  },
  {
    id: 'blue-mountains',
    name: 'Blue Mountains',
    shortName: 'Blue Mountains',
    mile: 1600,
    biome: 'mountain',
    elevation: 5210,
    weather: { rain: 43, tempC: 3, windKph: 33 },
    resources: [
      { resourceType: 'water', remaining: 28 },
      { resourceType: 'wood', remaining: 30 },
      { resourceType: 'forage', remaining: 18 },
      { resourceType: 'herd', remaining: 9 }
    ]
  },
  {
    id: 'the-dalles',
    name: 'The Dalles',
    shortName: 'The Dalles',
    mile: 1800,
    biome: 'river',
    elevation: 110,
    weather: { rain: 46, tempC: 10, windKph: 21 },
    resources: [
      { resourceType: 'water', remaining: 39 },
      { resourceType: 'wood', remaining: 18 },
      { resourceType: 'forage', remaining: 16 },
      { resourceType: 'herd', remaining: 8 }
    ]
  },
  {
    id: FINISH_TILE_ID,
    name: 'Willamette Valley, OR',
    shortName: 'Willamette Valley',
    mile: TOTAL_TRAIL_MILES,
    biome: 'grassland',
    elevation: 180,
    weather: { rain: 52, tempC: 11, windKph: 14 },
    resources: [
      { resourceType: 'water', remaining: 50 },
      { resourceType: 'wood', remaining: 40 },
      { resourceType: 'forage', remaining: 32 },
      { resourceType: 'herd', remaining: 12 }
    ]
  }
];

export const trailLandmarks = Object.fromEntries(trailMilestones.map((milestone) => [milestone.id, milestone.shortName]));

export const fallbackTile = {
  ...trailMilestones[0],
  tileId: trailMilestones[0].id
};

function loadCloudNarrationPreference() {
  try {
    const stored = localStorage.getItem(CLOUD_NARRATION_STORAGE_KEY);
    return stored === null ? null : stored === 'true';
  } catch {
    return null;
  }
}

export function saveCloudNarrationPreference(enabled) {
  try {
    localStorage.setItem(CLOUD_NARRATION_STORAGE_KEY, String(enabled));
  } catch {
    // Ignore storage failures and keep the current in-memory preference.
  }
}

export function loadBooleanPreference(key, defaultValue) {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return defaultValue;
    return stored === 'true';
  } catch {
    return defaultValue;
  }
}

export function saveBooleanPreference(key, enabled) {
  try {
    localStorage.setItem(key, String(enabled));
  } catch {
    // Ignore storage failures.
  }
}

function createInitialWagonState() {
  const party = createInitialParty();
  return {
    location: START_TILE_ID,
    health: 100,
    morale: 71,
    cash: STARTING_CASH,
    oxenYokes: 0,
    oxen: 0,
    oxenFatigue: 0,
    food: 0,
    water: 0,
    wood: 0,
    medicine: 0,
    ammunition: 0,
    spareAxles: 0,
    spareWheels: 0,
    spareTongues: 0,
    clothingSets: 0,
    doctorTreatments: 0,
    pace: 'steady',
    rations: 'filling',
    party,
    wagonParts: {
      axle: 100,
      wheels: 100,
      tongue: 100,
      brokenPart: null
    },
    status: 'On the trail'
  };
}

function createInitialParty(eraId = DEFAULT_PARTY_ERA_ID) {
  return [
    {
      id: 'leader',
      name: 'Jedediah',
      role: 'Guide',
      health: 100,
      status: 'Healthy',
      deceasedLogged: false,
      appearance: createMemberAppearance({
        gender: 'male',
        eraId,
        bodyTemplateId: 'broad_guardian',
        skinToneId: SKIN_TONES[0].id,
        headwearType: 'hat',
        variantIndex: 0
      })
    },
    {
      id: 'member_1',
      name: 'Abigail',
      role: 'Doctor',
      health: 100,
      status: 'Healthy',
      deceasedLogged: false,
      appearance: createMemberAppearance({
        gender: 'female',
        eraId,
        bodyTemplateId: 'standard_adventurer',
        skinToneId: SKIN_TONES[1].id,
        headwearType: 'hat',
        variantIndex: 0
      })
    },
    {
      id: 'member_2',
      name: 'Billy',
      role: 'Youth',
      health: 100,
      status: 'Healthy',
      deceasedLogged: false,
      appearance: createMemberAppearance({
        gender: 'male',
        eraId,
        bodyTemplateId: 'nimble_scout',
        skinToneId: SKIN_TONES[0].id,
        headwearType: 'hair',
        variantIndex: 1
      })
    },
    {
      id: 'member_3',
      name: 'Sarah',
      role: 'Carpenter',
      health: 100,
      status: 'Healthy',
      deceasedLogged: false,
      appearance: createMemberAppearance({
        gender: 'female',
        eraId,
        bodyTemplateId: 'standard_adventurer',
        skinToneId: SKIN_TONES[4].id,
        headwearType: 'hair',
        variantIndex: 1
      })
    }
  ];
}

export function createAppState() {
  const currentTrailSnapshot = getTrailSnapshot({ milesTraveled: 0, currentMilestoneIndex: 0, day: 1 });
  return {
    tileMap: trailMilestones,
    expeditionId: crypto.randomUUID(),
    expeditionName: 'The Schachterle Family',
    selectedEra: DEFAULT_PARTY_ERA_ID,
    activeCreatorMemberIndex: 0,
    creatorCategory: 'hats',
    creatorHeadwearSubFilter: 'all',
    landscapeCharX: 116,
    generalStoreApproachProgress: 0,
    landscapeScrollX: 0,
    landscapeMoving: false,
    riverCrossingAnimation: null,
    setupStage: 'register',
    setupError: '',
    outfittingProfile: '',
    prologueHeadline: '',
    prologueParagraphs: [],
    prologueReady: false,
    outfittingCart: createOutfittingCart(),
    dallesRouteChoice: null,
    milesTraveled: 0,
    currentMilestoneIndex: 0,
    currentTrailSnapshot,
    events: [],
    statusMessage: 'The trail is quiet. Pick a move and see what the world does next.',
    day: 1,
    turnPhase: 'dispatch',
    gameOver: false,
    journeyCompleted: false,
    narrationAutoPlay: loadBooleanPreference(AUTO_READ_STORAGE_KEY, true),
    llmNarrationPreferred: loadBooleanPreference(LLM_NARRATION_STORAGE_KEY, true),
    narrationText: '',
    latestNarration: null,
    narrationLoading: false,
    narrationRequestId: 0,
    narrationSpeechId: 0,
    narrationStateKey: '',
    narrationInFlightKey: '',
    narrationRefreshTimer: null,
    pendingNarrationAutoPlay: true,
    dispatchAutoPlayPending: false,
    selectedVoiceName: '',
    availableVoices: [],
    llmNarrationAvailable: false,
    elevenLabsAvailable: false,
    cloudNarrationPreferred: loadCloudNarrationPreference() ?? false,
    journeyStarted: false,
    journeyLoading: false,
    actionInProgress: false,
    travelAnimationActive: false,
    wagonAnimationFrame: 0,
    lastActionSummary: null,
    lastActionContext: null,
    actionHistory: [],
    narrationHistory: [],
    recentObstacleHistory: [],
    storyKeyPoints: [],
    strangenessLevel: 0,
    strangenessLevelOverride: null,
    weatherOverlay: 'none',
    weatherOverlayOverride: null,
    weatherSeed: Math.floor(Math.random() * 1000000),
    activeDialogue: null,
    prologueDialogue: null,
    pendingSurrealEffect: null,
    pendingMetaDialogue: null,
    justResolvedDecision: null,
    metaDialogueHistory: [],
    dmDossierUpdates: [],
    recordedNarrativeUpdateKeys: [],
    lastRemoteNarrationTriggerKey: '',
    lastObstacleDay: 0,
    activeObstacle: null,
    activeDecision: null,
    wagon: createInitialWagonState()
  };
}

export function getEffectiveStrangenessLevel(state) {
  return state.strangenessLevelOverride ?? state.strangenessLevel;
}

export const appState = createAppState();

export function resetExpedition(state = appState) {
  state.tileMap = trailMilestones;
  state.expeditionId = crypto.randomUUID();
  state.expeditionName = 'The Schachterle Family';
  state.selectedEra = DEFAULT_PARTY_ERA_ID;
  state.activeCreatorMemberIndex = 0;
  state.creatorCategory = 'hats';
  state.creatorHeadwearSubFilter = 'all';
  state.landscapeCharX = 116;
  state.generalStoreApproachProgress = 0;
  state.landscapeScrollX = 0;
  state.landscapeMoving = false;
  state.riverCrossingAnimation = null;
  state.setupStage = 'register';
  state.setupError = '';
  state.outfittingProfile = '';
  state.prologueHeadline = '';
  state.prologueParagraphs = [];
  state.prologueReady = false;
  state.outfittingCart = createOutfittingCart();
  state.dallesRouteChoice = null;
  state.milesTraveled = 0;
  state.currentMilestoneIndex = 0;
  state.currentTrailSnapshot = getTrailSnapshot({ milesTraveled: 0, currentMilestoneIndex: 0, day: 1 });
  state.events = [];
  state.statusMessage = 'The trail is quiet. Pick a move and see what the world does next.';
  state.day = 1;
  state.turnPhase = 'dispatch';
  state.gameOver = false;
  state.journeyCompleted = false;
  state.journeyStarted = false;
  state.narrationText = '';
  state.latestNarration = null;
  state.narrationLoading = false;
  state.narrationRequestId = 0;
  state.narrationSpeechId = 0;
  state.narrationStateKey = '';
  state.narrationInFlightKey = '';
  state.narrationRefreshTimer = null;
  state.pendingNarrationAutoPlay = true;
  state.dispatchAutoPlayPending = false;
  state.selectedVoiceName = '';
  state.availableVoices = [];
  state.elevenLabsAvailable = false;
  state.journeyLoading = false;
  state.actionInProgress = false;
  state.travelAnimationActive = false;
  state.wagonAnimationFrame = 0;
  state.lastActionSummary = null;
  state.lastActionContext = null;
  state.actionHistory = [],
  state.narrationHistory = [],
  state.recentObstacleHistory = [],
  state.storyKeyPoints = [],
  state.strangenessLevel = 0;
  state.strangenessLevelOverride = null;
  state.weatherOverlay = 'none';
  state.weatherOverlayOverride = null;
  state.weatherSeed = Math.floor(Math.random() * 1000000);
  state.activeDialogue = null;
  state.prologueDialogue = null;
  state.pendingSurrealEffect = null;
  state.pendingMetaDialogue = null;
  state.justResolvedDecision = null;
  state.metaDialogueHistory = [];
  state.dmDossierUpdates = [];
  state.recordedNarrativeUpdateKeys = [];
  state.lastRemoteNarrationTriggerKey = '';
  state.lastObstacleDay = 0;
  state.activeObstacle = null;
  state.activeDecision = null;
  state.wagon = createInitialWagonState();
}

export function debugNarration(state, label, detail = {}) {
  const snapshot = {
    label,
    narrationRequestId: state.narrationRequestId,
    narrationSpeechId: state.narrationSpeechId,
    narrationStateKey: state.narrationStateKey,
    narrationInFlightKey: state.narrationInFlightKey,
    narrationAutoPlay: state.narrationAutoPlay,
    milesTraveled: state.milesTraveled,
    day: state.day,
    statusMessage: state.statusMessage,
    ...detail
  };
  console.log('[narration-debug]', snapshot);
}

export function normalizeNarrationText(text = '') {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function isNarrationDuplicate(nextText, previousText) {
  const next = normalizeNarrationText(nextText);
  const prev = normalizeNarrationText(previousText);
  if (!next || !prev) {
    return false;
  }
  if (next === prev) {
    return true;
  }
  const nextWords = new Set(next.split(' '));
  const prevWords = new Set(prev.split(' '));
  const overlap = [...nextWords].filter((word) => prevWords.has(word) && word.length > 3).length;
  const total = Math.max(nextWords.size, prevWords.size);
  const ratio = total ? overlap / total : 0;
  return ratio >= 0.7;
}

export function rememberNarrationBody(state, body) {
  if (!body || typeof body !== 'string') {
    return;
  }
  const trimmed = body.trim();
  if (!trimmed) {
    return;
  }
  const last = state.narrationHistory.at(-1);
  if (last === trimmed) {
    return;
  }
  state.narrationHistory = [...state.narrationHistory, trimmed].slice(-8);
}

export function rememberNarrationKeyPoints(state, keyPoints) {
  if (!Array.isArray(keyPoints) || !keyPoints.length) {
    return;
  }
  const normalized = keyPoints
    .filter((point) => typeof point === 'string')
    .map((point) => point.trim())
    .filter(Boolean)
    .slice(0, 6);
  if (!normalized.length) {
    return;
  }
  const merged = [...state.storyKeyPoints];
  normalized.forEach((point) => {
    if (!merged.includes(point)) {
      merged.push(point);
    }
  });
  state.storyKeyPoints = merged.slice(-20);
}

export function clampObstacleCostValue(value, max = 20) {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(max, Math.round(value)));
}

function normalizeObstacleHistoryText(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function rememberObstacleHistory(state, obstacle) {
  const description = obstacle.description.trim();
  const history = state.recentObstacleHistory ?? [];
  const normalizedDescription = normalizeObstacleHistoryText(description);
  const matchingIndex = history.findIndex((entry) => normalizeObstacleHistoryText(entry.description) === normalizedDescription);
  state.recentObstacleHistory = [
    ...history.filter((_, index) => index !== matchingIndex),
    {
      day: state.day,
      description,
      choices: obstacle.choices.map((choice) => choice.label)
    }
  ].slice(-8);
}

export function normalizeObstacleCandidate(obstacle) {
  if (!obstacle || typeof obstacle !== 'object') return null;
  if (typeof obstacle.description !== 'string' || !obstacle.description.trim()) return null;
  if (!Array.isArray(obstacle.choices)) return null;

  const seenIds = new Set();
  const choices = obstacle.choices
    .map((choice) => {
      if (!choice || typeof choice !== 'object') return null;
      if (typeof choice.id !== 'string' || !choice.id.trim()) return null;
      if (seenIds.has(choice.id)) return null;
      if (typeof choice.label !== 'string' || !choice.label.trim()) return null;
      if (typeof choice.description !== 'string' || !choice.description.trim()) return null;
      const cost = choice.cost && typeof choice.cost === 'object' ? choice.cost : {};
      seenIds.add(choice.id);
      return {
        id: choice.id.trim(),
        label: choice.label.trim(),
        description: choice.description.trim(),
        approach: ['meta-engagement', 'reality-anchor', 'defiant-refusal'].includes(choice.approach) ? choice.approach : undefined,
        cost: {
          health: clampObstacleCostValue(cost.health),
          morale: clampObstacleCostValue(cost.morale),
          food: clampObstacleCostValue(cost.food),
          water: clampObstacleCostValue(cost.water),
          wood: clampObstacleCostValue(cost.wood),
          medicine: clampObstacleCostValue(cost.medicine),
          ammunition: clampObstacleCostValue(cost.ammunition),
          days: clampObstacleCostValue(cost.days, 3)
        }
      };
    })
    .filter(Boolean)
    .slice(0, 3);

  if (choices.length < 2) return null;
  return {
    description: obstacle.description.trim(),
    dilemmaType: obstacle.dilemmaType === 'surreal' ? 'surreal' : 'survival',
    choices
  };
}

function clampSignedEffect(value, limit) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(-limit, Math.min(limit, Math.round(number))) : 0;
}

export function normalizeSurrealMutation(mutation) {
  if (!mutation || typeof mutation !== 'object') return null;
  const title = typeof mutation.title === 'string' ? mutation.title.trim().slice(0, 100) : '';
  const manifestation = typeof mutation.manifestation === 'string' ? mutation.manifestation.trim().slice(0, 500) : '';
  const gameplayTwist = typeof mutation.gameplayTwist === 'string' ? mutation.gameplayTwist.trim().slice(0, 300) : '';
  const severity = typeof mutation.severity === 'string' ? mutation.severity.trim().slice(0, 40) : '';
  if (!title || !manifestation || !gameplayTwist || !severity) return null;

  const effect = mutation.mechanicalEffect && typeof mutation.mechanicalEffect === 'object'
    ? mutation.mechanicalEffect
    : {};
  return {
    mutationKey: typeof mutation.mutationKey === 'string' ? mutation.mutationKey : '',
    title,
    manifestation,
    gameplayTwist,
    severity,
    mechanicalEffect: {
      trigger: ['next_action', 'next_travel', 'next_camp'].includes(effect.trigger) ? effect.trigger : 'next_action',
      travelMilesDelta: clampSignedEffect(effect.travelMilesDelta, 20),
      healthDelta: clampSignedEffect(effect.healthDelta, 10),
      moraleDelta: clampSignedEffect(effect.moraleDelta, 15),
      foodDelta: clampSignedEffect(effect.foodDelta, 5),
      waterDelta: clampSignedEffect(effect.waterDelta, 5),
      woodDelta: clampSignedEffect(effect.woodDelta, 3),
      medicineDelta: clampSignedEffect(effect.medicineDelta, 2)
    }
  };
}

export function extractDialogueFromNarration(narration, state) {
  if (!narration) return null;
  const party = state?.wagon?.party ?? [];
  const livingParty = party.filter((member) => (member.health ?? 100) > 0 && member.status !== 'Deceased');
  const candidatePool = livingParty.length ? livingParty : party;

  const matchSpeakerFromHint = (hintText = '') => {
    const normalizedHint = String(hintText).toLowerCase();
    if (!normalizedHint.trim()) return null;

    if (/\b(matt|shopkeeper|storekeeper|merchant|outfitter)\b/i.test(normalizedHint)) {
      return { id: 'shopkeeper', name: 'Matt', role: 'Shopkeeper', targetType: 'npc' };
    }
    if (/\b(ferryman|ferry\s+operator|ferry\s+attendant|boatman)\b/i.test(normalizedHint)) {
      return { id: 'ferryOperator', name: 'Ferryman', role: 'Ferry Attendant', targetType: 'npc' };
    }
    if (/\b(river\s+guide|shoshone\s+guide|pawnee\s+guide|local\s+guide)\b/i.test(normalizedHint)) {
      return { id: 'riverGuide', name: 'River Guide', role: 'Guide', targetType: 'npc' };
    }

    for (const member of candidatePool) {
      const escapedName = String(member.name || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (escapedName && new RegExp(`\\b${escapedName}\\b`, 'i').test(hintText)) {
        return { id: member.id, name: member.name, role: member.role, targetType: 'party' };
      }
    }
    for (const member of candidatePool) {
      const roleLower = String(member.role || '').toLowerCase();
      if (roleLower && new RegExp(`\\b${roleLower}\\b`, 'i').test(normalizedHint)) {
        return { id: member.id, name: member.name, role: member.role, targetType: 'party' };
      }
      if (roleLower === 'youth' && /\b(youngest|child|boy|girl)\b/i.test(normalizedHint)) {
        return { id: member.id, name: member.name, role: member.role, targetType: 'party' };
      }
    }
    return null;
  };

  if (narration.dialogue && typeof narration.dialogue === 'object' && typeof narration.dialogue.text === 'string') {
    const cleanedText = narration.dialogue.text.trim().replace(/^["“]+|["”]+$/g, '').trim();
    if (cleanedText) {
      const byId = candidatePool.find((m) => narration.dialogue.speakerId && m.id === narration.dialogue.speakerId);
      const matched = byId
        ? { id: byId.id, name: byId.name, role: byId.role, targetType: 'party' }
        : matchSpeakerFromHint(`${narration.dialogue.speakerName ?? ''} ${narration.dialogue.speakerRole ?? ''}`);
      if (matched) {
        return {
          speakerId: matched.id,
          speakerName: matched.name,
          speakerRole: matched.role,
          targetType: matched.targetType ?? 'party',
          text: cleanedText
        };
      }
      const fallback = candidatePool[0];
      return {
        speakerId: narration.dialogue.speakerId || fallback?.id || 'leader',
        speakerName: narration.dialogue.speakerName?.trim() || fallback?.name || 'Traveler',
        speakerRole: narration.dialogue.speakerRole?.trim() || fallback?.role || '',
        targetType: 'party',
        text: cleanedText
      };
    }
  }

  const segments = [
    ...(Array.isArray(narration.lines) ? narration.lines : []),
    ...(Array.isArray(narration.prologueParagraphs) ? narration.prologueParagraphs : []),
    typeof narration.body === 'string' ? narration.body : ''
  ].filter(Boolean);

  for (const segment of segments) {
    const sentences = String(segment).match(/[^.!?]+[.!?]+(?:\s*["”])?|[^.!?]+$/g) ?? [String(segment)];
    for (let idx = 0; idx < sentences.length; idx += 1) {
      const sentence = sentences[idx];
      const matches = [...sentence.matchAll(/"([^"\n]{2,})"|“([^”\n]{2,})”/g)];
      if (!matches.length) continue;

      const quoteParts = matches.map((m) => (m[1] ?? m[2] ?? '').trim()).filter(Boolean);
      const quoteText = quoteParts.join(' ').replace(/\s+/g, ' ').trim();
      if (!quoteText) continue;

      const unquotedSentence = sentence.replace(/"[^"\n]*"|“[^”\n]*”/g, ' ');
      const prevSentence = idx > 0 ? sentences[idx - 1].replace(/"[^"\n]*"|“[^”\n]*”/g, ' ') : '';
      const matched =
        matchSpeakerFromHint(unquotedSentence) ||
        matchSpeakerFromHint(prevSentence) ||
        matchSpeakerFromHint(String(segment).replace(/"[^"\n]*"|“[^”\n]*”/g, ' ')) ||
        (candidatePool[0]
          ? { id: candidatePool[0].id, name: candidatePool[0].name, role: candidatePool[0].role, targetType: 'party' }
          : null);

      return {
        speakerId: matched?.id ?? 'leader',
        speakerName: matched?.name ?? 'Traveler',
        speakerRole: matched?.role ?? '',
        targetType: matched?.targetType ?? 'party',
        text: quoteText
      };
    }
  }

  return null;
}

export function applyNarrationBeat(state, narration) {
  const surrealMutation = normalizeSurrealMutation(narration?.surrealMutation);
  const resolvedDialogue = extractDialogueFromNarration(narration, state);
  state.latestNarration = narration
    ? {
        ...narration,
        surrealMutation: surrealMutation ?? undefined,
        dialogue: resolvedDialogue ?? narration.dialogue ?? undefined
      }
    : narration;
  state.activeDialogue = resolvedDialogue;
  state.activeDialogueShownAt = resolvedDialogue ? Date.now() : 0;
  state.activeObstacle = normalizeObstacleCandidate(narration?.obstacle);
  if (surrealMutation) {
    state.pendingSurrealEffect = surrealMutation;
  }
  state.narrationText = narration?.body ?? '';
  if (narration?.body) {
    rememberNarrationBody(state, narration.body);
  }
  if (Array.isArray(narration?.keyPoints)) {
    rememberNarrationKeyPoints(state, narration.keyPoints);
  }
  if (typeof narration?.weatherOverlay === 'string' && narration.weatherOverlay) {
    const nextWeather = normalizeWeatherOverlayId(narration.weatherOverlay);
    if (nextWeather !== state.weatherOverlay) {
      state.weatherSeed = Math.floor(Math.random() * 1000000);
    }
    state.weatherOverlay = nextWeather;
  }
}

export function describeAction(actionType) {
  const actionMap = {
    'press-on': 'Press on',
    camp: 'Make camp',
    hunt: 'Hunt for provisions',
    gather: 'Gather supplies',
    treat: 'Treat illness',
    trade: 'Trade resources',
    repair: 'Repair wagon',
    scout: 'Scout ahead',
  };
  return actionMap[actionType] ?? actionType;
}

export function toSupplySnapshot(wagon) {
  return {
    foodRations: Math.max(0, Math.round(wagon.food)),
    waterGallons: Math.max(0, Math.round(wagon.water)),
    firewoodBundles: Math.max(0, Math.round(wagon.wood)),
    medicineDoses: Math.max(0, Math.round(wagon.medicine)),
    ammunitionBoxes: Math.max(0, Math.round(wagon.ammunition))
  };
}

export function resourceUnitsLabel(resourceType) {
  if (resourceType === 'water') return 'gallons';
  if (resourceType === 'wood') return 'bundles';
  if (resourceType === 'forage') return 'rations';
  if (resourceType === 'herd') return 'meat rations';
  if (resourceType === 'ammunition') return 'boxes';
  return 'units';
}

export function wagonLoadWeight(wagon) {
  return (wagon.food * 1)
    + (wagon.water * 8)
    + (wagon.wood * 30)
    + (wagon.medicine * 0.5)
    + (wagon.ammunition * 3)
    + ((wagon.spareAxles ?? 0) * 45)
    + ((wagon.spareWheels ?? 0) * 50)
    + ((wagon.spareTongues ?? 0) * 40)
    + ((wagon.clothingSets ?? 0) * 15);
}

export function averagePartyHealth(party = []) {
  const living = party.filter((member) => (member.health ?? 0) > 0);
  if (!living.length) return 0;
  const total = living.reduce((sum, member) => sum + (member.health ?? 0), 0);
  return Math.round(total / living.length);
}

export function syncWagonHealthFromParty(state) {
  state.wagon.health = averagePartyHealth(state.wagon.party ?? []);
}

export function getLivingPartyMembers(state) {
  return (state.wagon.party ?? []).filter((member) => (member.health ?? 0) > 0);
}

export function getRoleHolder(state, role) {
  return (state.wagon.party ?? []).find((member) => member.role === role && member.health > 0) ?? null;
}

export function getRoleCount(state, role) {
  return (state.wagon.party ?? []).filter((member) => member.role === role && member.health > 0).length;
}

export function applyPartyHealthDelta(state, delta, options = {}) {
  const living = getLivingPartyMembers(state);
  if (!living.length || !delta) {
    syncWagonHealthFromParty(state);
    return [];
  }

  const targets = options.memberId
    ? living.filter((member) => member.id === options.memberId)
    : [...living].sort((left, right) => (left.health ?? 0) - (right.health ?? 0));
  const affected = targets.length ? targets : living;
  const perMember = Math.max(1, Math.round(Math.abs(delta) / affected.length));

  affected.forEach((member) => {
    if (delta < 0) {
      member.health = Math.max(0, member.health - perMember);
      if (member.health <= 0) {
        member.status = 'Deceased';
      } else if (options.status) {
        member.status = options.status;
      }
    } else {
      member.health = Math.min(100, member.health + perMember);
      if (options.clearStatus !== false && member.health > 0 && member.status !== 'Deceased') {
        member.status = 'Healthy';
      }
    }
  });

  syncWagonHealthFromParty(state);
  return affected.map((member) => member.id);
}

export function setPartyCondition(state, memberId, status) {
  const member = (state.wagon.party ?? []).find((entry) => entry.id === memberId);
  if (!member || member.health <= 0) return null;
  member.status = status;
  syncWagonHealthFromParty(state);
  return member;
}

export function paceLabel(value) {
  const labels = {
    steady: 'Steady',
    strenuous: 'Strenuous',
    grueling: 'Grueling'
  };
  return labels[value] ?? value;
}

export function rationsLabel(value) {
  const labels = {
    filling: 'Filling',
    normal: 'Normal',
    meager: 'Meager',
  };
  return labels[value] ?? value;
}

export function getCurrentMilestoneIndexForMiles(milesTraveled = 0) {
  const miles = Math.max(0, Math.min(TOTAL_TRAIL_MILES, Math.round(milesTraveled)));
  let index = 0;
  for (let i = 0; i < trailMilestones.length; i += 1) {
    if (trailMilestones[i].mile <= miles) {
      index = i;
    } else {
      break;
    }
  }
  return index;
}

export function getCurrentMilestone(state) {
  const index = typeof state?.currentMilestoneIndex === 'number'
    ? state.currentMilestoneIndex
    : getCurrentMilestoneIndexForMiles(state?.milesTraveled ?? 0);
  return trailMilestones[index] ?? trailMilestones[0];
}

export function getNextMilestone(state) {
  const currentIndex = typeof state?.currentMilestoneIndex === 'number'
    ? state.currentMilestoneIndex
    : getCurrentMilestoneIndexForMiles(state?.milesTraveled ?? 0);
  return trailMilestones[currentIndex + 1] ?? null;
}

export function getMilesToNextMilestone(state) {
  const next = getNextMilestone(state);
  if (!next) return 0;
  return Math.max(0, next.mile - Math.round(state?.milesTraveled ?? 0));
}

export function locationNameForTile(tileId, biome = 'frontier trail') {
  return trailLandmarks[tileId] ?? `${biome} stretch`;
}

export function locationDescriptor(tileId, biome) {
  return locationNameForTile(tileId, biome || 'frontier trail');
}

export function terrainIcon(biome = 'unknown') {
  const icons = {
    grassland: '🌾',
    prairie: '🌾',
    river: '🌊',
    forest: '🌲',
    mountain: '⛰️',
    badlands: '🏜️',
    plains: '🌾',
    unknown: '•'
  };
  return icons[biome] ?? icons.unknown;
}

export function normalizeTile(rawTile) {
  const tile = rawTile?.tile ?? rawTile ?? {};
  return {
    ...tile,
    tileId: tile.tileId ?? tile.id ?? 'unknown',
    biome: tile.biome ?? 'unknown',
    elevation: tile.elevation ?? 0,
    weather: rawTile?.weather ?? tile.weather ?? { rain: 0, tempC: 0, windKph: 0 },
    resources: rawTile?.resources ?? tile.resources ?? [],
    river: rawTile?.river ?? tile.river ?? null
  };
}

export function getVisibleTiles(state) {
  return [getTrailSnapshot(state)];
}

export function getJourneyPhase(state) {
  if (state.gameOver || (state.milesTraveled ?? 0) >= TOTAL_TRAIL_MILES) {
    return 'finish';
  }
  if (state.day <= 1 && (state.milesTraveled ?? 0) <= 0) {
    return 'start';
  }
  return 'mid';
}

export function getTrailSnapshot(state) {
  const miles = Math.max(0, Math.min(TOTAL_TRAIL_MILES, Math.round(state?.milesTraveled ?? 0)));
  const current = getCurrentMilestone(state);
  const next = getNextMilestone(state) ?? current;
  const span = Math.max(1, next.mile - current.mile);
  const ratio = next === current ? 1 : Math.max(0, Math.min(1, (miles - current.mile) / span));
  const blend = (currentValue, nextValue) => currentValue + ((nextValue - currentValue) * ratio);
  const oscillation = ((state?.day ?? 1) + Math.floor(miles / 37)) % 5;
  const biome = ratio >= 0.62 && next?.biome ? next.biome : current.biome;
  return {
    tileId: current.id,
    biome,
    elevation: Math.round(blend(current.elevation ?? 0, next.elevation ?? current.elevation ?? 0)),
    weather: {
      rain: Number((blend(current.weather?.rain ?? 0, next.weather?.rain ?? current.weather?.rain ?? 0) + (oscillation - 2) * 2.1).toFixed(2)),
      tempC: Number((blend(current.weather?.tempC ?? 0, next.weather?.tempC ?? current.weather?.tempC ?? 0) + (oscillation - 2) * 0.6).toFixed(2)),
      windKph: Number((blend(current.weather?.windKph ?? 0, next.weather?.windKph ?? current.weather?.windKph ?? 0) + (oscillation - 2) * 1.7).toFixed(2))
    },
    resources: current.resources ?? [],
    river: current.river ?? null
  };
}

export function createFallbackTileMap() {
  return trailMilestones.map((milestone) => ({
    tileId: milestone.id,
    biome: milestone.biome,
    elevation: milestone.elevation,
    weather: milestone.weather,
    resources: milestone.resources ?? [],
    river: milestone.river ?? null
  }));
}
