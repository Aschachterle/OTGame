import {
  GRID_SIZE,
  GENDERS,
  ERAS,
  CATEGORIES,
  PRESET_COLOR_DYES,
  SKIN_TONES,
  BASE_BODY_TEMPLATES,
  INITIAL_CLOTHING_BOILERPLATE,
  addCustomClothingItem,
  renameClothingItem,
  deleteCustomClothingItem,
  getAllCustomClothingObject,
  saveCustomClothingToServer,
  clearAllCustomClothingStorage
} from './character-presets.js?v=clothing_editor_v4';
import {
  getBoilerplateSpriteFrameCount,
  getBoilerplateSpriteGrid,
  getBoilerplateSpriteSize,
  preloadBoilerplateSprites
} from './boilerplate-sprites.js';
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

export {
  addCustomClothingItem,
  renameClothingItem,
  deleteCustomClothingItem,
  getAllCustomClothingObject,
  saveCustomClothingToServer,
  clearAllCustomClothingStorage
};

export { preloadBoilerplateSprites };

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
  const effectiveDrawOrder = ['pants', 'shoes', 'shirts', 'accessories', 'hats'];

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
  // FRAME 1 (f=0, Neutral Height torsoBounceY=0): Wide Contact Stride A — Near (warm) leg forward heel-strike, Far (cool dark) leg back on toe (5-8px gap)
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
  // FRAME 2 (f=1, Down - Dip 1px torsoBounceY=+1): Closed Passing A — Near foot planted flat under body; Far leg crosses directly behind/across with 0px gap between legs!
  frame1: [
    '............OOOOOOO.............',
    '............OOOOOOO.............',
    '............OhhhHHHO............',
    '............OhhOHHHO............',
    '............OppOLPPO............',
    '............OppOLPPpo...........',
    '...........ObbOOBPpo............',
    '..........OukbOOKPO.............',
    '..........OduwOOKPO.............',
    '..........OduO.OKUOOO...........',
    '..........OOO..ODUWWWO..........',
    '...............OOOOOOO..........'
  ],
  // FRAME 3 (f=2, Up - Rise 1px torsoBounceY=-1): Emerging Push-Off A — Near heel lifts behind as Far (dark) leg emerges in front (1-3px gap opening into Frame 4)
  frame2: [
    '............OHHHHHO.............',
    '............OHHHhhhO............',
    '............OHHOhhhO............',
    '............OLPOoppO............',
    '...........OLPO.oppO............',
    '..........OBPO..obbO............',
    '.........OOKPO...okbO...........',
    '........ODUWO....okbO...........',
    '........ODUWO....okuOOO.........',
    '.........OUWO.....ouwwwO........',
    '.........OUWO.....oduOOO........',
    '.........OOOO...................'
  ],
  // FRAME 4 (f=3, Neutral Height torsoBounceY=0): Wide Contact Stride B — Far (cool dark) leg forward heel-strike, Near (warm) leg back on toe (5-8px gap)
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
  // FRAME 5 (f=4, Down - Dip 1px torsoBounceY=+1): Closed Passing B — Far foot planted flat under body; Near (warm) leg crosses directly across in foreground with 0px gap!
  frame4: [
    '............OOOOOOO.............',
    '............OOOOOOO.............',
    '............OHHHhhhO............',
    '............OHHOhhO.............',
    '............OLPOppO.............',
    '............OLPPLPO.............',
    '...........OBPPLPO..............',
    '..........OOKBPOkbo.............',
    '..........ODUWOokbo.............',
    '..........ODUO.okuOOO...........',
    '..........OOO..oduwwwO..........',
    '...............OOOOOOO..........'
  ],
  // FRAME 6 (f=5, Up - Rise 1px torsoBounceY=-1): Emerging Push-Off B — Far heel lifts behind as Near (warm) leg emerges in front (1-3px gap opening into Frame 1)
  frame5: [
    '............OHHHHHO.............',
    '............OhhhHHHO............',
    '............OhhOHHHO............',
    '............OppOLPO.............',
    '...........OppO.OLPO............',
    '..........ObbO..OBPO............',
    '.........OukbO...OKPO...........',
    '........OduwO....OKPO...........',
    '........OduwO....OKUOOO.........',
    '.........OuwO.....OUWWWO........',
    '.........OuwO.....ODUOOO........',
    '.........OOOO...................'
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

function getLegacyCharacterFrameGrid(appearance, view = 'front', animMode = 'walk', frameIndex = 0) {
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

const SPRITE_OUTLINE_COLORS = new Set([
  '#050004', '#1a0507', '#110b0f', '#4c0207',
  '#120e26', '#242339', '#281028', '#410a32'
]);

const SPRITE_FAR_LIMB_COLORS = new Set([
  '#b73a32', '#ae4a3a', '#a82824', '#a0322b', '#962926', '#7b2218',
  '#bc4437', '#550735', '#821534', '#7a093e', '#a32938', '#ad4437',
  '#98423e', '#8d332e', '#8c3e3e', '#511425', '#422434', '#411726'
]);

const SPRITE_BASE_HAIR_COLORS = new Set([
  '#4d1b1b', '#81492c',
  '#4b4e59', '#636a76', '#747c86', '#2b2a3f', '#3f4050', '#5a5766', '#333345'
]);

const SPRITE_UNDIES_COLORS = new Set([
  '#f3fbfb', '#859dc6', '#9db2ce', '#84807e',
  '#6d6679', '#8a6c75'
]);

function isSpriteOutline(color) {
  if (!color) return false;
  const lower = color.toLowerCase();
  if (SPRITE_OUTLINE_COLORS.has(lower)) return true;
  if (!lower.startsWith('#') || lower.length !== 7) return false;
  const r = parseInt(lower.slice(1, 3), 16);
  const g = parseInt(lower.slice(3, 5), 16);
  const b = parseInt(lower.slice(5, 7), 16);
  return (r + g + b) / 3 < 42;
}

function isSpriteFarLimb(color, y, headDy = 0) {
  if (!color || y < 11 + headDy) return false;
  return SPRITE_FAR_LIMB_COLORS.has(color.toLowerCase());
}

function isSpriteBaseHair(color, y, headDy = 0) {
  if (!color || y > 8 + headDy) return false;
  return SPRITE_BASE_HAIR_COLORS.has(color.toLowerCase());
}

function isSpriteUndies(color) {
  if (!color) return false;
  return SPRITE_UNDIES_COLORS.has(color.toLowerCase());
}

const KNOWN_SKIN_HIGHLIGHT_COLORS = new Set([
  '#f1af7d', '#ffe6d4', '#fad0a8', '#ffffff',
  ...SKIN_TONES.map((s) => s.highlight.toLowerCase())
]);

const KNOWN_SKIN_BASE_COLORS = new Set([
  '#eea572', '#efa580', '#f6c69f', '#e09b67', '#f6d6bd',
  ...SKIN_TONES.map((s) => s.base.toLowerCase())
]);

const KNOWN_SKIN_SHADOW_COLORS = new Set([
  '#c56749', '#ca694f', '#bd5e44', '#c97e54', '#a86034', '#d99066',
  ...SKIN_TONES.map((s) => s.shadow.toLowerCase())
]);

export function isSpriteSkinPixel(color, y = 0, headDy = 0) {
  if (!color) return false;
  const lower = color.toLowerCase();
  if (isSpriteOutline(lower)) return false;
  if (isSpriteBaseHair(lower, y, headDy)) return false;
  if (isSpriteUndies(lower)) return false;
  if (SPRITE_FAR_LIMB_COLORS.has(lower)) return true;
  if (KNOWN_SKIN_HIGHLIGHT_COLORS.has(lower)) return true;
  if (KNOWN_SKIN_BASE_COLORS.has(lower)) return true;
  if (KNOWN_SKIN_SHADOW_COLORS.has(lower)) return true;
  if (lower.startsWith('#') && lower.length === 7) {
    const r = parseInt(lower.slice(1, 3), 16);
    const g = parseInt(lower.slice(3, 5), 16);
    const b = parseInt(lower.slice(5, 7), 16);
    if (r > g && g > b && r > 90 && b < 180) {
      return true;
    }
  }
  return false;
}

export function applySkinToneToSpriteGrid(grid, skinToneId, gender = 'male') {
  if (!grid || !Array.isArray(grid)) return grid;
  const skin = getSkinToneById(skinToneId);
  if (!skin) return grid;

  const result = grid.map((row) => [...row]);
  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const col = result[y]?.[x];
      if (!col) continue;
      const lower = col.toLowerCase();
      if (isSpriteOutline(lower)) continue;
      if (isSpriteBaseHair(lower, y, 0)) continue;
      if (isSpriteUndies(lower)) continue;

      if (SPRITE_FAR_LIMB_COLORS.has(lower)) {
        result[y][x] = coolShadowHex(skin.shadow, 0.42);
      } else if (KNOWN_SKIN_HIGHLIGHT_COLORS.has(lower)) {
        result[y][x] = skin.highlight;
      } else if (KNOWN_SKIN_SHADOW_COLORS.has(lower)) {
        result[y][x] = skin.shadow;
      } else if (KNOWN_SKIN_BASE_COLORS.has(lower)) {
        result[y][x] = skin.base;
      } else if (isSpriteSkinPixel(lower, y, 0)) {
        const r = parseInt(lower.slice(1, 3), 16);
        const g = parseInt(lower.slice(3, 5), 16);
        const b = parseInt(lower.slice(5, 7), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        if (brightness > 210) result[y][x] = skin.highlight;
        else if (brightness < 140) result[y][x] = skin.shadow;
        else result[y][x] = skin.base;
      }
    }
  }
  return result;
}


function isSkirtPreset(preset) {
  if (!preset || preset.isNone) return false;
  const id = String(preset.id || '');
  const pat = String(preset.patternId || '');
  return (
    pat === 'prairieLongSkirt' ||
    pat === 'pleatedSkirtKilt' ||
    id.includes('skirt') ||
    id.includes('kirtle') ||
    id.includes('kilt') ||
    id.includes('rhinegraves')
  );
}

function isShortSkirtPreset(preset) {
  if (!isSkirtPreset(preset)) return false;
  const id = String(preset.id || '');
  const pat = String(preset.patternId || '');
  return (
    pat === 'pleatedSkirtKilt' ||
    id.includes('flapper') ||
    id.includes('pleated') ||
    id.includes('poodle') ||
    id.includes('mini')
  );
}

function resolveGarmentPalette(preset, dyeId) {
  const raw = preset?.palette || {};
  let fallbackP = raw.P || null;
  let fallbackS = raw.S || null;
  let fallbackL = raw.L || null;
  let fallbackO = raw.O || null;

  if (!fallbackP || !fallbackO) {
    for (const [, , color, role] of preset?.front || []) {
      if (role === 'primary' && !fallbackP) fallbackP = color;
      else if (role === 'secondary' && !fallbackS) fallbackS = color;
      else if (role === 'highlight' && !fallbackL) fallbackL = color;
      else if (!role && !fallbackO) fallbackO = color;
    }
  }

  const baseP = fallbackP || fallbackS || fallbackL || '#8f563b';
  const baseS = fallbackS || shadeHex(baseP, -24);
  const baseL = fallbackL || shadeHex(baseP, 24);
  const baseO = fallbackO || localOutlineHex(baseP, 0.76);

  const P = resolvePresetPixelColor(baseP, 'primary', dyeId);
  const S = resolvePresetPixelColor(baseS, 'secondary', dyeId);
  const L = resolvePresetPixelColor(baseL, 'highlight', dyeId);
  const O = (!dyeId || dyeId === 'default') ? baseO : localOutlineHex(P, 0.76);

  const farP = coolShadowHex(P, 0.42);
  const farS = coolShadowHex(S, 0.46);
  const farL = coolShadowHex(L, 0.36);
  const farO = localOutlineHex(farP, 0.78);

  return { O, P, S, L, farO, farP, farS, farL };
}

const SIDE_NEAR_HAND_CONTOURS = {
  male: {
    idle: [
      [17, 16], [18, 16], [19, 16],
      [16, 17], [17, 17], [18, 17], [19, 17],
      [16, 18], [17, 18], [18, 18], [19, 18]
    ],
    walk: [
      [[14, 15], [15, 15], [16, 15], [14, 16], [15, 16], [16, 16], [17, 16], [14, 17], [15, 17], [16, 17], [17, 17]],
      [[13, 16], [14, 16], [15, 16], [16, 16], [12, 17], [13, 17], [14, 17], [15, 17], [16, 17], [13, 18], [14, 18], [15, 18], [16, 18], [13, 19], [14, 19], [15, 19], [16, 19]],
      [[12, 16], [13, 16], [14, 16], [12, 17], [13, 17], [14, 17], [15, 17], [12, 18], [13, 18], [14, 18], [15, 18]],
      [[9, 16], [10, 16], [11, 16], [12, 16], [9, 17], [10, 17], [11, 17], [12, 17], [10, 18], [11, 18], [12, 18], [13, 18], [10, 19], [11, 19], [12, 19], [13, 19]],
      [[8, 15], [9, 15], [10, 15], [11, 15], [8, 16], [9, 16], [10, 16], [11, 16], [8, 17], [9, 17], [10, 17], [11, 17], [8, 18], [9, 18], [10, 18], [11, 18], [8, 19], [9, 19], [10, 19], [11, 19]],
      [[9, 15], [10, 15], [11, 15], [12, 15], [9, 16], [10, 16], [11, 16], [12, 16], [9, 17], [10, 17], [11, 17], [12, 17], [10, 18], [11, 18], [12, 18], [13, 18], [10, 19], [11, 19], [12, 19], [13, 19]],
      [[10, 16], [11, 16], [12, 16], [13, 16], [11, 17], [12, 17], [13, 17], [14, 17], [11, 18], [12, 18], [13, 18], [14, 18], [12, 19], [13, 19], [14, 19], [12, 20], [13, 20], [14, 20]],
      [[13, 16], [14, 16], [15, 16], [13, 17], [14, 17], [15, 17], [16, 17], [13, 18], [14, 18], [15, 18], [16, 18], [13, 19], [14, 19], [15, 19], [16, 19]]
    ]
  },
  female: {
    idle: [
      [14, 16], [15, 16], [16, 16], [17, 16],
      [14, 17], [15, 17], [16, 17], [17, 17],
      [14, 18], [15, 18], [16, 18]
    ],
    walk: [
      // f=0: near hand forward at x=18..22, y=16..18
      [[18, 16], [19, 16], [20, 16], [18, 17], [19, 17], [20, 17], [21, 17], [22, 17], [19, 18], [20, 18], [21, 18]],
      // f=1: near hand forward at x=17..21, y=17..19
      [[17, 17], [18, 17], [19, 17], [20, 17], [18, 18], [19, 18], [20, 18], [21, 18], [19, 19], [20, 19]],
      // f=2: near hand past hip at x=14..16, y=15..17
      [[14, 15], [15, 15], [16, 15], [14, 16], [15, 16], [16, 16], [14, 17], [15, 17], [16, 17]],
      // f=3: near hand back at x=11..14, y=17..19
      [[11, 17], [12, 17], [13, 17], [14, 17], [11, 18], [12, 18], [13, 18], [14, 18], [11, 19], [12, 19], [13, 19]],
      // f=4: near hand far back at x=8..12, y=16..19
      [[9, 16], [10, 16], [11, 16], [8, 17], [9, 17], [10, 17], [11, 17], [8, 18], [9, 18], [10, 18], [11, 18], [9, 19], [10, 19], [11, 19]],
      // f=5: near hand swinging forward from back at x=10..13, y=16..19
      [[11, 16], [12, 16], [13, 16], [11, 17], [12, 17], [13, 17], [10, 18], [11, 18], [12, 18], [13, 18], [10, 19], [11, 19], [12, 19], [13, 19]],
      // f=6: near hand past hip at x=13..16, y=15..17
      [[14, 15], [15, 15], [16, 15], [13, 16], [14, 16], [15, 16], [16, 16], [14, 17], [15, 17], [16, 17]],
      // f=7: near hand forward at x=17..20, y=16..19
      [[17, 16], [18, 16], [19, 16], [17, 17], [18, 17], [19, 17], [20, 17], [17, 18], [18, 18], [19, 18], [20, 18], [18, 19], [19, 19]]
    ]
  }
};

import { CUSTOM_SPRITE_MASKS } from './custom-sprite-masks.js';
import { CUSTOM_SPRITE_OVERRIDES_DATA } from './custom-sprite-overrides.js';

export const MASK_SECTIONS = [
  { id: 'head', label: 'Head', color: '#ffd166', shortcut: '1', role: 'head', isForeground: true, desc: 'Face, hair, skull & chin' },
  { id: 'torso', label: 'Torso', color: '#f78c6c', shortcut: '2', role: 'torso', isForeground: false, desc: 'Chest, ribs & upper back' },
  { id: 'fg_sleeve', label: 'Foreground Short Sleeve', color: '#80ed99', shortcut: '3', role: 'sleeve', isForeground: false, desc: 'Near shoulder & bicep (short sleeve shirt length)' },
  { id: 'fg_arm', label: 'Foreground Forearm', color: '#06d6a0', shortcut: '4', role: 'limb', isForeground: true, desc: 'Near elbow & forearm (exposed past short sleeve)' },
  { id: 'bg_sleeve', label: 'Background Short Sleeve', color: '#2a6f97', shortcut: '5', role: 'sleeve', isForeground: false, desc: 'Far shoulder & bicep behind body' },
  { id: 'bg_arm', label: 'Background Forearm', color: '#118ab2', shortcut: '6', role: 'limb', isForeground: false, desc: 'Far elbow & forearm behind torso' },
  { id: 'fg_hand', label: 'Foreground Hand', color: '#00e5ff', shortcut: '7', role: 'hand', isForeground: true, desc: 'Near hand & fingers in front of clothes' },
  { id: 'bg_hand', label: 'Background Hand', color: '#073b4c', shortcut: '8', role: 'hand', isForeground: false, desc: 'Far hand & fingers behind body' },
  { id: 'fg_leg', label: 'Foreground Leg and waist', color: '#9d4edd', shortcut: '9', role: 'leg', isForeground: true, desc: 'Waist/pelvis, near hip & thigh (above boot)' },
  { id: 'fg_boot', label: 'Foreground Boot Length', color: '#4361ee', shortcut: '0', role: 'boot', isForeground: true, desc: 'Near knee, shin & calf (boot length)' },
  { id: 'bg_leg', label: 'Background Leg', color: '#5a189a', shortcut: '-', role: 'leg', isForeground: false, desc: 'Far thigh & pelvis behind skirt/body' },
  { id: 'bg_boot', label: 'Background Boot Length', color: '#3f37c9', shortcut: '=', role: 'boot', isForeground: false, desc: 'Far knee, shin & calf behind body (boot length)' },
  { id: 'fg_foot', label: 'Foreground Foot', color: '#ff007f', shortcut: 'o', role: 'foot', isForeground: true, desc: 'Near ankle, heel, boot sole & toe' },
  { id: 'bg_foot', label: 'Background Foot', color: '#9b1d64', shortcut: 'p', role: 'foot', isForeground: false, desc: 'Far ankle, heel, boot sole & toe' }
];

export const MASK_SECTION_COLORS = Object.fromEntries(
  MASK_SECTIONS.map((s) => [s.id, s.color])
);

const CUSTOM_MASKS_STORAGE_KEY = 'ot_custom_sprite_masks';
const CUSTOM_OVERRIDES_STORAGE_KEY = 'ot_custom_sprite_overrides';

const CUSTOM_FRAME_MASKS = new Map();
const SAVED_FRAME_MASKS = new Map();
const CUSTOM_SPRITE_OVERRIDES = new Map();

function normalizeMaskKey(gender, view, animMode, frameIndex) {
  const normGender = gender === 'female' ? 'female' : 'male';
  const normView = view === 'front' ? 'front' : 'side';
  const normAnim = animMode === 'idle' ? 'idle' : 'walk';
  const normFrame = Math.max(0, Number(frameIndex) || 0);
  return `${normGender}:${normView}:${normAnim}:${normFrame}`;
}

function cloneMaskData(val) {
  if (Array.isArray(val)) {
    return val.map(([x, y]) => [x, y]);
  }
  if (val && typeof val === 'object') {
    const obj = {};
    for (const [k, coords] of Object.entries(val)) {
      obj[k] = Array.isArray(coords) ? coords.map(([x, y]) => [x, y]) : [];
    }
    return obj;
  }
  return null;
}

function loadCustomMasksFromStorage() {
  if (CUSTOM_SPRITE_MASKS && typeof CUSTOM_SPRITE_MASKS === 'object') {
    for (const [key, coords] of Object.entries(CUSTOM_SPRITE_MASKS)) {
      const cloned = cloneMaskData(coords);
      if (cloned) {
        CUSTOM_FRAME_MASKS.set(key, cloned);
        SAVED_FRAME_MASKS.set(key, cloneMaskData(coords));
      }
    }
  }
  if (typeof localStorage === 'undefined') return;
  try {
    const raw = localStorage.getItem(CUSTOM_MASKS_STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data && typeof data === 'object') {
      for (const [key, coords] of Object.entries(data)) {
        const cloned = cloneMaskData(coords);
        if (cloned) {
          CUSTOM_FRAME_MASKS.set(key, cloned);
          if (!SAVED_FRAME_MASKS.has(key)) {
            SAVED_FRAME_MASKS.set(key, cloneMaskData(coords));
          }
        }
      }
    }
  } catch (err) {
    console.warn('Failed to parse custom sprite masks from localStorage', err);
  }
}

function saveCustomMasksToStorage() {
  if (typeof localStorage === 'undefined') return;
  try {
    const obj = {};
    for (const [k, v] of CUSTOM_FRAME_MASKS.entries()) {
      obj[k] = v;
    }
    localStorage.setItem(CUSTOM_MASKS_STORAGE_KEY, JSON.stringify(obj));
  } catch (err) {
    console.warn('Failed to save custom sprite masks to localStorage', err);
  }
}

loadCustomMasksFromStorage();

export function commitSavedMasks() {
  SAVED_FRAME_MASKS.clear();
  for (const [k, v] of CUSTOM_FRAME_MASKS.entries()) {
    SAVED_FRAME_MASKS.set(k, v.map(([x, y]) => [x, y]));
  }
}

export function getFrameSavedMask(gender, view = 'side', animMode = 'walk', frameIndex = 0, baseGrid = null) {
  const key = normalizeMaskKey(gender, view, animMode, frameIndex);
  if (SAVED_FRAME_MASKS.has(key)) {
    return SAVED_FRAME_MASKS.get(key).map(([x, y]) => [x, y]);
  }
  return getDefaultFrameMask(gender, view, animMode, frameIndex, baseGrid);
}

export function getAllCustomMasksObject() {
  const obj = {};
  for (const [k, v] of CUSTOM_FRAME_MASKS.entries()) {
    obj[k] = v;
  }
  return obj;
}

export async function saveCustomMasksToServer() {
  const payload = getAllCustomMasksObject();
  const response = await fetch('/api/dev/save-sprite-masks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error(`Server returned status ${response.status}`);
  }
  const result = await response.json();
  commitSavedMasks();
  return result;
}

function loadCustomOverridesFromStorage() {
  if (CUSTOM_SPRITE_OVERRIDES_DATA && typeof CUSTOM_SPRITE_OVERRIDES_DATA === 'object') {
    for (const [key, grid] of Object.entries(CUSTOM_SPRITE_OVERRIDES_DATA)) {
      if (Array.isArray(grid)) {
        CUSTOM_SPRITE_OVERRIDES.set(key, grid.map((row) => [...row]));
      }
    }
  }
  if (typeof localStorage === 'undefined') return;
  try {
    const raw = localStorage.getItem(CUSTOM_OVERRIDES_STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data && typeof data === 'object') {
      for (const [key, grid] of Object.entries(data)) {
        if (Array.isArray(grid)) {
          CUSTOM_SPRITE_OVERRIDES.set(key, grid.map((row) => [...row]));
        }
      }
    }
  } catch (err) {
    console.warn('Failed to parse custom sprite overrides from localStorage', err);
  }
}

function saveCustomOverridesToStorage() {
  if (typeof localStorage === 'undefined') return;
  try {
    const obj = {};
    for (const [k, v] of CUSTOM_SPRITE_OVERRIDES.entries()) {
      obj[k] = v;
    }
    localStorage.setItem(CUSTOM_OVERRIDES_STORAGE_KEY, JSON.stringify(obj));
  } catch (err) {
    console.warn('Failed to save custom sprite overrides to localStorage', err);
  }
}

loadCustomOverridesFromStorage();

export function getCustomSpriteOverride(key) {
  if (CUSTOM_SPRITE_OVERRIDES.has(key)) {
    return CUSTOM_SPRITE_OVERRIDES.get(key).map((row) => [...row]);
  }
  return null;
}

export function setCustomSpriteOverride(key, grid) {
  if (!Array.isArray(grid)) return;
  CUSTOM_SPRITE_OVERRIDES.set(key, grid.map((row) => [...row]));
  saveCustomOverridesToStorage();
}

export function resetCustomSpriteOverride(key) {
  const deleted = CUSTOM_SPRITE_OVERRIDES.delete(key);
  saveCustomOverridesToStorage();
  return deleted;
}

export function getAllCustomOverridesObject() {
  const obj = {};
  for (const [k, v] of CUSTOM_SPRITE_OVERRIDES.entries()) {
    obj[k] = v;
  }
  return obj;
}

export async function saveCustomOverridesToServer() {
  const payload = getAllCustomOverridesObject();
  const response = await fetch('/api/dev/save-sprite-overrides', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error(`Server returned status ${response.status}`);
  }
  return await response.json();
}

export function clearAllCustomOverridesAndStorage() {
  CUSTOM_SPRITE_OVERRIDES.clear();
  if (CUSTOM_SPRITE_OVERRIDES_DATA && typeof CUSTOM_SPRITE_OVERRIDES_DATA === 'object') {
    for (const [key, grid] of Object.entries(CUSTOM_SPRITE_OVERRIDES_DATA)) {
      if (Array.isArray(grid)) {
        CUSTOM_SPRITE_OVERRIDES.set(key, grid.map((row) => [...row]));
      }
    }
  }
  CUSTOM_FRAME_MASKS.clear();
  SAVED_FRAME_MASKS.clear();
  if (CUSTOM_SPRITE_MASKS && typeof CUSTOM_SPRITE_MASKS === 'object') {
    for (const [key, coords] of Object.entries(CUSTOM_SPRITE_MASKS)) {
      if (Array.isArray(coords)) {
        CUSTOM_FRAME_MASKS.set(key, coords.map(([x, y]) => [x, y]));
        SAVED_FRAME_MASKS.set(key, coords.map(([x, y]) => [x, y]));
      }
    }
  }
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(CUSTOM_OVERRIDES_STORAGE_KEY);
      localStorage.removeItem(CUSTOM_MASKS_STORAGE_KEY);
    } catch (err) {
      console.warn('Failed to clear cached overrides from localStorage', err);
    }
  }
  clearAllCustomClothingStorage();
}

