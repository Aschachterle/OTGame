import {
  GRID_SIZE,
  GENDERS,
  ERAS,
  CATEGORIES,
  PRESET_COLOR_DYES,
  SKIN_TONES,
  BASE_BODY_TEMPLATES,
  INITIAL_CLOTHING_BOILERPLATE
} from './character-presets.js';
import {
  drawRiverChannelRow,
  getRiverVisualProfile,
  riverBounds,
  riverBoundsAtY
} from './scene-sprites.js?v=pixi_final_1';

export {
  WEATHER_OVERLAYS,
  drawFerryOperator,
  drawFerryPlatform,
  drawOxenAndWagonCart,
  drawRiverChannelRow,
  drawRiverCrossingSplashes,
  drawRiverGuideMarker,
  drawRiverWaterline,
  drawWeatherOverlay,
  getWeatherOverlayMeta,
  normalizeWeatherOverlayId,
  riverBounds,
  riverBoundsAtY
} from './scene-sprites.js?v=pixi_final_1';

export {
  GRID_SIZE,
  GENDERS,
  CATEGORIES,
  PRESET_COLOR_DYES,
  SKIN_TONES,
  BASE_BODY_TEMPLATES,
  INITIAL_CLOTHING_BOILERPLATE
};

// Single party era selector excludes 'all' so the user picks one concrete era for all party members
export const SELECTABLE_ERAS = ERAS.filter((era) => era.id !== 'all');
export const DEFAULT_PARTY_ERA_ID = 'oregon_trail';

export const ARCHETYPE_OPTIONS = [
  { role: 'Guide', label: 'GUIDE / SCOUT', shortLabel: 'Guide', description: '+10% hunt accuracy, +3 meat, +2 forage, trail scouting' },
  { role: 'Doctor', label: 'DOCTOR / HEALER', shortLabel: 'Doctor', description: '+4 camp HP, every 2nd medicine dose free, +5 HP triage' },
  { role: 'Carpenter', label: 'CARPENTER / CRAFT', shortLabel: 'Carpenter', description: '-5% breakdown risk, 1-wood repairs, faster oxen recovery' },
  { role: 'Farmer', label: 'FARMER / COOK', shortLabel: 'Farmer', description: '-20% daily food use, slower oxen fatigue on the trail' },
  { role: 'Banker', label: 'BANKER / MERCHANT', shortLabel: 'Banker', description: '+$250 starting cash, immune to fort store price markups' },
  { role: 'Youth', label: 'YOUTH / DEPENDENT', shortLabel: 'Youth', description: 'Absorbs 65% of snakebites, +10 morale floor, DM compassion anchor' }
];

const LAYER_DRAW_ORDER = ['shoes', 'pants', 'shirts', 'accessories', 'hats'];

export const BACKDROPS = {
  prairie: {
    id: 'prairie',
    label: 'Tallgrass Prairie Trail',
    skyTop: '#0098dc',
    skyMid: '#31a2f2',
    skyHorizon: '#b2dce8',
    sunColor: '#f7e26b',
    distantColor: '#2f484e',
    midHillColor: '#44891a',
    nearGrassColor: '#a3ce27',
    pathTop: '#e4a672',
    pathMain: '#b86f50',
    pathRut: '#8f563b',
    fgColor: '#2f484e',
    dustColor: '#e4a672'
  },
  mountains: {
    id: 'mountains',
    label: 'Rocky Mountains Pass',
    skyTop: '#1e579c',
    skyMid: '#0098dc',
    skyHorizon: '#b2dce8',
    sunColor: '#f7e26b',
    distantColor: '#3a4466',
    midHillColor: '#5a6988',
    nearGrassColor: '#2f484e',
    pathTop: '#c2c3c7',
    pathMain: '#8b93af',
    pathRut: '#5a6988',
    fgColor: '#262b44',
    dustColor: '#c2c3c7'
  },
  snow: {
    id: 'snow',
    label: 'Snowy Mountain Pass',
    skyTop: '#262b44',
    skyMid: '#3a4466',
    skyHorizon: '#8b93af',
    sunColor: '#ffffff',
    distantColor: '#5a6988',
    midHillColor: '#c2c3c7',
    nearGrassColor: '#ffffff',
    pathTop: '#ffffff',
    pathMain: '#b2dce8',
    pathRut: '#8b93af',
    fgColor: '#3a4466',
    dustColor: '#ffffff'
  },
  desert: {
    id: 'desert',
    label: 'Sunbaked Badlands & Red Rocks',
    skyTop: '#ac2847',
    skyMid: '#de5d3a',
    skyHorizon: '#f7e26b',
    sunColor: '#ffffff',
    distantColor: '#743f39',
    midHillColor: '#b86f50',
    nearGrassColor: '#e98537',
    pathTop: '#f6d6bd',
    pathMain: '#e4a672',
    pathRut: '#b86f50',
    fgColor: '#663931',
    dustColor: '#f6d6bd'
  },
  river: {
    id: 'river',
    label: 'River Crossing Ford',
    skyTop: '#0098dc',
    skyMid: '#31a2f2',
    skyHorizon: '#b2dce8',
    sunColor: '#f7e26b',
    distantColor: '#2f484e',
    midHillColor: '#44891a',
    nearGrassColor: '#e4a672',
    pathTop: '#31a2f2',
    pathMain: '#0098dc',
    pathRut: '#1e579c',
    fgColor: '#b86f50',
    dustColor: '#ffffff'
  }
};

export const PACE_PRESETS = {
  camp: { id: 'camp', label: 'Camp (Stopped)', fps: 4, speed: 0, animMode: 'idle' },
  slow: { id: 'slow', label: 'Slow Pace', fps: 4, speed: 0.55, animMode: 'walk' },
  steady: { id: 'steady', label: 'Steady Pace', fps: 6, speed: 1.0, animMode: 'walk' },
  strenuous: { id: 'strenuous', label: 'Strenuous Pace', fps: 9, speed: 1.6, animMode: 'walk' },
  grueling: { id: 'grueling', label: 'Grueling Pace', fps: 13, speed: 2.35, animMode: 'walk' }
};

function hashInt(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function shadeHex(hex, delta) {
  if (!hex) return null;
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + delta));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + delta));
  const b = Math.min(255, Math.max(0, (num & 0xff) + delta));
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

function mixHex(first, second, amount) {
  if (!first || !second) return first || second || null;
  const a = parseInt(first.replace('#', ''), 16);
  const b = parseInt(second.replace('#', ''), 16);
  const channels = [16, 8, 0].map((shift) => {
    const av = (a >> shift) & 0xff;
    const bv = (b >> shift) & 0xff;
    return Math.round(av * (1 - amount) + bv * amount);
  });
  return '#' + channels.map((value) => value.toString(16).padStart(2, '0')).join('');
}

function coolShadowHex(hex, amount = 0.52) {
  return mixHex(hex, '#282436', amount);
}

function localOutlineHex(hex, amount = 0.72) {
  return mixHex(hex, '#140c1c', amount);
}

function isOutlineColor(color, fallbackOutline = '#140c1c') {
  return color && (color.toLowerCase() === '#140c1c' || color.toLowerCase() === fallbackOutline.toLowerCase());
}

function getSelectiveOutlineColor(grid, x, y, fallbackOutline = '#140c1c') {
  let r = 0;
  let g = 0;
  let b = 0;
  let samples = 0;
  for (const [dx, dy] of [[0, -1], [-1, 0], [1, 0], [0, 1]]) {
    const color = grid[y + dy]?.[x + dx];
    if (!color || isOutlineColor(color, fallbackOutline)) continue;
    const value = parseInt(color.replace('#', ''), 16);
    r += (value >> 16) & 0xff;
    g += (value >> 8) & 0xff;
    b += value & 0xff;
    samples++;
  }
  if (!samples) return fallbackOutline;
  const localColor = '#' + [r, g, b].map((value) => Math.round(value / samples).toString(16).padStart(2, '0')).join('');
  return localOutlineHex(localColor, 0.76);
}

function shiftGrid(sourceGrid, dx, dy = 0) {
  if (!dx && !dy) return sourceGrid;
  const shifted = createEmptyGrid();
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const color = sourceGrid[y][x];
      if (!color) continue;
      const targetX = x + dx;
      const targetY = y + dy;
      if (targetX >= 0 && targetX < GRID_SIZE && targetY >= 0 && targetY < GRID_SIZE) {
        shifted[targetY][targetX] = color;
      }
    }
  }
  return shifted;
}

export function getEraById(eraId) {
  return SELECTABLE_ERAS.find((era) => era.id === eraId) || SELECTABLE_ERAS.find((era) => era.id === DEFAULT_PARTY_ERA_ID) || SELECTABLE_ERAS[0];
}

export function getBodyTemplateById(bodyTemplateId) {
  return BASE_BODY_TEMPLATES.find((t) => t.id === bodyTemplateId) || BASE_BODY_TEMPLATES[0];
}

export function getSkinToneById(skinToneId) {
  return SKIN_TONES.find((s) => s.id === skinToneId) || SKIN_TONES[0];
}

export function getDyeById(dyeId) {
  return PRESET_COLOR_DYES.find((d) => d.id === dyeId) || PRESET_COLOR_DYES[0];
}

export function getPresetsForCategoryAndEra(categoryId, eraId, gender = null, headwearSubFilter = 'all') {
  const targetEra = getEraById(eraId).id;
  const allItems = INITIAL_CLOTHING_BOILERPLATE[categoryId] || [];
  return allItems.filter((item) => {
    if (item.isNone) return true;
    if (item.era !== targetEra) return false;
    if (categoryId === 'hats' && headwearSubFilter !== 'all' && item.subType !== headwearSubFilter) {
      return false;
    }
    if (gender && item.gender && item.gender !== 'unisex' && item.gender !== gender) {
      return false;
    }
    return true;
  });
}

function pickBestPresetForSlot(categoryId, eraId, gender, requiredSubType = null, variantIndex = 0) {
  const targetEra = getEraById(eraId).id;
  const eraItems = (INITIAL_CLOTHING_BOILERPLATE[categoryId] || []).filter(
    (p) => p.era === targetEra && !p.isNone && (!requiredSubType || p.subType === requiredSubType)
  );
  if (!eraItems.length) {
    const nonePreset = (INITIAL_CLOTHING_BOILERPLATE[categoryId] || []).find((p) => p.isNone);
    return nonePreset ? nonePreset.id : '';
  }
  const exactGender = eraItems.filter((p) => p.gender === gender);
  const genderOrUnisex = eraItems.filter((p) => p.gender === gender || !p.gender || p.gender === 'unisex');
  const pool = exactGender.length ? exactGender : genderOrUnisex.length ? genderOrUnisex : eraItems;
  return pool[Math.abs(variantIndex) % pool.length].id;
}

