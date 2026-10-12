export const CLOUD_NARRATION_STORAGE_KEY = 'immutable-trail-cloud-narration';
export const LLM_NARRATION_STORAGE_KEY = 'immutable-trail-llm-narration';
export const AUTO_READ_STORAGE_KEY = 'immutable-trail-auto-read';
export const START_TILE_ID = 'independence';
export const FINISH_TILE_ID = 'willamette-valley';
export const MAX_STRANGENESS_LEVEL = 10;
export const WAGON_CAPACITY = 320;
export const TOTAL_TRAIL_MILES = 2000;
export const ACTION_TYPES = ['press-on', 'camp', 'hunt', 'gather', 'treat', 'trade', 'repair', 'scout', 'warp-west'];

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
    food: 34,
    water: 26,
    wood: 12,
    medicine: 3,
    ammunition: 6,
    pace: 'steady',
    rations: 'filling',
    party,
    wagonParts: {
      axle: 100,
      wheels: 100,
      brokenPart: null
    },
    status: 'On the trail'
  };
}

function createInitialParty() {
  return [
    { id: 'leader', name: 'Jedediah', role: 'Guide', health: 100, status: 'Healthy', deceasedLogged: false },
    { id: 'member_1', name: 'Abigail', role: 'Doctor', health: 100, status: 'Healthy', deceasedLogged: false },
    { id: 'member_2', name: 'Billy', role: 'Youth', health: 100, status: 'Healthy', deceasedLogged: false },
    { id: 'member_3', name: 'Sarah', role: 'Carpenter', health: 100, status: 'Healthy', deceasedLogged: false }
  ];
}

export function createAppState() {
  const currentTrailSnapshot = getTrailSnapshot({ milesTraveled: 0, currentMilestoneIndex: 0, day: 1 });
  return {
    tileMap: trailMilestones,
    milesTraveled: 0,
    currentMilestoneIndex: 0,
    currentTrailSnapshot,
    events: [],
    statusMessage: 'The trail is quiet. Pick a move and see what the world does next.',
    day: 1,
    gameOver: false,
    journeyCompleted: false,
    narrationAutoPlay: loadBooleanPreference(AUTO_READ_STORAGE_KEY, true),
    llmNarrationPreferred: loadBooleanPreference(LLM_NARRATION_STORAGE_KEY, true),
    narrationText: '',
    latestNarration: null,
    narrationRequestId: 0,
    narrationSpeechId: 0,
    narrationStateKey: '',
    narrationInFlightKey: '',
    narrationRefreshTimer: null,
    pendingNarrationAutoPlay: true,
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
    storyKeyPoints: [],
    strangenessLevel: 0,
    lastRemoteNarrationTriggerKey: '',
    lastObstacleDay: 0,
    activeObstacle: null,
    activeDecision: null,
    wagon: createInitialWagonState()
  };
}

export const appState = createAppState();

export function resetExpedition(state = appState) {
  state.tileMap = trailMilestones;
  state.milesTraveled = 0;
  state.currentMilestoneIndex = 0;
  state.currentTrailSnapshot = getTrailSnapshot({ milesTraveled: 0, currentMilestoneIndex: 0, day: 1 });
  state.events = [];
  state.statusMessage = 'The trail is quiet. Pick a move and see what the world does next.';
  state.day = 1;
  state.gameOver = false;
  state.journeyCompleted = false;
  state.journeyStarted = false;
  state.narrationText = '';
  state.latestNarration = null;
  state.narrationRequestId = 0;
  state.narrationSpeechId = 0;
  state.narrationStateKey = '';
  state.narrationInFlightKey = '';
  state.narrationRefreshTimer = null;
  state.pendingNarrationAutoPlay = true;
  state.selectedVoiceName = '';
  state.availableVoices = [];
  state.elevenLabsAvailable = false;
  state.journeyLoading = false;
  state.actionInProgress = false;
  state.travelAnimationActive = false;
  state.wagonAnimationFrame = 0;
  state.lastActionSummary = null;
  state.lastActionContext = null;
  state.actionHistory = [];
  state.narrationHistory = [];
  state.storyKeyPoints = [];
  state.strangenessLevel = 0;
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
    choices
  };
}

export function applyNarrationBeat(state, narration) {
  state.latestNarration = narration;
  state.activeObstacle = normalizeObstacleCandidate(narration?.obstacle);
  state.narrationText = narration?.body ?? '';
  if (narration?.body) {
    rememberNarrationBody(state, narration.body);
  }
  if (Array.isArray(narration?.keyPoints)) {
    rememberNarrationKeyPoints(state, narration.keyPoints);
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
    'warp-west': 'Warp west'
  };
  return actionMap[actionType] ?? actionType;
}

export function toSupplySnapshot(wagon) {
  return {
    foodRations: Math.max(0, Math.round(wagon.food * 2)),
    waterGallons: Math.max(0, Math.round(wagon.water * 3)),
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
  return (wagon.food * 2) + (wagon.water * 3) + (wagon.wood * 4) + (wagon.medicine * 0.5) + (wagon.ammunition * 3);
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
    meager: 'Meager',
    'bare-bones': 'Bare Bones'
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