export function hasCachedOptions() {
  if (typeof localStorage === 'undefined') return false;
  try {
    return Boolean(
      localStorage.getItem(CUSTOM_OVERRIDES_STORAGE_KEY) ||
      localStorage.getItem(CUSTOM_MASKS_STORAGE_KEY) ||
      localStorage.getItem('ot_custom_clothing_items') ||
      localStorage.getItem('ot_clothing_name_overrides')
    );
  } catch {
    return false;
  }
}

export function getClothingItemDefaultGrid(category, presetId, gender = 'male', baseOrientation = 'side', dyeId = 'default', animMode = 'walk', frameIndex = 0) {
  const preset = (INITIAL_CLOTHING_BOILERPLATE[category] || []).find((p) => p.id === presetId);
  if (!preset || preset.isNone) return createEmptyGrid();
  const grid = createEmptyGrid();
  const baseGrid = getBaseBoilerplateGrid(gender, baseOrientation, animMode, frameIndex) || createEmptyGrid();
  const frameInfo = analyzeBoilerplateFrame(baseGrid, gender, baseOrientation, animMode, frameIndex);
  const palette = resolveGarmentPalette(preset, dyeId);
  if (category === 'pants') {
    renderFittedPantsOrSkirt(grid, baseGrid, frameInfo, preset, palette, false);
  } else if (category === 'shoes') {
    renderFittedShoes(grid, baseGrid, frameInfo, preset, palette);
  } else if (category === 'shirts') {
    renderFittedShirt(grid, baseGrid, frameInfo, preset, palette);
  } else if (category === 'accessories') {
    renderFittedAccessory(grid, baseGrid, frameInfo, preset, palette);
  } else if (category === 'hats') {
    renderFittedHeadwear(grid, baseGrid, frameInfo, preset, palette);
  }
  return grid;
}

export function getBaseSpriteGrid(gender, direction = 'east', animMode = 'walk', frameIndex = 0) {
  const normGender = gender === 'female' ? 'female' : 'male';
  const normDir = direction === 'south' || direction === 'front' ? 'south' : 'east';
  const effectiveMode = (normDir === 'south' && normGender === 'male') ? 'idle' : animMode;
  const frameCount = getBoilerplateSpriteFrameCount(normGender, effectiveMode) || 1;
  const frame = (((Number(frameIndex) || 0) % frameCount) + frameCount) % frameCount;

  const frameSpecificKey = `base:${normGender}:${normDir}:${effectiveMode}:${frame}`;
  const universalKey = `base:${normGender}:${normDir}`;

  const custom = CUSTOM_SPRITE_OVERRIDES.get(frameSpecificKey) || CUSTOM_SPRITE_OVERRIDES.get(universalKey);
  if (custom) return custom.map((r) => [...r]);

  return getBoilerplateSpriteGrid(normGender, normDir, effectiveMode, frame);
}

export function getBaseBoilerplateGrid(gender, view = 'side', animMode = 'walk', frameIndex = 0, skinToneId = null) {
  const normGender = gender === 'female' ? 'female' : 'male';
  const isFront = view === 'front';
  const dir = isFront ? 'south' : 'east';
  const raw = getBaseSpriteGrid(normGender, dir, animMode, frameIndex);
  if (!raw) return null;
  const oriented = ((view === 'side_left' || view === 'west') && !isFront)
    ? raw.map((row) => [...row].reverse())
    : raw;
  if (skinToneId) {
    return applySkinToneToSpriteGrid(oriented, skinToneId, normGender);
  }
  return oriented;
}