export function createMemberAppearance({
  gender = 'male',
  eraId = DEFAULT_PARTY_ERA_ID,
  bodyTemplateId = 'standard_adventurer',
  skinToneId = 'warm_ivory',
  headwearType = 'hat',
  variantIndex = 0
} = {}) {
  const appearance = {
    gender: gender === 'female' ? 'female' : 'male',
    bodyTemplateId,
    skinToneId,
    preferredHeadwearType: headwearType,
    equippedPresets: {
      hats: '',
      shirts: '',
      pants: '',
      shoes: '',
      accessories: ''
    },
    categoryDyes: {
      hats: 'default',
      shirts: 'default',
      pants: 'default',
      shoes: 'default',
      accessories: 'default'
    }
  };

  equipMemberEraOutfit(appearance, eraId, headwearType, variantIndex);
  return appearance;
}

export function equipMemberEraOutfit(appearance, eraId, headwearType = appearance.preferredHeadwearType || 'hat', variantIndex = 0) {
  if (!appearance) return;
  const targetEra = getEraById(eraId).id;
  appearance.preferredHeadwearType = headwearType;
  if (targetEra === 'oregon_trail' && appearance.gender === 'male' && variantIndex % 2 === 0 && headwearType === 'hat') {
    appearance.equippedPresets.hats = 'hat_oregon_frontier_slouch';
    appearance.equippedPresets.shirts = 'shirt_oregon_buckskin_jacket';
    appearance.equippedPresets.pants = 'pants_oregon_duck_trousers';
    appearance.equippedPresets.shoes = 'shoes_oregon_cowhide_boots';
    appearance.equippedPresets.accessories = 'acc_oregon_trail_bandana';
    CATEGORIES.forEach(({ id }) => {
      appearance.categoryDyes[id] = 'default';
    });
    return;
  }
  const pickedHead =
    pickBestPresetForSlot('hats', targetEra, appearance.gender, headwearType, variantIndex) ||
    pickBestPresetForSlot('hats', targetEra, appearance.gender, null, variantIndex);
  appearance.equippedPresets.hats = pickedHead;
  ['shirts', 'pants', 'shoes', 'accessories'].forEach((cat, idx) => {
    appearance.equippedPresets[cat] = pickBestPresetForSlot(cat, targetEra, appearance.gender, null, variantIndex + idx);
  });
  CATEGORIES.forEach(({ id }) => {
    appearance.categoryDyes[id] = 'default';
  });
}

export function randomizeMemberInEra(appearance, eraId) {
  if (!appearance) return;
  const targetEra = getEraById(eraId).id;
  const randomBody = BASE_BODY_TEMPLATES[Math.floor(Math.random() * BASE_BODY_TEMPLATES.length)];
  const randomSkin = SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)];
  appearance.bodyTemplateId = randomBody.id;
  appearance.skinToneId = randomSkin.id;
  const headwearType = Math.random() < 0.5 ? 'hat' : 'hair';
  appearance.preferredHeadwearType = headwearType;
  CATEGORIES.forEach(({ id }) => {
    const subFilter = id === 'hats' ? headwearType : 'all';
    const candidates = getPresetsForCategoryAndEra(id, targetEra, appearance.gender, subFilter).filter((p) => !p.isNone);
    if (candidates.length) {
      appearance.equippedPresets[id] = candidates[Math.floor(Math.random() * candidates.length)].id;
    }
    const randomDye = Math.random() < 0.45
      ? 'default'
      : PRESET_COLOR_DYES[Math.floor(Math.random() * PRESET_COLOR_DYES.length)].id;
    appearance.categoryDyes[id] = randomDye;
  });
}

export function syncAllPartyAppearancesToEra(party = [], eraId = DEFAULT_PARTY_ERA_ID) {
  const targetEra = getEraById(eraId).id;
  party.forEach((member, index) => {
    if (!member.appearance) {
      const defaultGender = member.role === 'Doctor' || member.role === 'Carpenter' ? 'female' : 'male';
      member.appearance = createMemberAppearance({
        gender: defaultGender,
        eraId: targetEra,
        bodyTemplateId: index === 0 ? 'broad_guardian' : index === 2 ? 'nimble_scout' : 'standard_adventurer',
        skinToneId: SKIN_TONES[index % SKIN_TONES.length].id,
        headwearType: index % 2 === 0 ? 'hat' : 'hair',
        variantIndex: index
      });
      return;
    }
    // Check if any equipped item is not from targetEra; if so, re-equip for targetEra
    const needsSync = CATEGORIES.some(({ id }) => {
      const presetId = member.appearance.equippedPresets?.[id];
      const preset = (INITIAL_CLOTHING_BOILERPLATE[id] || []).find((p) => p.id === presetId);
      return !preset || (!preset.isNone && preset.era !== targetEra);
    });
    if (needsSync) {
      equipMemberEraOutfit(member.appearance, targetEra, member.appearance.preferredHeadwearType || (index % 2 === 0 ? 'hat' : 'hair'), index);
    }
  });
}

export function summarizeMemberOutfit(memberOrAppearance) {
  const appearance = memberOrAppearance?.appearance ? memberOrAppearance.appearance : memberOrAppearance;
  if (!appearance || !appearance.equippedPresets) return 'period travel clothes';
  const parts = [];
  CATEGORIES.forEach(({ id }) => {
    const presetEntry = appearance.equippedPresets[id];
    const presetId = typeof presetEntry === 'object' && presetEntry !== null ? presetEntry.id : presetEntry;
    const preset = (INITIAL_CLOTHING_BOILERPLATE[id] || []).find((p) => p.id === presetId);
    if (preset && !preset.isNone && preset.name) {
      parts.push(preset.name);
    }
  });
  return parts.length ? parts.join(', ') : 'period travel clothes';
}

function createEmptyGrid() {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
}

function isInsideBodyForView(appearance, x, y, baseOrientation = 'front', category = null) {
  return x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE;
}

function getBaseBodyPixel(appearance, x, y, baseOrientation = 'front') {
  const template = getBodyTemplateById(appearance?.bodyTemplateId);
  const skin = getSkinToneById(appearance?.skinToneId);
  const gender = appearance?.gender || 'male';
  const map = baseOrientation === 'side' ? template.side : template.front;
  const ch = map[y]?.[x];
  if (!ch || ch === '.' || ch === 'H') return null;

  switch (ch) {
    case 'O':
      return skin.outline;
    case 'S':
      return skin.shadow;
    case 'B':
      return skin.base;
    case 'L':
      return skin.highlight;
    case 'E':
      return skin.eye;
    case 'I':
      return skin.iris || '#0098dc';
    case 'F':
      return gender === 'female' ? skin.eye : skin.shadow;
    case 'P':
      return skin.pupil;
    case 'M':
      return gender === 'female' ? skin.femaleMouth || skin.mouth : skin.mouth;
    case 'U':
      return '#2d2936';
    case 'D':
      return '#221e29';
    case 'W':
      return gender === 'female' ? '#2d2936' : skin.base;
    case 'V':
      return gender === 'female' ? '#221e29' : skin.shadow;
    case 'C':
      return gender === 'female' ? skin.shadow : skin.base;
    default:
      return null;
  }
}

function resolvePresetPixelColor(rawColor, role, dyeId) {
  if (!rawColor) return null;
  if (!dyeId || dyeId === 'default') return rawColor;
  const dye = getDyeById(dyeId);
  if (!dye || !dye.primary) return rawColor;
  if (role === 'primary' && dye.primary) return dye.primary;
  if (role === 'secondary' && dye.secondary) return dye.secondary;
  if (role === 'highlight' && dye.highlight) return dye.highlight;
  return rawColor;
}

function applyDirectional16BitShading(hexColor, x, y, baseOrientation, category, subType, role) {
  if (!hexColor || role === null) return hexColor;

  // High-contrast 16-color JRPG cluster discipline: keep discrete palette clusters crisp
  // and only apply subtle vertical depth to long cascading hair and lower boots/trousers.
  if (category === 'hats' && subType === 'hair') {
    if (y <= 3) return shadeHex(hexColor, 8);
    if (y >= 13) return shadeHex(hexColor, -10);
    return hexColor;
  }

  if (category === 'pants' && y >= 25) {
    return shadeHex(hexColor, -6);
  }

  return hexColor;
}

export function buildNeutralCompositeGrid(appearance, baseOrientation = 'front') {
  const grid = createEmptyGrid();
  const template = getBodyTemplateById(appearance?.bodyTemplateId);
  const map = baseOrientation === 'side' ? template.side : template.front;

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const bodyColor = getBaseBodyPixel(appearance, x, y, baseOrientation);
      if (bodyColor) {
        const ch = map[y]?.[x];
        const isSkinTone = ch === 'S' || ch === 'B' || ch === 'L';
        grid[y][x] = isSkinTone
          ? applyDirectional16BitShading(bodyColor, x, y, baseOrientation, 'body', null, 'skin')
          : bodyColor;
      }
    }
  }

  const pantsPresetId = String(appearance?.equippedPresets?.pants || '');
  const isSkirtEquipped =
    pantsPresetId.includes('skirt') ||
    pantsPresetId.includes('kirtle') ||
    pantsPresetId.includes('kilt');
  const effectiveDrawOrder = isSkirtEquipped
    ? ['shoes', 'pants', 'shirts', 'accessories', 'hats']
    : ['pants', 'shoes', 'shirts', 'accessories', 'hats'];

  for (const cat of effectiveDrawOrder) {
    const presetId = appearance?.equippedPresets?.[cat];
    const preset = (INITIAL_CLOTHING_BOILERPLATE[cat] || []).find((p) => p.id === presetId);
    if (!preset || preset.isNone) continue;

    const dyeId = appearance?.categoryDyes?.[cat] || 'default';
    const pixelList =
      baseOrientation === 'side'
        ? preset.side && preset.side.length > 0
          ? preset.side
          : preset.front || preset.pixels || []
        : preset.front || preset.pixels || [];

    pixelList.forEach(([x, y, rawColor, role]) => {
      if (isInsideBodyForView(appearance, x, y, baseOrientation, cat)) {
        let finalColor = resolvePresetPixelColor(rawColor, role, dyeId);
        if (finalColor && role !== null) {
          finalColor = applyDirectional16BitShading(
            finalColor,
            x,
            y,
            baseOrientation,
            cat,
            preset.subType || null,
            role
          );
        }
        if (finalColor) {
          const isLowerHair =
            cat === 'hats' &&
            preset.subType === 'hair' &&
            y >= 12 &&
            !(presetId.includes('beard') && baseOrientation === 'front' && x >= 11 && x <= 20);
          if (!isLowerHair || !grid[y][x]) {
            grid[y][x] = finalColor;
          }
        }
      }
    });
  }

  return grid;
}