export function getDefaultFrameMask(gender, view = 'side', animMode = 'walk', frameIndex = 0, baseGrid = null) {
  const normGender = gender === 'female' ? 'female' : 'male';
  const normView = view === 'front' ? 'front' : 'side';
  const normAnim = animMode === 'idle' ? 'idle' : 'walk';
  const normFrame = Math.max(0, Number(frameIndex) || 0);

  if (normView === 'side') {
    const contours = normAnim === 'walk'
      ? SIDE_NEAR_HAND_CONTOURS[normGender]?.walk?.[normFrame % 8] || []
      : SIDE_NEAR_HAND_CONTOURS[normGender]?.idle || [];
    return contours.map(([x, y]) => [x, y]);
  }

  // Front view heuristic: hands swinging beside/over hips at x <= 11 and x >= 19 for y=15..19
  const grid = baseGrid || getBaseBoilerplateGrid(normGender, 'front', normAnim, normFrame);
  const coords = [];
  for (let y = 15; y <= 19; y++) {
    for (const x of [8, 9, 10, 11, 19, 20, 21, 22]) {
      if (grid && grid[y]?.[x]) {
        coords.push([x, y]);
      }
    }
  }
  return coords;
}

export function getStridingLegFootMask(gender, view = 'side', animMode = 'walk', frameIndex = 0, baseGrid = null) {
  const normGender = gender === 'female' ? 'female' : 'male';
  const normView = view === 'front' ? 'front' : 'side';
  const normAnim = animMode === 'idle' ? 'idle' : 'walk';
  const normFrame = Math.max(0, Number(frameIndex) || 0);
  const grid = baseGrid || getBaseBoilerplateGrid(normGender, normView, normAnim, normFrame);
  if (!grid) return [];

  const coords = [];
  if (normView === 'side') {
    const frameInfo = analyzeBoilerplateFrame(grid, normGender, 'side', normAnim, normFrame);
    for (let y = 20; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (!grid[y]?.[x]) continue;
        const limb = frameInfo.sideLimb?.[y]?.[x];
        if (limb === 'N') {
          coords.push([x, y]);
        }
      }
    }
  } else {
    for (let y = 22; y < GRID_SIZE; y++) {
      for (let x = 8; x <= 23; x++) {
        if (grid[y]?.[x]) {
          coords.push([x, y]);
        }
      }
    }
  }
  return coords;
}

export function getAllForegroundLimbsMask(gender, view = 'side', animMode = 'walk', frameIndex = 0, baseGrid = null) {
  const handCoords = getDefaultFrameMask(gender, view, animMode, frameIndex, baseGrid);
  const legCoords = getStridingLegFootMask(gender, view, animMode, frameIndex, baseGrid);
  const coordSet = new Set(handCoords.map(([x, y]) => `${x},${y}`));
  for (const [x, y] of legCoords) {
    coordSet.add(`${x},${y}`);
  }
  return Array.from(coordSet).map((k) => k.split(',').map(Number));
}

export function getTorsoWaistMask(gender, view = 'side', animMode = 'walk', frameIndex = 0, baseGrid = null) {
  const normGender = gender === 'female' ? 'female' : 'male';
  const normView = view === 'front' ? 'front' : 'side';
  const normAnim = animMode === 'idle' ? 'idle' : 'walk';
  const normFrame = Math.max(0, Number(frameIndex) || 0);
  const grid = baseGrid || getBaseBoilerplateGrid(normGender, normView, normAnim, normFrame);
  if (!grid) return [];

  const coords = [];
  const minX = normView === 'side' ? 12 : 11;
  const maxX = normView === 'side' ? 20 : 20;
  for (let y = 14; y <= 19; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (grid[y]?.[x]) coords.push([x, y]);
    }
  }
  return coords;
}

export function getHeadBeardHairMask(gender, view = 'side', animMode = 'walk', frameIndex = 0, baseGrid = null) {
  const normGender = gender === 'female' ? 'female' : 'male';
  const normView = view === 'front' ? 'front' : 'side';
  const normAnim = animMode === 'idle' ? 'idle' : 'walk';
  const normFrame = Math.max(0, Number(frameIndex) || 0);
  const grid = baseGrid || getBaseBoilerplateGrid(normGender, normView, normAnim, normFrame);
  if (!grid) return [];

  const coords = [];
  const minX = normView === 'side' ? 10 : 10;
  const maxX = normView === 'side' ? 22 : 21;
  for (let y = 5; y <= 13; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (grid[y]?.[x]) coords.push([x, y]);
    }
  }
  return coords;
}

export function sectionGridToMap(grid) {
  const map = {};
  for (const s of MASK_SECTIONS) map[s.id] = [];
  if (Array.isArray(grid)) {
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const id = grid[y]?.[x];
        if (id && map[id]) {
          map[id].push([x, y]);
        }
      }
    }
  }
  return map;
}

export function sectionMapToGrid(map) {
  const grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
  if (map && typeof map === 'object') {
    for (const [sectionId, coords] of Object.entries(map)) {
      if (Array.isArray(coords)) {
        for (const [x, y] of coords) {
          if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
            grid[y][x] = sectionId;
          }
        }
      }
    }
  }
  return grid;
}

export function getAutoDetectedSectionMap(gender, view = 'side', animMode = 'walk', frameIndex = 0, baseGrid = null) {
  const normGender = gender === 'female' ? 'female' : 'male';
  const normView = view === 'front' ? 'front' : 'side';
  const normAnim = animMode === 'idle' ? 'idle' : 'walk';
  const normFrame = Math.max(0, Number(frameIndex) || 0);
  const grid = baseGrid || getBaseBoilerplateGrid(normGender, normView, normAnim, normFrame);
  if (!grid) return {};

  const frameInfo = analyzeBoilerplateFrame(grid, normGender, normView, normAnim, normFrame, true);
  const { headDy, sideLimb, footBottomY, nearHandMask } = frameInfo;
  const sectionGrid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));

  const poseKey = `frame${normFrame % 6}`;
  const legPoseRows = (normView === 'side' && normAnim === 'walk') ? SIDE_LEG_POSE_MAPS[poseKey] : null;
  const armPose = (normView === 'side' && normAnim === 'walk') ? SIDE_ARM_POSE_MAPS[poseKey] : null;

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const c = grid[y]?.[x];
      if (!c) continue;

      if (y <= 8 + headDy) {
        sectionGrid[y][x] = 'head';
      } else if (y >= 17 + headDy) {
        if (y <= 18 + headDy) {
          sectionGrid[y][x] = 'fg_leg'; // Foreground Leg and waist
        } else if (normView === 'side') {
          let isFar = false;
          let isFoot = y >= 27;
          let isBoot = y >= 23 && y <= 26;
          if (legPoseRows && y >= 19 && y < 19 + legPoseRows.length) {
            const ch = legPoseRows[y - 19]?.[x];
            if (ch && ch !== '.') {
              isFar = ch === ch.toLowerCase();
              if ('UWD'.includes(ch.toUpperCase()) || y >= 27) {
                isFoot = true;
                isBoot = false;
              } else if (y >= 23) {
                isBoot = true;
              }
            } else {
              const limb = sideLimb?.[y]?.[x] || (isSpriteFarLimb(c, y, headDy) ? 'F' : 'N');
              isFar = limb === 'F';
            }
          } else {
            const limb = sideLimb?.[y]?.[x] || (isSpriteFarLimb(c, y, headDy) ? 'F' : 'N');
            isFar = limb === 'F';
          }
          if (isFar) {
            sectionGrid[y][x] = isFoot ? 'bg_foot' : (isBoot ? 'bg_boot' : 'bg_leg');
          } else {
            sectionGrid[y][x] = isFoot ? 'fg_foot' : (isBoot ? 'fg_boot' : 'fg_leg');
          }
        } else {
          // Front view: left vs right leg
          const isFoot = y >= 27;
          const isBoot = y >= 23 && y <= 26;
          if (x <= 14) {
            sectionGrid[y][x] = isFoot ? 'fg_foot' : (isBoot ? 'fg_boot' : 'fg_leg');
          } else if (x >= 17) {
            sectionGrid[y][x] = isFoot ? 'bg_foot' : (isBoot ? 'bg_boot' : 'bg_leg');
          } else {
            sectionGrid[y][x] = isFoot ? 'fg_foot' : (isBoot ? 'fg_boot' : 'fg_leg');
          }
        }
      } else {
        // y between 9 + headDy and 16 + headDy
        if (normView === 'side') {
          const isNearHand = nearHandMask?.has(`${x},${y}`);
          const isFarLimbColor = isSpriteFarLimb(c, y, headDy);
          let isFarArm = false;
          let isNearArm = false;
          if (armPose) {
            const nearRows = armPose.near || [];
            if (y >= 11 && y < 11 + nearRows.length && nearRows[y - 11]?.[x] && nearRows[y - 11][x] !== '.') {
              isNearArm = true;
            }
            const farRows = armPose.far || [];
            if (y >= 11 && y < 11 + farRows.length && farRows[y - 11]?.[x] && farRows[y - 11][x] !== '.') {
              isFarArm = true;
            }
          }

          const isSleeveHeight = y <= 13 + headDy;

          if (isNearHand || isNearArm) {
            if (isSleeveHeight) {
              sectionGrid[y][x] = 'fg_sleeve';
            } else if (y >= 16 + headDy && isNearHand) {
              sectionGrid[y][x] = 'fg_hand';
            } else {
              sectionGrid[y][x] = 'fg_arm';
            }
          } else if (isFarArm || isFarLimbColor || (x >= 19 && y >= 14 + headDy)) {
            if (isSleeveHeight) {
              sectionGrid[y][x] = 'bg_sleeve';
            } else if (y >= 16 + headDy) {
              sectionGrid[y][x] = 'bg_hand';
            } else {
              sectionGrid[y][x] = 'bg_arm';
            }
          } else if (x <= 11) {
            if (isSleeveHeight) {
              sectionGrid[y][x] = 'fg_sleeve';
            } else {
              sectionGrid[y][x] = (y >= 16 + headDy) ? 'fg_hand' : 'fg_arm';
            }
          } else {
            sectionGrid[y][x] = 'torso';
          }
        } else {
          // Front view
          const isSleeveHeight = y <= 13 + headDy;
          if (x <= 10) {
            if (isSleeveHeight) {
              sectionGrid[y][x] = 'fg_sleeve';
            } else {
              sectionGrid[y][x] = (y >= 16 + headDy) ? 'fg_hand' : 'fg_arm';
            }
          } else if (x >= 21) {
            if (isSleeveHeight) {
              sectionGrid[y][x] = 'bg_sleeve';
            } else {
              sectionGrid[y][x] = (y >= 16 + headDy) ? 'bg_hand' : 'bg_arm';
            }
          } else {
            sectionGrid[y][x] = 'torso';
          }
        }
      }
    }
  }

  return sectionGridToMap(sectionGrid);
}

export function getFrameSectionMap(gender, view = 'side', animMode = 'walk', frameIndex = 0, baseGrid = null) {
  const key = normalizeMaskKey(gender, view, animMode, frameIndex);
  const custom = CUSTOM_FRAME_MASKS.get(key);
  if (custom && typeof custom === 'object' && !Array.isArray(custom)) {
    const auto = getAutoDetectedSectionMap(gender, view, animMode, frameIndex, baseGrid);
    const merged = {};

    // Backward-compatibility: if custom has fg_arm but not fg_sleeve, partition fg_arm at y <= 13
    let customFgArm = custom.fg_arm;
    let customFgSleeve = custom.fg_sleeve;
    if (Array.isArray(customFgArm) && !customFgSleeve) {
      customFgSleeve = customFgArm.filter(([x, y]) => y <= 13);
      customFgArm = customFgArm.filter(([x, y]) => y >= 14);
    }

    let customBgArm = custom.bg_arm;
    let customBgSleeve = custom.bg_sleeve;
    if (Array.isArray(customBgArm) && !customBgSleeve) {
      customBgSleeve = customBgArm.filter(([x, y]) => y <= 13);
      customBgArm = customBgArm.filter(([x, y]) => y >= 14);
    }

    let customFgLeg = custom.fg_leg;
    let customFgBoot = custom.fg_boot;
    if (Array.isArray(customFgLeg) && !customFgBoot) {
      customFgBoot = customFgLeg.filter(([x, y]) => y >= 23);
      customFgLeg = customFgLeg.filter(([x, y]) => y <= 22);
    }

    let customBgLeg = custom.bg_leg;
    let customBgBoot = custom.bg_boot;
    if (Array.isArray(customBgLeg) && !customBgBoot) {
      customBgBoot = customBgLeg.filter(([x, y]) => y >= 23);
      customBgLeg = customBgLeg.filter(([x, y]) => y <= 22);
    }

    const resolved = {
      ...custom,
      fg_arm: customFgArm,
      fg_sleeve: customFgSleeve,
      bg_arm: customBgArm,
      bg_sleeve: customBgSleeve,
      fg_leg: customFgLeg,
      fg_boot: customFgBoot,
      bg_leg: customBgLeg,
      bg_boot: customBgBoot
    };

    for (const s of MASK_SECTIONS) {
      merged[s.id] = Array.isArray(resolved[s.id])
        ? resolved[s.id].map(([x, y]) => [x, y])
        : (auto[s.id] || []);
    }
    return merged;
  }
  if (Array.isArray(custom)) {
    const auto = getAutoDetectedSectionMap(gender, view, animMode, frameIndex, baseGrid);
    auto.fg_hand = custom.map(([x, y]) => [x, y]);
    return auto;
  }
  return getAutoDetectedSectionMap(gender, view, animMode, frameIndex, baseGrid);
}

export function setFrameSectionMap(gender, view = 'side', animMode = 'walk', frameIndex = 0, sectionMap = {}) {
  const key = normalizeMaskKey(gender, view, animMode, frameIndex);
  const cleaned = {};
  for (const s of MASK_SECTIONS) {
    const coords = sectionMap[s.id];
    cleaned[s.id] = (Array.isArray(coords) ? coords : [])
      .filter(([x, y]) => Number.isInteger(x) && Number.isInteger(y) && x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE)
      .map(([x, y]) => [x, y]);
  }
  CUSTOM_FRAME_MASKS.set(key, cleaned);
  saveCustomMasksToStorage();
}

export function getFrameCustomMask(gender, view = 'side', animMode = 'walk', frameIndex = 0) {
  const key = normalizeMaskKey(gender, view, animMode, frameIndex);
  if (CUSTOM_FRAME_MASKS.has(key)) {
    const val = CUSTOM_FRAME_MASKS.get(key);
    if (Array.isArray(val)) {
      return val.map(([x, y]) => [x, y]);
    }
    if (val && typeof val === 'object') {
      const fgCoords = [];
      for (const k of ['fg_hand', 'fg_arm']) {
        if (Array.isArray(val[k])) fgCoords.push(...val[k]);
      }
      return fgCoords;
    }
  }
  return null;
}

export function getFrameActiveMask(gender, view = 'side', animMode = 'walk', frameIndex = 0, baseGrid = null) {
  const custom = getFrameCustomMask(gender, view, animMode, frameIndex);
  if (custom !== null) return custom;
  return getDefaultFrameMask(gender, view, animMode, frameIndex, baseGrid);
}

export function setFrameCustomMask(gender, view = 'side', animMode = 'walk', frameIndex = 0, coords = []) {
  const key = normalizeMaskKey(gender, view, animMode, frameIndex);
  if (coords && typeof coords === 'object' && !Array.isArray(coords)) {
    setFrameSectionMap(gender, view, animMode, frameIndex, coords);
    return;
  }
  const cleaned = (coords || [])
    .filter(([x, y]) => Number.isInteger(x) && Number.isInteger(y) && x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE)
    .map(([x, y]) => [x, y]);
  CUSTOM_FRAME_MASKS.set(key, cleaned);
  saveCustomMasksToStorage();
}

export function resetFrameCustomMask(gender, view = 'side', animMode = 'walk', frameIndex = 0) {
  const key = normalizeMaskKey(gender, view, animMode, frameIndex);
  const deleted = CUSTOM_FRAME_MASKS.delete(key);
  saveCustomMasksToStorage();
  return deleted;
}

export function resetAllCustomMasks() {
  CUSTOM_FRAME_MASKS.clear();
  saveCustomMasksToStorage();
}

export function exportAllMaskOverrides() {
  const obj = {};
  for (const [k, v] of CUSTOM_FRAME_MASKS.entries()) {
    obj[k] = v;
  }
  return JSON.stringify(obj, null, 2);
}

export function importMaskOverrides(jsonOrObj) {
  const data = typeof jsonOrObj === 'string' ? JSON.parse(jsonOrObj) : jsonOrObj;
  if (!data || typeof data !== 'object') return false;
  for (const [k, val] of Object.entries(data)) {
    if (Array.isArray(val)) {
      const cleaned = val
        .filter(([x, y]) => Number.isInteger(x) && Number.isInteger(y) && x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE)
        .map(([x, y]) => [x, y]);
      CUSTOM_FRAME_MASKS.set(k, cleaned);
    } else if (val && typeof val === 'object') {
      const cleanedObj = {};
      for (const [secId, coords] of Object.entries(val)) {
        if (Array.isArray(coords)) {
          cleanedObj[secId] = coords
            .filter(([x, y]) => Number.isInteger(x) && Number.isInteger(y) && x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE)
            .map(([x, y]) => [x, y]);
        }
      }
      CUSTOM_FRAME_MASKS.set(k, cleanedObj);
    }
  }
  saveCustomMasksToStorage();
  return true;
}

export function analyzeBoilerplateFrame(baseGrid, gender, baseOrientation, animMode = "idle", frameIndex = 0, skipSectionMap = false) {
  let headTopY = 1;
  for (let y = 0; y < GRID_SIZE; y += 1) {
    if (baseGrid[y]?.some(Boolean)) {
      headTopY = y;
      break;
    }
  }
  const headDy = headTopY - 1;

  let crownMinX = 14;
  let crownMaxX = 17;
  if (baseGrid[headTopY]) {
    let minX = GRID_SIZE;
    let maxX = -1;
    for (let x = 0; x < GRID_SIZE; x += 1) {
      if (baseGrid[headTopY][x]) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
      }
    }
    if (maxX >= minX) {
      crownMinX = minX;
      crownMaxX = maxX;
    }
  }

  const headDx = baseOrientation === 'side' ? crownMinX - 14 : 0;

  let leftFootMaxY = 30;
  let rightFootMaxY = 30;
  if (baseOrientation === 'front') {
    let lMax = -1;
    let rMax = -1;
    for (let y = 22; y < GRID_SIZE; y += 1) {
      for (let x = 8; x <= 14; x += 1) {
        if (baseGrid[y]?.[x]) lMax = Math.max(lMax, y);
      }
      for (let x = 16; x <= 23; x += 1) {
        if (baseGrid[y]?.[x]) rMax = Math.max(rMax, y);
      }
    }
    if (lMax >= 24) leftFootMaxY = lMax;
    if (rMax >= 24) rightFootMaxY = rMax;
  }

  const sideLimb = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
  const footBottomY = {
    N: Array(GRID_SIZE).fill(-1),
    F: Array(GRID_SIZE).fill(-1)
  };

  if (baseOrientation === 'side') {
    for (let y = Math.max(0, 15 + headDy); y < GRID_SIZE; y += 1) {
      for (let x = 0; x < GRID_SIZE; x += 1) {
        const c = baseGrid[y]?.[x];
        if (!c || isSpriteOutline(c)) continue;
        sideLimb[y][x] = isSpriteFarLimb(c, y, headDy) ? 'F' : 'N';
      }
    }
    for (let pass = 0; pass < 3; pass += 1) {
      for (let y = Math.max(0, 15 + headDy); y < GRID_SIZE; y += 1) {
        for (let x = 0; x < GRID_SIZE; x += 1) {
          if (!baseGrid[y]?.[x] || sideLimb[y][x]) continue;
          let hasN = false;
          let hasF = false;
          for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]]) {
            const neighbor = sideLimb[y + dy]?.[x + dx];
            if (neighbor === 'N') hasN = true;
            if (neighbor === 'F') hasF = true;
          }
          if (hasN) sideLimb[y][x] = 'N';
          else if (hasF) sideLimb[y][x] = 'F';
        }
      }
    }

    for (const limbKey of ['N', 'F']) {
      for (let x = 0; x < GRID_SIZE; x += 1) {
        for (let y = 20; y < GRID_SIZE; y += 1) {
          if (sideLimb[y][x] === limbKey) {
            footBottomY[limbKey][x] = Math.max(footBottomY[limbKey][x], y);
          }
        }
      }
      for (let pass = 0; pass < 4; pass += 1) {
        const next = [...footBottomY[limbKey]];
        for (let x = 1; x < GRID_SIZE - 1; x += 1) {
          if (next[x] < 20) continue;
          if (footBottomY[limbKey][x - 1] >= 20) next[x] = Math.max(next[x], footBottomY[limbKey][x - 1]);
          if (footBottomY[limbKey][x + 1] >= 20) next[x] = Math.max(next[x], footBottomY[limbKey][x + 1]);
        }
        footBottomY[limbKey] = next;
      }
    }
  }

  const nearHandCoords = getFrameActiveMask(gender, baseOrientation, animMode, frameIndex, baseGrid);

  const nearHandMask = new Set();
  const nearHandPixels = [];
  for (const [hx, hy] of nearHandCoords) {
    if (hx >= 0 && hx < GRID_SIZE && hy >= 0 && hy < GRID_SIZE && baseGrid[hy]?.[hx]) {
      nearHandMask.add(`${hx},${hy}`);
      nearHandPixels.push({ x: hx, y: hy, color: baseGrid[hy][hx] });
    }
  }

  let sectionMap = null;
  let sectionGrid = null;
  if (!skipSectionMap) {
    sectionMap = getFrameSectionMap(gender, baseOrientation, animMode, frameIndex, baseGrid);
    sectionGrid = sectionMapToGrid(sectionMap);
  }

  return {
    gender,
    baseOrientation,
    headTopY,
    headDy,
    headDx,
    crownMinX,
    crownMaxX,
    leftFootMaxY,
    rightFootMaxY,
    sideLimb,
    footBottomY,
    nearHandMask,
    nearHandPixels,
    foregroundZMask: nearHandMask,
    foregroundZPixels: nearHandPixels,
    sectionMap,
    sectionGrid
  };
}

function getFrontLegSideAndMaxY(baseGrid, frameInfo, x, y) {
  if (x <= 14) return { side: 'left', footMaxY: frameInfo.leftFootMaxY };
  if (x >= 16) return { side: 'right', footMaxY: frameInfo.rightFootMaxY };
  // x === 15 (center column on female front walk)
  const hasLeft = Boolean(baseGrid[y]?.[14]);
  const hasRight = Boolean(baseGrid[y]?.[16]);
  if (hasLeft && !hasRight) return { side: 'left', footMaxY: frameInfo.leftFootMaxY };
  if (hasRight && !hasLeft) return { side: 'right', footMaxY: frameInfo.rightFootMaxY };
  return frameInfo.leftFootMaxY >= frameInfo.rightFootMaxY
    ? { side: 'left', footMaxY: frameInfo.leftFootMaxY }
    : { side: 'right', footMaxY: frameInfo.rightFootMaxY };
}

function getContiguousSegmentBounds(baseGrid, y, startX, minX = 0, maxX = GRID_SIZE - 1) {
  let segMin = startX;
  let segMax = startX;
  while (segMin > minX && baseGrid[y]?.[segMin - 1]) segMin -= 1;
  while (segMax < maxX && baseGrid[y]?.[segMax + 1]) segMax += 1;
  return { segMin, segMax };
}