const SIDE_LEG_POSE_MAPS = {
  // FRAME 1 (f=0, Neutral Height torsoBounceY=0): Near (warm) leg forward with heel-strike; Far (cool dark) leg back pushing off on toe
  frame0: [
    '............OOOOOOO.............',
    '............OhhhHHHO............',
    '............OhhOHHHO............',
    '...........OppO.OLPO............',
    '..........OppO...OLPO...........',
    '.........ObbO....OBPO...........',
    '........OukbO.....OKPO..........',
    '.......OduwO......OKPO..........',
    '.......OduwO......OKUOOO........',
    '........OuwO.......OUWWWO.......',
    '........OuwO.......ODUOOO.......',
    '........OOOO........OOO.........'
  ],
  // FRAME 2 (f=1, Down - Dip 1px torsoBounceY=+1): Near (warm) foot planted flat bearing weight; Far (cool dark) leg bends, lifting knee and foot to pass forward
  frame1: [
    '............OOOOOOO.............',
    '............OOOOOOO.............',
    '............OhhhHHHO............',
    '............OhhOHHHO............',
    '...........OppOOLPO.............',
    '...........OppO.OLPO............',
    '..........ObbO..OBPO............',
    '........OoukbO..OKPO............',
    '........OduwO...OKPO............',
    '........OduO....OKUOOO..........',
    '........OOO.....ODUWWWO.........',
    '................OOOOOOO.........'
  ],
  // FRAME 3 (f=2, Up - Rise 1px torsoBounceY=-1): Near (warm) heel lifts pushing off back; Far (cool dark) leg extends forward in air to strike
  frame2: [
    '............OHHHHHO.............',
    '............OHHHhhhO............',
    '............OHHOohhhO...........',
    '...........OLPO.oppO............',
    '..........OLPO...oppO...........',
    '.........OBPO.....obbO..........',
    '........OOKPO.....okbO..........',
    '.......ODUWO.......okbO.........',
    '.......ODUWO.......okuOOO.......',
    '........OUWO........ouwwwO......',
    '........OUWO........oduOOO......',
    '........OOOO....................'
  ],
  // FRAME 4 (f=3, Neutral Height torsoBounceY=0): Far (cool dark) leg forward with heel-strike; Near (warm) leg back pushing off on toe
  frame3: [
    '............OOOOOOO.............',
    '............OHHHhhhO............',
    '............OHHOohhhO...........',
    '...........OLPO.oppO............',
    '..........OLPO...oppO...........',
    '.........OBPO....obbO...........',
    '........OOKPO.....okbO..........',
    '.......ODUWO......okbO..........',
    '.......ODUWO......okuOOO........',
    '........OUWO.......ouwwwO.......',
    '........OUWO.......oduOOO.......',
    '........OOOO........OOO.........'
  ],
  // FRAME 5 (f=4, Down - Dip 1px torsoBounceY=+1): Far (cool dark) foot planted flat bearing weight; Near (warm) leg bends in foreground, lifting knee & foot to pass forward
  frame4: [
    '............OOOOOOO.............',
    '............OOOOOOO.............',
    '............OHHHhhhO............',
    '............OHHOhhO.............',
    '............OLPOppO.............',
    '............OLPOoppO............',
    '...........OBPO.obbO............',
    '........OOKBPO..okbO............',
    '........ODUWO...okbO............',
    '........ODUO....okuOOO..........',
    '........OOO.....oduwwwO.........',
    '................OOOOOOO.........'
  ],
  // FRAME 6 (f=5, Up - Rise 1px torsoBounceY=-1): Far (cool dark) heel lifts pushing off back; Near (warm) leg reaches forward in air to prepare for Frame 1 heel-strike
  frame5: [
    '............OHHHHHO.............',
    '............OhhhHHHO............',
    '............OhhOHHHO............',
    '...........OppO.OLPO............',
    '..........OppO...OLPO...........',
    '.........ObbO.....OBPO..........',
    '........OukbO.....OKPO..........',
    '.......OduwO.......OKPO.........',
    '.......OduwO.......OKUOOO.......',
    '........OuwO........OUWWWO......',
    '........OuwO........ODUOOO......',
    '........OOOO....................'
  ]
};

const SIDE_ARM_POSE_MAPS = {
  // FRAME 1 (f=0): Near arm pulled slightly back, Far (darker) arm swinging forward
  frame0: {
    near: [
      '...........OSAO.................',
      '..........OSAO..................',
      '..........OSAO..................',
      '.........OSAO...................',
      '.........OSAO...................',
      '.........OBLO...................',
      '.........OBBO...................',
      '.........OOOO...................'
    ],
    far: [
      '................................',
      '.................OaO............',
      '.................OaaO...........',
      '..................OaaO..........',
      '..................ObbO..........',
      '..................ObbO..........',
      '..................OOOO..........',
      '................................'
    ]
  },
  // FRAME 2 (f=1): Near arm begins swinging forward toward hip, Far arm retracting
  frame1: {
    near: [
      '...........OSAO.................',
      '..........OSAO..................',
      '..........OSAO..................',
      '..........OSAO..................',
      '...........OSAO.................',
      '...........OBLO.................',
      '...........OBBO.................',
      '...........OOOO.................'
    ],
    far: [
      '................................',
      '................................',
      '.................OaO............',
      '.................ObbO...........',
      '.................ObbO...........',
      '.................OOOO...........',
      '................................',
      '................................'
    ]
  },
  // FRAME 3 (f=2): Near arm swinging forward across hip, Far arm swinging back behind torso
  frame2: {
    near: [
      '...........OSAO.................',
      '...........OSAO.................',
      '...........OSAO.................',
      '............OSAO................',
      '............OSAO................',
      '............OBLO................',
      '............OBBO................',
      '............OOOO................'
    ],
    far: [
      '................................',
      '................................',
      '................................',
      '.........OaO....................',
      '.........ObbO...................',
      '.........OOOO...................',
      '................................',
      '................................'
    ]
  },
  // FRAME 4 (f=3): Near arm swung forward across torso, Far (darker) arm pulled back
  frame3: {
    near: [
      '...........OSAO.................',
      '...........OSAO.................',
      '............OSAO................',
      '............OSAO................',
      '.............OSAO...............',
      '.............OBLO...............',
      '.............OBBO...............',
      '.............OOOO...............'
    ],
    far: [
      '................................',
      '................................',
      '.........OaaO...................',
      '........OaaaO...................',
      '........ObbO....................',
      '........OOOO....................',
      '................................',
      '................................'
    ]
  },
  // FRAME 5 (f=4): Near arm returning from forward swing, Far arm counter-swinging behind torso
  frame4: {
    near: [
      '...........OSAO.................',
      '...........OSAO.................',
      '...........OSAO.................',
      '............OSAO................',
      '............OSAO................',
      '............OBLO................',
      '............OBBO................',
      '............OOOO................'
    ],
    far: []
  },
  // FRAME 6 (f=5): Near arm pulled back at elbow, Far (darker) arm reaching forward preparing for Frame 1
  frame5: {
    near: [
      '...........OSAO.................',
      '..........OSAO..................',
      '..........OSAO..................',
      '..........OSAO..................',
      '..........OSAO..................',
      '..........OBLO..................',
      '..........OBBO..................',
      '..........OOOO..................'
    ],
    far: [
      '................................',
      '................................',
      '.................OaO............',
      '.................OaaO...........',
      '..................ObbO..........',
      '..................ObbO..........',
      '..................OOOO..........',
      '................................'
    ]
  },
  // Static / Idle standing arm pose
  standing: {
    near: [
      '...........OSAO.................',
      '...........OSAO.................',
      '...........OSAO.................',
      '...........OSAO.................',
      '...........OSAO.................',
      '...........OBLO.................',
      '...........OBBO.................',
      '...........OOOO.................'
    ],
    far: []
  }
};