function renderFittedPantsOrSkirt(target, baseGrid, frameInfo, preset, palette, hasShoes) {
  const { gender, baseOrientation, headDy, leftFootMaxY, rightFootMaxY, sideLimb, footBottomY } = frameInfo;
  const { O, P, S, L, farO, farP, farS, farL } = palette;
  const pat = preset.patternId || 'trousersJeans';

  if (isSkirtPreset(preset)) {
    const isShort = isShortSkirtPreset(preset);
    const skirtTopY = 16 + headDy;
    const skirtBottomY = (isShort ? 22 : 26) + headDy;
    const H = skirtBottomY - skirtTopY + 1;

    if (baseOrientation === 'front') {
      const hipMinX = 11;
      const hipMaxX = gender === 'female' ? 19 : 20;
      const stepSway = leftFootMaxY > rightFootMaxY ? -1 : rightFootMaxY > leftFootMaxY ? 1 : 0;

      for (let y = skirtTopY; y <= skirtBottomY; y += 1) {
        if (y < 0 || y >= GRID_SIZE) continue;
        const ry = y - skirtTopY;
        let rowLeft = hipMinX;
        let rowRight = hipMaxX;
        if (ry >= 4 && ry <= 6) {
          rowLeft = hipMinX - 1;
          rowRight = hipMaxX + 1;
        } else if (ry >= 7) {
          const sway = ry >= 9 ? stepSway : 0;
          rowLeft = hipMinX - 2 + Math.min(0, sway);
          rowRight = hipMaxX + 2 + Math.max(0, sway);
        }

        for (let x = rowLeft; x <= rowRight; x += 1) {
          if (x < 0 || x >= GRID_SIZE) continue;
          if (frameInfo.nearHandMask?.has(`${x},${y}`)) continue;
          if (ry === 0 || ry === H - 1 || x === rowLeft || x === rowRight) {
            target[y][x] = O;
          } else if ((isShort && ry === H - 2) || (!isShort && (ry === 5 || ry === H - 2))) {
            target[y][x] = (x - rowLeft) % 3 === 1 ? L : S;
          } else if (x <= rowLeft + 2 || x === 15) {
            target[y][x] = L;
          } else if (x >= rowRight - 2) {
            target[y][x] = S;
          } else {
            target[y][x] = P;
          }
        }
      }

      if (!isShort) {
        for (let y = skirtBottomY + 1; y < GRID_SIZE; y += 1) {
          for (let x = 8; x <= 23; x += 1) {
            if (!baseGrid[y]?.[x]) continue;
            if (frameInfo.nearHandMask?.has(`${x},${y}`)) continue;
            const { footMaxY } = getFrontLegSideAndMaxY(baseGrid, frameInfo, x, y);
            const shoeH = hasShoes ? 3 : 0;
            if (footMaxY - y >= shoeH) {
              target[y][x] = isSpriteOutline(baseGrid[y][x]) ? O : S;
            }
          }
        }
      }
      return;
    }

    // Side view skirt: keep a graceful, consistent bell width anchored to the hip/pelvis
    // rather than stretching out to the tips of the striding feet.
    const skirtFixedBottomY = isShort ? (22 + headDy) : 26;
    const effectiveH = skirtFixedBottomY - skirtTopY + 1;
    const centerHipX = 15.5 + (frameInfo.headDx > 0 ? 0.5 : 0);
    let hemLeft = 10;
    let hemRight = 21;

    for (let y = skirtTopY; y <= skirtFixedBottomY; y += 1) {
      if (y < 0 || y >= GRID_SIZE) continue;
      const ry = y - skirtTopY;
      const t = effectiveH > 1 ? ry / (effectiveH - 1) : 0;
      const halfWidth = 2.5 + t * (isShort ? 2.0 : 3.2);
      const rowLeft = Math.round(centerHipX - halfWidth);
      const rowRight = Math.round(centerHipX + halfWidth);
      hemLeft = rowLeft;
      hemRight = rowRight;

      // Clear any stray bare thigh pixels of the base sprite that poke outside the skirt bell (thighs only, never feet/legs y >= 24!)
      if (!isShort && ry >= 3 && y < 24) {
        for (let x = 5; x < rowLeft; x += 1) {
          if (frameInfo.nearHandMask?.has(`${x},${y}`)) continue;
          if (baseGrid[y]?.[x]) target[y][x] = null;
        }
        for (let x = rowRight + 1; x <= 26; x += 1) {
          if (frameInfo.nearHandMask?.has(`${x},${y}`)) continue;
          if (baseGrid[y]?.[x]) target[y][x] = null;
        }
      }

      for (let x = rowLeft; x <= rowRight; x += 1) {
        if (x < 0 || x >= GRID_SIZE) continue;
        if (frameInfo.nearHandMask?.has(`${x},${y}`)) continue;
        if (ry === 0 || ry === effectiveH - 1 || x === rowLeft || x === rowRight) {
          target[y][x] = O;
        } else if ((isShort && ry === effectiveH - 2) || (!isShort && (ry === 5 || ry === effectiveH - 2))) {
          target[y][x] = (x - rowLeft) % 3 === 1 ? L : S;
        } else if (x <= rowLeft + 2) {
          target[y][x] = S;
        } else if (x >= rowRight - 2) {
          target[y][x] = L;
        } else {
          target[y][x] = P;
        }
      }
    }

    if (!isShort) {
      for (let y = skirtFixedBottomY + 1; y < GRID_SIZE; y += 1) {
        for (let x = 5; x <= 26; x += 1) {
          if (!baseGrid[y]?.[x]) continue;
          if (frameInfo.nearHandMask?.has(`${x},${y}`)) continue;
          const limb = sideLimb[y][x] || 'N';
          const fMax = footBottomY[limb][x] >= 24 ? footBottomY[limb][x] : 29;
          const shoeH = hasShoes ? 3 : 0;
          if (fMax - y >= shoeH) {
            target[y][x] = isSpriteOutline(baseGrid[y][x]) ? O : (limb === 'F' ? farS : S);
          } else if (x === hemLeft || x === hemRight) {
            target[y][x] = O;
          }
        }
      }
    }
    return;
  }

  // Trousers, Jeans, Dungarees, Breeches/Shorts
  if (frameInfo.sectionGrid && !isSkirtPreset(preset)) {
    const isShortPant = pat === 'breechesShorts';
    for (let y = 0; y < GRID_SIZE; y += 1) {
      for (let x = 0; x < GRID_SIZE; x += 1) {
        if (frameInfo.nearHandMask?.has(`${x},${y}`)) continue;
        const c = baseGrid[y]?.[x];
        if (!c) continue;
        const sec = frameInfo.sectionGrid[y]?.[x];
        if (!sec) continue;

        const isFgLeg = sec === 'fg_leg' || (!isShortPant && sec === 'fg_boot');
        const isBgLeg = sec === 'bg_leg' || (!isShortPant && sec === 'bg_boot');

        if (!isFgLeg && !isBgLeg) continue;

        const isFar = isBgLeg;
        const curO = isFar ? farO : O;
        const curP = isFar ? farP : P;
        const curS = isFar ? farS : S;
        const curL = isFar ? farL : L;

        const isWaistband = sec === 'fg_leg' && (!baseGrid[y - 1]?.[x] || frameInfo.sectionGrid[y - 1]?.[x] === 'torso');
        const isBoundary =
          isSpriteOutline(c) ||
          !baseGrid[y - 1]?.[x] ||
          !baseGrid[y + 1]?.[x] ||
          !baseGrid[y]?.[x - 1] ||
          !baseGrid[y]?.[x + 1] ||
          isWaistband;

        if (isBoundary) {
          target[y][x] = curO;
        } else if (baseOrientation === 'side') {
          const isFront = !baseGrid[y]?.[x + 1] || (frameInfo.sectionGrid[y]?.[x + 1] !== sec);
          const isBack = !baseGrid[y]?.[x - 1] || (frameInfo.sectionGrid[y]?.[x - 1] !== sec);
          if (isFront) {
            target[y][x] = curL;
          } else if (isBack) {
            target[y][x] = curS;
          } else {
            target[y][x] = curP;
          }
        } else {
          target[y][x] = x <= 15 ? curL : curP;
        }
      }
    }
    return;
  }

  const isShortPant = pat === 'breechesShorts';
  const minDistFromFoot = isShortPant ? 5 : (hasShoes ? 2 : 3);
  const pelvisTopY = 16 + headDy;
  const pelvisBottomY = 19 + headDy;

  if (baseOrientation === 'front') {
    const pelvisMinX = 11;
    const pelvisMaxX = gender === 'female' ? 19 : 20;

    for (let y = pelvisTopY; y <= pelvisBottomY; y += 1) {
      if (y < 0 || y >= GRID_SIZE) continue;
      for (let x = pelvisMinX; x <= pelvisMaxX; x += 1) {
        if (frameInfo.nearHandMask?.has(`${x},${y}`)) continue;
        const c = baseGrid[y]?.[x];
        if (!c) continue;
        const isEdge = x === pelvisMinX || x === pelvisMaxX || !baseGrid[y]?.[x - 1] || !baseGrid[y]?.[x + 1];
        if (y === pelvisTopY || isEdge || isSpriteOutline(c)) {
          target[y][x] = O;
        } else if (y === pelvisBottomY && (x === 15 || (gender === 'male' && x === 16))) {
          target[y][x] = O;
        } else if (x <= pelvisMinX + 2) {
          target[y][x] = L;
        } else if (x >= pelvisMaxX - 2) {
          target[y][x] = S;
        } else {
          target[y][x] = P;
        }
      }
    }

    for (let y = pelvisBottomY + 1; y < GRID_SIZE; y += 1) {
      for (let x = 8; x <= 23; x += 1) {
        const c = baseGrid[y]?.[x];
        if (!c) continue;
        const { side, footMaxY } = getFrontLegSideAndMaxY(baseGrid, frameInfo, x, y);
        const dist = footMaxY - y;
        if (dist < minDistFromFoot) continue;

        const subMin = side === 'left' ? 8 : (gender === 'female' ? 15 : 16);
        const subMax = side === 'left' ? 15 : 23;
        const { segMin, segMax } = getContiguousSegmentBounds(baseGrid, y, x, subMin, subMax);

        if (x === segMin || x === segMax || isSpriteOutline(c)) {
          target[y][x] = O;
        } else if (dist === minDistFromFoot) {
          target[y][x] = pat === 'bellBottomsBaggy' ? L : S;
        } else if (pat === 'distressedJeans' && dist === 5) {
          target[y][x] = L;
        } else if (x === segMin + 1) {
          target[y][x] = L;
        } else if (x === segMax - 1 && segMax - segMin >= 3) {
          target[y][x] = S;
        } else {
          target[y][x] = P;
        }
      }
    }
    return;
  }

  // Side view trousers / breeches
  for (let y = pelvisTopY; y <= pelvisBottomY; y += 1) {
    if (y < 0 || y >= GRID_SIZE) continue;
    let rowMin = GRID_SIZE;
    let rowMax = -1;
    for (let x = 11; x <= 22; x += 1) {
      if (baseGrid[y]?.[x] && !frameInfo.nearHandMask?.has(`${x},${y}`)) {
        rowMin = Math.min(rowMin, x);
        rowMax = Math.max(rowMax, x);
      }
    }
    if (rowMax < rowMin) {
      rowMin = 13;
      rowMax = 18;
    } else {
      rowMin = Math.min(rowMin, 13);
    }
    for (let x = rowMin; x <= rowMax; x += 1) {
      if (frameInfo.nearHandMask?.has(`${x},${y}`)) continue;
      const c = baseGrid[y]?.[x];
      if (y === pelvisTopY || x === rowMin || x === rowMax || (c && isSpriteOutline(c))) {
        target[y][x] = O;
      } else if (x >= rowMax - 1) {
        target[y][x] = L;
      } else if (x <= rowMin + 1) {
        target[y][x] = S;
      } else {
        target[y][x] = P;
      }
    }
  }

  for (let y = pelvisBottomY + 1; y < GRID_SIZE; y += 1) {
    if (y <= 20) {
      let legMin = GRID_SIZE;
      let legMax = -1;
      for (let x = 11; x <= 22; x += 1) {
        if (baseGrid[y]?.[x] && !frameInfo.nearHandMask?.has(`${x},${y}`)) {
          legMin = Math.min(legMin, x);
          legMax = Math.max(legMax, x);
        }
      }
      if (legMax > legMin) {
        for (let x = legMin; x <= legMax; x += 1) {
          if (!baseGrid[y]?.[x] && !frameInfo.nearHandMask?.has(`${x},${y}`)) {
            target[y][x] = S;
          }
        }
      }
    }

    for (let x = 5; x <= 26; x += 1) {
      if (frameInfo.nearHandMask?.has(`${x},${y}`)) continue;
      const c = baseGrid[y]?.[x];
      if (!c) continue;
      const limb = sideLimb[y][x] || 'N';
      const rawFootMax = footBottomY[limb][x];
      const footMaxY = rawFootMax >= 24 ? rawFootMax : 29;
      const dist = footMaxY - y;
      if (dist < minDistFromFoot) continue;

      const curO = limb === 'F' ? farO : O;
      const curP = limb === 'F' ? farP : P;
      const curS = limb === 'F' ? farS : S;
      const curL = limb === 'F' ? farL : L;

      const isBoundary =
        isSpriteOutline(c) ||
        sideLimb[y][x - 1] !== limb ||
        sideLimb[y][x + 1] !== limb;

      if (isBoundary) {
        target[y][x] = curO;
      } else if (dist === minDistFromFoot) {
        target[y][x] = pat === 'bellBottomsBaggy' ? curL : curS;
      } else if (pat === 'distressedJeans' && dist === 5) {
        target[y][x] = curL;
      } else if (sideLimb[y][x + 2] !== limb) {
        target[y][x] = curL;
      } else if (sideLimb[y][x - 2] !== limb) {
        target[y][x] = curS;
      } else {
        target[y][x] = curP;
      }
    }
  }
}

function renderFittedShoes(target, baseGrid, frameInfo, preset, palette) {
  const { gender, baseOrientation, sideLimb, footBottomY } = frameInfo;
  const { O, P, S, L, farO, farP, farS, farL } = palette;
  const pat = preset.patternId || 'boots';
  const shoeHeight = pat === 'tallRidingBoots' ? 5 : pat === 'boots' ? 4 : 3;

  if (frameInfo.sectionGrid) {
    const isTall = pat === 'tallRidingBoots' || pat === 'boots';
    for (let y = 0; y < GRID_SIZE; y += 1) {
      for (let x = 0; x < GRID_SIZE; x += 1) {
        const c = baseGrid[y]?.[x];
        if (!c) continue;
        const sec = frameInfo.sectionGrid[y]?.[x];
        if (!sec) continue;

        const isFgShoe = sec === 'fg_foot' || (isTall && sec === 'fg_boot');
        const isBgShoe = sec === 'bg_foot' || (isTall && sec === 'bg_boot');

        if (!isFgShoe && !isBgShoe) continue;

        const isFar = isBgShoe;
        const curO = isFar ? farO : O;
        const curP = isFar ? farP : P;
        const curS = isFar ? farS : S;
        const curL = isFar ? farL : L;

        const isSoleRow = !baseGrid[y + 1]?.[x] || (!baseGrid[y + 1]?.[x - 1] && !baseGrid[y + 1]?.[x + 1]);
        const isBootTop = isTall && (sec === 'fg_boot' || sec === 'bg_boot') &&
          (!baseGrid[y - 1]?.[x] || frameInfo.sectionGrid[y - 1]?.[x] === 'fg_leg' || frameInfo.sectionGrid[y - 1]?.[x] === 'bg_leg');

        const isBoundary =
          isSpriteOutline(c) ||
          !baseGrid[y - 1]?.[x] ||
          !baseGrid[y + 1]?.[x] ||
          !baseGrid[y]?.[x - 1] ||
          !baseGrid[y]?.[x + 1] ||
          isSoleRow ||
          isBootTop;

        if (isBoundary) {
          target[y][x] = curO;
        } else if (isSoleRow) {
          target[y][x] = curS;
        } else if (baseOrientation === 'side') {
          const isFront = !baseGrid[y]?.[x + 1] || (frameInfo.sectionGrid[y]?.[x + 1] !== sec);
          const isBack = !baseGrid[y]?.[x - 1] || (frameInfo.sectionGrid[y]?.[x - 1] !== sec);
          if (isFront) {
            target[y][x] = curL;
          } else if (isBack) {
            target[y][x] = curS;
          } else {
            target[y][x] = curP;
          }
        } else {
          target[y][x] = x <= 15 ? curL : curP;
        }
      }
    }
    return;
  }

  if (baseOrientation === 'front') {
    for (let y = 22; y < GRID_SIZE; y += 1) {
      for (let x = 8; x <= 23; x += 1) {
        const c = baseGrid[y]?.[x];
        if (!c) continue;
        const { side, footMaxY } = getFrontLegSideAndMaxY(baseGrid, frameInfo, x, y);
        const dist = footMaxY - y;
        if (dist < 0 || dist >= shoeHeight) continue;

        const subMin = side === 'left' ? 8 : (gender === 'female' ? 15 : 16);
        const subMax = side === 'left' ? 15 : 23;
        const { segMin, segMax } = getContiguousSegmentBounds(baseGrid, y, x, subMin, subMax);

        if (dist === 0 || x === segMin || x === segMax || isSpriteOutline(c)) {
          target[y][x] = O;
        } else if (dist === 1) {
          target[y][x] = (pat === 'sneakersShoes' || x === segMin + 1) ? L : P;
        } else if (dist === shoeHeight - 1) {
          target[y][x] = pat === 'tallRidingBoots' ? L : S;
        } else {
          target[y][x] = x <= (segMin + segMax) / 2 ? P : S;
        }
      }
    }
    return;
  }

  // Side view shoes
  for (let y = 22; y < GRID_SIZE; y += 1) {
    for (let x = 5; x <= 26; x += 1) {
      const c = baseGrid[y]?.[x];
      if (!c) continue;
      const limb = sideLimb[y][x] || 'N';
      const footMaxY = footBottomY[limb][x];
      if (footMaxY < 25) continue;
      const dist = footMaxY - y;
      if (dist < 0 || dist >= shoeHeight) continue;

      const curO = limb === 'F' ? farO : O;
      const curP = limb === 'F' ? farP : P;
      const curS = limb === 'F' ? farS : S;
      const curL = limb === 'F' ? farL : L;

      const isBoundary =
        isSpriteOutline(c) ||
        sideLimb[y][x - 1] !== limb ||
        sideLimb[y][x + 1] !== limb;

      if (dist === 0 || isBoundary) {
        target[y][x] = curO;
      } else if (dist === 1) {
        target[y][x] = (sideLimb[y][x + 2] !== limb || pat === 'sneakersShoes') ? curL : curP;
      } else if (dist === shoeHeight - 1) {
        target[y][x] = pat === 'tallRidingBoots' ? curL : curS;
      } else {
        target[y][x] = sideLimb[y][x + 2] !== limb ? curL : curP;
      }
    }
  }
}

function renderFittedShirt(target, baseGrid, frameInfo, preset, palette) {
  const { gender, baseOrientation, headDy } = frameInfo;
  const { O, P, S, L, farO, farP, farS, farL } = palette;
  const pat = preset.patternId || 'teeHoodie';
  const isSleeveless = pat === 'vestJerkin' || pat === 'sleevelessTank';
  const isLongSleeve = pat === 'suitJacket' || pat === 'doubletCoat' || pat === 'capeletCoat';
  const hasHighCollar = pat === 'turtleneckSweater' || pat === 'calicoBodice';
  const isCapelet = pat === 'capeletCoat';

  if (frameInfo.sectionGrid) {
    for (let y = 0; y < GRID_SIZE; y += 1) {
      for (let x = 0; x < GRID_SIZE; x += 1) {
        const c = baseGrid[y]?.[x];
        if (!c) continue;
        const sec = frameInfo.sectionGrid[y]?.[x];

        const isCollar = hasHighCollar && sec === 'head' && y >= 7 + headDy;
        const isTorso = sec === 'torso';
        const isFgSleeve = !isSleeveless && (sec === 'fg_sleeve' || (isLongSleeve && sec === 'fg_arm'));
        const isBgSleeve = !isSleeveless && (sec === 'bg_sleeve' || (isLongSleeve && sec === 'bg_arm'));

        if (!isCollar && !isTorso && !isFgSleeve && !isBgSleeve) continue;

        if (isTorso && frameInfo.nearHandMask?.has(`${x},${y}`)) continue;

        const isFar = isBgSleeve;
        const curO = isFar ? farO : O;
        const curP = isFar ? farP : P;
        const curS = isFar ? farS : S;
        const curL = isFar ? farL : L;

        const isSleeveHem = isFgSleeve && sec === 'fg_sleeve' && frameInfo.sectionGrid[y + 1]?.[x] === 'fg_arm';
        const isShirtHem = isTorso && frameInfo.sectionGrid[y + 1]?.[x] === 'fg_leg';
        const isBoundary =
          isSpriteOutline(c) ||
          !baseGrid[y - 1]?.[x] ||
          !baseGrid[y + 1]?.[x] ||
          !baseGrid[y]?.[x - 1] ||
          !baseGrid[y]?.[x + 1] ||
          isSleeveHem ||
          isShirtHem;

        if (isBoundary) {
          target[y][x] = curO;
        } else if (isFgSleeve) {
          const isTopShoulder = !baseGrid[y - 1]?.[x] || frameInfo.sectionGrid[y - 1]?.[x] === 'head';
          const isFront = !baseGrid[y]?.[x + 1] || frameInfo.sectionGrid[y]?.[x + 1] !== 'fg_sleeve';
          target[y][x] = (isTopShoulder || isFront) ? curL : curP;
        } else if (isBgSleeve) {
          target[y][x] = curP;
        } else if (isCollar) {
          target[y][x] = curP;
        } else if (pat === 'fringedBuckskin') {
          const isSuspender = baseOrientation === 'side'
            ? (x === 15 || x === 16)
            : (x === 13 || x === 17);
          const isBuckle = isSuspender && (y === 11 + headDy || y === 12 + headDy);
          const isCenterPlacket = baseOrientation === 'front' && Math.abs(x - 15.5) <= 0.6;
          const isButton = isCenterPlacket && (y % 2 === 0);

          if (isBuckle) {
            target[y][x] = curL;
          } else if (isSuspender) {
            target[y][x] = curS;
          } else if (isButton) {
            target[y][x] = curL;
          } else if (isCenterPlacket) {
            target[y][x] = shadeHex(curP, 18);
          } else if (baseOrientation === 'side') {
            if (x >= 17) {
              target[y][x] = shadeHex(curP, 16);
            } else if (x <= 13) {
              target[y][x] = shadeHex(curP, -16);
            } else {
              target[y][x] = curP;
            }
          } else {
            target[y][x] = x <= 15 ? shadeHex(curP, 16) : curP;
          }
        } else if (pat === 'calicoBodice') {
          target[y][x] = (x === 16 || x === 17) ? curL : curP;
        } else if (isCapelet) {
          target[y][x] = y <= 11 + headDy ? curL : curP;
        } else {
          if (baseOrientation === 'side') {
            target[y][x] = x >= 17 ? curL : (x <= 13 ? curS : curP);
          } else {
            target[y][x] = x <= 15 ? curL : curP;
          }
        }
      }
    }
    return;
  }

  if (baseOrientation === 'front') {
    const torsoMinX = 11;
    const torsoMaxX = gender === 'female' ? 19 : 20;
    const cx = gender === 'female' ? 15.0 : 15.5;
    const neckY = 8 + headDy;
    const topY = 9 + headDy;
    const bottomY = 16 + headDy;

    if (hasHighCollar && neckY >= 0 && neckY < GRID_SIZE) {
      const cMin = 13;
      const cMax = gender === 'female' ? 17 : 18;
      for (let x = cMin; x <= cMax; x += 1) {
        if (!baseGrid[neckY]?.[x]) continue;
        target[neckY][x] = (x === cMin || x === cMax) ? O : (x <= cx ? L : S);
      }
    }

    for (let y = topY; y <= bottomY; y += 1) {
      if (y < 0 || y >= GRID_SIZE) continue;
      const ry = y - topY;

      for (let x = 7; x <= 24; x += 1) {
        const c = baseGrid[y]?.[x];
        if (!c) continue;
        const inTorso = x >= torsoMinX && x <= torsoMaxX;
        if (!inTorso && isSleeveless) continue;

        if (!inTorso) {
          // Sleeve pixel
          const isSleeveEdge = y === bottomY || isSpriteOutline(c) || !baseGrid[y]?.[x - 1] || !baseGrid[y]?.[x + 1];
          if (isSleeveEdge) {
            target[y][x] = O;
          } else if (isCapelet && ry <= 2) {
            target[y][x] = L;
          } else {
            target[y][x] = x < cx ? L : P;
          }
          continue;
        }

        // Torso pixel
        if (pat === 'sleevelessTank' && ry === 0 && Math.abs(x - cx) <= 1.5 && !isSpriteUndies(c)) {
          continue;
        }

        const isTorsoOutline =
          x === torsoMinX ||
          x === torsoMaxX ||
          (ry === 0 && (x <= torsoMinX + 1 || x >= torsoMaxX - 1)) ||
          (!baseGrid[y]?.[x - 1] || !baseGrid[y]?.[x + 1]);

        if (isTorsoOutline) {
          target[y][x] = O;
        } else if (pat === 'fringedBuckskin') {
          const isStrap = x === torsoMinX + 2 || x === torsoMaxX - 2;
          const isCenterPlacket = Math.abs(x - cx) <= 0.6;
          const isButton = isCenterPlacket && (ry === 2 || ry === 4 || ry === 6);
          const isBuckle = isStrap && ry === 3;
          if (isBuckle) {
            target[y][x] = L;
          } else if (isStrap) {
            target[y][x] = (ry <= 1) ? shadeHex(S, 20) : S;
          } else if (isButton) {
            target[y][x] = L;
          } else if (isCenterPlacket) {
            target[y][x] = shadeHex(P, 18);
          } else if (x < cx) {
            target[y][x] = ry <= 2 ? shadeHex(P, 20) : P;
          } else {
            target[y][x] = ry >= 4 ? shadeHex(P, -16) : P;
          }
        } else if (y === bottomY) {
          target[y][x] = O;
        } else if (y === bottomY - 1) {
          target[y][x] = S;
        } else if (pat === 'calicoBodice') {
          if (Math.abs(x - cx) <= 1.5) {
            target[y][x] = ry <= 3 ? L : S;
          } else {
            target[y][x] = P;
          }
        } else if (pat === 'suitJacket') {
          if (Math.abs(x - cx) <= 0.6) {
            target[y][x] = ry <= 2 ? L : S;
          } else if (Math.abs(x - cx) <= 1.6 && ry <= 3) {
            target[y][x] = S;
          } else {
            target[y][x] = x < cx ? L : P;
          }
        } else if (pat === 'doubletCoat' || pat === 'vestJerkin') {
          if (Math.abs(x - cx) <= 0.6) {
            target[y][x] = ry % 2 === 1 ? L : S;
          } else {
            target[y][x] = (ry <= 2 && x < cx) ? L : P;
          }
        } else if (isCapelet) {
          if (ry <= 1) target[y][x] = x <= cx ? L : P;
          else if (ry === 2) target[y][x] = O;
          else target[y][x] = x <= cx ? P : S;
        } else {
          target[y][x] = (ry <= 2 && x <= cx) ? L : P;
        }
      }
    }
    return;
  }

  // Side view shirt
  const neckY = (gender === 'female' ? 9 : 8) + headDy;
  const topY = (gender === 'female' ? 10 : 9) + headDy;
  const bottomY = 16 + headDy;

  if (hasHighCollar && neckY >= 0 && neckY < GRID_SIZE) {
    for (let x = 12; x <= 18; x += 1) {
      const c = baseGrid[neckY]?.[x];
      if (!c) continue;
      target[neckY][x] = isSpriteOutline(c) ? O : (x <= 15 ? L : S);
    }
  }

  for (let y = topY; y <= bottomY; y += 1) {
    if (y < 0 || y >= GRID_SIZE) continue;
    const ry = y - topY;

    for (let x = 8; x <= 22; x += 1) {
      const c = baseGrid[y]?.[x];
      if (!c) continue;

      // Preserve swinging bare hands at extreme forward/backward arm reach
      if (y >= 15 + headDy && (x <= 9 || x >= 21)) continue;

      if (isSleeveless) {
        // Keep foreground shoulder & arm (x <= 14 on ry >= 1) and swinging arms bare
        if (x < 14 || x > 18) continue;
        if (ry >= 1 && x <= 14 && !isSpriteUndies(c)) continue;
      }

      const isFar = isSpriteFarLimb(c, y, headDy) || (x >= 19 && y >= 14 + headDy);
      const curO = isFar ? farO : O;
      const curP = isFar ? farP : P;
      const curS = isFar ? farS : S;
      const curL = isFar ? farL : L;

      const isEdge =
        isSpriteOutline(c) ||
        !baseGrid[y]?.[x - 1] ||
        !baseGrid[y]?.[x + 1] ||
        (y === bottomY && (x <= 12 || x >= 19));

      if (isEdge) {
        target[y][x] = curO;
      } else if (isCapelet && ry <= 2) {
        target[y][x] = ry === 2 ? curO : curL;
      } else if (pat === 'fringedBuckskin') {
        const isSuspender = x === 16;
        const isBuckle = isSuspender && (ry === 3 || ry === 4);
        if (isBuckle) {
          target[y][x] = curL;
        } else if (isSuspender) {
          target[y][x] = curS;
        } else if (x >= 17) {
          target[y][x] = ry <= 2 ? shadeHex(curP, 20) : curP;
        } else if (x <= 13) {
          target[y][x] = ry <= 2 ? shadeHex(curP, 16) : curP;
        } else {
          target[y][x] = shadeHex(curP, -18);
        }
      } else if ((pat === 'suitJacket' || pat === 'calicoBodice' || pat === 'doubletCoat') && x === 17 && ry <= 3) {
        target[y][x] = curL;
      } else if (x <= 14) {
        target[y][x] = curL;
      } else {
        target[y][x] = curP;
      }
    }
  }

  // Harmonize any remaining far-arm shadow pixels on swinging hands/wrists (y <= 19 + headDy)
  const handShadowSkin = gender === 'female' ? '#d67256' : '#c56749';
  for (let y = 14 + headDy; y <= Math.min(GRID_SIZE - 1, 19 + headDy); y += 1) {
    for (let x = 7; x <= 24; x += 1) {
      if (isSpriteFarLimb(target[y][x], y, headDy)) {
        target[y][x] = handShadowSkin;
      }
    }
  }

  // Clean up any remaining undergarment pixels on row 17 + headDy
  const waistSeamY = 17 + headDy;
  if (waistSeamY >= 0 && waistSeamY < GRID_SIZE) {
    for (let x = 11; x <= 20; x += 1) {
      if (isSpriteUndies(target[waistSeamY][x])) {
        target[waistSeamY][x] = O;
      }
    }
  }
}

function drawPatternRowsAt(target, startX, startY, rows, palette) {
  rows.forEach((rowStr, dy) => {
    const y = startY + dy;
    if (y < 0 || y >= GRID_SIZE) return;
    for (let dx = 0; dx < rowStr.length; dx += 1) {
      const ch = rowStr[dx];
      if (!ch || ch === '.' || ch === ' ') continue;
      const x = startX + dx;
      if (x < 0 || x >= GRID_SIZE) continue;
      const color = palette[ch];
      if (color) target[y][x] = color;
    }
  });
}