export function getCharacterFrameGrid(appearance, view = 'front', animMode = 'walk', frameIndex = 0) {
  const isSide = view === 'side_right' || view === 'side_left';
  const baseOrientation = isSide ? 'side' : 'front';
  const neutral = buildNeutralCompositeGrid(appearance, baseOrientation);
  const skin = getSkinToneById(appearance?.skinToneId);
  let result = createEmptyGrid();

  const pantsPresetId = String(appearance?.equippedPresets?.pants || '');
  const isSkirtEquipped =
    pantsPresetId.includes('skirt') ||
    pantsPresetId.includes('kirtle') ||
    pantsPresetId.includes('kilt');
  const isShortSkirt =
    isSkirtEquipped &&
    (pantsPresetId.includes('flapper') ||
      pantsPresetId.includes('pleated') ||
      pantsPresetId.includes('poodle') ||
      pantsPresetId.includes('mini') ||
      pantsPresetId.includes('kilt'));

  const sampleSideLegPalette = () => {
    const hipPrimary = neutral[21]?.[15] || '#2d2936';
    const thighHighlight = neutral[23]?.[15] || skin.highlight;
    const thighPrimary = neutral[23]?.[16] || skin.base;
    const calfPrimary = neutral[25]?.[16] || thighPrimary;
    const anklePrimary = neutral[27]?.[16] || calfPrimary;
    const shoeUpper = neutral[28]?.[16] || skin.base;
    const shoeBright = neutral[28]?.[17] || shoeUpper;
    const shoeSole = neutral[29]?.[15] || shadeHex(shoeUpper, -20);
    const nearOutline = localOutlineHex(hipPrimary, 0.76);
    const farOutline = coolShadowHex(nearOutline, 0.35);
    return {
      O: nearOutline,
      o: farOutline,
      H: hipPrimary,
      L: thighHighlight,
      P: thighPrimary,
      B: calfPrimary,
      K: anklePrimary,
      U: shoeUpper,
      W: shoeBright,
      D: shoeSole,
      h: coolShadowHex(hipPrimary, 0.55),
      l: coolShadowHex(thighHighlight, 0.55),
      p: coolShadowHex(thighPrimary, 0.55),
      b: coolShadowHex(calfPrimary, 0.55),
      k: coolShadowHex(anklePrimary, 0.55),
      u: coolShadowHex(shoeUpper, 0.50),
      w: coolShadowHex(shoeBright, 0.50),
      d: coolShadowHex(shoeSole, 0.45)
    };
  };

  const drawSidePoseLegs = (targetGrid, poseKey, torsoBounceY = 0, swayDx = 0) => {
    const palette = sampleSideLegPalette();
    const rows = SIDE_LEG_POSE_MAPS[poseKey] || SIDE_LEG_POSE_MAPS.frame1;

    for (let idx = 0; idx < rows.length; idx++) {
      const y = 19 + idx;
      if (isSkirtEquipped && !isShortSkirt && y < 27) continue;
      const rowStr = rows[idx];
      for (let x = 0; x < GRID_SIZE && x < rowStr.length; x++) {
        const ch = rowStr[x];
        if (ch !== '.' && palette[ch]) {
          targetGrid[y][x] = palette[ch];
        }
      }
    }

    if (isSkirtEquipped) {
      const maxSkirtY = isShortSkirt ? 25 : 27;
      for (let y = 19; y <= maxSkirtY; y++) {
        const srcY = Math.min(maxSkirtY, Math.max(20, y - torsoBounceY));
        for (let x = 0; x < GRID_SIZE; x++) {
          const c = neutral[srcY][x];
          if (!c) continue;
          const dx = y >= 24 ? swayDx : 0;
          const destX = x + dx;
          if (destX >= 0 && destX < GRID_SIZE && y >= 19 && y < GRID_SIZE) {
            targetGrid[y][destX] = c;
          }
        }
      }
    }
  };

  const drawSideUpperBodyAndArms = (targetGrid, armPoseKey = 'standing', torsoBounceY = 0, secondarySwayDx = 0) => {
    const armShadow = neutral[15]?.[12] || skin.shadow;
    const armPrimary = neutral[15]?.[13] || skin.base;
    const chestFill = neutral[16]?.[15] || armPrimary;
    const nearArmOutline = localOutlineHex(armPrimary, 0.76);
    const chestOutline = localOutlineHex(chestFill, 0.76);
    const armPalette = {
      O: nearArmOutline,
      o: coolShadowHex(nearArmOutline, 0.35),
      S: armShadow,
      A: armPrimary,
      B: skin.base,
      L: skin.highlight,
      a: coolShadowHex(armPrimary, 0.55),
      b: coolShadowHex(skin.shadow, 0.50)
    };
    const armPose = SIDE_ARM_POSE_MAPS[armPoseKey] || SIDE_ARM_POSE_MAPS.standing;
    const isScarfPixel = (color, x, y) => {
      if (y < 11 || y > 17 || !color) return false;
      const value = parseInt(color.replace('#', ''), 16);
      const red = (value >> 16) & 0xff;
      const green = (value >> 8) & 0xff;
      const blue = value & 0xff;
      return red > 100 && red > green * 1.25 && red > blue * 1.12 && x >= 11;
    };
    const shadeUpperBodyPixel = (color, x, y) => {
      if (isOutlineColor(color, skin.outline || '#140c1c')) {
        return getSelectiveOutlineColor(neutral, x, y, skin.outline || '#140c1c');
      }

      let delta = 0;
      // Top-front/left light source: highlight crown of hat, top of bedroll/pack, and upper scarf
      if (y <= 4) delta += 10;
      // Occlusion shadow beneath hat brim
      if (y === 7 && x >= 11 && x <= 20) delta -= 12;
      // Bedroll & backpack top highlight and under-pack occlusion shadow
      if (x <= 11 && y >= 9 && y <= 19) {
        if (y <= 11) delta += 9;
        if (y >= 17) delta -= 12;
      }
      // Under-torso occlusion shadow above belt
      if (x >= 12 && y >= 17 && y <= 18) delta -= 8;
      // Scarf top highlight vs lower fold shadow
      if (isScarfPixel(color, x, y)) delta += y <= 13 ? 10 : -8;
      return delta ? shadeHex(color, delta) : color;
    };

    // 1. Draw Far Arm behind/in front of torso edge (y = 14..21 + torsoBounceY)
    if (armPose.far && armPose.far.length) {
      for (let idx = 0; idx < armPose.far.length; idx++) {
        const destY = 14 + idx + torsoBounceY;
        if (destY < 0 || destY >= GRID_SIZE) continue;
        const rowStr = armPose.far[idx];
        for (let x = 0; x < GRID_SIZE && x < rowStr.length; x++) {
          const ch = rowStr[x];
          if (ch !== '.' && armPalette[ch]) {
            targetGrid[destY][x] = armPalette[ch === 'O' ? 'o' : ch];
          }
        }
      }
    }

    // 2. Copy Head (y = 1..12), Backpack (x <= 11, y = 9..19), and Torso Chest (x = 12..31, y = 13..19)
    // First pass fills all base pixels at their unshifted x so secondary scarf/pack sway never leaves holes!
    for (let y = 1; y <= 19; y++) {
      const destY = y + torsoBounceY;
      if (destY < 0 || destY >= GRID_SIZE) continue;
      for (let x = 0; x < GRID_SIZE; x++) {
        if (y >= 14 && x >= 11 && x <= 14) {
          if (x === 11) {
            if (neutral[y]?.[10]) targetGrid[destY][11] = chestOutline;
          } else if (x === 12 && y <= 18) {
            targetGrid[destY][12] = chestOutline;
          } else if ((x === 13 || x === 14) && y <= 18) {
            targetGrid[destY][x] = shadeUpperBodyPixel(chestFill, x, y);
          } else if ((x === 13 || x === 14) && y === 19) {
            targetGrid[destY][x] = chestOutline;
          }
          continue;
        }
        const c = neutral[y][x];
        if (c) {
          targetGrid[destY][x] = shadeUpperBodyPixel(c, x, y);
        }
      }
    }

    // Secondary motion pass: subtle lag on scarf tail (y = 14..15) and lower backpack strap (y = 16..18, x <= 10)
    if (secondarySwayDx !== 0) {
      const lagDy = torsoBounceY > 0 ? -1 : torsoBounceY < 0 ? 1 : 0;
      for (let y = 14; y <= 18; y++) {
        const destY = y + torsoBounceY + lagDy;
        if (destY < 12 || destY >= 20) continue;
        for (let x = 7; x <= 18; x++) {
          const c = neutral[y][x];
          if (!c) continue;
          if (isScarfPixel(c, x, y) && y >= 14 && y <= 15) {
            targetGrid[destY][x] = shadeUpperBodyPixel(c, x, y);
          }
        }
      }
    }

    // 3. Draw Near Arm & 2x2 Hand on top of shoulder/hip (y = 14..21 + torsoBounceY)
    if (armPose.near && armPose.near.length) {
      for (let idx = 0; idx < armPose.near.length; idx++) {
        const destY = 14 + idx + torsoBounceY;
        if (destY < 0 || destY >= GRID_SIZE) continue;
        const rowStr = armPose.near[idx];
        for (let x = 0; x < GRID_SIZE && x < rowStr.length; x++) {
          const ch = rowStr[x];
          if (ch !== '.' && armPalette[ch]) {
            targetGrid[destY][x] = armPalette[ch];
          }
        }
      }
    }
  };

  if (animMode === 'static') {
    if (!isSide) {
      result = neutral;
    } else {
      drawSidePoseLegs(result, 'frame1', 0, 0);
      drawSideUpperBodyAndArms(result, 'standing', 0);
    }
  } else if (animMode === 'idle') {
    const bob = frameIndex % 2 === 1 ? 1 : 0;
    if (!isSide) {
      for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          const srcY = bob === 1 && y <= 20 ? y - 1 : y;
          if (srcY >= 0 && srcY < GRID_SIZE) {
            result[y][x] = neutral[srcY][x];
          }
        }
      }
    } else {
      drawSidePoseLegs(result, 'frame1', bob, 0);
      drawSideUpperBodyAndArms(result, 'standing', bob);
    }
  } else if (animMode === 'walk') {
    const f = ((frameIndex % 6) + 6) % 6;
    if (!isSide) {
      const torsoDy = f === 0 || f === 3 ? 1 : 0;

      for (let y = 20; y <= 30; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          if (y <= 21 && (x <= 11 || x >= 20)) continue;
          const c = neutral[y][x];
          if (!c) continue;
          const isLeftHalf = x < 16;
          let legLift = 0;
          let shade = 0;

          if (f === 0) {
            if (!isLeftHalf) {
              legLift = y >= 24 ? -2 : y >= 22 ? -1 : 0;
              if (y >= 23) shade = -20;
            } else if (y >= 28) {
              shade = 8;
            }
          } else if (f === 1) {
            if (!isLeftHalf && y >= 24) {
              legLift = -1;
              shade = -12;
            }
          } else if (f === 2) {
            if (!isLeftHalf && y >= 23) {
              legLift = -2;
              shade = -8;
            }
          } else if (f === 3) {
            if (isLeftHalf) {
              legLift = y >= 24 ? -2 : y >= 22 ? -1 : 0;
              if (y >= 23) shade = -20;
            } else if (y >= 28) {
              shade = 8;
            }
          } else if (f === 4) {
            if (isLeftHalf && y >= 24) {
              legLift = -1;
              shade = -12;
            }
          } else if (f === 5) {
            if (isLeftHalf && y >= 23) {
              legLift = -2;
              shade = -8;
            }
          }

          const destY = y + legLift;
          if (destY >= 20 && destY < GRID_SIZE) {
            const isOutline = c === '#140c1c' || c === skin.outline;
            result[destY][x] = shade !== 0 && !isOutline ? shadeHex(c, shade) : c;
          }
        }
      }

      for (let y = 1; y <= 21; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          if (y >= 20 && x >= 12 && x <= 19) continue;
          const c = neutral[y][x];
          if (!c) continue;
          let dy = torsoDy;
          let shade = 0;
          const isLeftArm = y >= 14 && x <= 12;
          const isRightArm = y >= 14 && x >= 19;

          if (isLeftArm && x <= 11) {
            if (f === 0 || f === 1) {
              if (y === 15) continue;
              if (y >= 16) {
                dy = 0;
                shade = -16;
              }
            } else if ((f === 3 || f === 4) && y >= 19) {
              shade = 8;
            }
          } else if (isRightArm && x >= 20) {
            if (f === 3 || f === 4) {
              if (y === 15) continue;
              if (y >= 16) {
                dy = 0;
                shade = -16;
              }
            } else if ((f === 0 || f === 1) && y >= 19) {
              shade = 8;
            }
          }

          const destY = y + dy;
          if (destY >= 0 && destY < GRID_SIZE) {
            const isOutline = c === '#140c1c' || c === skin.outline;
            result[destY][x] = shade !== 0 && !isOutline ? shadeHex(c, shade) : c;
          }
        }
      }
    } else {
      // Six-frame alternating stride: contact, load, push-off for each leg in turn.
      const poseKey = 'frame' + f;
      const torsoBounceY = f === 1 || f === 4 ? 1 : f === 2 || f === 5 ? -1 : 0;
      const secondarySwayDx = f === 1 || f === 4 ? -1 : f === 2 || f === 5 ? 1 : 0;
      const swayDx = secondarySwayDx;
      drawSidePoseLegs(result, poseKey, torsoBounceY, swayDx);
      drawSideUpperBodyAndArms(result, poseKey, torsoBounceY, secondarySwayDx);
    }
  }

  if (view === 'side_left') {
    return result.map((row) => [...row].reverse());
  }

  return result;
}