function renderFittedAccessory(target, baseGrid, frameInfo, preset, palette) {
  const { gender, baseOrientation, headTopY, headDy, headDx } = frameInfo;
  const { O, P, S, L } = palette;
  const pat = preset.patternId || '';
  const pal = { O, P, S, L };

  // 1. Eye / Face Accessories
  const eyeY = headTopY + (gender === 'female' ? 5 : 4);
  if (
    pat === 'monocleChain' ||
    pat === 'aviatorGoggles' ||
    pat === 'hornRimGlasses' ||
    pat === 'roundPeaceShades' ||
    pat === 'neonWayfarerShades' ||
    pat === 'y2kRimlessShades'
  ) {
    if (baseOrientation === 'front') {
      const isFem = gender === 'female';
      if (pat === 'monocleChain') {
        const mx = isFem ? 15 : 16;
        drawPatternRowsAt(target, mx, eyeY - 1, [
          'OOO',
          'OLO',
          'OOO',
          '..S'
        ], pal);
        return;
      }
      if (pat === 'y2kRimlessShades') {
        const rows = isFem
          ? ['PLLSLPL']
          : ['PLLSLLPL'];
        drawPatternRowsAt(target, isFem ? 12 : 12, eyeY, rows, pal);
        return;
      }
      const frameChar = pat === 'neonWayfarerShades' ? 'P' : 'O';
      const rows = isFem
        ? [
            `.${frameChar}${frameChar}.${frameChar}${frameChar}.`,
            `${frameChar}PLO${frameChar}LP${frameChar}`
          ]
        : [
            `.${frameChar}${frameChar}..${frameChar}${frameChar}.`,
            `${frameChar}PLOOPL${frameChar}`
          ];
      drawPatternRowsAt(target, 12, eyeY - 1, rows, pal);
      return;
    }

    // Side view eyewear
    const sx = 14 + headDx;
    if (pat === 'monocleChain') {
      drawPatternRowsAt(target, sx + 1, eyeY - 1, [
        '.OOO',
        '.OLO',
        '.OOO',
        '.S..'
      ], pal);
      return;
    }
    if (pat === 'y2kRimlessShades') {
      drawPatternRowsAt(target, sx, eyeY, ['SSPLL'], pal);
      return;
    }
    const frameChar = pat === 'neonWayfarerShades' ? 'P' : 'O';
    drawPatternRowsAt(target, sx, eyeY - 1, [
      `..${frameChar}${frameChar}${frameChar}`,
      `OOPL${frameChar}`
    ], pal);
    return;
  }

  // 2. Trail Bandana & Pack
  if (pat === 'trailBandana') {
    if (baseOrientation === 'front') {
      const isFem = gender === 'female';
      const rows = isFem
        ? [
            'OO.....OO',
            'OLO...OLO',
            'OOPPPPPOO',
            '..OPJPO..'.replace('J', 'L'),
            '...OPO...'
          ]
        : [
            'OO......OO',
            'OLO....OLO',
            'OOPPPPPPOO',
            '..OPLLPO..',
            '...OPPO...'
          ];
      drawPatternRowsAt(target, 11, 8 + headDy, rows, pal);
      return;
    }
    drawPatternRowsAt(target, 8, 8 + headDy, [
      'OOOO.......',
      'OLLLOOOOOO.',
      'OLSLLOPPPPO',
      'OOOOO.OPPPO',
      '.OSSS..OPO.',
      '.OSSS......',
      '.OOOO......'
    ], pal);
    return;
  }

  // 3. Neck / Collar / Chest Accessories
  if (
    pat === 'tudorRuff' ||
    pat === 'collarRuffCravat' ||
    pat === 'bowtieCollar' ||
    pat === 'drapedScarf' ||
    pat === 'neckHeadphones'
  ) {
    if (baseOrientation === 'front') {
      const isFem = gender === 'female';
      const rowsByPat = {
        tudorRuff: isFem ? ['OOOOOOO', 'OLLPLLO', 'OLPLPLO'] : ['OOOOOOOO', 'OLLPPLLO', 'OLPLLPLO'],
        collarRuffCravat: isFem ? ['.OOOOO.', 'OOLLLOO', '.OLPLO.'] : ['.OOOOOO.', 'OOLLLLOO', '.OLLPPO.'],
        bowtieCollar: isFem ? ['.OLLLO.', 'OPSSSPO', '.O...O.'] : ['.OLLLL0.'.replace('0', 'O'), 'OPPSSPPO', '.O....O.'],
        drapedScarf: isFem ? ['OLLPPSSO', 'OPLSSSPO', '.OO..OO.'] : ['OLLPPPSSO', 'OPLLSSSPO', '.OO...OO.'],
        neckHeadphones: isFem ? ['OS...SO', 'OPLSLPO', '.O...O.'] : ['OS....SO', 'OPLSSLPO', '.O....O.']
      };
      drawPatternRowsAt(target, 12, 8 + headDy, rowsByPat[pat] || rowsByPat.drapedScarf, pal);
      return;
    }
    const sideRowsByPat = {
      tudorRuff: ['OOOOOO', 'OLLPLO', 'OLPLLO'],
      collarRuffCravat: ['OOOOO.', '.OLLLO', '..OLPO'],
      bowtieCollar: ['OLLLO.', '..OPSO', '..OOO.'],
      drapedScarf: ['OLLPSO', 'OPLSSO', '.O..O.'],
      neckHeadphones: ['.OOO..', '.OSOPO', '..OOO.']
    };
    drawPatternRowsAt(target, 13, 8 + headDy, sideRowsByPat[pat] || sideRowsByPat.drapedScarf, pal);
    return;
  }

  if (pat === 'longNecktie' || pat === 'pearlBeadNecklace' || pat === 'discoMedallion') {
    if (baseOrientation === 'front') {
      const isFem = gender === 'female';
      if (pat === 'longNecktie') {
        drawPatternRowsAt(target, isFem ? 13 : 13, 8 + headDy, isFem ? [
          'OLLLO',
          '.OPO.',
          '.OPO.',
          '.OSO.',
          '.OPO.',
          '..O..'
        ] : [
          'OLLLL0'.replace('0', 'O'),
          '.OPPO.',
          '.OPPO.',
          '.OSSO.',
          '.OPPO.',
          '..OO..'
        ], pal);
        return;
      }
      if (pat === 'pearlBeadNecklace') {
        drawPatternRowsAt(target, 13, 8 + headDy, isFem ? [
          'LP.PL',
          'L...L',
          '.LPL.',
          '..P..'
        ] : [
          'LP..PL',
          'L....L',
          '.LPPL.',
          '..PP..'
        ], pal);
        return;
      }
      drawPatternRowsAt(target, 13, 8 + headDy, isFem ? [
        'S...S',
        '.SOS.',
        '.OLO.',
        '.OPO.',
        '..O..'
      ] : [
        'S....S',
        '.SOOS.',
        '.OLLO.',
        '.OPPO.',
        '..OO..'
      ], pal);
      return;
    }
    // Side view tie / necklace / medallion
    if (pat === 'longNecktie') {
      drawPatternRowsAt(target, 14, 9 + headDy, [
        'OLLO',
        '..PO',
        '..PO',
        '..SO',
        '..OO'
      ], pal);
      return;
    }
    if (pat === 'pearlBeadNecklace') {
      drawPatternRowsAt(target, 14, 9 + headDy, [
        'LP..',
        '.LP.',
        '..LP'
      ], pal);
      return;
    }
    drawPatternRowsAt(target, 14, 9 + headDy, [
      'S...',
      '.SO.',
      '.OLO',
      '.OPO'
    ], pal);
    return;
  }

  // 4. Suspenders & Crossbody Bag
  if (pat === 'suspendersBraces' || pat === 'crossbodyBag') {
    if (baseOrientation === 'front') {
      const isFem = gender === 'female';
      if (pat === 'suspendersBraces') {
        const rx = isFem ? 17 : 18;
        for (let y = 9 + headDy; y <= 15 + headDy; y += 1) {
          if (y < 0 || y >= GRID_SIZE) continue;
          const c = y === 15 + headDy ? L : S;
          if (baseGrid[y]?.[13]) target[y][13] = c;
          if (baseGrid[y]?.[rx]) target[y][rx] = c;
        }
        return;
      }
      drawPatternRowsAt(target, 12, 9 + headDy, [
        'OO.....',
        '.LP....',
        '..PO...',
        '...SO..',
        '....OLO',
        '...OPPO',
        '...OOOO'
      ], pal);
      return;
    }
    if (pat === 'suspendersBraces') {
      for (let y = 9 + headDy; y <= 15 + headDy; y += 1) {
        if (y < 0 || y >= GRID_SIZE) continue;
        if (baseGrid[y]?.[15]) target[y][15] = y === 15 + headDy ? L : S;
        if (baseGrid[y]?.[16]) target[y][16] = O;
      }
      return;
    }
    drawPatternRowsAt(target, 13, 9 + headDy, [
      '.OO..',
      '.LP..',
      '..PO.',
      '.OLLO',
      '.OPPO',
      '.OOOO'
    ], pal);
    return;
  }

  // 5. Waist Belts, Fanny Pack, and Pioneer Apron
  if (pat === 'pioneerApron') {
    if (baseOrientation === 'front') {
      const isFem = gender === 'female';
      drawPatternRowsAt(target, 12, 16 + headDy, isFem ? [
        'OOOOOOO',
        'OLLLLPO',
        'OLLLLPO',
        'OLLPPLO',
        'OLLLLPO',
        'OPPPSSO',
        '.OOOOO.'
      ] : [
        'OOOOOOOO',
        'OLLLLLPO',
        'OLLLLLPO',
        'OLLPPPLO',
        'OLLLLLPO',
        'OPPPPSSO',
        '.OOOOOO.'
      ], pal);
      return;
    }
    drawPatternRowsAt(target, 13, 16 + headDy, [
      'OOOOOO',
      'OSSLLO',
      '..OLLO',
      '..OPLO',
      '..OLLO',
      '..OSSO',
      '...OOO'
    ], pal);
    return;
  }

  // beltChainSash / fannyPackWaist
  if (baseOrientation === 'front') {
    const isFem = gender === 'female';
    const rows = pat === 'fannyPackWaist'
      ? (isFem ? ['OOOOOOO', 'OSOLPPO', '..OPPO.', '...OO..'] : ['OOOOOOOO', 'OSOLLPPO', '..OPPPO.', '...OOO..'])
      : (isFem ? ['OOOOOOO', 'OSPPLSO', 'OOOOOOO'] : ['OOOOOOOO', 'OSPPLLSO', 'OOOOOOOO']);
    drawPatternRowsAt(target, 12, 15 + headDy, rows, pal);
    return;
  }
  const sideRows = pat === 'fannyPackWaist'
    ? ['OOOOOO', 'OSOLPO', '..OPPO', '...OO.']
    : ['OOOOOO', 'OSPPLO', 'OOOOOO'];
  drawPatternRowsAt(target, 13, 15 + headDy, sideRows, pal);
}

const FITTED_HEADWEAR_MAPS = {
  sunbonnet: {
    front: [
      '..OOOOOOOO..',
      '.OLLLLPPPPO.',
      'OPLLPPPPSSPO',
      'OPLLSSSSSSPO',
      'OPO......OPO',
      'OSO......OSO',
      '.OO......OO.',
      '..L......S..'
    ],
    side: [
      '..OOOOOOO...',
      '.OLLLLPPPO..',
      'OPLLPPPPPSSO',
      'OPPPSSSSSLLO',
      'OPPPSSO..OO.',
      '.OSSSSO.....',
      '..OO.L......',
      '.....S......'
    ]
  },
  slouchHat: {
    front: [
      '...OOOOOOOO...',
      '..OLLLLPPPPO..',
      '.OOSSSSSSSSOO.',
      'OLLLLPPPPPPLSO',
      '.OOOOOOOOOOOO.',
      '...O......O...',
      '...OSSSSSSO...',
      '...OSSLLSSO...',
      '....OOOOOO....'
    ],
    side: [
      '...OOOOOO...',
      '..OLLLLPPO..',
      '.OOSSSSSSOO.',
      'OLLLPPPPPLSO',
      '.OOOOOOOOOO.',
      '....OO......',
      '....OSSSSOO.',
      '.....OSSSSO.',
      '.....OOOOOO.'
    ]
  },
  coonskinCap: {
    front: [
      '..OOOOOOOO..',
      '.OLLPPLLPPO.',
      'OPLPSSSSPPPO',
      '.OOOOOOOOOO.',
      '.........OO.',
      '........OPLO',
      '........OSSO',
      '.........OO.'
    ],
    side: [
      '...OOOOOOOO.',
      '..OLLPPLLPPO',
      '.OPLPSSSSPPO',
      '..OOOOOOOOOO',
      '.OO.........',
      'OPLO........',
      'OSSO........',
      '.OO.........'
    ]
  },
  beret: {
    front: [
      '..OOOOOOOO..',
      '.OLLLLPPPPO.',
      'OPLLPPPPSSPO',
      '.OOOOOOOOOO.'
    ],
    side: [
      '..OOOOOOOO..',
      '.OLLLLPPPSO.',
      'OPLLPPPPPSSO',
      '.OOOOOOOOOO.'
    ]
  },
  plumedHat: {
    front: [
      '..OOOLLLLOOO..',
      '.OLLLLPPPPSSO.',
      'OOOOLLLPPSSOOO',
      '.OOOOOOOOOOOO.'
    ],
    side: [
      '..OOOLLLLOO...',
      '.OLLLLPPPPSSO.',
      'OOOOLLLPPSSOOO',
      '.OOOOOOOOOOOO.'
    ]
  },
  puritanCapotain: {
    front: [
      '...OOOOOOOO...',
      '..OPLLPPSSPO..',
      '..OOSSSLLSSOO.',
      'OOOOLLPPPSSOOO',
      '.OOOOOOOOOOOO.'
    ],
    side: [
      '...OOOOOOOO..',
      '..OPLLPPSSPO.',
      '..OSSSLLSSSSO',
      'OOOOLLPPPSSOO',
      '.OOOOOOOOOOOO'
    ]
  },
  tricorne: {
    front: [
      '.OOO....OOO.',
      'OOLLOOOOLLOO',
      'OPLLPPPPSSPO',
      '.OOOOOOOOOO.'
    ],
    side: [
      '..OOOOOOOO..',
      '.OOLLLLLLSSO',
      'OPLLPPPPPPSS',
      '.OOOOOOOOOO.'
    ]
  },
  bicorne: {
    front: [
      '..OOOOOOOO..',
      '.OLLPPLLPPSO',
      'OPLLPPPPSSPO',
      'OOOOOOOOOOOO'
    ],
    side: [
      '..OOOOOOOO..',
      '.OLLLLPPPSSO',
      'OPLLPPPPPPSO',
      'OOOOOOOOOOOO'
    ]
  },
  topHat: {
    front: [
      '..OOOOOOOO..',
      '..OPLLPPSSPO',
      '..OPLLPPSSPO',
      '..OSSSLLSSSO',
      'OOOOOOOOOOOO'
    ],
    side: [
      '..OOOOOOOO..',
      '..OPLLPPSSO.',
      '..OPLLPPSSO.',
      '..OSSSLLSSO.',
      'OOOOOOOOOOOO'
    ]
  },
  bowlerDerby: {
    front: [
      '..OOOOOOOO..',
      '.OPLLPPPPSSO',
      '.OSSSLLLLSSO',
      'OOOOOOOOOOOO'
    ],
    side: [
      '..OOOOOOOO..',
      '.OPLLPPPPSSO',
      '.OSSSLLLLSSO',
      'OOOOOOOOOOOO'
    ]
  },
  boaterFedora: {
    front: [
      '...OOOOOOOO...',
      '..OPLLPPSSPO..',
      '..OOSSSLLSSOO.',
      'OOOOLLPPPSSOOO',
      '.OOOOOOOOOOOO.'
    ],
    side: [
      '...OOOOOOOO..',
      '..OPLLPPPSSO.',
      '..OSSSLLLSSO.',
      'OOOOLLPPPSSOO',
      '.OOOOOOOOOOOO'
    ]
  },
  newsboyFlatCap: {
    front: [
      '..OOOOOOOO..',
      '.OLLLLPPPPO.',
      'OPLLPPPPSSPO',
      '.OOOOOOOOOO.'
    ],
    side: [
      '..OOOOOOOO..',
      '.OLLLLPPPSO.',
      'OPLLPPPPPSSO',
      '.OOOOOOOOOOO'
    ]
  },
  clocheBellHat: {
    front: [
      '..OOOOOOOO..',
      '.OLLLLPPPPO.',
      'OPLLSSSSSSPO',
      '.OOOOOOOOOO.'
    ],
    side: [
      '..OOOOOOOO..',
      '.OLLLLPPPSO.',
      'OPLLSSSSSPSO',
      '.OOOOOOOOOO.'
    ]
  },
  steelHelmet: {
    front: [
      '..OOOOOOOO..',
      '.OLLLLPPPPO.',
      'OOSSSSSSSSOO',
      'OOOOOOOOOOOO'
    ],
    side: [
      '..OOOOOOOO..',
      '.OLLLLPPPSO.',
      'OOSSSSSSSSOO',
      'OOOOOOOOOOOO'
    ]
  },
  capBeanie: {
    front: [
      '..OOOOOOOO..',
      '.OLLLLPPPPO.',
      'OPLLPPPPSSPO',
      '.OOOOOOOOOO.'
    ],
    side: [
      '..OOOOOOOO..',
      '.OLLLLPPPSO.',
      '.OPLLPPPPSSO',
      '..OOOOOOOOOO'
    ]
  },
  backwardsCap: {
    front: [
      '..OOOOOOOO..',
      '.OLLLLPPPPO.',
      'OPLLSSSSPPPO',
      '.OOOOOOOOOO.'
    ],
    side: [
      '...OOOOOOOO.',
      '..OLLLLPPPSO',
      'OOPLLPPPPSSO',
      'OOOOOOOOOOO.'
    ]
  },
  headbandBandana: {
    front: [
      '.OO..OOOO..OO.',
      'OPLOLLLLPPOLPO',
      '.OPLLPPPPSSPO.',
      '..OOOOOOOOOO..'
    ],
    side: [
      '.OO..OOOOOO.',
      'OPLOLLLLPPSO',
      '.OPLLPPPPSSO',
      '..OOOOOOOOOO'
    ]
  },
  longWavyFlow: {
    front: [
      '...OOOOOOOO...',
      '..OLLLLPPPPO..',
      '.OPLLPPPPSSPO.',
      '.OPLSO..OLSPO.',
      'OPLPO....OPLPO',
      'OPLPO....OPLPO',
      'OOLPO....OPLOO',
      '.OPSO....OSPO.',
      '.OOLO....OLOO.',
      '..OO......OO..'
    ],
    side: [
      '...OOOOOOOO..',
      '..OLLLLPPPSO.',
      '.OPLLPPPPPSSO',
      'OOPLLPPSSSSPO',
      'OPLPPSSO.....',
      'OPLPSSO......',
      '.OPLPSSO.....',
      '.OPPPSSO.....',
      '..OPSSO......',
      '...OO........'
    ]
  },
  longTwinBraids: {
    front: [
      '...OOOOOOOO...',
      '..OLLPPLLPPO..',
      '.OPLLPPPPSSPO.',
      '.OPLSO..OLSPO.',
      '.OOLO....OLOO.',
      '..OPO....OPO..',
      '.OOLO....OLOO.',
      '..OPO....OPO..',
      '.OOLO....OLOO.',
      '..OO......OO..'
    ],
    side: [
      '...OOOOOOOO..',
      '..OLLPPPPPSSO',
      '.OPLLPPPPPSSO',
      '.OPLLPPSSSSPO',
      'OOPPPSSO.....',
      '.OPLPSSO.....',
      '.OOLPPO......',
      '..OSSSSO.....',
      '..OOPLPO.....',
      '...OOO.......'
    ]
  },
  curlsWig: {
    front: [
      '..OOOOOOOOOO..',
      '.OLLPPLLPPPPO.',
      'OPLLPPPPPPSSPO',
      'OPLSO....OLSPO',
      'OOLPO....OPLOO',
      'OPLSO....OLSPO',
      'OOLPO....OPLOO',
      '.OPSO....OSPO.',
      '..OO......OO..'
    ],
    side: [
      '...OOOOOOOO..',
      '..OLLPPLLPPSO',
      '.OPLLPPPPPSSO',
      'OOPLLPPSSSSPO',
      'OOLPPSSO.....',
      'OPLPPSSO.....',
      '.OOLPSSO.....',
      '.OPLPSSO.....',
      '..OOOO.......'
    ]
  },
  ponytailQueue: {
    front: [
      '..OOOOOOOO..',
      '.OLLLLPPPPO.',
      'OPLLPPPPSSPO',
      'OPLSO..OLSPO',
      '.OO......OO.'
    ],
    side: [
      '...OOOOOOOO.',
      '..OLLLLPPPSO',
      '.OPLLPPPPSSO',
      'OOSSSSO.....',
      'OPLPPPO.....',
      '.OPLPO......',
      '..OSSO......',
      '..OO........'
    ]
  },
  frontierBeardHair: {
    front: [
      '..OOOOOOOO..',
      '.OLLLLPPPPO.',
      'OPLLPPPPSSPO',
      'OPLSO..OLSPO',
      'OPO......OSO',
      '.OSSSSSSSSO.',
      '.OSSLLLLSSO.',
      '..OSSSSSSSO.',
      '...OOOOOOO..'
    ],
    side: [
      '..OOOOOOOO..',
      '.OLLLLPPPSO.',
      'OPLLPPPPPSSO',
      'OPLPPSSO....',
      'OPLPSO......',
      '.OSSO..OOOO.',
      '..OO..OSSSSO',
      '......OSSLLO',
      '.......OOOO.'
    ]
  },
  longPartedCascade: {
    front: [
      '...OOOOOOOO...',
      '..OLLPPLLPPO..',
      '.OPLLPPPPSSPO.',
      '.OPLSO..OLSPO.',
      'OOLPO....OPSOO',
      'OPLPO....OPSPO',
      '.OPLO....OLPO.',
      '..OO......OO..'
    ],
    side: [
      '...OOOOOOOO..',
      '..OLLPPLLPPSO',
      '.OPLLPPPPPSSO',
      'OOPLLPPSSSSPO',
      'OPLPPSSO.....',
      '.OPLPSSO.....',
      '.OPPPSSO.....',
      '..OSSO.......',
      '...OO........'
    ]
  },
  pioneerBun: {
    front: [
      '...OOOOOO...',
      '..OLLLLPPO..',
      '.OOOPPPPOOO.',
      'OPLLPPPPSSPO',
      'OPLSO..OLSPO',
      '.OO......OO.'
    ],
    side: [
      '.OOOO.......',
      'OPLPSOOOOO..',
      'OPPSOLLLLPSO',
      'OOPLLPPPPPPO',
      '.OPPPSSO....',
      '..OSSO......',
      '...OO.......'
    ]
  },
  bobPageboy: {
    front: [
      '..OOOOOOOO..',
      '.OLLLLPPPPO.',
      'OPLLPPPPSSPO',
      'OPLSO..OLSPO',
      'OPO......OSO',
      '.OO......OO.'
    ],
    side: [
      '..OOOOOOOO..',
      '.OLLLLPPPSO.',
      'OPLLPPPPPSSO',
      'OPPPSSSSPPO.',
      '.OPPPSSO....',
      '..OSSO......'
    ]
  },
  pompadourAfro: {
    front: [
      '.OOOOOOOOOO.',
      'OLLLLPPPPSSO',
      'OPLLPPPPSSPO',
      'OPLSO..OLSPO',
      '.OO......OO.'
    ],
    side: [
      '.OOOOOOOOO..',
      'OLLLLPPPPSOO',
      'OPLLPPPPPSSO',
      '.OPPPSSO....',
      '..OOOO......'
    ]
  },
  spikyCurtains: {
    front: [
      'OO..OOOO..OO',
      'OPLOLLLLPOLO',
      'OPLLPPPPSSPO',
      'OPLSO..OLSPO',
      '.OO......OO.'
    ],
    side: [
      'OO..OOOO..OO',
      'OPLOLLLLPOLO',
      'OPLLPPPPPSSO',
      '.OPPPSSO....',
      '..OOO.......'
    ]
  },
  braidedCrown: {
    front: [
      '.OOOOOOOOOO.',
      'OLLPPLLLLPPO',
      'OSSSLLLLSSSO',
      'OPLSO..OLSPO',
      '.OO......OO.'
    ],
    side: [
      '..OOOOOOOO..',
      '.OLLPPLLLLPO',
      '.OSSSSSSSSPO',
      'OOSSSSO.....',
      '.OPLPPO.....',
      '..OOOO......'
    ]
  },
  buzzFadeTop: {
    front: [
      '..OOOOOOOO..',
      '.OLLLLPPPPO.',
      '.OPLLPPSSPO.',
      '.OSO....OSO.'
    ],
    side: [
      '..OOOOOOOO..',
      '.OLLLLPPPPO.',
      '.OPLLPPPPSO.',
      '..OOOO......'
    ]
  }
};

function renderFittedHeadwear(target, baseGrid, frameInfo, preset, palette) {
  const { gender, baseOrientation, headTopY, headDy, headDx } = frameInfo;
  const { O, P, S, L } = palette;
  const pat = preset.patternId || (preset.subType === 'hair' ? 'bobPageboy' : 'beret');
  const isHair = preset.subType === 'hair';

  // When a hairstyle is equipped, harmonize any built-in hair pixels on the head
  // so dark slate/brown base hair never clashes with the selected hairstyle color.
  if (isHair) {
    for (let y = Math.max(0, headTopY); y <= Math.min(GRID_SIZE - 1, 8 + headDy); y += 1) {
      for (let x = 8; x <= 23; x += 1) {
        const c = baseGrid[y]?.[x];
        if (isSpriteBaseHair(c, y, headDy)) {
          target[y][x] = y <= headTopY + 2 ? L : (x <= 15 ? P : S);
        }
      }
    }
  }

  const mapEntry = FITTED_HEADWEAR_MAPS[pat] || (isHair ? FITTED_HEADWEAR_MAPS.bobPageboy : FITTED_HEADWEAR_MAPS.beret);
  const rows = baseOrientation === 'side' ? mapEntry.side : mapEntry.front;
  if (!rows || !rows.length) return;

  const width = rows[0].length;
  const centerX = baseOrientation === 'side'
    ? 15.5 + headDx
    : (gender === 'female' ? 15.0 : 15.5);
  const startX = Math.round(centerX - width / 2);

  // Determine vertical start row so hats/hair sit on the crown without covering the eyes
  const hasTallCrown = pat === 'slouchHat' || pat === 'puritanCapotain' || pat === 'topHat' || pat === 'boaterFedora';
  const startY = hasTallCrown ? Math.max(0, headTopY - 1) : headTopY;

  const eyeRow = headTopY + (gender === 'female' ? 5 : 4);
  const hasBeard = pat === 'slouchHat' || pat === 'frontierBeardHair';

  rows.forEach((rowStr, rIdx) => {
    const y = startY + rIdx;
    if (y < 0 || y >= GRID_SIZE) return;
    for (let cIdx = 0; cIdx < rowStr.length; cIdx += 1) {
      const ch = rowStr[cIdx];
      if (!ch || ch === '.' || ch === ' ') continue;
      const x = startX + cIdx;
      if (x < 0 || x >= GRID_SIZE) continue;

      // Protect eyes and central face from being overwritten by hair or hat brims
      if (baseOrientation === 'front') {
        const faceMinX = gender === 'female' ? 13 : 13;
        const faceMaxX = gender === 'female' ? 17 : 18;
        const inCentralFaceX = x >= faceMinX && x <= faceMaxX;
        if (inCentralFaceX && y >= eyeRow - 1 && y <= eyeRow) {
          continue;
        }
        if (!hasBeard && inCentralFaceX && y >= eyeRow && y <= headTopY + 6) {
          continue;
        }
      } else {
        // Side view (facing east): face profile is on the east side (x >= 16 + headDx)
        const inEastFaceX = x >= 16 + headDx && x <= 19 + headDx;
        if (inEastFaceX && y >= eyeRow - 1 && y <= eyeRow) {
          continue;
        }
        if (!hasBeard && inEastFaceX && y >= eyeRow - 1 && y <= headTopY + 6) {
          continue;
        }
      }

      // Lower cascading hair (below shoulder line) drapes behind/around the torso rather than overwriting central chest
      if (isHair && !hasBeard && y >= headTopY + 8) {
        if (baseOrientation === 'front') {
          const innerChestMin = gender === 'female' ? 13 : 13;
          const innerChestMax = gender === 'female' ? 17 : 18;
          if (x >= innerChestMin && x <= innerChestMax && target[y][x]) continue;
        } else if (x >= 15 + headDx && target[y][x]) {
          continue;
        }
      }

      let color = palette[ch];
      if (!color) continue;
      if (ch !== 'O') {
        color = applyDirectional16BitShading(
          color,
          x,
          y,
          baseOrientation,
          'hats',
          preset.subType || null,
          ch === 'P' ? 'primary' : ch === 'S' ? 'secondary' : 'highlight'
        );
      }
      target[y][x] = color;
    }
  });
}

function overlayFittedClothing(baseGrid, appearance, baseOrientation = 'front', animMode = 'idle', frameIndex = 0) {
  const target = baseGrid.map((row) => [...row]);
  const gender = appearance?.gender === 'female' ? 'female' : 'male';
  const frameInfo = analyzeBoilerplateFrame(baseGrid, gender, baseOrientation, animMode, frameIndex);

  const pantsPresetId = String(appearance?.equippedPresets?.pants || '');
  const pantsPreset = (INITIAL_CLOTHING_BOILERPLATE.pants || []).find((entry) => entry.id === pantsPresetId);
  const shoesPresetId = String(appearance?.equippedPresets?.shoes || '');
  const shoesPreset = (INITIAL_CLOTHING_BOILERPLATE.shoes || []).find((entry) => entry.id === shoesPresetId);
  const hasShoes = Boolean(shoesPreset && !shoesPreset.isNone);
  const isSkirt = isSkirtPreset(pantsPreset);

  const drawOrder = ['pants', 'shoes', 'shirts', 'accessories', 'hats'];

  for (const category of drawOrder) {
    const presetId = String(appearance?.equippedPresets?.[category] || '');
    const preset = (INITIAL_CLOTHING_BOILERPLATE[category] || []).find((entry) => entry.id === presetId);
    if (!preset || preset.isNone) continue;

    const dyeId = appearance?.categoryDyes?.[category] || 'default';
    const palette = resolveGarmentPalette(preset, dyeId);

    const frameSpecificKey = `clothing:${presetId}:${baseOrientation}:${animMode}:${frameIndex}`;
    const orientationKey = `clothing:${presetId}:${baseOrientation}`;
    const hasSpecific = CUSTOM_SPRITE_OVERRIDES.has(frameSpecificKey);
    const customGrid = hasSpecific
      ? CUSTOM_SPRITE_OVERRIDES.get(frameSpecificKey)
      : CUSTOM_SPRITE_OVERRIDES.get(orientationKey);
    if (customGrid) {
      let shiftX = 0;
      let shiftY = 0;
      if (!hasSpecific && (category === 'hats' || category === 'accessories')) {
        const refBase = getBaseBoilerplateGrid(gender, baseOrientation, 'walk', 0);
        if (refBase) {
          const refInfo = analyzeBoilerplateFrame(refBase, gender, baseOrientation, 'walk', 0);
          shiftX = (frameInfo.headDx || 0) - (refInfo.headDx || 0);
          shiftY = (frameInfo.headDy || 0) - (refInfo.headDy || 0);
        }
      }
      for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          const col = customGrid[y]?.[x];
          if (col) {
            const tx = x + shiftX;
            const ty = y + shiftY;
            if (tx >= 0 && tx < GRID_SIZE && ty >= 0 && ty < GRID_SIZE) {
              target[ty][tx] = col;
            }
          }
        }
      }
    } else {
      if (category === 'pants') {
        renderFittedPantsOrSkirt(target, baseGrid, frameInfo, preset, palette, hasShoes);
      } else if (category === 'shoes') {
        renderFittedShoes(target, baseGrid, frameInfo, preset, palette);
      } else if (category === 'shirts') {
        renderFittedShirt(target, baseGrid, frameInfo, preset, palette);
      } else if (category === 'accessories') {
        renderFittedAccessory(target, baseGrid, frameInfo, preset, palette);
      } else if (category === 'hats') {
        renderFittedHeadwear(target, baseGrid, frameInfo, preset, palette);
      }
    }
  }

  if (frameInfo.nearHandPixels && frameInfo.nearHandPixels.length > 0) {
    for (const { x, y, color } of frameInfo.nearHandPixels) {
      target[y][x] = color;
    }
  }

  return target;
}

export function getCharacterFrameCount(appearance, view = 'side_right', animMode = 'walk') {
  const isFront = view === 'front';
  const gender = appearance?.gender === 'female' ? 'female' : 'male';
  if (getBoilerplateSpriteSize(gender)) {
    const usesSouthWalk = gender === 'female' && isFront;
    if (animMode === 'idle' || (isFront && !usesSouthWalk)) return 1;
    return getBoilerplateSpriteFrameCount(gender, animMode);
  }
  return animMode === 'idle' ? 2 : 6;
}

export function getCharacterFrameSize(appearance) {
  const gender = appearance?.gender === 'female' ? 'female' : 'male';
  return getBoilerplateSpriteSize(gender) ?? GRID_SIZE;
}

export function getCharacterFrameGrid(appearance, view = 'front', animMode = 'walk', frameIndex = 0) {
  const gender = appearance?.gender === 'female' ? 'female' : 'male';
  const isFront = view === 'front';
  const isSideLeft = view === 'side_left';

  if (isFront) {
    const effectiveMode = gender === 'female' && animMode === 'walk' ? 'walk' : 'idle';
    const rawGrid = getBaseSpriteGrid(gender, 'south', effectiveMode, frameIndex);
    if (!rawGrid) return getLegacyCharacterFrameGrid(appearance, view, animMode, frameIndex);
    const spriteGrid = applySkinToneToSpriteGrid(rawGrid, appearance?.skinToneId, gender);
    return overlayFittedClothing(spriteGrid, appearance, 'front', effectiveMode, frameIndex);
  }

  const rawGrid = getBaseSpriteGrid(gender, 'east', animMode, frameIndex);
  if (!rawGrid) return getLegacyCharacterFrameGrid(appearance, view, animMode, frameIndex);
  const eastGrid = applySkinToneToSpriteGrid(rawGrid, appearance?.skinToneId, gender);
  const dressedEast = overlayFittedClothing(eastGrid, appearance, 'side', animMode, frameIndex);
  return isSideLeft ? dressedEast.map((row) => [...row].reverse()) : dressedEast;
}

export function getCharacterOutfitGrid(appearance, view = 'front') {
  const gender = appearance?.gender === 'female' ? 'female' : 'male';
  const isSide = view === 'side' || view === 'side_right' || view === 'side_left';
  const dir = isSide ? 'east' : 'south';
  const rawGrid = getBaseSpriteGrid(gender, dir, 'idle', 0);
  if (!rawGrid) return buildNeutralCompositeGrid(appearance, isSide ? 'side' : 'front');
  const spriteGrid = applySkinToneToSpriteGrid(rawGrid, appearance?.skinToneId, gender);
  const dressed = overlayFittedClothing(spriteGrid, appearance, isSide ? 'side' : 'front', 'idle', 0);
  return view === 'side_left' ? dressed.map((row) => [...row].reverse()) : dressed;
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