export function renderCharacterGridToCanvas(firstArg, secondArg, options = {}) {
  const isCanvasFirst = firstArg && typeof firstArg.getContext === 'function';
  const canvas = isCanvasFirst ? firstArg : secondArg;
  const grid = isCanvasFirst ? secondArg : firstArg;
  if (!canvas || !Array.isArray(grid)) return;
  const opts = typeof options === 'string' ? { bgColor: options, includeBackdrop: false } : (options || {});
  const {
    backdropId = 'prairie',
    includeBackdrop = false,
    bgColor = '#020904',
    scrollOffset = 0,
    drawGridLines = false
  } = opts;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const cellSize = canvas.width / GRID_SIZE;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (includeBackdrop) {
    const off = document.createElement('canvas');
    off.width = GRID_SIZE;
    off.height = GRID_SIZE;
    const offCtx = off.getContext('2d');
    drawPixelBackdropScene(offCtx, GRID_SIZE, GRID_SIZE, backdropId, scrollOffset * 0.5, 30);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(off, 0, 0, canvas.width, canvas.height);
  } else if (bgColor) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.fillRect(9 * cellSize, 30 * cellSize, 14 * cellSize, 1 * cellSize);

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const color = grid[y][x];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  }

  if (drawGridLines && cellSize >= 4) {
    ctx.strokeStyle = 'rgba(0, 255, 102, 0.12)';
    ctx.lineWidth = 1;
    for (let i = 1; i < GRID_SIZE; i++) {
      const pos = Math.floor(i * cellSize) + 0.5;
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(canvas.width, pos);
      ctx.stroke();
    }
  }
}

export function mapBiomeToBackdropId(biome = 'plains', weather = {}) {
  if ((weather?.tempC ?? 10) < 0) return 'snow';
  if (biome === 'river') return 'river';
  if (biome === 'mountain') return 'mountains';
  if (biome === 'badlands') return 'desert';
  return 'prairie';
}

export function drawPixelBackdropParallaxLayer(ctx, width, backdropId, charFootY, layer, scrollOffset = 0) {
  const backdrop = BACKDROPS[backdropId] || BACKDROPS.prairie;
  const horizonY = Math.max(12, charFootY - 20);

  if (layer === 'sky') {
    const skyBand1 = Math.floor(horizonY * 0.38);
    const skyBand2 = Math.floor(horizonY * 0.72);
    ctx.fillStyle = backdrop.skyTop;
    ctx.fillRect(0, 0, width, skyBand1);
    ctx.fillStyle = backdrop.skyMid;
    ctx.fillRect(0, skyBand1, width, skyBand2 - skyBand1);
    ctx.fillStyle = backdrop.skyHorizon;
    ctx.fillRect(0, skyBand2, width, horizonY - skyBand2);

    const sunX = Math.floor(width * 0.78);
    const sunY = Math.max(4, Math.floor(horizonY * 0.25));
    ctx.fillStyle = backdrop.sunColor;
    ctx.fillRect(sunX - 2, sunY - 3, 5, 7);
    ctx.fillRect(sunX - 3, sunY - 2, 7, 5);
    return;
  }

  if (layer === 'clouds') {
    const cloudScroll = Math.floor(scrollOffset * 0.15);
    ctx.fillStyle = backdropId === 'desert' ? '#f6d6bd' : '#ffffff';
    for (let cloud = 0; cloud < 4; cloud += 1) {
      const cloudX = (((cloud * 47 + 12 - cloudScroll) % (width + 24)) + (width + 24)) % (width + 24) - 12;
      const cloudY = 4 + (cloud % 2) * 5;
      if (cloudY + 3 >= horizonY) continue;
      ctx.fillRect(cloudX, cloudY + 1, 10, 2);
      ctx.fillRect(cloudX + 2, cloudY, 6, 1);
    }
    return;
  }

  if (layer !== 'horizon') {
    throw new RangeError(`Unknown pixel backdrop parallax layer: ${layer}`);
  }

  const farScroll = Math.floor(scrollOffset * 0.3);
  for (let x = 0; x < width; x += 1) {
    const worldX = x + farScroll;
    if (backdropId === 'mountains' || backdropId === 'snow') {
      const peakWave =
        Math.abs(((worldX * 0.7) % 36) - 18) * 0.8
        + Math.abs(((worldX * 0.35 + 11) % 24) - 12) * 0.5;
      const peakTop = Math.max(3, Math.floor(horizonY - 18 + peakWave));
      ctx.fillStyle = backdrop.distantColor;
      ctx.fillRect(x, peakTop, 1, horizonY - peakTop);
      const snowLine = peakTop + Math.min(5, Math.floor((horizonY - peakTop) * 0.38));
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, peakTop, 1, Math.max(1, snowLine - peakTop));
    } else if (backdropId === 'desert') {
      const mod = ((worldX % 52) + 52) % 52;
      let mesaHeight = 3;
      if (mod >= 8 && mod <= 28) mesaHeight = 13;
      else if (mod === 6 || mod === 7 || mod === 29 || mod === 30) mesaHeight = 9;
      else if (mod === 4 || mod === 5 || mod === 31 || mod === 32) mesaHeight = 5;
      const topY = horizonY - mesaHeight;
      ctx.fillStyle = backdrop.distantColor;
      ctx.fillRect(x, topY, 1, mesaHeight);
      if (mesaHeight >= 9) {
        ctx.fillStyle = '#de5d3a';
        ctx.fillRect(x, topY + 3, 1, 1);
        ctx.fillRect(x, topY + 7, 1, 1);
      }
    } else {
      const hillH = Math.floor(4 + Math.sin(worldX * 0.08) * 2.5 + Math.cos(worldX * 0.035) * 2);
      ctx.fillStyle = backdrop.distantColor;
      ctx.fillRect(x, horizonY - hillH, 1, hillH);
    }
  }
}

export function drawPixelBackdropScene(
  ctx,
  W,
  H,
  backdropId,
  scrollOffset,
  charFootY = 55,
  river,
  landmarkId,
  waterlineOffsetPx,
  drawBackgroundLayers = true,
  drawRiverWater = true
) {
  const bd = BACKDROPS[backdropId] || BACKDROPS.prairie;
  const horizonY = Math.max(12, charFootY - 20);
  const pathStartY = Math.max(18, charFootY - 6);
  const pathEndY = Math.min(H - 2, charFootY + 4);
  const riverProfile = getRiverVisualProfile(river);
  const effectiveWaterlineOffsetPx = Number.isFinite(waterlineOffsetPx)
    ? waterlineOffsetPx
    : riverProfile.waterlineOffsetPx;

  if (drawBackgroundLayers) {
    drawPixelBackdropParallaxLayer(ctx, W, backdropId, charFootY, 'sky');
    drawPixelBackdropParallaxLayer(ctx, W, backdropId, charFootY, 'clouds', scrollOffset);
    drawPixelBackdropParallaxLayer(ctx, W, backdropId, charFootY, 'horizon', scrollOffset);
  }

  // 5. Mid-ground Band
  if (backdropId !== 'river' || drawRiverWater) {
    ctx.fillStyle = bd.midHillColor;
    ctx.fillRect(0, horizonY, W, pathStartY - horizonY);
  }

  const midScroll = Math.floor(scrollOffset * 0.65);
  if (backdropId === 'prairie') {
    ctx.fillStyle = bd.nearGrassColor;
    ctx.fillRect(0, pathStartY - 3, W, 3);
    for (let gx = 0; gx < W; gx += 2) {
      const wx = Math.floor((gx + midScroll) / 2);
      const r = hashInt(wx);
      if (r > 0.35) {
        ctx.fillStyle = r > 0.78 ? '#f7e26b' : r > 0.65 ? '#ec273f' : '#a3ce27';
        ctx.fillRect(gx, pathStartY - 5, 1, 2);
      }
    }
    for (let x = 0; x < W; x++) {
      const wx = (((x + midScroll) % 48) + 48) % 48;
      if (wx === 20) {
        ctx.fillStyle = '#663931';
        ctx.fillRect(x, pathStartY - 7, 2, 6);
        ctx.fillStyle = '#e4a672';
        ctx.fillRect(x - 1, pathStartY - 6, 4, 2);
      }
    }
  } else if (backdropId === 'mountains' || backdropId === 'snow') {
    for (let x = -6; x < W + 6; x++) {
      const wx = (((x + midScroll) % 18) + 18) % 18;
      if (wx === 9) {
        const treeBaseY = pathStartY - 1;
        ctx.fillStyle = '#442434';
        ctx.fillRect(x, treeBaseY - 2, 2, 2);
        ctx.fillStyle = backdropId === 'snow' ? '#2f484e' : '#140c1c';
        ctx.fillRect(x - 2, treeBaseY - 5, 6, 3);
        ctx.fillRect(x - 1, treeBaseY - 8, 4, 3);
        ctx.fillRect(x, treeBaseY - 10, 2, 2);
        if (backdropId === 'snow') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x - 2, treeBaseY - 5, 6, 1);
          ctx.fillRect(x - 1, treeBaseY - 8, 4, 1);
        }
      }
    }
  } else if (backdropId === 'desert') {
    for (let x = -6; x < W + 6; x++) {
      const wx = (((x + midScroll) % 34) + 34) % 34;
      if (wx === 14) {
        const cBase = pathStartY - 1;
        ctx.fillStyle = '#44891a';
        ctx.fillRect(x, cBase - 9, 2, 9);
        ctx.fillRect(x - 2, cBase - 6, 2, 1);
        ctx.fillRect(x - 2, cBase - 8, 1, 3);
        ctx.fillRect(x + 2, cBase - 5, 2, 1);
        ctx.fillRect(x + 3, cBase - 7, 1, 3);
        ctx.fillStyle = '#a3ce27';
        ctx.fillRect(x, cBase - 9, 1, 8);
      } else if (wx === 28) {
        ctx.fillStyle = '#743f39';
        ctx.fillRect(x, pathStartY - 3, 3, 2);
      }
    }
  } else if (backdropId === 'river') {
    const firstBankRow = drawRiverWater ? horizonY + 2 : horizonY;
    for (let y = firstBankRow; y < pathStartY; y += 1) {
      const bounds = riverBoundsAtY(W, y, horizonY, pathEndY, H, landmarkId);
      ctx.fillStyle = y >= pathStartY - 3 ? '#a3ce27' : bd.midHillColor;
      ctx.fillRect(0, y, bounds.start, 1);
      ctx.fillRect(bounds.end, y, W - bounds.end, 1);
      if (drawRiverWater) {
        drawRiverChannelRow(ctx, W, y, horizonY, pathStartY, pathEndY, H, riverProfile.depthScale, effectiveWaterlineOffsetPx, landmarkId);
      }
    }
  }

  // 6. Trail Path Surface
  const pathScroll = Math.floor(scrollOffset);
  if (backdropId === 'river') {
    for (let y = pathStartY; y < pathEndY; y += 1) {
      const bounds = riverBoundsAtY(W, y, horizonY, pathEndY, H, landmarkId);
      ctx.fillStyle = y === pathStartY ? '#e4a672' : y === pathEndY - 1 ? '#8f563b' : '#b86f50';
      ctx.fillRect(0, y, bounds.start, 1);
      ctx.fillRect(bounds.end, y, W - bounds.end, 1);
      if (drawRiverWater) {
        drawRiverChannelRow(ctx, W, y, horizonY, pathStartY, pathEndY, H, riverProfile.depthScale, effectiveWaterlineOffsetPx, landmarkId);
      }
    }
  } else {
    ctx.fillStyle = bd.pathTop;
    ctx.fillRect(0, pathStartY, W, 1);
    ctx.fillStyle = bd.pathMain;
    ctx.fillRect(0, pathStartY + 1, W, pathEndY - pathStartY - 1);
    ctx.fillStyle = bd.pathRut;
    ctx.fillRect(0, pathEndY - 1, W, 1);
  }

  for (let x = 0; x < W; x++) {
    const wx = x + pathScroll;
    if (backdropId !== 'river') {
      if (wx % 7 === 0) {
        ctx.fillStyle = bd.pathRut;
        ctx.fillRect(x, pathStartY + 2, 2, 1);
        ctx.fillRect(x, pathEndY - 3, 2, 1);
      }
      if (hashInt(wx) > 0.75) {
        ctx.fillStyle = bd.pathTop;
        const py = pathStartY + 2 + (Math.floor(hashInt(wx + 9) * 100) % Math.max(1, pathEndY - pathStartY - 3));
        ctx.fillRect(x, py, 1, 1);
      }
    }
  }

  // 7. Foreground Verge (with inward-angling foreground banks for 'river')
  if (backdropId === 'river') {
    for (let y = pathEndY; y < H; y += 1) {
      const bounds = riverBoundsAtY(W, y, horizonY, pathEndY, H, landmarkId);
      ctx.fillStyle = y >= H - 4 ? '#8f563b' : bd.fgColor;
      ctx.fillRect(0, y, bounds.start, 1);
      ctx.fillRect(bounds.end, y, W - bounds.end, 1);
      if (drawRiverWater) {
        drawRiverChannelRow(ctx, W, y, horizonY, pathStartY, pathEndY, H, riverProfile.depthScale, effectiveWaterlineOffsetPx, landmarkId);
      }
    }

    // Current flecks flowing from the foreground (bottom) toward the horizon (top) along perspective lanes
    const flowStep = Math.floor(scrollOffset * 0.6 * riverProfile.flowScale)
      + Math.floor(Date.now() / (130 / riverProfile.flowScale));
    const totalRiverHeight = Math.max(1, (H - 2) - (horizonY + 3));
    const laneCount = riverProfile.isFast ? 16 : 11;
    const pulseCount = riverProfile.isFast ? 4 : 3;
    for (let lane = 0; lane < laneCount; lane += 1) {
      const u = 0.10 + (lane / (laneCount - 1)) * 0.80;
      for (let pulse = 0; pulse < pulseCount; pulse += 1) {
        const travel = (flowStep + lane * 5 + pulse * Math.floor(totalRiverHeight / 3)) % totalRiverHeight;
        const y = (H - 2) - travel;
        if (y > pathEndY) continue;
        const bounds = riverBoundsAtY(W, y, horizonY, pathEndY, H, landmarkId);
        const span = bounds.end - bounds.start;
        const fleckX = Math.round(bounds.start + u * span);
        const fleckLen = y < pathStartY ? 2 : riverProfile.isFast ? 4 : 3;
        if (fleckX >= bounds.start + 3 && fleckX + fleckLen <= bounds.end - 3) {
          const isWhitecap = riverProfile.isFast
            ? (flowStep + lane + pulse) % 3 === 0
            : y >= pathStartY && pulse === 0;
          ctx.fillStyle = isWhitecap ? '#ffffff' : '#b2dce8';
          ctx.fillRect(fleckX, y, fleckLen, 1);
        }
      }
    }
  } else {
    ctx.fillStyle = bd.fgColor;
    ctx.fillRect(0, pathEndY, W, H - pathEndY);
  }

  const foregroundRiverBounds = backdropId === 'river'
    ? riverBoundsAtY(W, pathEndY, horizonY, pathEndY, H, landmarkId)
    : null;
  for (let x = 0; x < W; x += 3) {
    if (
      foregroundRiverBounds
      && x + 2 > foregroundRiverBounds.start - 3
      && x < foregroundRiverBounds.end + 3
    ) continue;
    const wx = x + pathScroll;
    if (hashInt(wx * 2) > 0.5) {
      ctx.fillStyle = bd.midHillColor;
      ctx.fillRect(x, pathEndY, 2, 1);
    }
  }

  // 8. Falling Snowflakes
  if (backdropId === 'snow') {
    const snowTime = Math.floor(Date.now() / 110);
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < Math.floor(W * 0.22); i++) {
      const sx = (((i * 19 - snowTime) % W) + W) % W;
      const sy = (i * 13 + snowTime) % (H - 4);
      ctx.fillRect(sx, sy, 1, 1);
    }
  }
}

/**
 * Draws an Era/Location-Appropriate Home on the left of the landscape stage
 */
export function drawEraHomeBuilding(ctx, eraId, baseX, groundY) {
  const x = Math.round(baseX);
  const y = Math.round(groundY);
  if (x + 48 < 0 || x > 640) return;

  if (eraId === '1500s' || eraId === '1600s') {
    // Tudor / Baroque Half-Timbered or Stone Manor
    ctx.fillStyle = '#f6d6bd';
    ctx.fillRect(x + 2, y - 18, 24, 18);
    ctx.fillStyle = '#442434'; // Timber beams
    ctx.fillRect(x + 2, y - 18, 24, 2);
    ctx.fillRect(x + 2, y - 10, 24, 2);
    ctx.fillRect(x + 2, y - 18, 2, 18);
    ctx.fillRect(x + 13, y - 18, 2, 18);
    ctx.fillRect(x + 24, y - 18, 2, 18);
    // Steep gabled roof
    for (let r = 0; r < 8; r++) {
      ctx.fillStyle = eraId === '1500s' ? '#743f39' : '#3a4466';
      ctx.fillRect(x + r, y - 19 - r, 28 - r * 2, 1);
    }
    // Arched oak door & leaded windows
    ctx.fillStyle = '#663931';
    ctx.fillRect(x + 11, y - 8, 5, 8);
    ctx.fillStyle = '#f7e26b';
    ctx.fillRect(x + 5, y - 15, 5, 4);
    ctx.fillRect(x + 18, y - 15, 5, 4);
  } else if (eraId === '1700s' || eraId === '1800s' || eraId === '1900_1920') {
    // Colonial Brick / Victorian / Edwardian Townhouse
    ctx.fillStyle = eraId === '1700s' ? '#ac2847' : eraId === '1800s' ? '#5a6988' : '#e4a672';
    ctx.fillRect(x + 2, y - 20, 24, 20);
    // Roof & chimney
    ctx.fillStyle = '#262b44';
    ctx.fillRect(x + 20, y - 26, 4, 6);
    for (let r = 0; r < 6; r++) {
      ctx.fillRect(x + r, y - 20 - r, 28 - r * 2, 1);
    }
    // White trim & windows
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 2, y - 20, 24, 1);
    ctx.fillRect(x + 5, y - 16, 4, 5);
    ctx.fillRect(x + 19, y - 16, 4, 5);
    ctx.fillStyle = '#f7e26b';
    ctx.fillRect(x + 6, y - 15, 2, 3);
    ctx.fillRect(x + 20, y - 15, 2, 3);
    // Front door with pediment
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 11, y - 10, 6, 10);
    ctx.fillStyle = '#442434';
    ctx.fillRect(x + 12, y - 9, 4, 9);
  } else if (eraId === '1921_1940' || eraId === '1941_1950' || eraId === '1950s' || eraId === '1960s' || eraId === '1970s') {
    // Mid-20th Century Art Deco / Diner Ranch / Brownstone
    const wallColor = eraId === '1950s' ? '#b2dce8' : eraId === '1960s' ? '#f3a833' : eraId === '1970s' ? '#b86f50' : '#c2c3c7';
    ctx.fillStyle = wallColor;
    ctx.fillRect(x + 1, y - 17, 26, 17);
    // Stepped or flat mid-century roof line
    ctx.fillStyle = eraId === '1950s' ? '#ec273f' : '#3a4466';
    ctx.fillRect(x, y - 20, 28, 3);
    if (eraId === '1921_1940') {
      ctx.fillRect(x + 6, y - 23, 16, 3);
    }
    // Picture window & door
    ctx.fillStyle = '#f7e26b';
    ctx.fillRect(x + 4, y - 13, 10, 6);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 4, y - 13, 10, 1);
    ctx.fillStyle = '#262b44';
    ctx.fillRect(x + 18, y - 11, 6, 11);
  } else if (eraId === '1980s' || eraId === '1990s' || eraId === '2000s' || eraId === '2010s' || eraId === '2020s') {
    // Late 20th / 21st Century Home (80s Neon Synthwave / 90s-00s Suburban / 10s-20s Modern Glass & Steel)
    ctx.fillStyle = eraId === '1980s' ? '#262b44' : eraId === '2020s' ? '#140c1c' : '#5a6988';
    ctx.fillRect(x + 1, y - 19, 26, 19);
    // Modern cantilevered roof or neon trim
    ctx.fillStyle = eraId === '1980s' ? '#ec273f' : eraId === '2020s' ? '#00ff66' : '#3a4466';
    ctx.fillRect(x, y - 21, 29, 2);
    // Large modern glass panes
    ctx.fillStyle = eraId === '1980s' ? '#31a2f2' : '#b2dce8';
    ctx.fillRect(x + 4, y - 15, 11, 7);
    ctx.fillStyle = '#f7e26b';
    ctx.fillRect(x + 6, y - 13, 7, 3);
    // Door
    ctx.fillStyle = '#8f563b';
    ctx.fillRect(x + 19, y - 11, 5, 11);
  } else {
    // Default 'oregon_trail' 1848 Frontier Log Homestead Cabin
    ctx.fillStyle = '#663931'; // Stone chimney on left
    ctx.fillRect(x + 1, y - 21, 4, 21);
    ctx.fillStyle = '#8f563b'; // Notched log walls
    ctx.fillRect(x + 4, y - 15, 22, 15);
    ctx.fillStyle = '#663931'; // Log seams
    for (let ly = y - 13; ly < y; ly += 3) {
      ctx.fillRect(x + 4, ly, 22, 1);
    }
    // Wood-shingle gable roof
    for (let r = 0; r < 6; r++) {
      ctx.fillStyle = '#442434';
      ctx.fillRect(x + 2 + r, y - 16 - r, 26 - r * 2, 1);
    }
    // Warm lantern window & plank door
    ctx.fillStyle = '#f7e26b';
    ctx.fillRect(x + 8, y - 11, 5, 5);
    ctx.fillStyle = '#442434';
    ctx.fillRect(x + 17, y - 10, 5, 10);
  }
}

export const NPC_APPEARANCES = Object.freeze({
  shopkeeper: {
    gender: 'male',
    bodyTemplateId: 'broad_guardian',
    skinToneId: 'warm_ivory',
    preferredHeadwearType: 'hair',
    equippedPresets: {
      hats: 'hair_1800s_side_part',
      shirts: 'shirt_1800s_frock_coat',
      pants: 'pants_oregon_duck_trousers',
      shoes: 'shoes_oregon_cowhide_boots',
      accessories: 'acc_oregon_prairie_apron'
    },
    categoryDyes: {
      hats: 'espresso',
      shirts: 'emerald',
      pants: 'default',
      shoes: 'default',
      accessories: 'default'
    }
  },
  ferryOperator: {
    gender: 'male',
    bodyTemplateId: 'broad_guardian',
    skinToneId: 'golden_tan',
    preferredHeadwearType: 'hat',
    equippedPresets: {
      hats: 'hat_oregon_frontier_slouch',
      shirts: 'shirt_oregon_red_flannel',
      pants: 'pants_oregon_denim_dungarees',
      shoes: 'shoes_oregon_cowhide_boots',
      accessories: 'acc_oregon_leather_braces'
    },
    categoryDyes: {
      hats: 'espresso',
      shirts: 'cobalt',
      pants: 'default',
      shoes: 'default',
      accessories: 'default'
    }
  },
  riverGuide: {
    gender: 'male',
    bodyTemplateId: 'nimble_scout',
    skinToneId: 'olive_bronze',
    preferredHeadwearType: 'hair',
    equippedPresets: {
      hats: 'hair_oregon_scout_long_locks',
      shirts: 'shirt_oregon_buckskin_jacket',
      pants: 'pants_oregon_duck_trousers',
      shoes: 'shoes_oregon_buckskin_moccasins',
      accessories: 'acc_oregon_powder_horn'
    },
    categoryDyes: {
      hats: 'default',
      shirts: 'default',
      pants: 'espresso',
      shoes: 'default',
      accessories: 'default'
    }
  }
});

export function drawCharacterGridAt(ctx, grid, baseX, baseY, scale = 1) {
  const originX = Math.round(baseX);
  const originY = Math.round(baseY);
  if (scale === 1) {
    for (let y = 0; y < GRID_SIZE; y += 1) {
      for (let x = 0; x < GRID_SIZE; x += 1) {
        const color = grid[y][x];
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(originX + x, originY + y, 1, 1);
        }
      }
    }
    return;
  }

  const outputSize = Math.max(1, Math.round(GRID_SIZE * scale));
  for (let y = 0; y < outputSize; y += 1) {
    const sourceY = Math.min(GRID_SIZE - 1, Math.floor(y / scale));
    for (let x = 0; x < outputSize; x += 1) {
      const color = grid[sourceY][Math.min(GRID_SIZE - 1, Math.floor(x / scale))];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(originX + x, originY + y, 1, 1);
    }
  }
}

/**
 * Draws the 1848 Independence General Store ("MATT'S OUTFITTING POST")
 */
export function drawGeneralStoreBuilding(ctx, baseX, groundY, animTick = 0) {
  const x = Math.round(baseX);
  const y = Math.round(groundY);
  if (x + 56 < 0 || x > 640) return;

  // Stepped false-front western timber facade
  ctx.fillStyle = '#442434';
  ctx.fillRect(x + 3, y - 29, 36, 2);
  ctx.fillRect(x + 7, y - 31, 28, 2);
  ctx.fillStyle = '#8f563b';
  ctx.fillRect(x + 4, y - 27, 34, 27);
  ctx.fillStyle = '#663931';
  ctx.fillRect(x + 4, y - 27, 34, 2);
  ctx.fillRect(x + 4, y - 19, 34, 2);
  for (let py = y - 17; py < y; py += 3) {
    ctx.fillRect(x + 4, py, 34, 1);
  }

  // Signboard banner on false front
  ctx.fillStyle = '#442434';
  ctx.fillRect(x + 6, y - 26, 30, 7);
  ctx.fillStyle = '#f6d6bd';
  ctx.fillRect(x + 7, y - 25, 28, 5);
  ctx.fillStyle = '#442434';
  // Pixel-art "STORE" lettering blocks
  ctx.fillRect(x + 9, y - 24, 3, 3);
  ctx.fillRect(x + 14, y - 24, 3, 3);
  ctx.fillRect(x + 19, y - 24, 3, 3);
  ctx.fillRect(x + 24, y - 24, 3, 3);
  ctx.fillRect(x + 29, y - 24, 3, 3);

  // Porch overhang, shingled awning & support posts
  ctx.fillStyle = '#442434';
  ctx.fillRect(x - 1, y - 14, 42, 2);
  ctx.fillStyle = '#663931';
  ctx.fillRect(x, y - 12, 40, 1);
  ctx.fillStyle = '#e4a672';
  ctx.fillRect(x + 1, y - 11, 2, 11);
  ctx.fillRect(x + 37, y - 11, 2, 11);

  // Raised wooden boardwalk porch deck
  ctx.fillStyle = '#442434';
  ctx.fillRect(x - 2, y - 1, 44, 2);
  ctx.fillStyle = '#b86f50';
  ctx.fillRect(x - 1, y - 2, 42, 1);

  // Storefront paned display windows & open doorway
  ctx.fillStyle = '#442434';
  ctx.fillRect(x + 6, y - 10, 8, 6);
  ctx.fillRect(x + 27, y - 10, 8, 6);
  ctx.fillStyle = '#f7e26b';
  ctx.fillRect(x + 7, y - 9, 6, 4);
  ctx.fillRect(x + 28, y - 9, 6, 4);
  ctx.fillStyle = '#b86f50';
  ctx.fillRect(x + 10, y - 9, 1, 4);
  ctx.fillRect(x + 31, y - 9, 1, 4);

  ctx.fillStyle = '#262b44';
  ctx.fillRect(x + 16, y - 10, 9, 9);
  ctx.fillStyle = '#663931';
  ctx.fillRect(x + 15, y - 10, 1, 9);
  ctx.fillRect(x + 25, y - 10, 1, 9);

  // Shopkeeper standing on the porch welcoming travelers (scaled to match doorway)
  const porchKeeperGrid = getCharacterFrameGrid(
    NPC_APPEARANCES.shopkeeper,
    'front',
    'idle',
    animTick % 2
  );
  drawCharacterGridAt(ctx, porchKeeperGrid, x + 13, y - 17, 0.52);

  // Supply barrels, flour sacks & hitching rail out front
  ctx.fillStyle = '#b86f50';
  ctx.fillRect(x + 3, y - 6, 4, 5);
  ctx.fillStyle = '#442434';
  ctx.fillRect(x + 3, y - 5, 4, 1);
  ctx.fillRect(x + 3, y - 3, 4, 1);
  ctx.fillStyle = '#f6d6bd';
  ctx.fillRect(x + 33, y - 5, 4, 4);
  ctx.fillStyle = '#e4a672';
  ctx.fillRect(x + 33, y - 3, 4, 2);
  ctx.fillStyle = '#442434';
  ctx.fillRect(x - 7, y - 5, 6, 1);
  ctx.fillRect(x - 6, y - 5, 1, 5);
}

export function drawGeneralStoreInterior(ctx, width, height, animTick = 0) {
  const floorY = Math.floor(height * 0.71);

  // 1. Timber wall & ceiling rafters
  ctx.fillStyle = '#442434';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#743f39';
  ctx.fillRect(0, 6, width, floorY - 6);
  ctx.fillStyle = '#8f563b';
  for (let y = 8; y < floorY - 4; y += 8) {
    ctx.fillRect(0, y, width, 6);
  }
  ctx.fillStyle = '#663931';
  for (let y = 14; y < floorY; y += 8) {
    ctx.fillRect(0, y, width, 1);
  }
  for (const postX of [4, 58, 146, 212, width - 8]) {
    ctx.fillStyle = '#442434';
    ctx.fillRect(postX, 5, 4, floorY - 5);
    ctx.fillStyle = '#663931';
    ctx.fillRect(postX + 1, 5, 2, floorY - 5);
  }
  ctx.fillStyle = '#442434';
  ctx.fillRect(0, floorY - 3, width, 3);

  // 2. Left storefront paned window looking out onto the sunny prairie
  const winX = 14;
  const winY = 15;
  const winW = 36;
  const winH = 30;
  ctx.fillStyle = '#442434';
  ctx.fillRect(winX - 2, winY - 2, winW + 4, winH + 4);
  ctx.fillStyle = '#31a2f2';
  ctx.fillRect(winX, winY, winW, 12);
  ctx.fillStyle = '#b2dce8';
  ctx.fillRect(winX, winY + 12, winW, 8);
  ctx.fillStyle = '#44891a';
  ctx.fillRect(winX, winY + 20, winW, 6);
  ctx.fillStyle = '#e4a672';
  ctx.fillRect(winX, winY + 26, winW, 4);
  ctx.fillStyle = '#442434';
  ctx.fillRect(winX + Math.floor(winW / 2) - 1, winY, 2, winH);
  ctx.fillRect(winX, winY + Math.floor(winH / 2) - 1, winW, 2);
  ctx.fillStyle = '#e4a672';
  ctx.fillRect(winX - 3, winY + winH + 1, winW + 6, 2);

  // 3. Hanging brass oil lanterns with warm flicker
  for (const lampX of [102, 252]) {
    ctx.fillStyle = 'rgba(247, 226, 107, 0.12)';
    ctx.fillRect(lampX - 8, 10, 17, 14);
    ctx.fillStyle = '#442434';
    ctx.fillRect(lampX, 5, 1, 6);
    ctx.fillStyle = '#f3a833';
    ctx.fillRect(lampX - 3, 11, 7, 2);
    ctx.fillRect(lampX - 2, 16, 5, 2);
    ctx.fillStyle = animTick % 2 === 0 ? '#ffffff' : '#f7e26b';
    ctx.fillRect(lampX - 1, 13, 3, 3);
  }

  // 4. Store signboard ("MATT'S OUTFITTING")
  const signX = 70;
  const signY = 8;
  const signW = 68;
  ctx.fillStyle = '#442434';
  ctx.fillRect(signX, signY, signW, 10);
  ctx.fillStyle = '#f6d6bd';
  ctx.fillRect(signX + 2, signY + 2, signW - 4, 6);
  ctx.fillStyle = '#442434';
  for (let lx = signX + 6; lx < signX + signW - 7; lx += 5) {
    ctx.fillRect(lx, signY + 3, 3, 4);
  }

  // 5. Stocked dry-goods & apothecary shelves along the back wall
  const drawShelfBay = (x, bayW, variant) => {
    for (const shelfY of [31, 46, 60]) {
      ctx.fillStyle = '#442434';
      ctx.fillRect(x, shelfY, bayW, 2);
      ctx.fillStyle = '#b86f50';
      ctx.fillRect(x + 1, shelfY + 2, bayW - 2, 1);
    }
    if (variant === 'drygoods') {
      const tins = ['#ac2847', '#31a2f2', '#f7e26b', '#44891a', '#e98537', '#3a4466'];
      for (let i = 0; i < 6; i += 1) {
        const ix = x + 4 + i * 11;
        ctx.fillStyle = tins[i];
        ctx.fillRect(ix, 24, 7, 7);
        ctx.fillStyle = '#f6d6bd';
        ctx.fillRect(ix + 1, 26, 5, 2);
      }
      for (let i = 0; i < 5; i += 1) {
        const ix = x + 5 + i * 13;
        ctx.fillStyle = i % 2 === 0 ? '#3a4466' : '#ac2847';
        ctx.fillRect(ix, 39, 9, 4);
        ctx.fillStyle = '#f7e26b';
        ctx.fillRect(ix, 43, 9, 3);
      }
      for (let i = 0; i < 5; i += 1) {
        const ix = x + 4 + i * 13;
        ctx.fillStyle = i % 2 === 0 ? '#f6d6bd' : '#e4a672';
        ctx.fillRect(ix, 51, 9, 9);
        ctx.fillStyle = '#ac2847';
        ctx.fillRect(ix + 2, 53, 5, 1);
      }
    } else {
      const bottles = ['#0098dc', '#b2dce8', '#a3ce27', '#31a2f2', '#ec273f'];
      for (let i = 0; i < 5; i += 1) {
        const ix = x + 4 + i * 10;
        ctx.fillStyle = '#e4a672';
        ctx.fillRect(ix + 2, 22, 2, 2);
        ctx.fillStyle = bottles[i];
        ctx.fillRect(ix, 24, 6, 7);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(ix + 1, 25, 1, 4);
      }
      for (let i = 0; i < 4; i += 1) {
        const ix = x + 5 + i * 12;
        ctx.fillStyle = i % 2 === 0 ? '#663931' : '#e4a672';
        ctx.fillRect(ix, 39, 8, 7);
        ctx.fillStyle = '#f6d6bd';
        ctx.fillRect(ix + 2, 41, 4, 3);
      }
      const wx = x + bayW - 14;
      const wy = 55;
      ctx.fillStyle = '#442434';
      ctx.fillRect(wx - 5, wy - 5, 11, 11);
      ctx.fillStyle = '#b86f50';
      ctx.fillRect(wx - 3, wy - 3, 7, 7);
      ctx.fillStyle = '#f7e26b';
      ctx.fillRect(wx, wy - 4, 1, 9);
      ctx.fillRect(wx - 4, wy, 9, 1);
    }
  };

  drawShelfBay(66, 76, 'drygoods');
  drawShelfBay(154, 54, 'hardware');

  // 6. Planked hardwood floor & braided frontier rug
  ctx.fillStyle = '#b86f50';
  ctx.fillRect(0, floorY, width, height - floorY);
  ctx.fillStyle = '#8f563b';
  for (let y = floorY + 2; y < height; y += 8) {
    ctx.fillRect(0, y, width, 3);
  }
  ctx.fillStyle = '#663931';
  for (let y = floorY + 5; y < height; y += 6) {
    ctx.fillRect(0, y, width, 1);
  }
  for (let x = 14; x < width; x += 28) {
    ctx.fillRect(x, floorY, 1, height - floorY);
  }

  const rugX = 82;
  const rugY = floorY + 8;
  ctx.fillStyle = '#442434';
  ctx.fillRect(rugX, rugY, 112, 11);
  ctx.fillStyle = '#ac2847';
  ctx.fillRect(rugX + 2, rugY + 1, 108, 9);
  ctx.fillStyle = '#f7e26b';
  ctx.fillRect(rugX + 5, rugY + 3, 102, 1);
  ctx.fillRect(rugX + 5, rugY + 7, 102, 1);
  ctx.fillStyle = '#3a4466';
  ctx.fillRect(rugX + 8, rugY + 4, 96, 3);

  // 7. Shopkeeper Matt (rendered using the 32x32 CharacterDesigner engine behind the counter)
  const shopkeeperDrawX = width - 82;
  const shopkeeperFootY = floorY + 13;
  const shopkeeperGrid = getCharacterFrameGrid(
    NPC_APPEARANCES.shopkeeper,
    'side_left',
    'idle',
    animTick % 2
  );
  drawCharacterGridAt(ctx, shopkeeperGrid, shopkeeperDrawX, shopkeeperFootY - 30, 1);

  // 8. Foreground Outfitting Counter (drawn over the shopkeeper's lower body)
  const counterX = 214;
  const counterY = floorY - 3;
  const counterW = 82;
  const counterH = 19;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.30)';
  ctx.fillRect(counterX - 2, counterY + counterH, counterW + 4, 2);

  ctx.fillStyle = '#442434';
  ctx.fillRect(counterX - 1, counterY, counterW + 2, 3);
  ctx.fillStyle = '#e4a672';
  ctx.fillRect(counterX, counterY + 1, counterW, 1);

  ctx.fillStyle = '#8f563b';
  ctx.fillRect(counterX + 1, counterY + 3, counterW - 2, counterH - 3);
  ctx.fillStyle = '#663931';
  ctx.fillRect(counterX + 1, counterY + counterH - 2, counterW - 2, 2);
  for (let px = counterX + 5; px < counterX + counterW - 14; px += 24) {
    ctx.fillStyle = '#442434';
    ctx.fillRect(px, counterY + 5, 18, 11);
    ctx.fillStyle = '#743f39';
    ctx.fillRect(px + 1, counterY + 6, 16, 9);
  }

  // Brass balance scale
  ctx.fillStyle = '#f3a833';
  ctx.fillRect(counterX + 8, counterY - 5, 7, 1);
  ctx.fillRect(counterX + 11, counterY - 6, 1, 6);
  ctx.fillStyle = '#f7e26b';
  ctx.fillRect(counterX + 7, counterY - 3, 3, 2);
  ctx.fillRect(counterX + 13, counterY - 3, 3, 2);
  ctx.fillRect(counterX + 9, counterY - 1, 5, 1);

  // Open ledger & white quill next to shopkeeper
  ctx.fillStyle = '#f6d6bd';
  ctx.fillRect(counterX + 24, counterY - 2, 9, 2);
  ctx.fillStyle = '#442434';
  ctx.fillRect(counterX + 28, counterY - 2, 1, 2);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(counterX + 31, counterY - 5, 1, 3);
  ctx.fillRect(counterX + 32, counterY - 6, 1, 2);

  // Stacked provisions & barrel at right end of counter
  ctx.fillStyle = '#31a2f2';
  ctx.fillRect(counterX + 60, counterY - 4, 6, 4);
  ctx.fillStyle = '#e4a672';
  ctx.fillRect(counterX + 67, counterY - 5, 8, 5);
  ctx.fillStyle = '#b86f50';
  ctx.fillRect(counterX + counterW + 2, floorY + 2, 12, 14);
  ctx.fillStyle = '#442434';
  ctx.fillRect(counterX + counterW + 2, floorY + 5, 12, 1);
  ctx.fillRect(counterX + counterW + 2, floorY + 12, 12, 1);
}
