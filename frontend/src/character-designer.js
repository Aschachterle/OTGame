import {
  GRID_SIZE,
  GENDERS,
  ERAS,
  CATEGORIES,
  PRESET_COLOR_DYES,
  SKIN_TONES,
  HAIR_COLORS,
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
  HAIR_COLORS,
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

export function getHairColorById(hairColorId) {
  return HAIR_COLORS.find((h) => h.id === hairColorId) || HAIR_COLORS[0];
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
  hairColorId = 'chestnut_brown',
  headwearType = 'hat',
  variantIndex = 0
} = {}) {
  const appearance = {
    gender: gender === 'female' ? 'female' : 'male',
    bodyTemplateId,
    skinToneId,
    hairColorId,
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
  const randomHair = HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)];
  appearance.bodyTemplateId = randomBody.id;
  appearance.skinToneId = randomSkin.id;
  appearance.hairColorId = randomHair.id;
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
  '#f1af7d', '#ffe6d4', '#fad0a8',
  ...SKIN_TONES.map((s) => s.highlight.toLowerCase())
]);
KNOWN_SKIN_HIGHLIGHT_COLORS.delete('#ffffff');

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
  return false;
}

export function applySkinToneToSpriteGrid(grid, skinToneId, gender = 'male', skinRoleMap = null) {
  if (!grid || !Array.isArray(grid)) return grid;
  const skin = getSkinToneById(skinToneId);
  if (!skin) return grid;

  const result = grid.map((row) => [...row]);
  const explicitRoles = new Map();
  if (skinRoleMap && typeof skinRoleMap === 'object') {
    for (const [role, coords] of Object.entries(skinRoleMap)) {
      if (!Array.isArray(coords)) continue;
      for (const [x, y] of coords) {
        if (Number.isInteger(x) && Number.isInteger(y) && x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
          explicitRoles.set(`${x},${y}`, role);
        }
      }
    }
  }
  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const col = result[y]?.[x];
      if (!col) continue;
      const lower = col.toLowerCase();
      const explicitRole = explicitRoles.get(`${x},${y}`);
      if (explicitRole) {
        if (explicitRole === 'far-limb') result[y][x] = coolShadowHex(skin.shadow, 0.42);
        else if (explicitRole === 'highlight') result[y][x] = skin.highlight;
        else if (explicitRole === 'shadow') result[y][x] = skin.shadow;
        else result[y][x] = skin.base;
        continue;
      }
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

const KNOWN_HAIR_HIGHLIGHT_COLORS = new Set([
  '#81492c', '#8f563b', '#743f39', '#855847',
  ...HAIR_COLORS.map((h) => h.highlight.toLowerCase())
]);

const KNOWN_HAIR_BASE_COLORS = new Set([
  '#4d1b1b', '#663931',
  ...HAIR_COLORS.map((h) => h.base.toLowerCase())
]);

const KNOWN_HAIR_SHADOW_COLORS = new Set([
  '#442434', '#3b1e14', '#30160d', '#2b2a3f',
  ...HAIR_COLORS.map((h) => h.shadow.toLowerCase())
]);

const KNOWN_SKIN_COLORS = new Set(
  SKIN_TONES.flatMap((tone) => [tone.shadow, tone.base, tone.highlight].map((color) => color.toLowerCase()))
);

function getKnownHairRole(color) {
  const lower = color?.toLowerCase();
  if (!lower) return null;
  if (KNOWN_HAIR_HIGHLIGHT_COLORS.has(lower)) return 'highlight';
  if (KNOWN_HAIR_SHADOW_COLORS.has(lower)) return 'shadow';
  if (KNOWN_HAIR_BASE_COLORS.has(lower) || SPRITE_BASE_HAIR_COLORS.has(lower)) return 'base';
  return null;
}

export function applyHairColorToSpriteGrid(grid, hairColorId, gender = 'male', hairMaskCoords = null, view = 'side', animMode = 'walk', frameIndex = 0, hairRoleMap = null) {
  if (!grid || !Array.isArray(grid)) return grid;
  const hair = getHairColorById(hairColorId);
  if (!hair) return grid;

  const result = grid.map((row) => [...row]);
  let coords = Array.isArray(hairMaskCoords) ? hairMaskCoords : [];
  if (coords.length === 0) {
    try {
      coords = getFrameSectionMap(gender, view, animMode, frameIndex, grid)?.hair || [];
    } catch {
      coords = [];
    }
  }
  const explicitRoles = new Map();
  if (hairRoleMap && typeof hairRoleMap === 'object') {
    for (const [role, roleCoords] of Object.entries(hairRoleMap)) {
      if (!Array.isArray(roleCoords)) continue;
      for (const [x, y] of roleCoords) {
        if (Number.isInteger(x) && Number.isInteger(y) && x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
          explicitRoles.set(`${x},${y}`, role);
        }
      }
    }
  }
  if (explicitRoles.size > 0) {
    const coordSet = new Set(coords.map(([x, y]) => `${x},${y}`));
    for (const key of explicitRoles.keys()) coordSet.add(key);
    coords = Array.from(coordSet, (key) => key.split(',').map(Number));
  }
  if (coords.length === 0) return result;

  const rowBounds = new Map();
  let minY = GRID_SIZE;
  let maxY = -1;
  for (const [x, y] of coords) {
    if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) continue;
    const bounds = rowBounds.get(y) || { minX: x, maxX: x };
    bounds.minX = Math.min(bounds.minX, x);
    bounds.maxX = Math.max(bounds.maxX, x);
    rowBounds.set(y, bounds);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }

  const femaleHighlightCoords = new Set();
  if (gender === 'female') {
    for (let y = minY; y <= Math.min(maxY, minY + 3); y++) {
      const bounds = rowBounds.get(y);
      if (!bounds) continue;
      const centerX = (bounds.minX + bounds.maxX) / 2;
      const candidates = coords
        .filter(([x, rowY]) => rowY === y && result[y]?.[x] && !isSpriteOutline(result[y][x]))
        .sort((a, b) => Math.abs(a[0] - centerX) - Math.abs(b[0] - centerX));
      if (candidates.length > 0) femaleHighlightCoords.add(`${candidates[0][0]},${y}`);
    }
  }

  for (const [x, y] of coords) {
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) continue;
    const color = result[y]?.[x];
    if (!color) continue;
    const lower = color.toLowerCase();
    const explicitRole = explicitRoles.get(`${x},${y}`);
    if (!explicitRole && (lower === '#0098dc' || lower === '#ffffff')) continue;

    // Keep existing palette roles; classify unknown masked colors by silhouette
    // position so highlights and shadows stay registered across animation frames.
    let role = explicitRole;
    if (!role && gender === 'female') {
      if (SPRITE_OUTLINE_COLORS.has(lower) || isSpriteOutline(lower)) continue;
      const row = rowBounds.get(y);
      if (!row) continue;
      const backEdge = x === row.minX + 1 && row.maxX - row.minX > 2;
      if (y >= maxY - 1 || backEdge) role = 'shadow';
      else if (femaleHighlightCoords.has(`${x},${y}`)) role = 'highlight';
      else role = 'base';
    } else if (!role) {
      role = getKnownHairRole(lower);
      if (!role) {
        if (KNOWN_SKIN_COLORS.has(lower)) continue;
        if (SPRITE_OUTLINE_COLORS.has(lower) || isSpriteOutline(lower)) continue;
        const row = rowBounds.get(y);
        if (!row) continue;
        const rowWidth = row.maxX - row.minX + 1;
        const edge = x === row.minX || x === row.maxX;
        if (y >= maxY - 1 || (edge && rowWidth > 2)) role = 'shadow';
        else if (y <= minY + 1 && x > row.minX && x < row.maxX) role = 'highlight';
        else role = 'base';
      }
    }
    result[y][x] = hair[role];
  }
  return result;
}

function recolorCustomHairGrid(grid, preset, hairColorId) {
  const hair = getHairColorById(hairColorId);
  if (!hair || !Array.isArray(grid)) return grid;
  const source = preset?.palette || {};
  const roleByColor = new Map();
  for (const [sourceRole, hairRole] of [['O', null], ['P', 'base'], ['S', 'shadow'], ['L', 'highlight']]) {
    const color = source[sourceRole]?.toLowerCase();
    if (color) roleByColor.set(color, hairRole);
  }
  return grid.map((row) => row.map((color) => {
    if (!color) return color;
    const role = roleByColor.get(color.toLowerCase());
    return role ? hair[role] : color;
  }));
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

function resolveGarmentPalette(preset, dyeId, hairColorId = null) {
  if (preset?.subType === 'hair' && (!dyeId || dyeId === 'default') && hairColorId) {
    const hair = getHairColorById(hairColorId);
    if (hair) {
      const O = '#140c1c';
      const P = hair.base;
      const S = hair.shadow;
      const L = hair.highlight;
      return {
        O,
        P,
        S,
        L,
        farO: O,
        farP: coolShadowHex(P, 0.42),
        farS: coolShadowHex(S, 0.46),
        farL: coolShadowHex(L, 0.36)
      };
    }
  }

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
  { id: 'hair', label: 'Hair', color: '#ff9e00', shortcut: 'h', role: 'hair', isForeground: true, desc: 'Scalp, crown, bangs, sideburns & locks' },
  { id: 'head', label: 'Head / Face', color: '#ffd166', shortcut: '1', role: 'head', isForeground: true, desc: 'Face, eyes, nose, cheeks, mouth, jaw & chin' },
  { id: 'neck', label: 'Neck', color: '#d4a373', shortcut: 'n', role: 'neck', isForeground: false, desc: 'Neck, throat, collar base & chin junction' },
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
      if ((k === 'skinRoles' || k === 'hairRoles') && coords && typeof coords === 'object' && !Array.isArray(coords)) {
        obj[k] = Object.fromEntries(Object.entries(coords).map(([role, roleCoords]) => [
          role,
          Array.isArray(roleCoords) ? roleCoords.map(([x, y]) => [x, y]) : []
        ]));
      } else {
        obj[k] = Array.isArray(coords) ? coords.map(([x, y]) => [x, y]) : [];
      }
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

function normalizeExistingBaseOverridesAsBald() {
  let changed = false;
  const frameKeys = [...CUSTOM_SPRITE_OVERRIDES.keys()];
  for (const key of frameKeys) {
    const match = key.match(/^base:(male|female):(east|south):(walk|idle):(\d+)$/);
    if (!match) continue;
    const [, gender, direction, animMode, frameIndex] = match;
    const grid = CUSTOM_SPRITE_OVERRIDES.get(key);
    if (!grid) continue;
    const view = direction === 'south' ? 'front' : 'side';
    const hairCoords = getFrameSectionMap(gender, view, animMode, Number(frameIndex), grid)?.hair || [];
    let frameChanged = false;
    for (const [x, y] of hairCoords) {
      if (Number.isInteger(x) && Number.isInteger(y) && grid[y]?.[x]) {
        grid[y][x] = null;
        frameChanged = true;
      }
    }
    if (frameChanged) {
      CUSTOM_SPRITE_OVERRIDES.set(key, grid);
      changed = true;
    }
  }
  if (changed) saveCustomOverridesToStorage();
}

normalizeExistingBaseOverridesAsBald();

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
  const effectiveMode = normDir === 'south' ? 'idle' : animMode;
  const frameCount = getBoilerplateSpriteFrameCount(normGender, effectiveMode) || 1;
  const frame = (((Number(frameIndex) || 0) % frameCount) + frameCount) % frameCount;

  const frameSpecificKey = `base:${normGender}:${normDir}:${effectiveMode}:${frame}`;
  const southIdleFallbackKey = `base:${normGender}:south:idle:0`;
  const universalKey = `base:${normGender}:${normDir}`;

  const customKey = CUSTOM_SPRITE_OVERRIDES.has(frameSpecificKey)
    ? frameSpecificKey
    : (normDir === 'south' && CUSTOM_SPRITE_OVERRIDES.has(southIdleFallbackKey)
        ? southIdleFallbackKey
        : (CUSTOM_SPRITE_OVERRIDES.has(universalKey) ? universalKey : null));
  const custom = customKey ? CUSTOM_SPRITE_OVERRIDES.get(customKey) : null;
  const sourceGrid = custom
    ? custom.map((r) => [...r])
    : getBoilerplateSpriteGrid(normGender, normDir, effectiveMode, frame);
  if (!sourceGrid) return sourceGrid;

  // Base bodies are intentionally bald: hairstyles are clothing-layer items
  // authored in the Clothing Studio and fitted over this clean scalp.
  const hairView = normDir === 'south' ? 'front' : 'side';
  const hairCoords = getFrameSectionMap(normGender, hairView, effectiveMode, frame, sourceGrid)?.hair || [];
  const baldGrid = sourceGrid.map((row) => [...row]);
  let removedHairPixel = false;
  for (const [x, y] of hairCoords) {
    if (Number.isInteger(x) && Number.isInteger(y) && baldGrid[y]?.[x]) {
      baldGrid[y][x] = null;
      removedHairPixel = true;
    }
  }
  // Custom override grids are the Base Studio's editable source pixels. Keep
  // the canonical in-memory/local draft bald too, so later edits and exports
  // start from these pixels instead of reintroducing the old scalp fill.
  if (removedHairPixel && customKey) {
    CUSTOM_SPRITE_OVERRIDES.set(customKey, baldGrid.map((row) => [...row]));
    saveCustomOverridesToStorage();
  }
  return baldGrid;
}

export function getBaseBoilerplateGrid(gender, view = 'side', animMode = 'walk', frameIndex = 0, skinToneId = null, hairColorId = null) {
  const normGender = gender === 'female' ? 'female' : 'male';
  const isFront = view === 'front';
  const dir = isFront ? 'south' : 'east';
  const raw = getBaseSpriteGrid(normGender, dir, animMode, frameIndex);
  if (!raw) return null;
  let oriented = ((view === 'side_left' || view === 'west') && !isFront)
    ? raw.map((row) => [...row].reverse())
    : raw;
  if (skinToneId) {
    const skinRoles = getFrameSkinRoleMap(normGender, isFront ? 'front' : 'side', animMode, frameIndex);
    oriented = applySkinToneToSpriteGrid(oriented, skinToneId, normGender, skinRoles);
  }
  if (hairColorId) {
    const hairMask = getFrameSectionMap(normGender, isFront ? 'front' : 'side', animMode, frameIndex, raw)?.hair;
    oriented = applyHairColorToSpriteGrid(
      oriented,
      hairColorId,
      normGender,
      hairMask,
      isFront ? 'front' : 'side',
      animMode,
      frameIndex,
      getFrameHairRoleMap(normGender, isFront ? 'front' : 'side', animMode, frameIndex)
    );
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
        if (normView === 'side') {
          if (y <= 3 + headDy) {
            sectionGrid[y][x] = 'hair';
          } else if (y >= 4 + headDy && y <= 7 + headDy) {
            sectionGrid[y][x] = x <= 14 ? 'hair' : 'head';
          } else if (y === 8 + headDy) {
            if (normGender === 'female') {
              sectionGrid[y][x] = x <= 15 ? 'hair' : 'head';
            } else {
              if (x <= 14) sectionGrid[y][x] = 'hair';
              else if (x >= 17) sectionGrid[y][x] = 'head';
              else sectionGrid[y][x] = 'neck';
            }
          }
        } else {
          // Front view 32Man / 32Woman head, hair & neck auto-detection
          if (y <= 3 + headDy) {
            sectionGrid[y][x] = 'hair';
          } else if (normGender === 'female') {
            if (x <= 13 || x >= 17) sectionGrid[y][x] = 'hair';
            else sectionGrid[y][x] = 'head';
          } else {
            if (y <= 6 + headDy) {
              sectionGrid[y][x] = (x <= 12 || x >= 19) ? 'hair' : 'head';
            } else if (y === 7 + headDy) {
              if (x >= 13 && x <= 18) sectionGrid[y][x] = 'neck';
              else sectionGrid[y][x] = x < 13 ? 'fg_sleeve' : 'bg_sleeve';
            } else {
              sectionGrid[y][x] = x <= 11 ? 'fg_sleeve' : (x >= 20 ? 'bg_sleeve' : 'torso');
            }
          }
        }
      } else if (y >= 17 + headDy) {
        if (normView === 'front') {
          if (y <= 19 + headDy && ((normGender === 'male' && (x <= 11 || x >= 20)) || (normGender === 'female' && (x <= 11 || x >= 19)))) {
            sectionGrid[y][x] = x <= 15 ? 'fg_hand' : 'bg_hand';
          } else if (y <= 19 + headDy) {
            sectionGrid[y][x] = 'fg_leg';
          } else {
            const isFoot = y >= 28;
            const isBoot = y >= 24 && y <= 27;
            if (x <= 15) {
              sectionGrid[y][x] = isFoot ? 'fg_foot' : (isBoot ? 'fg_boot' : 'fg_leg');
            } else {
              sectionGrid[y][x] = isFoot ? 'bg_foot' : (isBoot ? 'bg_boot' : 'bg_leg');
            }
          }
        } else if (y <= 18 + headDy) {
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
          } else if (normGender === 'female' && y === 9 + headDy && x <= 15) {
            sectionGrid[y][x] = 'hair';
          } else if (
            (normGender === 'female' && (y === 9 + headDy || y === 10 + headDy) && x >= 16 && x <= 18) ||
            (normGender === 'male' && (y === 9 + headDy || y === 10 + headDy) && x >= 15 && x <= 18)
          ) {
            sectionGrid[y][x] = 'neck';
          } else {
            sectionGrid[y][x] = 'torso';
          }
        } else {
          // Front view y = 9..16
          if (normGender === 'female' && y === 9 + headDy) {
            sectionGrid[y][x] = (x <= 13 || x >= 17) ? 'hair' : 'neck';
          } else {
            const isSleeveHeight = y <= 13 + headDy;
            const leftArmX = normGender === 'female' ? (isSleeveHeight ? 12 : 11) : 11;
            const rightArmX = normGender === 'female' ? (isSleeveHeight ? 18 : 19) : 20;
            if (x <= leftArmX) {
              sectionGrid[y][x] = isSleeveHeight ? 'fg_sleeve' : 'fg_arm';
            } else if (x >= rightArmX) {
              sectionGrid[y][x] = isSleeveHeight ? 'bg_sleeve' : 'bg_arm';
            } else {
              sectionGrid[y][x] = 'torso';
            }
          }
        }
      }
    }
  }

  return sectionGridToMap(sectionGrid);
}

export function getFrameSectionMap(gender, view = 'side', animMode = 'walk', frameIndex = 0, baseGrid = null) {
  const key = normalizeMaskKey(gender, view, animMode, frameIndex);
  const normGender = gender === 'female' ? 'female' : 'male';
  const normView = view === 'front' ? 'front' : 'side';
  const custom =
    CUSTOM_FRAME_MASKS.get(key) ||
    (normView === 'front' ? CUSTOM_FRAME_MASKS.get(`${normGender}:front:idle:0`) : null);
  if (custom && typeof custom === 'object' && !Array.isArray(custom)) {
    const auto = getAutoDetectedSectionMap(gender, view, animMode, frameIndex, baseGrid);
    const merged = {};

    // Backward-compatibility: if custom has head but not hair, partition hair and head
    let customHead = custom.head;
    let customHair = custom.hair;
    if (Array.isArray(customHead) && !customHair) {
      const isFem = gender === 'female';
      customHair = customHead.filter(([x, y]) => {
        if (isFem) return y <= 4 || (y <= 9 && x <= 15);
        return y <= 3 || (y <= 7 && x <= 14);
      });
      customHead = customHead.filter(([x, y]) => {
        if (isFem) return !(y <= 4 || (y <= 9 && x <= 15));
        return !(y <= 3 || (y <= 7 && x <= 14));
      });
    }

    // Backward-compatibility: if custom has torso but not neck, partition neck from torso
    let customTorso = custom.torso;
    let customNeck = custom.neck;
    if (Array.isArray(customTorso) && !customNeck) {
      const isFem = gender === 'female';
      customNeck = customTorso.filter(([x, y]) => {
        if (isFem) return (y === 10 || y === 11) && x >= 15 && x <= 18;
        return (y === 8 || y === 9 || y === 10) && x >= 14 && x <= 18;
      });
      customTorso = customTorso.filter(([x, y]) => {
        if (isFem) return !((y === 10 || y === 11) && x >= 15 && x <= 18);
        return !((y === 8 || y === 9 || y === 10) && x >= 14 && x <= 18);
      });
    }

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
      hair: customHair,
      head: customHead,
      neck: customNeck,
      torso: customTorso,
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
      const customCoords = resolved[s.id];
      const rawCoords = Array.isArray(customCoords)
        ? customCoords.map(([x, y]) => [x, y])
        : (custom.head === undefined && custom.hair === undefined ? (auto[s.id] || []) : []);
      merged[s.id] = Array.isArray(baseGrid)
        ? rawCoords.filter(([x, y]) => Boolean(baseGrid[y]?.[x]))
        : rawCoords;
    }
    merged.skinRoles = custom.skinRoles && typeof custom.skinRoles === 'object'
      ? Object.fromEntries(Object.entries(custom.skinRoles).map(([role, coords]) => [
        role,
        Array.isArray(coords)
          ? coords.filter(([x, y]) => !Array.isArray(baseGrid) || Boolean(baseGrid[y]?.[x])).map(([x, y]) => [x, y])
          : []
      ]))
      : {};
    merged.hairRoles = custom.hairRoles && typeof custom.hairRoles === 'object'
      ? Object.fromEntries(Object.entries(custom.hairRoles).map(([role, coords]) => [
        role,
        Array.isArray(coords)
          ? coords.filter(([x, y]) => !Array.isArray(baseGrid) || Boolean(baseGrid[y]?.[x])).map(([x, y]) => [x, y])
          : []
      ]))
      : {};
    return merged;
  }
  if (Array.isArray(custom)) {
    const auto = getAutoDetectedSectionMap(gender, view, animMode, frameIndex, baseGrid);
    auto.fg_hand = custom.map(([x, y]) => [x, y]);
    return auto;
  }
  return getAutoDetectedSectionMap(gender, view, animMode, frameIndex, baseGrid);
}

export function pruneDeletedPixelsFromFrameMask(gender, view = 'side', animMode = 'walk', frameIndex = 0, spriteGrid = null) {
  if (!Array.isArray(spriteGrid)) return;
  const currentMap = getFrameSectionMap(gender, view, animMode, frameIndex, null);
  const pruned = {};
  for (const s of MASK_SECTIONS) {
    pruned[s.id] = (currentMap[s.id] || []).filter(([x, y]) => Boolean(spriteGrid[y]?.[x]));
  }
  for (const roleKey of ['skinRoles', 'hairRoles']) {
    if (currentMap[roleKey] && typeof currentMap[roleKey] === 'object') {
      pruned[roleKey] = Object.fromEntries(
        Object.entries(currentMap[roleKey]).map(([role, coords]) => [
          role,
          (Array.isArray(coords) ? coords : []).filter(([x, y]) => Boolean(spriteGrid[y]?.[x]))
        ])
      );
    }
  }
  setFrameSectionMap(gender, view, animMode, frameIndex, pruned);
}

export function setFrameSectionMap(gender, view = 'side', animMode = 'walk', frameIndex = 0, sectionMap = {}) {
  const key = normalizeMaskKey(gender, view, animMode, frameIndex);
  const normGender = gender === 'female' ? 'female' : 'male';
  const normView = view === 'front' ? 'front' : 'side';
  const cleaned = {};
  for (const s of MASK_SECTIONS) {
    const coords = sectionMap[s.id];
    cleaned[s.id] = (Array.isArray(coords) ? coords : [])
      .filter(([x, y]) => Number.isInteger(x) && Number.isInteger(y) && x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE)
      .map(([x, y]) => [x, y]);
  }
  const existing = CUSTOM_FRAME_MASKS.get(key);
  for (const metadataKey of ['skinRoles', 'hairRoles']) {
    const roles = sectionMap[metadataKey] || (existing && !Array.isArray(existing) ? existing[metadataKey] : null);
    if (!roles || typeof roles !== 'object') continue;
    cleaned[metadataKey] = Object.fromEntries(Object.entries(roles).map(([role, coords]) => [
      role,
      Array.isArray(coords)
        ? coords.filter(([x, y]) => Number.isInteger(x) && Number.isInteger(y) && x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE).map(([x, y]) => [x, y])
        : []
    ]));
  }
  CUSTOM_FRAME_MASKS.set(key, cleaned);
  if (normView === 'front') {
    CUSTOM_FRAME_MASKS.set(`${normGender}:front:idle:0`, JSON.parse(JSON.stringify(cleaned)));
    CUSTOM_FRAME_MASKS.set(`${normGender}:front:walk:0`, JSON.parse(JSON.stringify(cleaned)));
  }
  saveCustomMasksToStorage();
}

export function getFrameSkinRoleMap(gender, view = 'side', animMode = 'walk', frameIndex = 0) {
  const key = normalizeMaskKey(gender, view, animMode, frameIndex);
  const custom = CUSTOM_FRAME_MASKS.get(key);
  const fallback = view === 'front'
    ? CUSTOM_FRAME_MASKS.get(`${gender === 'female' ? 'female' : 'male'}:front:idle:0`)
    : null;
  const roles = custom && !Array.isArray(custom) && custom.skinRoles
    ? custom.skinRoles
    : fallback && !Array.isArray(fallback) ? fallback.skinRoles : null;
  if (!roles || typeof roles !== 'object') return {};
  return Object.fromEntries(Object.entries(roles).map(([role, coords]) => [
    role,
    Array.isArray(coords) ? coords.map(([x, y]) => [x, y]) : []
  ]));
}

export function setFrameSkinRoleMap(gender, view = 'side', animMode = 'walk', frameIndex = 0, skinRoles = {}) {
  const key = normalizeMaskKey(gender, view, animMode, frameIndex);
  const existing = CUSTOM_FRAME_MASKS.get(key);
  const sectionMap = existing && !Array.isArray(existing)
    ? { ...existing }
    : getFrameSectionMap(gender, view, animMode, frameIndex);
  sectionMap.skinRoles = Object.fromEntries(Object.entries(skinRoles || {}).map(([role, coords]) => [
    role,
    Array.isArray(coords)
      ? coords.filter(([x, y]) => Number.isInteger(x) && Number.isInteger(y) && x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE).map(([x, y]) => [x, y])
      : []
  ]));
  CUSTOM_FRAME_MASKS.set(key, sectionMap);
  if (view === 'front' && Number(frameIndex) === 0) {
    const copy = JSON.parse(JSON.stringify(sectionMap));
    CUSTOM_FRAME_MASKS.set(`${gender === 'female' ? 'female' : 'male'}:front:idle:0`, copy);
    CUSTOM_FRAME_MASKS.set(`${gender === 'female' ? 'female' : 'male'}:front:walk:0`, JSON.parse(JSON.stringify(copy)));
  }
  saveCustomMasksToStorage();
}

export function getFrameHairRoleMap(gender, view = 'side', animMode = 'walk', frameIndex = 0) {
  const key = normalizeMaskKey(gender, view, animMode, frameIndex);
  const custom = CUSTOM_FRAME_MASKS.get(key);
  const fallback = view === 'front'
    ? CUSTOM_FRAME_MASKS.get(`${gender === 'female' ? 'female' : 'male'}:front:idle:0`)
    : null;
  const roles = custom && !Array.isArray(custom) && custom.hairRoles
    ? custom.hairRoles
    : fallback && !Array.isArray(fallback) ? fallback.hairRoles : null;
  if (!roles || typeof roles !== 'object') return {};
  return Object.fromEntries(Object.entries(roles).map(([role, coords]) => [
    role,
    Array.isArray(coords) ? coords.map(([x, y]) => [x, y]) : []
  ]));
}

export function setFrameHairRoleMap(gender, view = 'side', animMode = 'walk', frameIndex = 0, hairRoles = {}) {
  const key = normalizeMaskKey(gender, view, animMode, frameIndex);
  const existing = CUSTOM_FRAME_MASKS.get(key);
  const sectionMap = existing && !Array.isArray(existing)
    ? { ...existing }
    : getFrameSectionMap(gender, view, animMode, frameIndex);
  sectionMap.hairRoles = Object.fromEntries(Object.entries(hairRoles || {}).map(([role, coords]) => [
    role,
    Array.isArray(coords)
      ? coords.filter(([x, y]) => Number.isInteger(x) && Number.isInteger(y) && x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE).map(([x, y]) => [x, y])
      : []
  ]));
  CUSTOM_FRAME_MASKS.set(key, sectionMap);
  if (view === 'front' && Number(frameIndex) === 0) {
    const copy = JSON.parse(JSON.stringify(sectionMap));
    CUSTOM_FRAME_MASKS.set(`${gender === 'female' ? 'female' : 'male'}:front:idle:0`, copy);
    CUSTOM_FRAME_MASKS.set(`${gender === 'female' ? 'female' : 'male'}:front:walk:0`, JSON.parse(JSON.stringify(copy)));
  }
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
        if ((secId === 'skinRoles' || secId === 'hairRoles') && coords && typeof coords === 'object' && !Array.isArray(coords)) {
          cleanedObj[secId] = Object.fromEntries(Object.entries(coords).map(([role, roleCoords]) => [
            role,
            Array.isArray(roleCoords)
              ? roleCoords.filter(([x, y]) => Number.isInteger(x) && Number.isInteger(y) && x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE).map(([x, y]) => [x, y])
              : []
          ]));
        } else if (Array.isArray(coords)) {
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
  let sectionBounds = null;
  if (!skipSectionMap) {
    sectionMap = getFrameSectionMap(gender, baseOrientation, animMode, frameIndex, baseGrid);
    sectionGrid = sectionMapToGrid(sectionMap);
    sectionBounds = computeAnatomicalSectionBounds(sectionMap);
  }

  return {
    gender,
    baseOrientation,
    animMode,
    frameIndex,
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
    sectionGrid,
    sectionBounds
  };
}

function computeSingleSectionBound(coords = []) {
  if (!Array.isArray(coords) || coords.length === 0) return null;
  let minX = GRID_SIZE;
  let maxX = -1;
  let minY = GRID_SIZE;
  let maxY = -1;
  const byRow = new Map();
  for (const [x, y] of coords) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
    const row = byRow.get(y);
    if (!row) {
      byRow.set(y, { minX: x, maxX: x });
    } else {
      if (x < row.minX) row.minX = x;
      if (x > row.maxX) row.maxX = x;
    }
  }
  if (maxX < minX) return null;
  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
    count: coords.length,
    byRow
  };
}

function computeAnatomicalSectionBounds(sectionMap) {
  if (!sectionMap) return {};
  const bounds = {};
  for (const s of MASK_SECTIONS) {
    bounds[s.id] = computeSingleSectionBound(sectionMap[s.id] || []);
  }
  bounds.cranium = computeSingleSectionBound([
    ...(sectionMap.hair || []),
    ...(sectionMap.head || [])
  ]);
  bounds.upperBody = computeSingleSectionBound([
    ...(sectionMap.torso || []),
    ...(sectionMap.fg_sleeve || []),
    ...(sectionMap.bg_sleeve || [])
  ]);
  bounds.pelvisAndLegs = computeSingleSectionBound([
    ...(sectionMap.fg_leg || []),
    ...(sectionMap.bg_leg || []),
    ...(sectionMap.fg_boot || []),
    ...(sectionMap.bg_boot || [])
  ]);
  return bounds;
}

function getSectionRowSpan(sectionGrid, y, allowedSections) {
  let minX = GRID_SIZE;
  let maxX = -1;
  for (let x = 0; x < GRID_SIZE; x += 1) {
    const sec = sectionGrid[y]?.[x];
    if (sec && allowedSections.has(sec)) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
    }
  }
  return maxX >= minX ? { minX, maxX } : null;
}

function getFrontLegSideAndMaxY(baseGrid, frameInfo, x, y) {
  if (x <= 14) return { side: 'left', footMaxY: frameInfo.leftFootMaxY };
  if (x >= 16) return { side: 'right', footMaxY: frameInfo.rightFootMaxY };
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
  const { gender, baseOrientation, headDy, sectionGrid, sectionBounds } = frameInfo;
  const { O, P, S, L, farO, farP, farS, farL } = palette;
  const pat = preset.patternId || "trousersJeans";
  if (!sectionGrid) return;

  if (isSkirtPreset(preset)) {
    const isShort = isShortSkirtPreset(preset);
    const legBounds = sectionBounds?.pelvisAndLegs;
    const fgLegBounds = sectionBounds?.fg_leg;
    const waistTopY = fgLegBounds?.minY ?? legBounds?.minY ?? (17 + headDy);
    const maxBootY = Math.max(
      sectionBounds?.fg_boot?.maxY ?? 25,
      sectionBounds?.bg_boot?.maxY ?? 25,
      fgLegBounds?.maxY ?? 24
    );
    const skirtBottomY = isShort
      ? Math.min(maxBootY - 2, (fgLegBounds?.maxY ?? 23))
      : maxBootY;
    const effectiveH = Math.max(1, skirtBottomY - waistTopY + 1);
    const hipSpan = fgLegBounds?.byRow?.get(waistTopY) || legBounds?.byRow?.get(waistTopY) || { minX: 12, maxX: 18 };
    const hipCenterX = (hipSpan.minX + hipSpan.maxX) / 2;

    const legSectionSet = new Set(["fg_leg", "bg_leg", "fg_boot", "bg_boot"]);

    for (let y = waistTopY; y <= skirtBottomY; y += 1) {
      if (y < 0 || y >= GRID_SIZE) continue;
      const ry = y - waistTopY;
      const t = effectiveH > 1 ? ry / (effectiveH - 1) : 0;
      const bellHalfW = (hipSpan.maxX - hipSpan.minX) * 0.5 + 0.5 + t * (isShort ? 2.0 : 3.2);
      const legSpan = getSectionRowSpan(sectionGrid, y, legSectionSet);

      let rowLeft = Math.round(hipCenterX - bellHalfW);
      let rowRight = Math.round(hipCenterX + bellHalfW);
      if (legSpan) {
        rowLeft = Math.min(rowLeft, Math.max(hipSpan.minX - 4, legSpan.minX));
        rowRight = Math.max(rowRight, Math.min(hipSpan.maxX + 4, legSpan.maxX));
      }

      for (let x = rowLeft; x <= rowRight; x += 1) {
        if (x < 0 || x >= GRID_SIZE) continue;
        const sec = sectionGrid[y]?.[x];
        if (sec === "fg_arm" || sec === "fg_hand" || sec === "fg_sleeve" || frameInfo.nearHandMask?.has(`${x},${y}`)) {
          continue;
        }
        if (sec === "torso" && ry === 0) continue;
        if (sec === "fg_foot" || sec === "bg_foot") continue;

        const isTopWaist = ry === 0;
        const isBottomHem = ry === effectiveH - 1;
        const isOuterEdge = x === rowLeft || x === rowRight;
        const isFlounceRow = !isShort && ry === effectiveH - 2;
        const isTartanBand = isShort && (ry === effectiveH - 2 || ry === Math.floor(effectiveH / 2));

        if (isTopWaist || isBottomHem || isOuterEdge) {
          target[y][x] = O;
        } else if (ry === 1) {
          target[y][x] = (x === Math.round(hipCenterX)) ? L : S;
        } else if (isFlounceRow) {
          target[y][x] = (x - rowLeft) % 2 === 1 ? L : S;
        } else if (isTartanBand) {
          target[y][x] = (x - rowLeft) % 2 === 0 ? L : S;
        } else {
          const relX = x - rowLeft;
          const rowW = Math.max(1, rowRight - rowLeft);
          const isPleatCrease = isShort ? (relX % 2 === 0) : (relX % 3 === 0);
          if (baseOrientation === "side") {
            if (x >= rowRight - 2) {
              target[y][x] = isPleatCrease ? P : L;
            } else if (x <= rowLeft + 2) {
              target[y][x] = isPleatCrease ? farS : S;
            } else {
              target[y][x] = isPleatCrease ? S : P;
            }
          } else {
            if (relX <= 2 || Math.abs(x - hipCenterX) < 0.8) {
              target[y][x] = L;
            } else if (relX >= rowW - 2 || isPleatCrease) {
              target[y][x] = S;
            } else {
              target[y][x] = P;
            }
          }
        }
      }
    }
    return;
  }

  // Mask-driven Trousers, Jeans, Bell-Bottoms & Breeches/Shorts
  const isShortPant = pat === "breechesShorts";
  const isBellBottom = pat === "bellBottomsBaggy";
  const isDistressed = pat === "distressedJeans";
  const fgLegSet = new Set(isShortPant ? ["fg_leg"] : ["fg_leg", "fg_boot"]);
  const bgLegSet = new Set(isShortPant ? ["bg_leg"] : ["bg_leg", "bg_boot"]);
  const waistTopY = sectionBounds?.fg_leg?.minY ?? (17 + headDy);

  for (let y = 0; y < GRID_SIZE; y += 1) {
    const fgSpan = getSectionRowSpan(sectionGrid, y, fgLegSet);
    const bgSpan = getSectionRowSpan(sectionGrid, y, bgLegSet);

    for (let x = 0; x < GRID_SIZE; x += 1) {
      if (frameInfo.nearHandMask?.has(`${x},${y}`)) continue;
      const c = baseGrid[y]?.[x];
      if (!c) continue;
      const sec = sectionGrid[y]?.[x];
      if (!sec) continue;
      if (sec === "fg_arm" || sec === "fg_hand" || sec === "fg_sleeve") continue;

      const isFg = fgLegSet.has(sec);
      const isBg = bgLegSet.has(sec);
      if (!isFg && !isBg) continue;

      const activeSet = isFg ? fgLegSet : bgLegSet;
      const span = isFg ? fgSpan : bgSpan;
      const curO = isFg ? O : farO;
      const curP = isFg ? P : farP;
      const curS = isFg ? S : farS;
      const curL = isFg ? L : farL;

      const upSec = sectionGrid[y - 1]?.[x];
      const downSec = sectionGrid[y + 1]?.[x];
      const leftSec = sectionGrid[y]?.[x - 1];
      const rightSec = sectionGrid[y]?.[x + 1];

      const isWaistRow = y === waistTopY || (sec === "fg_leg" && upSec === "torso");
      const isBottomCuff =
        (isShortPant && (downSec === "fg_boot" || downSec === "bg_boot")) ||
        (!isShortPant && (downSec === "fg_foot" || downSec === "bg_foot" || !baseGrid[y + 1]?.[x]));
      const isOuterBoundary =
        isSpriteOutline(c) ||
        !baseGrid[y - 1]?.[x] ||
        !baseGrid[y + 1]?.[x] ||
        !baseGrid[y]?.[x - 1] ||
        !baseGrid[y]?.[x + 1] ||
        (leftSec && !activeSet.has(leftSec) && leftSec !== "fg_arm" && leftSec !== "fg_hand") ||
        (rightSec && !activeSet.has(rightSec) && rightSec !== "fg_arm" && rightSec !== "fg_hand");

      if (isWaistRow) {
        const isBeltEdge = !span || x === span.minX || x === span.maxX;
        const isBuckle = span && x === (baseOrientation === "side" ? span.maxX - 1 : Math.round((span.minX + span.maxX) / 2));
        target[y][x] = isBeltEdge ? curO : (isBuckle ? curL : curS);
      } else if (isOuterBoundary) {
        target[y][x] = curO;
      } else if (isBottomCuff) {
        target[y][x] = (isBellBottom || isShortPant) ? curL : curS;
      } else if (isDistressed && (sec === "fg_boot" || sec === "bg_boot") && (upSec === "fg_leg" || upSec === "bg_leg")) {
        target[y][x] = curL;
      } else if (baseOrientation === "side" && span) {
        if (x >= span.maxX - 1) {
          target[y][x] = curL;
        } else if (x <= span.minX + 1) {
          target[y][x] = curS;
        } else {
          target[y][x] = curP;
        }
      } else {
        target[y][x] = x <= 15 ? curL : curP;
      }
    }

    // Bell-bottom flare on boot section
    if (isBellBottom && (fgSpan || bgSpan)) {
      for (const [span, isFg] of [[fgSpan, true], [bgSpan, false]]) {
        if (!span) continue;
        const secAtMin = sectionGrid[y]?.[span.minX];
        if (secAtMin !== "fg_boot" && secAtMin !== "bg_boot") continue;
        const curO = isFg ? O : farO;
        const curL = isFg ? L : farL;
        if (span.maxX + 1 < GRID_SIZE && !target[y][span.maxX + 1]) {
          target[y][span.maxX] = curL;
          target[y][span.maxX + 1] = curO;
        }
      }
    }
  }
}

function renderFittedShoes(target, baseGrid, frameInfo, preset, palette) {
  const { baseOrientation, sectionGrid, sectionBounds } = frameInfo;
  const { O, P, S, L, farO, farP, farS, farL } = palette;
  const pat = preset.patternId || "boots";
  if (!sectionGrid) return;

  const isTallRiding = pat === "tallRidingBoots";
  const isWorkBoot = pat === "boots";
  const isSneaker = pat === "sneakersShoes";
  const fgBootMinY = sectionBounds?.fg_boot?.minY ?? 24;
  const fgBootMaxY = sectionBounds?.fg_boot?.maxY ?? 26;
  const bgBootMinY = sectionBounds?.bg_boot?.minY ?? 24;
  const bgBootMaxY = sectionBounds?.bg_boot?.maxY ?? 26;

  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const c = baseGrid[y]?.[x];
      if (!c) continue;
      const sec = sectionGrid[y]?.[x];
      if (!sec) continue;

      const isFgBootIncluded =
        sec === "fg_boot" &&
        (isTallRiding || (isWorkBoot && y >= fgBootMinY + 1) || (isSneaker && y >= fgBootMaxY));
      const isBgBootIncluded =
        sec === "bg_boot" &&
        (isTallRiding || (isWorkBoot && y >= bgBootMinY + 1) || (isSneaker && y >= bgBootMaxY));

      const isFgShoe = sec === "fg_foot" || isFgBootIncluded;
      const isBgShoe = sec === "bg_foot" || isBgBootIncluded;
      if (!isFgShoe && !isBgShoe) continue;

      const isFar = isBgShoe;
      const curO = isFar ? farO : O;
      const curP = isFar ? farP : P;
      const curS = isFar ? farS : S;
      const curL = isFar ? farL : L;

      const upSec = sectionGrid[y - 1]?.[x];
      const downSec = sectionGrid[y + 1]?.[x];
      const leftSec = sectionGrid[y]?.[x - 1];
      const rightSec = sectionGrid[y]?.[x + 1];

      const isSoleRow = !baseGrid[y + 1]?.[x] || !downSec;
      const isTopCollar =
        !upSec ||
        upSec === "fg_leg" ||
        upSec === "bg_leg" ||
        (!isTallRiding && (upSec === "fg_boot" || upSec === "bg_boot"));

      const isOuterEdge =
        isSpriteOutline(c) ||
        !baseGrid[y]?.[x - 1] ||
        !baseGrid[y]?.[x + 1] ||
        (isFgShoe && (leftSec === "bg_foot" || leftSec === "bg_boot")) ||
        (isBgShoe && (rightSec === "fg_foot" || rightSec === "fg_boot"));

      if (isSoleRow) {
        const isToeOrHeelCorner = !baseGrid[y]?.[x - 1] || !baseGrid[y]?.[x + 1];
        target[y][x] = (isSneaker && !isToeOrHeelCorner) ? curL : curO;
      } else if (isOuterEdge) {
        target[y][x] = curO;
      } else if (isTopCollar) {
        target[y][x] = (isTallRiding || isSneaker) ? curL : curO;
      } else if (baseOrientation === "side") {
        const isToeFront = !baseGrid[y]?.[x + 2] || sectionGrid[y]?.[x + 2] !== sec;
        const isHeelBack = !baseGrid[y]?.[x - 2] || sectionGrid[y]?.[x - 2] !== sec;
        if (isToeFront) {
          target[y][x] = curL;
        } else if (isHeelBack) {
          target[y][x] = isTallRiding && y === (isFar ? bgBootMaxY : fgBootMaxY) ? curL : curS;
        } else {
          target[y][x] = isSneaker && ((x + y) % 2 === 0) ? curL : curP;
        }
      } else {
        target[y][x] = x <= 15 ? curL : curP;
      }
    }
  }
}

function renderFittedShirt(target, baseGrid, frameInfo, preset, palette) {
  const { baseOrientation, headDy, sectionGrid, sectionBounds } = frameInfo;
  const { O, P, S, L, farO, farP, farS, farL } = palette;
  const pat = preset.patternId || "teeHoodie";
  if (!sectionGrid) return;

  const isSleeveless = pat === "vestJerkin" || pat === "sleevelessTank";
  const isLongSleeve =
    pat === "fringedBuckskin" ||
    pat === "suitJacket" ||
    pat === "doubletCoat" ||
    pat === "capeletCoat" ||
    pat === "turtleneckSweater";
  const hasHighCollar =
    pat === "turtleneckSweater" ||
    pat === "calicoBodice" ||
    pat === "doubletCoat";
  const isCapelet = pat === "capeletCoat";

  const torsoBounds = sectionBounds?.torso;
  const torsoMinY = torsoBounds?.minY ?? (9 + headDy);
  const torsoMaxY = torsoBounds?.maxY ?? (16 + headDy);
  const torsoCenterX = torsoBounds?.centerX ?? 16;

  for (let y = 0; y < GRID_SIZE; y += 1) {
    const torsoRow = torsoBounds?.byRow?.get(y);
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const c = baseGrid[y]?.[x];
      if (!c) continue;
      const sec = sectionGrid[y]?.[x];
      if (!sec) continue;

      const isCollar = hasHighCollar && sec === "neck";
      const isTorso = sec === "torso";
      const isFgSleeve = !isSleeveless && (sec === "fg_sleeve" || (isLongSleeve && sec === "fg_arm"));
      const isBgSleeve = !isSleeveless && (sec === "bg_sleeve" || (isLongSleeve && sec === "bg_arm"));

      if (!isCollar && !isTorso && !isFgSleeve && !isBgSleeve) continue;
      if (frameInfo.nearHandMask?.has(`${x},${y}`)) continue;

      if (pat === "sleevelessTank" && isTorso && y === torsoMinY && torsoRow && x >= torsoRow.maxX - 1) {
        continue;
      }

      const isFar = isBgSleeve;
      const curO = isFar ? farO : O;
      const curP = isFar ? farP : P;
      const curS = isFar ? farS : S;
      const curL = isFar ? farL : L;

      const upSec = sectionGrid[y - 1]?.[x];
      const downSec = sectionGrid[y + 1]?.[x];
      const leftSec = sectionGrid[y]?.[x - 1];
      const rightSec = sectionGrid[y]?.[x + 1];

      const isShortSleeveCuff = !isLongSleeve && isFgSleeve && sec === "fg_sleeve" && downSec === "fg_arm";
      const isLongSleeveCuff = isLongSleeve && isFgSleeve && sec === "fg_arm" && (downSec === "fg_hand" || rightSec === "fg_hand");
      const isWaistHem = isTorso && (downSec === "fg_leg" || downSec === "bg_leg" || y === torsoMaxY);
      const isArmTorsoSeam = isFgSleeve && (rightSec === "torso" || downSec === "torso") && !isCapelet;

      const isOuterBoundary =
        isSpriteOutline(c) ||
        !baseGrid[y - 1]?.[x] ||
        !baseGrid[y + 1]?.[x] ||
        !baseGrid[y]?.[x - 1] ||
        !baseGrid[y]?.[x + 1] ||
        isWaistHem;

      if (isCollar) {
        const isCollarEdge = isSpriteOutline(c) || !baseGrid[y]?.[x - 1] || !baseGrid[y]?.[x + 1];
        target[y][x] = isCollarEdge ? curO : curL;
        continue;
      }

      if (isShortSleeveCuff || isLongSleeveCuff) {
        target[y][x] = isSpriteOutline(c) ? curO : curL;
        continue;
      }

      if (isOuterBoundary) {
        if (pat === "fringedBuckskin" && isWaistHem && !isSpriteOutline(c)) {
          target[y][x] = (x % 2 === 0) ? curL : curO;
        } else {
          target[y][x] = curO;
        }
        continue;
      }

      if (isArmTorsoSeam) {
        target[y][x] = curS;
        continue;
      }

      if (isFgSleeve) {
        const isShoulderCrown = upSec === "hair" || upSec === "head" || upSec === "neck" || !upSec;
        if (pat === "doubletCoat" && isShoulderCrown) {
          target[y][x] = curL;
        } else if (isCapelet && y <= torsoMinY + 3) {
          target[y][x] = (y === torsoMinY + 3) ? curO : curL;
        } else if (pat === "turtleneckSweater") {
          target[y][x] = (y % 2 === 0) ? curL : curP;
        } else {
          const isSleeveFront = rightSec !== sec;
          target[y][x] = (isShoulderCrown || isSleeveFront) ? curL : curP;
        }
        continue;
      }

      if (isBgSleeve) {
        target[y][x] = curP;
        continue;
      }

      // Interior Torso Detailing by Pattern
      const ry = y - torsoMinY;
      const rowMin = torsoRow?.minX ?? 14;
      const rowMax = torsoRow?.maxX ?? 19;
      const isFrontChestEdge = baseOrientation === "side" ? (x >= rowMax - 1) : (Math.abs(x - torsoCenterX) <= 0.8);
      const isBackTorsoEdge = baseOrientation === "side" ? (x <= rowMin + 1) : (x <= rowMin + 1 || x >= rowMax - 1);

      if (pat === "fringedBuckskin") {
        if (ry === 2) {
          target[y][x] = (x % 2 === 0) ? curL : curS;
        } else if (ry < 2) {
          target[y][x] = curL;
        } else if (isFrontChestEdge) {
          target[y][x] = (ry % 2 === 0) ? curL : curS;
        } else if (isBackTorsoEdge) {
          target[y][x] = curS;
        } else {
          target[y][x] = curP;
        }
      } else if (pat === "calicoBodice") {
        if (y >= torsoMaxY - 1) {
          target[y][x] = curS;
        } else if (isFrontChestEdge && ry <= 2) {
          target[y][x] = curL;
        } else {
          target[y][x] = ((x + y) % 2 === 0) ? curL : curP;
        }
      } else if (pat === "suitJacket") {
        if (isFrontChestEdge && ry <= 2) {
          target[y][x] = curL;
        } else if ((baseOrientation === "side" && x === rowMax - 2 && ry <= 3) || (baseOrientation === "front" && Math.abs(x - torsoCenterX) <= 1.6 && ry <= 3)) {
          target[y][x] = curS;
        } else if (isFrontChestEdge && ry > 2) {
          target[y][x] = (ry % 2 === 1) ? curL : curS;
        } else if (isBackTorsoEdge) {
          target[y][x] = curS;
        } else {
          target[y][x] = curP;
        }
      } else if (pat === "doubletCoat") {
        if (ry % 2 === 1 && !isBackTorsoEdge) {
          target[y][x] = curL;
        } else if (isFrontChestEdge) {
          target[y][x] = curS;
        } else {
          target[y][x] = isBackTorsoEdge ? curS : curP;
        }
      } else if (isCapelet) {
        if (ry <= 2) {
          target[y][x] = isFrontChestEdge ? curL : curP;
        } else if (ry === 3) {
          target[y][x] = curO;
        } else {
          target[y][x] = isFrontChestEdge ? curP : curS;
        }
      } else if (pat === "vestJerkin") {
        if (isFrontChestEdge) {
          target[y][x] = (ry === 0) ? curS : ((ry % 2 === 1) ? curL : curS);
        } else if (isBackTorsoEdge) {
          target[y][x] = curS;
        } else {
          target[y][x] = curP;
        }
      } else if (pat === "turtleneckSweater") {
        target[y][x] = (x % 2 === 0) ? curL : (isBackTorsoEdge ? curS : curP);
      } else if (pat === "sleevelessTank") {
        target[y][x] = isFrontChestEdge ? curL : (isBackTorsoEdge ? curS : curP);
      } else {
        if (ry === 0 && isFrontChestEdge) {
          target[y][x] = curS;
        } else if (isFrontChestEdge) {
          target[y][x] = curL;
        } else if (isBackTorsoEdge) {
          target[y][x] = curS;
        } else {
          target[y][x] = curP;
        }
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
      if (!ch || ch === "." || ch === " ") continue;
      const x = startX + dx;
      if (x < 0 || x >= GRID_SIZE) continue;
      const color = palette[ch];
      if (color) target[y][x] = color;
    }
  });
}

function renderFittedAccessory(target, baseGrid, frameInfo, preset, palette) {
  const { gender, baseOrientation, headDy, sectionGrid, sectionBounds } = frameInfo;
  const { O, P, S, L } = palette;
  const pat = preset.patternId || "";
  const pal = { O, P, S, L };

  const headBounds = sectionBounds?.head;
  const hairBounds = sectionBounds?.hair;
  const neckBounds = sectionBounds?.neck;
  const torsoBounds = sectionBounds?.torso;
  const fgLegBounds = sectionBounds?.fg_leg;

  // 1. Mask-driven Eyewear
  const eyeY = (headBounds?.minY ?? (4 + headDy)) + 1;
  const faceMinX = headBounds?.minX ?? 15;
  const faceMaxX = headBounds?.maxX ?? 19;
  const templeMinX = hairBounds?.minX ?? 13;

  if (
    pat === "monocleChain" ||
    pat === "aviatorGoggles" ||
    pat === "hornRimGlasses" ||
    pat === "roundPeaceShades" ||
    pat === "neonWayfarerShades" ||
    pat === "y2kRimlessShades"
  ) {
    if (baseOrientation === "front") {
      const isFem = gender === "female";
      if (pat === "monocleChain") {
        drawPatternRowsAt(target, isFem ? 15 : 16, eyeY - 1, ["OOO", "OLO", "OOO", "..S"], pal);
        return;
      }
      if (pat === "y2kRimlessShades") {
        drawPatternRowsAt(target, 12, eyeY, [isFem ? "PLLSLPL" : "PLLSLLPL"], pal);
        return;
      }
      const frameChar = pat === "neonWayfarerShades" ? "P" : "O";
      const rows = isFem
        ? [`.${frameChar}${frameChar}.${frameChar}${frameChar}.`, `${frameChar}PLO${frameChar}LP${frameChar}`]
        : [`.${frameChar}${frameChar}..${frameChar}${frameChar}.`, `${frameChar}PLOOPL${frameChar}`];
      drawPatternRowsAt(target, 12, eyeY - 1, rows, pal);
      return;
    }

    // Side view eyewear anchored to headBounds eye level
    if (pat === "monocleChain") {
      drawPatternRowsAt(target, faceMaxX - 3, eyeY - 1, [".OOO", ".OLO", ".OOO", ".S.."], pal);
      return;
    }
    if (pat === "y2kRimlessShades") {
      for (let x = faceMinX - 1; x <= faceMaxX; x += 1) {
        if (x < 0 || x >= GRID_SIZE) continue;
        target[eyeY][x] = x >= faceMaxX - 2 ? L : S;
      }
      return;
    }
    const frameCol = pat === "neonWayfarerShades" ? P : O;
    for (let x = Math.max(templeMinX + 1, faceMinX - 1); x <= faceMaxX; x += 1) {
      if (x >= faceMaxX - 2) {
        if (eyeY - 1 >= 0) target[eyeY - 1][x] = frameCol;
        target[eyeY][x] = (x === faceMaxX - 1) ? L : P;
        if (pat === "aviatorGoggles" && eyeY + 1 < GRID_SIZE) target[eyeY + 1][x] = frameCol;
      } else {
        target[eyeY][x] = frameCol; // Temple arm back to ear
      }
    }
    return;
  }

  // 2. Neck & Chest Accessories anchored to neckBounds & torsoBounds
  const neckY = neckBounds?.minY ?? ((torsoBounds?.minY ?? (10 + headDy)) - 1);
  const torsoMinY = torsoBounds?.minY ?? (neckY + 1);
  const torsoMaxY = torsoBounds?.maxY ?? (16 + headDy);
  const topTorsoRow = torsoBounds?.byRow?.get(torsoMinY) || { minX: 14, maxX: 18 };

  if (pat === "trailBandana") {
    if (baseOrientation === "front") {
      const isFem = gender === "female";
      drawPatternRowsAt(target, 11, neckY, isFem
        ? ["OO.....OO", "OLO...OLO", "OOPPPPPOO", "..OPLPO..", "...OPO..."]
        : ["OO......OO", "OLO....OLO", "OOPPPPPPOO", "..OPLLPO..", "...OPPO..."], pal);
      return;
    }
    // Side view: knotted trail bandana on neck + upper chest & frontier canvas pack on back of torso
    for (const [nx, ny] of (frameInfo.sectionMap?.neck || [])) {
      target[ny][nx] = (nx >= (neckBounds?.maxX ?? 17)) ? L : P;
    }
    for (let dy = 0; dy <= 2; dy += 1) {
      const y = torsoMinY + dy;
      const rSpan = torsoBounds?.byRow?.get(y) || topTorsoRow;
      for (let x = rSpan.maxX - (2 - dy); x <= rSpan.maxX + (dy === 0 ? 1 : 0); x += 1) {
        if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) continue;
        target[y][x] = (dy === 2 || x === rSpan.maxX + 1) ? O : (x === rSpan.maxX ? L : P);
      }
    }
    // Frontier bedroll / canvas pack strapped behind torso/sleeve
    const packRightX = (sectionBounds?.fg_sleeve?.minX ?? topTorsoRow.minX) - 1;
    const packLeftX = Math.max(1, packRightX - 3);
    for (let y = torsoMinY; y <= Math.min(GRID_SIZE - 2, torsoMinY + 5); y += 1) {
      const ry = y - torsoMinY;
      for (let x = packLeftX; x <= packRightX; x += 1) {
        if (ry === 0 || ry === 5 || x === packLeftX || x === packRightX) {
          target[y][x] = O;
        } else if (ry === 1) {
          target[y][x] = L;
        } else {
          target[y][x] = S;
        }
      }
    }
    return;
  }

  if (
    pat === "tudorRuff" ||
    pat === "collarRuffCravat" ||
    pat === "bowtieCollar" ||
    pat === "drapedScarf" ||
    pat === "neckHeadphones"
  ) {
    if (baseOrientation === "front") {
      const isFem = gender === "female";
      const rowsByPat = {
        tudorRuff: isFem ? ["OOOOOOO", "OLLPLLO", "OLPLPLO"] : ["OOOOOOOO", "OLLPPLLO", "OLPLLPLO"],
        collarRuffCravat: isFem ? [".OOOOO.", "OOLLLOO", ".OLPLO."] : [".OOOOOO.", "OOLLLLOO", ".OLLPPO."],
        bowtieCollar: isFem ? [".OLLLO.", "OPSSSPO", ".O...O."] : [".OLLLL0.".replace("0", "O"), "OPPSSPPO", ".O....O."],
        drapedScarf: isFem ? ["OLLPPSSO", "OPLSSSPO", ".OO..OO."] : ["OLLPPPSSO", "OPLLSSSPO", ".OO...OO."],
        neckHeadphones: isFem ? ["OS...SO", "OPLSLPO", ".O...O."] : ["OS....SO", "OPLSSLPO", ".O....O."]
      };
      drawPatternRowsAt(target, 12, neckY, rowsByPat[pat] || rowsByPat.drapedScarf, pal);
      return;
    }
    const nMinX = (neckBounds?.minX ?? topTorsoRow.minX) - 1;
    const nMaxX = (neckBounds?.maxX ?? topTorsoRow.maxX) + 1;
    for (let y = neckY; y <= neckY + 1; y += 1) {
      if (y < 0 || y >= GRID_SIZE) continue;
      for (let x = nMinX; x <= nMaxX; x += 1) {
        if (x < 0 || x >= GRID_SIZE) continue;
        if (pat === "tudorRuff") {
          target[y][x] = ((x + y) % 2 === 0) ? L : P;
        } else if (pat === "bowtieCollar") {
          target[y][x] = x >= nMaxX - 1 ? P : L;
        } else if (pat === "neckHeadphones") {
          target[y][x] = (x === nMinX + 1 || x === nMaxX - 1) ? P : S;
        } else {
          target[y][x] = x === nMinX || x === nMaxX ? O : (x >= nMaxX - 2 ? L : P);
        }
      }
    }
    if (pat === "drapedScarf" || pat === "collarRuffCravat") {
      for (let dy = 1; dy <= 3; dy += 1) {
        const y = torsoMinY + dy;
        const rSpan = torsoBounds?.byRow?.get(y) || topTorsoRow;
        const sx = pat === "drapedScarf" ? rSpan.minX + 1 : rSpan.maxX - 1;
        if (y < GRID_SIZE && sx >= 0 && sx < GRID_SIZE) {
          target[y][sx] = dy === 3 ? O : (pat === "collarRuffCravat" ? L : S);
        }
      }
    }
    return;
  }

  if (pat === "longNecktie" || pat === "pearlBeadNecklace" || pat === "discoMedallion") {
    if (baseOrientation === "front") {
      const isFem = gender === "female";
      if (pat === "longNecktie") {
        drawPatternRowsAt(target, 13, neckY, isFem
          ? ["OLLLO", ".OPO.", ".OPO.", ".OSO.", ".OPO.", "..O.."]
          : ["OLLLL0".replace("0", "O"), ".OPPO.", ".OPPO.", ".OSSO.", ".OPPO.", "..OO.."], pal);
        return;
      }
      if (pat === "pearlBeadNecklace") {
        drawPatternRowsAt(target, 13, neckY, isFem
          ? ["LP.PL", "L...L", ".LPL.", "..P.."]
          : ["LP..PL", "L....L", ".LPPL.", "..PP.."], pal);
        return;
      }
      drawPatternRowsAt(target, 13, neckY, isFem
        ? ["S...S", ".SOS.", ".OLO.", ".OPO.", "..O.."]
        : ["S....S", ".SOOS.", ".OLLO.", ".OPPO.", "..OO.."], pal);
      return;
    }
    // Side view anchored to neck and leading edge of torso
    for (let dy = 0; dy <= 4; dy += 1) {
      const y = torsoMinY + dy;
      if (y < 0 || y >= GRID_SIZE) continue;
      const rSpan = torsoBounds?.byRow?.get(y) || topTorsoRow;
      const tx = rSpan.maxX - 1;
      if (pat === "longNecktie") {
        target[y][tx] = dy === 0 ? L : (dy === 4 ? O : P);
        if (tx + 1 <= rSpan.maxX) target[y][tx + 1] = O;
      } else if (pat === "pearlBeadNecklace" && dy <= 2) {
        target[y][tx - (2 - dy)] = (dy % 2 === 0) ? L : P;
      } else if (pat === "discoMedallion" && dy <= 3) {
        target[y][tx] = dy < 2 ? S : (dy === 2 ? L : P);
      }
    }
    return;
  }

  // 3. Suspenders & Crossbody Bag anchored to torsoBounds
  if (pat === "suspendersBraces" || pat === "crossbodyBag") {
    if (baseOrientation === "front") {
      const isFem = gender === "female";
      if (pat === "suspendersBraces") {
        const rx = isFem ? 17 : 18;
        for (let y = torsoMinY; y <= torsoMaxY; y += 1) {
          if (y < 0 || y >= GRID_SIZE) continue;
          const c = y === torsoMaxY - 1 ? L : S;
          if (baseGrid[y]?.[13]) target[y][13] = c;
          if (baseGrid[y]?.[rx]) target[y][rx] = c;
        }
        return;
      }
      drawPatternRowsAt(target, 12, torsoMinY, [
        "OO.....", ".LP....", "..PO...", "...SO..", "....OLO", "...OPPO", "...OOOO"
      ], pal);
      return;
    }
    for (let y = torsoMinY; y <= torsoMaxY; y += 1) {
      if (y < 0 || y >= GRID_SIZE) continue;
      const rSpan = torsoBounds?.byRow?.get(y);
      if (!rSpan) continue;
      const ry = y - torsoMinY;
      if (pat === "suspendersBraces") {
        const sx = Math.min(rSpan.maxX - 1, Math.max(rSpan.minX + 1, Math.round((rSpan.minX + rSpan.maxX) / 2)));
        if (!frameInfo.nearHandMask?.has(`${sx},${y}`)) {
          target[y][sx] = (y === torsoMaxY - 1) ? L : S;
        }
      } else {
        const sx = Math.min(rSpan.maxX - 1, rSpan.minX + 1 + Math.floor(ry * 0.5));
        if (!frameInfo.nearHandMask?.has(`${sx},${y}`)) {
          target[y][sx] = (y >= torsoMaxY - 1) ? P : L;
          if (y >= torsoMaxY - 1 && sx - 1 >= rSpan.minX) target[y][sx - 1] = O;
        }
      }
    }
    return;
  }

  // 4. Pioneer Apron, Belt & Fanny Pack anchored to fg_leg waist
  const waistY = fgLegBounds?.minY ?? (torsoMaxY + 1);
  const waistSpan = fgLegBounds?.byRow?.get(waistY) || { minX: 12, maxX: 18 };

  if (pat === "pioneerApron") {
    if (baseOrientation === "front") {
      const isFem = gender === "female";
      drawPatternRowsAt(target, 12, waistY, isFem
        ? ["OOOOOOO", "OLLLLPO", "OLLLLPO", "OLLPPLO", "OLLLLPO", "OPPPSSO", ".OOOOO."]
        : ["OOOOOOOO", "OLLLLLPO", "OLLLLLPO", "OLLPPPLO", "OLLLLLPO", "OPPPPSSO", ".OOOOOO."], pal);
      return;
    }
    const apronBottomY = Math.min(GRID_SIZE - 2, waistY + 6);
    for (let y = waistY; y <= apronBottomY; y += 1) {
      const ry = y - waistY;
      const legRow = fgLegBounds?.byRow?.get(y) || waistSpan;
      const aMinX = ry === 0 ? legRow.minX : Math.max(legRow.minX + 1, legRow.maxX - 3);
      const aMaxX = legRow.maxX;
      for (let x = aMinX; x <= aMaxX; x += 1) {
        const sec = sectionGrid?.[y]?.[x];
        if (sec === "fg_arm" || sec === "fg_hand" || frameInfo.nearHandMask?.has(`${x},${y}`)) continue;
        if (ry === 0 || y === apronBottomY || x === aMinX || x === aMaxX) {
          target[y][x] = O;
        } else if (x === aMaxX - 1) {
          target[y][x] = L;
        } else {
          target[y][x] = P;
        }
      }
    }
    return;
  }

  // beltChainSash & fannyPackWaist
  for (let dy = 0; dy <= (pat === "fannyPackWaist" ? 2 : 1); dy += 1) {
    const y = waistY + dy;
    if (y < 0 || y >= GRID_SIZE) continue;
    const legRow = fgLegBounds?.byRow?.get(y) || waistSpan;
    for (let x = legRow.minX; x <= legRow.maxX; x += 1) {
      const sec = sectionGrid?.[y]?.[x];
      if (sec === "fg_arm" || sec === "fg_hand" || frameInfo.nearHandMask?.has(`${x},${y}`)) continue;
      if (dy === 0) {
        const isBuckle = x === (baseOrientation === "side" ? legRow.maxX - 1 : Math.round((legRow.minX + legRow.maxX) / 2));
        target[y][x] = (x === legRow.minX || x === legRow.maxX) ? O : (isBuckle ? L : S);
      } else if (pat === "fannyPackWaist" && x >= legRow.maxX - 3) {
        target[y][x] = (dy === 2 || x === legRow.maxX - 3 || x === legRow.maxX) ? O : (x === legRow.maxX - 1 ? L : P);
      }
    }
  }
}

function setHeadwearPixelSafe(target, frameInfo, x, y, color, allowOnFace = false) {
  if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE || !color) return;
  if (!allowOnFace) {
    const sec = frameInfo.sectionGrid?.[y]?.[x];
    const headMinY = frameInfo.sectionBounds?.head?.minY ?? (4 + frameInfo.headDy);
    // Protect eyes, nose, cheeks, and mouth in the head section
    if (sec === "head" && y >= headMinY) {
      return;
    }
  }
  target[y][x] = color;
}

function renderFittedHeadwear(target, baseGrid, frameInfo, preset, palette) {
  const { gender, baseOrientation, headTopY, headDy, sectionGrid, sectionBounds, sectionMap } = frameInfo;
  const { O, P, S, L } = palette;
  const pat = preset.patternId || (preset.subType === "hair" ? "bobPageboy" : "beret");
  const isHair = preset.subType === "hair";

  const hairBounds = sectionBounds?.hair;
  const headBounds = sectionBounds?.head;
  const craniumBounds = sectionBounds?.cranium;
  const neckBounds = sectionBounds?.neck;
  const torsoBounds = sectionBounds?.torso;

  const hMinX = hairBounds?.minX ?? craniumBounds?.minX ?? 13;
  const hMaxX = hairBounds?.maxX ?? craniumBounds?.maxX ?? 19;
  const hMinY = hairBounds?.minY ?? craniumBounds?.minY ?? headTopY;
  const hMaxY = hairBounds?.maxY ?? (8 + headDy);
  const faceMinY = headBounds?.minY ?? (hMinY + 3);
  const faceMaxX = headBounds?.maxX ?? hMaxX;
  const faceMaxY = headBounds?.maxY ?? (8 + headDy);

  if (isHair) {
    // 1. Shade all pixels inside the anatomical hair mask with directional 16-bit cluster shading
    const hairCoords = sectionMap?.hair || [];
    for (const [hx, hy] of hairCoords) {
      const orig = baseGrid[hy]?.[hx];
      if (!orig) continue;
      if (isSpriteOutline(orig) || orig === "#050004" || orig === "#120e26" || orig === "#140c1c") {
        target[hy][hx] = O;
        continue;
      }
      const relY = hy - hMinY;
      if (pat === "buzzFadeTop" && hy >= hMaxY - 1) {
        target[hy][hx] = S;
      } else if (relY <= 1 || (relY === 2 && hx >= hMinX + 2)) {
        target[hy][hx] = L;
      } else if (hx <= hMinX + 1 || hy >= hMaxY - 1) {
        target[hy][hx] = S;
      } else {
        target[hy][hx] = P;
      }
    }

    // 2. Sculpt distinctive hairstyle silhouettes anchored directly to the hair/head mask bounds
    if (pat === "buzzFadeTop") {
      return;
    }

    if (pat === "bobPageboy") {
      // Rounded bob back & tucked lower curl
      for (let y = hMinY + 1; y <= hMaxY; y += 1) {
        const rowSpan = hairBounds?.byRow?.get(y);
        if (!rowSpan) continue;
        const bx = rowSpan.minX - 1;
        if (bx >= 0) {
          setHeadwearPixelSafe(target, frameInfo, bx, y, O);
          setHeadwearPixelSafe(target, frameInfo, rowSpan.minX, y, y <= hMinY + 3 ? L : P);
        }
      }
      for (let x = hMinX; x <= hMinX + 3; x += 1) {
        setHeadwearPixelSafe(target, frameInfo, x, hMaxY + 1, O);
      }
      return;
    }

    if (pat === "pioneerBun") {
      // Sculpted 4x4 coiled chignon bun at the back of the crown with hairpin highlight
      const bunX = Math.max(1, hMinX - 3);
      const bunY = hMinY + 2;
      const bunRows = [
        ".OO.",
        "OLLO",
        "OPSO",
        ".OO."
      ];
      drawPatternRowsAt(target, bunX, bunY, bunRows, { O, P, S, L });
      setHeadwearPixelSafe(target, frameInfo, hMinX, bunY + 1, L); // Hairpin / ribbon accent
      return;
    }

    if (pat === "ponytailQueue") {
      // Ribbon tie at nape + flowing ponytail cascading behind shoulder
      const tieX = hMinX - 1;
      const tieY = hMinY + 3;
      setHeadwearPixelSafe(target, frameInfo, tieX, tieY, L);
      const tailRows = [
        ".OO.",
        "OLLO",
        "OPPO",
        "OSSO",
        ".OO."
      ];
      drawPatternRowsAt(target, Math.max(1, hMinX - 3), tieY + 1, tailRows, { O, P, S, L });
      return;
    }

    if (pat === "longTwinBraids") {
      // Woven braid plait draping down from behind the temple over the shoulder
      const braidX = hMinX + 1;
      for (let dy = 0; dy <= 6; dy += 1) {
        const y = hMaxY - 1 + dy;
        if (y >= GRID_SIZE - 1) break;
        setHeadwearPixelSafe(target, frameInfo, braidX - 1, y, O);
        setHeadwearPixelSafe(target, frameInfo, braidX, y, dy === 5 ? L : (dy % 2 === 0 ? L : S));
        setHeadwearPixelSafe(target, frameInfo, braidX + 1, y, dy === 6 ? O : (dy % 2 === 0 ? P : L));
        setHeadwearPixelSafe(target, frameInfo, braidX + 2, y, O);
      }
      return;
    }

    if (pat === "longWavyFlow" || pat === "longPartedCascade") {
      // Voluminous crown wave + long flowing locks cascading down the upper back
      for (let x = hMinX + 1; x <= hMaxX - 1; x += 1) {
        setHeadwearPixelSafe(target, frameInfo, x, hMinY - 1, O);
        setHeadwearPixelSafe(target, frameInfo, x, hMinY, L);
      }
      for (let dy = 0; dy <= 5; dy += 1) {
        const y = hMaxY - 1 + dy;
        if (y >= GRID_SIZE - 1) break;
        const waveShift = (pat === "longWavyFlow" && dy % 2 === 1) ? -1 : 0;
        const lx = Math.max(1, hMinX - 1 + waveShift);
        setHeadwearPixelSafe(target, frameInfo, lx, y, O);
        setHeadwearPixelSafe(target, frameInfo, lx + 1, y, dy % 2 === 0 ? L : P);
        setHeadwearPixelSafe(target, frameInfo, lx + 2, y, dy >= 4 ? O : S);
        setHeadwearPixelSafe(target, frameInfo, lx + 3, y, O);
      }
      return;
    }

    if (pat === "curlsWig") {
      // High powdered/baroque bouffant with tiered horizontal ringlet curls
      for (let x = hMinX; x <= hMaxX; x += 1) {
        setHeadwearPixelSafe(target, frameInfo, x, hMinY - 1, O);
        setHeadwearPixelSafe(target, frameInfo, x, hMinY, L);
      }
      for (let y = hMinY + 2; y <= hMaxY + 2; y += 1) {
        const curlCol = (y - hMinY) % 2 === 0 ? L : S;
        for (let x = hMinX - 1; x <= hMinX + 2; x += 1) {
          if (x === hMinX - 1 || y === hMaxY + 2) {
            setHeadwearPixelSafe(target, frameInfo, x, y, O);
          } else {
            setHeadwearPixelSafe(target, frameInfo, x, y, curlCol);
          }
        }
      }
      return;
    }

    if (pat === "spikyCurtains") {
      // Dynamic jagged spike tips rising above the crown + parted front bangs
      for (let x = hMinX; x <= hMaxX; x += 2) {
        setHeadwearPixelSafe(target, frameInfo, x, Math.max(0, hMinY - 2), O);
        setHeadwearPixelSafe(target, frameInfo, x, Math.max(0, hMinY - 1), L);
        if (x + 1 <= hMaxX) {
          setHeadwearPixelSafe(target, frameInfo, x + 1, Math.max(0, hMinY - 1), O);
          setHeadwearPixelSafe(target, frameInfo, x + 1, hMinY, P);
        }
      }
      return;
    }

    if (pat === "pompadourAfro") {
      // Full rounded halo / pompadour volume expanding above & forward from crown
      const topY = Math.max(0, hMinY - 2);
      for (let y = topY; y <= faceMinY; y += 1) {
        const isTopOrBot = y === topY;
        const rLeft = hMinX - (y >= hMinY ? 2 : 1);
        const rRight = hMaxX + (y <= faceMinY - 1 ? 1 : 0);
        for (let x = rLeft; x <= rRight; x += 1) {
          if (isTopOrBot || x === rLeft || x === rRight) {
            setHeadwearPixelSafe(target, frameInfo, x, y, O);
          } else {
            setHeadwearPixelSafe(target, frameInfo, x, y, ((x + y) % 2 === 0) ? L : P);
          }
        }
      }
      return;
    }

    if (pat === "frontierBeardHair") {
      // Bushy mountain-man hair + full sculpted trail beard across lower jaw & neck
      const jawStartY = Math.max(faceMinY + 2, faceMaxY - 1);
      const beardEndY = Math.min(GRID_SIZE - 2, faceMaxY + 3);
      for (let y = jawStartY; y <= beardEndY; y += 1) {
        const dy = y - jawStartY;
        const bMinX = (neckBounds?.minX ?? 15) - (dy <= 1 ? 1 : 0);
        const bMaxX = faceMaxX - (dy >= 3 ? 1 : 0);
        for (let x = bMinX; x <= bMaxX; x += 1) {
          if (y === beardEndY || x === bMinX || x === bMaxX) {
            setHeadwearPixelSafe(target, frameInfo, x, y, O, true);
          } else if (dy === 0) {
            setHeadwearPixelSafe(target, frameInfo, x, y, L, true); // Mustache highlight
          } else {
            setHeadwearPixelSafe(target, frameInfo, x, y, dy >= 2 ? S : P, true);
          }
        }
      }
      return;
    }
    return;
  }

  // ============================================================================
  // MASK-DRIVEN HATS & HELMETS (anchored to hairBounds & headBounds)
  // ============================================================================
  const brimY = Math.max(2, faceMinY);
  const crownTopY = Math.max(0, hMinY - 1);

  if (pat === "sunbonnet") {
    // Pioneer Prairie Sunbonnet wrapping the back of hair with a projecting front poke-brim & chin ribbon
    for (let y = crownTopY; y <= hMaxY; y += 1) {
      const hRow = hairBounds?.byRow?.get(y) || { minX: hMinX, maxX: hMaxX };
      const bLeft = hRow.minX - 1;
      const bRight = y <= brimY + 1 ? faceMaxX + 2 : Math.min(faceMaxX - 2, hRow.maxX);
      for (let x = bLeft; x <= bRight; x += 1) {
        if (y === crownTopY || y === hMaxY || x === bLeft || x === bRight) {
          setHeadwearPixelSafe(target, frameInfo, x, y, O);
        } else if (x >= bRight - 2 && y <= brimY + 1) {
          setHeadwearPixelSafe(target, frameInfo, x, y, L); // Sunlit poke-brim
        } else if (x <= bLeft + 2) {
          setHeadwearPixelSafe(target, frameInfo, x, y, S); // Gathered bonnet back
        } else {
          setHeadwearPixelSafe(target, frameInfo, x, y, P);
        }
      }
    }
    // Chin ribbon bow at neck
    if (neckBounds) {
      setHeadwearPixelSafe(target, frameInfo, neckBounds.minX, neckBounds.minY, L, true);
      setHeadwearPixelSafe(target, frameInfo, neckBounds.minX, neckBounds.minY + 1, S, true);
    }
    return;
  }

  if (pat === "coonskinCap") {
    // Mottled fur dome over crown + striped raccoon tail hanging behind head
    for (let y = crownTopY; y <= brimY; y += 1) {
      const rLeft = hMinX - 1;
      const rRight = hMaxX;
      for (let x = rLeft; x <= rRight; x += 1) {
        if (y === crownTopY || x === rLeft || x === rRight) {
          setHeadwearPixelSafe(target, frameInfo, x, y, O);
        } else {
          const furCol = (x + y) % 3 === 0 ? L : ((x + y) % 2 === 0 ? P : S);
          setHeadwearPixelSafe(target, frameInfo, x, y, furCol);
        }
      }
    }
    // Ringed raccoon tail at back
    const tailX = Math.max(1, hMinX - 3);
    for (let dy = 0; dy <= 5; dy += 1) {
      const y = brimY + dy;
      setHeadwearPixelSafe(target, frameInfo, tailX, y, O);
      setHeadwearPixelSafe(target, frameInfo, tailX + 1, y, dy === 5 ? O : (dy % 2 === 0 ? L : S));
      setHeadwearPixelSafe(target, frameInfo, tailX + 2, y, O);
    }
    return;
  }

  if (pat === "topHat" || pat === "puritanCapotain") {
    // Tall stovepipe / pilgrim capotain cylinder rising above hairMinY with flat brim at brimY
    const tallTopY = Math.max(0, hMinY - 2);
    for (let y = tallTopY; y <= brimY; y += 1) {
      const isBrim = y === brimY;
      const rLeft = isBrim ? hMinX - 2 : hMinX;
      const rRight = isBrim ? faceMaxX + 1 : hMaxX - 1;
      for (let x = rLeft; x <= rRight; x += 1) {
        if (y === tallTopY || isBrim || x === rLeft || x === rRight) {
          setHeadwearPixelSafe(target, frameInfo, x, y, O);
        } else if (y === brimY - 1) {
          const isBuckle = pat === "puritanCapotain" && x >= rRight - 2;
          setHeadwearPixelSafe(target, frameInfo, x, y, isBuckle ? L : S); // Hatband & pilgrim buckle
        } else {
          setHeadwearPixelSafe(target, frameInfo, x, y, x >= rRight - 2 ? L : P);
        }
      }
    }
    return;
  }

  if (pat === "slouchHat" || pat === "boaterFedora" || pat === "plumedHat") {
    // Pinched frontier crown + hatband + sweeping wide brim
    const topY = Math.max(0, hMinY - 1);
    for (let y = topY; y <= brimY; y += 1) {
      const isBrim = y === brimY;
      const rLeft = isBrim ? hMinX - 2 : hMinX + (y === topY ? 1 : 0);
      const rRight = isBrim ? faceMaxX + 2 : hMaxX - (y === topY ? 1 : 0);
      for (let x = rLeft; x <= rRight; x += 1) {
        if (y === topY || x === rLeft || x === rRight) {
          setHeadwearPixelSafe(target, frameInfo, x, y, O);
        } else if (isBrim) {
          setHeadwearPixelSafe(target, frameInfo, x, y, (x === rLeft + 1 || x === rRight - 1) ? P : O);
        } else if (y === brimY - 1) {
          setHeadwearPixelSafe(target, frameInfo, x, y, x === rRight - 1 ? L : S); // Hatband
        } else {
          setHeadwearPixelSafe(target, frameInfo, x, y, x >= rRight - 2 ? L : P);
        }
      }
    }
    if (pat === "plumedHat") {
      // Sweeping feather plume arching off the back of the crown
      setHeadwearPixelSafe(target, frameInfo, hMinX - 1, topY, L);
      setHeadwearPixelSafe(target, frameInfo, hMinX - 2, topY + 1, L);
      setHeadwearPixelSafe(target, frameInfo, hMinX - 3, topY + 2, P);
    }
    return;
  }

  if (pat === "tricorne" || pat === "bicorne") {
    // Cocked upturned triangular dark brim with gold/lace trim along the top crest & cockade rosette
    const topY = Math.max(0, hMinY - 1);
    for (let y = topY; y <= brimY; y += 1) {
      const dy = y - topY;
      const rLeft = hMinX - dy;
      const rRight = hMaxX + (dy >= 2 ? 1 : 0);
      for (let x = rLeft; x <= rRight; x += 1) {
        if (x === rLeft || x === rRight || y === brimY) {
          setHeadwearPixelSafe(target, frameInfo, x, y, O);
        } else if (y === topY) {
          setHeadwearPixelSafe(target, frameInfo, x, y, L); // Gold lace trim along cocked crest
        } else if (x === Math.round((rLeft + rRight) / 2) && dy === 2) {
          setHeadwearPixelSafe(target, frameInfo, x, y, L); // Cockade rosette
        } else {
          setHeadwearPixelSafe(target, frameInfo, x, y, dy === 1 ? P : S);
        }
      }
    }
    return;
  }

  if (pat === "headbandBandana") {
    // Wraparound headband / sweatband across forehead row with knot tails at back
    for (let x = hMinX - 1; x <= faceMaxX; x += 1) {
      setHeadwearPixelSafe(target, frameInfo, x, brimY - 1, (x === hMinX - 1 || x === faceMaxX) ? O : (x >= faceMaxX - 2 ? L : P));
      setHeadwearPixelSafe(target, frameInfo, x, brimY, O);
    }
    setHeadwearPixelSafe(target, frameInfo, hMinX - 2, brimY, S);
    setHeadwearPixelSafe(target, frameInfo, hMinX - 3, brimY + 1, P);
    return;
  }

  // Default fitted caps, berets, cloches, flat caps, beanies & steel helmets
  const isVisorCap = pat === "capBeanie" || pat === "newsboyFlatCap" || pat === "backwardsCap";
  const isBackwards = pat === "backwardsCap";
  const isCloche = pat === "clocheBellHat" || pat === "steelHelmet";

  for (let y = hMinY; y <= brimY; y += 1) {
    const isBrimRow = y === brimY;
    let rLeft = hMinX - (isBrimRow && isBackwards ? 2 : (isCloche ? 1 : 0));
    let rRight = hMaxX + (isBrimRow && isVisorCap && !isBackwards ? 2 : (isCloche ? 1 : 0));
    for (let x = rLeft; x <= rRight; x += 1) {
      if (y === hMinY || x === rLeft || x === rRight || (isBrimRow && !isVisorCap)) {
        setHeadwearPixelSafe(target, frameInfo, x, y, O);
      } else if (isBrimRow && isVisorCap) {
        setHeadwearPixelSafe(target, frameInfo, x, y, (x >= hMaxX || x <= hMinX) ? L : O);
      } else if (x >= rRight - 2) {
        setHeadwearPixelSafe(target, frameInfo, x, y, L);
      } else if (x <= rLeft + 1) {
        setHeadwearPixelSafe(target, frameInfo, x, y, S);
      } else {
        setHeadwearPixelSafe(target, frameInfo, x, y, P);
      }
    }
  }
}

function overlayFittedClothing(baseGrid, appearance, baseOrientation = "front", animMode = "idle", frameIndex = 0) {
  const target = baseGrid.map((row) => [...row]);
  const gender = appearance?.gender === "female" ? "female" : "male";
  const frameInfo = analyzeBoilerplateFrame(baseGrid, gender, baseOrientation, animMode, frameIndex);

  const pantsPresetId = String(appearance?.equippedPresets?.pants || "");
  const pantsPreset = (INITIAL_CLOTHING_BOILERPLATE.pants || []).find((entry) => entry.id === pantsPresetId);
  const shoesPresetId = String(appearance?.equippedPresets?.shoes || "");
  const shoesPreset = (INITIAL_CLOTHING_BOILERPLATE.shoes || []).find((entry) => entry.id === shoesPresetId);
  const shirtsPresetId = String(appearance?.equippedPresets?.shirts || "");
  const shirtsPreset = (INITIAL_CLOTHING_BOILERPLATE.shirts || []).find((entry) => entry.id === shirtsPresetId);
  const hasShoes = Boolean(shoesPreset && !shoesPreset.isNone);

  const drawOrder = ["pants", "shoes", "shirts", "accessories", "hats"];

  for (const category of drawOrder) {
    const presetId = String(appearance?.equippedPresets?.[category] || "");
    const preset = (INITIAL_CLOTHING_BOILERPLATE[category] || []).find((entry) => entry.id === presetId);
    if (!preset || preset.isNone) continue;

    const dyeId = appearance?.categoryDyes?.[category] || "default";
    const palette = resolveGarmentPalette(preset, dyeId, appearance?.hairColorId);

    const frameSpecificKey = `clothing:${presetId}:${baseOrientation}:${animMode}:${frameIndex}`;
    const orientationKey = `clothing:${presetId}:${baseOrientation}`;
    const hasSpecific = CUSTOM_SPRITE_OVERRIDES.has(frameSpecificKey);
    let customGrid = hasSpecific
      ? CUSTOM_SPRITE_OVERRIDES.get(frameSpecificKey)
      : CUSTOM_SPRITE_OVERRIDES.get(orientationKey);
    if (customGrid && category === 'hats' && preset.subType === 'hair' && dyeId === 'default') {
      customGrid = recolorCustomHairGrid(customGrid, preset, appearance?.hairColorId);
    }
    if (customGrid) {
      let shiftX = 0;
      let shiftY = 0;
      if (!hasSpecific && (category === "hats" || category === "accessories")) {
        const refBase = getBaseBoilerplateGrid(gender, baseOrientation, "walk", 0);
        if (refBase) {
          const refInfo = analyzeBoilerplateFrame(refBase, gender, baseOrientation, "walk", 0);
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
      if (category === "pants") {
        renderFittedPantsOrSkirt(target, baseGrid, frameInfo, preset, palette, hasShoes);
      } else if (category === "shoes") {
        renderFittedShoes(target, baseGrid, frameInfo, preset, palette);
      } else if (category === "shirts") {
        renderFittedShirt(target, baseGrid, frameInfo, preset, palette);
      } else if (category === "accessories") {
        renderFittedAccessory(target, baseGrid, frameInfo, preset, palette);
      } else if (category === "hats") {
        renderFittedHeadwear(target, baseGrid, frameInfo, preset, palette);
      }
    }
  }

  // Restore foreground hand pixels (and bare foreground forearm/shoulder when not covered by long/short sleeves)
  const shirtPat = shirtsPreset && !shirtsPreset.isNone ? (shirtsPreset.patternId || "teeHoodie") : "none";
  const shirtCoversForearm =
    shirtPat === "fringedBuckskin" ||
    shirtPat === "suitJacket" ||
    shirtPat === "doubletCoat" ||
    shirtPat === "capeletCoat" ||
    shirtPat === "turtleneckSweater";
  const shirtCoversSleeve = shirtPat !== "none" && shirtPat !== "vestJerkin" && shirtPat !== "sleevelessTank";

  if (frameInfo.sectionMap) {
    for (const [hx, hy] of (frameInfo.sectionMap.fg_hand || [])) {
      if (baseGrid[hy]?.[hx]) target[hy][hx] = baseGrid[hy][hx];
    }
    if (!shirtCoversForearm) {
      for (const [ax, ay] of (frameInfo.sectionMap.fg_arm || [])) {
        if (baseGrid[ay]?.[ax]) target[ay][ax] = baseGrid[ay][ax];
      }
    }
    if (!shirtCoversSleeve) {
      for (const [sx, sy] of (frameInfo.sectionMap.fg_sleeve || [])) {
        if (baseGrid[sy]?.[sx]) target[sy][sx] = baseGrid[sy][sx];
      }
    }
  } else if (frameInfo.nearHandPixels && frameInfo.nearHandPixels.length > 0) {
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
    const skinGrid = applySkinToneToSpriteGrid(
      rawGrid,
      appearance?.skinToneId,
      gender,
      getFrameSkinRoleMap(gender, 'front', effectiveMode, frameIndex)
    );
    const hairMask = getFrameSectionMap(gender, 'front', effectiveMode, frameIndex, rawGrid)?.hair;
    const spriteGrid = applyHairColorToSpriteGrid(skinGrid, appearance?.hairColorId, gender, hairMask, 'front', effectiveMode, frameIndex, getFrameHairRoleMap(gender, 'front', effectiveMode, frameIndex));
    return overlayFittedClothing(spriteGrid, appearance, 'front', effectiveMode, frameIndex);
  }

  const rawGrid = getBaseSpriteGrid(gender, 'east', animMode, frameIndex);
  if (!rawGrid) return getLegacyCharacterFrameGrid(appearance, view, animMode, frameIndex);
  const skinGrid = applySkinToneToSpriteGrid(
    rawGrid,
    appearance?.skinToneId,
    gender,
    getFrameSkinRoleMap(gender, 'side', animMode, frameIndex)
  );
  const hairMask = getFrameSectionMap(gender, 'side', animMode, frameIndex, rawGrid)?.hair;
  const eastGrid = applyHairColorToSpriteGrid(skinGrid, appearance?.hairColorId, gender, hairMask, 'side', animMode, frameIndex, getFrameHairRoleMap(gender, 'side', animMode, frameIndex));
  const dressedEast = overlayFittedClothing(eastGrid, appearance, 'side', animMode, frameIndex);
  return isSideLeft ? dressedEast.map((row) => [...row].reverse()) : dressedEast;
}

export function getCharacterOutfitGrid(appearance, view = 'front') {
  const gender = appearance?.gender === 'female' ? 'female' : 'male';
  const isSide = view === 'side' || view === 'side_right' || view === 'side_left';
  const dir = isSide ? 'east' : 'south';
  const rawGrid = getBaseSpriteGrid(gender, dir, 'idle', 0);
  if (!rawGrid) return buildNeutralCompositeGrid(appearance, isSide ? 'side' : 'front');
  const skinGrid = applySkinToneToSpriteGrid(
    rawGrid,
    appearance?.skinToneId,
    gender,
    getFrameSkinRoleMap(gender, isSide ? 'side' : 'front', 'idle', 0)
  );
  const hairMask = getFrameSectionMap(gender, isSide ? 'side' : 'front', 'idle', 0, rawGrid)?.hair;
  const spriteGrid = applyHairColorToSpriteGrid(skinGrid, appearance?.hairColorId, gender, hairMask, isSide ? 'side' : 'front', 'idle', 0, getFrameHairRoleMap(gender, isSide ? 'side' : 'front', 'idle', 0));
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
  const horizonY = Math.max(12, charFootY - 26);

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
    const sunY = Math.max(5, Math.floor(horizonY * 0.26));
    ctx.fillStyle = backdrop.sunColor;
    ctx.fillRect(sunX - 3, sunY - 4, 7, 9);
    ctx.fillRect(sunX - 4, sunY - 3, 9, 7);
    return;
  }

  if (layer === 'clouds') {
    const cloudScroll = Math.floor(scrollOffset * 0.15);
    ctx.fillStyle = backdropId === 'desert' ? '#f6d6bd' : '#ffffff';
    for (let cloud = 0; cloud < 4; cloud += 1) {
      const cloudX = (((cloud * 52 + 12 - cloudScroll) % (width + 32)) + (width + 32)) % (width + 32) - 16;
      const cloudY = 4 + (cloud % 2) * 6;
      if (cloudY + 4 >= horizonY) continue;
      ctx.fillRect(cloudX, cloudY + 2, 16, 2);
      ctx.fillRect(cloudX + 2, cloudY + 1, 12, 1);
      ctx.fillRect(cloudX + 4, cloudY, 7, 1);
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
        Math.abs(((worldX * 0.7) % 44) - 22) * 0.85
        + Math.abs(((worldX * 0.35 + 11) % 28) - 14) * 0.55;
      const peakTop = Math.max(3, Math.floor(horizonY - 22 + peakWave));
      ctx.fillStyle = backdrop.distantColor;
      ctx.fillRect(x, peakTop, 1, horizonY - peakTop);
      const snowLine = peakTop + Math.min(7, Math.floor((horizonY - peakTop) * 0.4));
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, peakTop, 1, Math.max(1, snowLine - peakTop));
    } else if (backdropId === 'desert') {
      const mod = ((worldX % 58) + 58) % 58;
      let mesaHeight = 4;
      if (mod >= 8 && mod <= 32) mesaHeight = 16;
      else if (mod === 6 || mod === 7 || mod === 33 || mod === 34) mesaHeight = 11;
      else if (mod === 4 || mod === 5 || mod === 35 || mod === 36) mesaHeight = 6;
      const topY = horizonY - mesaHeight;
      ctx.fillStyle = backdrop.distantColor;
      ctx.fillRect(x, topY, 1, mesaHeight);
      if (mesaHeight >= 11) {
        ctx.fillStyle = '#de5d3a';
        ctx.fillRect(x, topY + 3, 1, 2);
        ctx.fillRect(x, topY + 8, 1, 2);
      }
    } else {
      const hillH = Math.floor(6 + Math.sin(worldX * 0.065) * 3.5 + Math.cos(worldX * 0.03) * 2.5);
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
  const horizonY = Math.max(12, charFootY - 26);
  const pathStartY = Math.max(18, charFootY - 10);
  const pathEndY = Math.min(H - 2, charFootY + 6);
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
    ctx.fillRect(0, pathStartY - 5, W, 5);
    for (let gx = 0; gx < W; gx += 2) {
      const wx = Math.floor((gx + midScroll) / 2);
      const r = hashInt(wx);
      if (r > 0.30) {
        ctx.fillStyle = r > 0.80 ? '#f7e26b' : r > 0.66 ? '#ec273f' : '#a3ce27';
        ctx.fillRect(gx, pathStartY - 8, 1, 3);
      }
    }
    for (let x = 0; x < W; x++) {
      const wx = (((x + midScroll) % 64) + 64) % 64;
      if (wx === 24) {
        // Scaled-up frontier wooden milepost / guidepost
        ctx.fillStyle = '#442434';
        ctx.fillRect(x, pathStartY - 12, 3, 11);
        ctx.fillStyle = '#663931';
        ctx.fillRect(x + 1, pathStartY - 11, 1, 10);
        ctx.fillStyle = '#442434';
        ctx.fillRect(x - 3, pathStartY - 10, 9, 4);
        ctx.fillStyle = '#e4a672';
        ctx.fillRect(x - 2, pathStartY - 9, 7, 2);
      }
    }
  } else if (backdropId === 'mountains' || backdropId === 'snow') {
    for (let x = -8; x < W + 8; x++) {
      const wx = (((x + midScroll) % 24) + 24) % 24;
      if (wx === 11) {
        const treeBaseY = pathStartY - 1;
        ctx.fillStyle = '#442434';
        ctx.fillRect(x, treeBaseY - 4, 3, 4);
        ctx.fillStyle = backdropId === 'snow' ? '#2f484e' : '#140c1c';
        ctx.fillRect(x - 4, treeBaseY - 8, 11, 4);
        ctx.fillRect(x - 3, treeBaseY - 12, 9, 4);
        ctx.fillRect(x - 2, treeBaseY - 15, 7, 3);
        ctx.fillRect(x - 1, treeBaseY - 17, 5, 2);
        ctx.fillRect(x, treeBaseY - 19, 3, 2);
        if (backdropId === 'snow') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x - 4, treeBaseY - 8, 11, 1);
          ctx.fillRect(x - 3, treeBaseY - 12, 9, 1);
          ctx.fillRect(x - 2, treeBaseY - 15, 7, 1);
        }
      }
    }
  } else if (backdropId === 'desert') {
    for (let x = -8; x < W + 8; x++) {
      const wx = (((x + midScroll) % 42) + 42) % 42;
      if (wx === 16) {
        const cBase = pathStartY - 1;
        ctx.fillStyle = '#44891a';
        ctx.fillRect(x, cBase - 14, 3, 14);
        ctx.fillRect(x - 3, cBase - 9, 3, 2);
        ctx.fillRect(x - 3, cBase - 13, 2, 5);
        ctx.fillRect(x + 3, cBase - 8, 3, 2);
        ctx.fillRect(x + 4, cBase - 12, 2, 5);
        ctx.fillStyle = '#a3ce27';
        ctx.fillRect(x, cBase - 14, 1, 13);
      } else if (wx === 34) {
        ctx.fillStyle = '#743f39';
        ctx.fillRect(x, pathStartY - 4, 5, 3);
        ctx.fillStyle = '#b86f50';
        ctx.fillRect(x + 1, pathStartY - 5, 3, 1);
      }
    }
  } else if (backdropId === 'river') {
    const firstBankRow = drawRiverWater ? horizonY + 2 : horizonY;
    for (let y = firstBankRow; y < pathStartY; y += 1) {
      const bounds = riverBoundsAtY(W, y, horizonY, pathEndY, H, landmarkId);
      ctx.fillStyle = y >= pathStartY - 4 ? '#a3ce27' : bd.midHillColor;
      ctx.fillRect(0, y, bounds.start, 1);
      ctx.fillRect(bounds.end, y, W - bounds.end, 1);
      if (drawRiverWater) {
        drawRiverChannelRow(ctx, W, y, horizonY, pathStartY, pathEndY, H, riverProfile.depthScale, effectiveWaterlineOffsetPx, landmarkId);
      }
    }
  }

  // 6. Scaled-Up Trail Road Surface & Wheel Ruts
  const pathScroll = Math.floor(scrollOffset);
  const pathH = pathEndY - pathStartY;
  if (backdropId === 'river') {
    for (let y = pathStartY; y < pathEndY; y += 1) {
      const bounds = riverBoundsAtY(W, y, horizonY, pathEndY, H, landmarkId);
      ctx.fillStyle = y <= pathStartY + 1 ? '#e4a672' : y >= pathEndY - 2 ? '#8f563b' : '#b86f50';
      ctx.fillRect(0, y, bounds.start, 1);
      ctx.fillRect(bounds.end, y, W - bounds.end, 1);
      if (drawRiverWater) {
        drawRiverChannelRow(ctx, W, y, horizonY, pathStartY, pathEndY, H, riverProfile.depthScale, effectiveWaterlineOffsetPx, landmarkId);
      }
    }
  } else {
    // Upper sunlit road verge (2px)
    ctx.fillStyle = bd.pathTop;
    ctx.fillRect(0, pathStartY, W, 2);
    // Main packed dirt road bed
    ctx.fillStyle = bd.pathMain;
    ctx.fillRect(0, pathStartY + 2, W, Math.max(1, pathH - 4));
    // Lower shaded road embankment (2px)
    ctx.fillStyle = bd.pathRut;
    ctx.fillRect(0, pathEndY - 2, W, 2);

    // Dual parallel wagon wheel rut bands with ridge highlights
    const upperRutY = pathStartY + 4;
    const lowerRutY = pathEndY - 5;
    ctx.fillStyle = bd.pathRut;
    ctx.fillRect(0, upperRutY, W, 1);
    ctx.fillRect(0, lowerRutY, W, 1);
    ctx.fillStyle = bd.pathTop;
    ctx.fillRect(0, upperRutY + 1, W, 1);
    ctx.fillRect(0, lowerRutY - 1, W, 1);

    // Textured wagon tracks, cobbles, pebbles & verge grass tufts
    for (let x = 0; x < W; x++) {
      const wx = x + pathScroll;
      // Interrupted wheel-track grooves
      if (((wx % 8) + 8) % 8 < 5) {
        ctx.fillStyle = bd.pathRut;
        ctx.fillRect(x, upperRutY, 1, 2);
        ctx.fillRect(x, lowerRutY, 1, 2);
      } else {
        ctx.fillStyle = bd.pathMain;
        ctx.fillRect(x, upperRutY, 1, 1);
        ctx.fillRect(x, lowerRutY, 1, 1);
      }
      // Roadway stones & gravel clusters
      const h1 = hashInt(wx * 3);
      if (h1 > 0.82) {
        const stoneY = pathStartY + 2 + (Math.floor(hashInt(wx + 17) * 100) % Math.max(1, pathH - 5));
        ctx.fillStyle = bd.pathRut;
        ctx.fillRect(x, stoneY, 2, 2);
        ctx.fillStyle = bd.pathTop;
        ctx.fillRect(x, stoneY, 1, 1);
      } else if (h1 < 0.14) {
        const pebbleY = pathStartY + 3 + (Math.floor(hashInt(wx + 31) * 100) % Math.max(1, pathH - 6));
        ctx.fillStyle = bd.pathTop;
        ctx.fillRect(x, pebbleY, 2, 1);
      }
      // Grass overhang along top edge of road
      if (wx % 5 === 0 && hashInt(wx + 5) > 0.45) {
        ctx.fillStyle = backdropId === 'prairie' ? bd.nearGrassColor : bd.midHillColor;
        ctx.fillRect(x, pathStartY, 2, 1);
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
    if (hashInt(wx * 2) > 0.45) {
      ctx.fillStyle = bd.midHillColor;
      ctx.fillRect(x, pathEndY, 2, 2);
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
 * Scaled for 1.0x (32x32) characters (~56px wide x 52-56px tall, 24px doors)
 */
export function drawEraHomeBuilding(ctx, eraId, baseX, groundY) {
  const x = Math.round(baseX);
  const y = Math.round(groundY);
  if (x + 68 < 0 || x > 640) return;

  if (eraId === '1500s' || eraId === '1600s') {
    // Tudor / Baroque Half-Timbered Manor (56px wide, 54px tall)
    ctx.fillStyle = '#f6d6bd';
    ctx.fillRect(x + 4, y - 36, 48, 36);
    // Heavy oak timber framing
    ctx.fillStyle = '#442434';
    ctx.fillRect(x + 4, y - 36, 48, 3);
    ctx.fillRect(x + 4, y - 20, 48, 3);
    ctx.fillRect(x + 4, y - 3, 48, 3);
    ctx.fillRect(x + 4, y - 36, 3, 36);
    ctx.fillRect(x + 26, y - 36, 3, 36);
    ctx.fillRect(x + 49, y - 36, 3, 36);
    // Steep gabled roof (16px high)
    for (let r = 0; r < 16; r++) {
      ctx.fillStyle = eraId === '1500s' ? '#743f39' : '#3a4466';
      ctx.fillRect(x + r, y - 37 - r, 56 - r * 2, 1);
    }
    // Tall arched oak doorway (12x24px) & leaded casement windows
    ctx.fillStyle = '#442434';
    ctx.fillRect(x + 32, y - 24, 12, 24);
    ctx.fillStyle = '#663931';
    ctx.fillRect(x + 34, y - 22, 8, 22);
    ctx.fillStyle = '#f3a833';
    ctx.fillRect(x + 40, y - 12, 1, 2);
    // Windows
    ctx.fillStyle = '#442434';
    ctx.fillRect(x + 10, y - 31, 12, 10);
    ctx.fillRect(x + 10, y - 15, 12, 10);
    ctx.fillStyle = '#f7e26b';
    ctx.fillRect(x + 12, y - 29, 8, 6);
    ctx.fillRect(x + 12, y - 13, 8, 6);
  } else if (eraId === '1700s' || eraId === '1800s' || eraId === '1900_1920') {
    // Colonial Brick / Victorian / Edwardian Townhouse (56px wide, 56px tall)
    ctx.fillStyle = eraId === '1700s' ? '#ac2847' : eraId === '1800s' ? '#5a6988' : '#e4a672';
    ctx.fillRect(x + 4, y - 38, 48, 38);
    // Tall brick chimney & pitched slate roof
    ctx.fillStyle = '#262b44';
    ctx.fillRect(x + 40, y - 54, 7, 16);
    for (let r = 0; r < 13; r++) {
      ctx.fillRect(x + r, y - 39 - r, 56 - r * 2, 1);
    }
    // White cornice & window trim
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 3, y - 38, 50, 2);
    for (const wy of [y - 33, y - 18]) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 10, wy, 9, 10);
      ctx.fillRect(x + 23, wy, 9, 10);
      ctx.fillStyle = '#262b44';
      ctx.fillRect(x + 11, wy + 1, 7, 8);
      ctx.fillRect(x + 24, wy + 1, 7, 8);
      ctx.fillStyle = '#f7e26b';
      ctx.fillRect(x + 12, wy + 2, 5, 6);
      ctx.fillRect(x + 25, wy + 2, 5, 6);
    }
    // Pedimented front doorway (12x25px) on right side facing trail
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 35, y - 25, 13, 25);
    ctx.fillRect(x + 34, y - 27, 15, 2);
    ctx.fillStyle = '#442434';
    ctx.fillRect(x + 37, y - 23, 9, 23);
    ctx.fillStyle = '#f3a833';
    ctx.fillRect(x + 44, y - 12, 1, 2);
  } else if (eraId === '1921_1940' || eraId === '1941_1950' || eraId === '1950s' || eraId === '1960s' || eraId === '1970s') {
    // Mid-20th Century Art Deco / Diner Ranch / Brownstone (56px wide, 46px tall)
    const wallColor = eraId === '1950s' ? '#b2dce8' : eraId === '1960s' ? '#f3a833' : eraId === '1970s' ? '#b86f50' : '#c2c3c7';
    ctx.fillStyle = wallColor;
    ctx.fillRect(x + 2, y - 34, 52, 34);
    // Stepped mid-century roofline
    ctx.fillStyle = eraId === '1950s' ? '#ec273f' : '#3a4466';
    ctx.fillRect(x, y - 39, 56, 5);
    if (eraId === '1921_1940') {
      ctx.fillRect(x + 12, y - 45, 32, 6);
    }
    // Wide picture window & 12x24px front door
    ctx.fillStyle = '#442434';
    ctx.fillRect(x + 7, y - 26, 22, 15);
    ctx.fillStyle = '#f7e26b';
    ctx.fillRect(x + 9, y - 24, 18, 11);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 8, y - 26, 20, 2);
    ctx.fillStyle = '#262b44';
    ctx.fillRect(x + 35, y - 24, 13, 24);
    ctx.fillStyle = '#8f563b';
    ctx.fillRect(x + 37, y - 22, 9, 22);
  } else if (eraId === '1980s' || eraId === '1990s' || eraId === '2000s' || eraId === '2010s' || eraId === '2020s') {
    // Late 20th / 21st Century Home (56px wide, 46px tall)
    ctx.fillStyle = eraId === '1980s' ? '#262b44' : eraId === '2020s' ? '#140c1c' : '#5a6988';
    ctx.fillRect(x + 2, y - 36, 52, 36);
    ctx.fillStyle = eraId === '1980s' ? '#ec273f' : eraId === '2020s' ? '#00ff66' : '#3a4466';
    ctx.fillRect(x, y - 40, 56, 4);
    // Large modern glass panes
    ctx.fillStyle = eraId === '1980s' ? '#31a2f2' : '#b2dce8';
    ctx.fillRect(x + 7, y - 28, 22, 16);
    ctx.fillStyle = '#f7e26b';
    ctx.fillRect(x + 10, y - 24, 16, 8);
    // Full-height 12x24px entry door
    ctx.fillStyle = '#442434';
    ctx.fillRect(x + 35, y - 24, 13, 24);
    ctx.fillStyle = '#8f563b';
    ctx.fillRect(x + 37, y - 22, 9, 22);
  } else {
    // Default 'oregon_trail' 1848 Frontier Log Homestead Cabin (58px wide, 54px tall)
    // 1. Heavy fieldstone hearth & chimney on the left (9px wide x 52px tall)
    ctx.fillStyle = '#3a4466';
    ctx.fillRect(x + 1, y - 50, 9, 50);
    ctx.fillStyle = '#5a6988';
    for (let cy = y - 48; cy < y - 2; cy += 4) {
      ctx.fillRect(x + 2 + ((cy % 8 === 0) ? 1 : 0), cy, 6, 2);
    }
    ctx.fillStyle = '#262b44';
    ctx.fillRect(x, y - 52, 11, 3);

    // 2. Notched timber log cabin walls (46px wide x 32px tall)
    ctx.fillStyle = '#8f563b';
    ctx.fillRect(x + 8, y - 32, 46, 32);
    // Alternating sunlit log highlights & dark mortar chinking
    for (let ly = y - 30; ly < y; ly += 4) {
      ctx.fillStyle = '#b86f50';
      ctx.fillRect(x + 9, ly, 44, 1);
      ctx.fillStyle = '#442434';
      ctx.fillRect(x + 8, ly + 2, 46, 1);
    }
    // Interlocking saddle-notched log ends at corners
    for (let ly = y - 31; ly < y - 1; ly += 4) {
      ctx.fillStyle = '#e4a672';
      ctx.fillRect(x + 6, ly, 3, 2);
      ctx.fillRect(x + 53, ly, 3, 2);
      ctx.fillStyle = '#442434';
      ctx.fillRect(x + 6, ly + 2, 3, 1);
      ctx.fillRect(x + 53, ly + 2, 3, 1);
    }

    // 3. Steep wood-shingle gable roof (18px tall peak)
    for (let r = 0; r < 18; r++) {
      ctx.fillStyle = r % 3 === 0 ? '#2c1e31' : '#442434';
      ctx.fillRect(x + 4 + r, y - 33 - r, 54 - r * 2, 1);
    }
    ctx.fillStyle = '#663931';
    ctx.fillRect(x + 4, y - 33, 54, 1);

    // 4. Multi-pane frontier lantern window (12x12px) with shutters
    ctx.fillStyle = '#442434';
    ctx.fillRect(x + 14, y - 24, 14, 13);
    ctx.fillStyle = '#f7e26b';
    ctx.fillRect(x + 16, y - 22, 10, 9);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 17, y - 21, 3, 3);
    // Window muntin crossbars & sill
    ctx.fillStyle = '#442434';
    ctx.fillRect(x + 20, y - 22, 2, 9);
    ctx.fillRect(x + 16, y - 18, 10, 2);
    ctx.fillStyle = '#e4a672';
    ctx.fillRect(x + 13, y - 11, 16, 2);

    // 5. Full-height plank doorway (13px wide x 25px tall, scaled for 30px pioneers)
    ctx.fillStyle = '#2c1e31';
    ctx.fillRect(x + 34, y - 25, 14, 25);
    ctx.fillStyle = '#663931';
    ctx.fillRect(x + 36, y - 23, 10, 23);
    ctx.fillStyle = '#442434';
    ctx.fillRect(x + 39, y - 23, 1, 23);
    ctx.fillRect(x + 42, y - 23, 1, 23);
    // Iron latch & wooden lintel
    ctx.fillStyle = '#e4a672';
    ctx.fillRect(x + 33, y - 26, 16, 2);
    ctx.fillStyle = '#f3a833';
    ctx.fillRect(x + 44, y - 13, 2, 2);

    // 6. Raised timber front porch step & rain barrel
    ctx.fillStyle = '#442434';
    ctx.fillRect(x + 31, y - 2, 26, 3);
    ctx.fillStyle = '#b86f50';
    ctx.fillRect(x + 32, y - 2, 24, 1);
    // Rain barrel at corner
    ctx.fillStyle = '#663931';
    ctx.fillRect(x + 50, y - 9, 6, 8);
    ctx.fillStyle = '#262b44';
    ctx.fillRect(x + 50, y - 7, 6, 1);
    ctx.fillRect(x + 50, y - 4, 6, 1);
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
 * Scaled for 1.0x (32x32) characters (~78px wide x 66px tall, 35px porch clearance)
 */
export function drawGeneralStoreBuilding(ctx, baseX, groundY, animTick = 0) {
  const x = Math.round(baseX);
  const y = Math.round(groundY);
  if (x + 88 < 0 || x > 640) return;

  // 1. Stepped 2-story false-front western timber facade (72px wide x 64px tall)
  ctx.fillStyle = '#2c1e31';
  ctx.fillRect(x + 2, y - 61, 72, 3);
  ctx.fillRect(x + 10, y - 66, 56, 5);
  ctx.fillStyle = '#e4a672';
  ctx.fillRect(x + 12, y - 64, 52, 1);

  // Main timber building body
  ctx.fillStyle = '#8f563b';
  ctx.fillRect(x + 4, y - 58, 68, 58);
  // Horizontal clapboard siding courses & corner pilasters
  ctx.fillStyle = '#442434';
  ctx.fillRect(x + 4, y - 58, 3, 58);
  ctx.fillRect(x + 69, y - 58, 3, 58);
  ctx.fillStyle = '#663931';
  ctx.fillRect(x + 4, y - 58, 68, 2);
  ctx.fillRect(x + 4, y - 39, 68, 2);
  for (let py = y - 55; py < y; py += 4) {
    ctx.fillStyle = '#663931';
    ctx.fillRect(x + 7, py, 62, 1);
    ctx.fillStyle = '#b86f50';
    ctx.fillRect(x + 7, py + 1, 62, 1);
  }

  // 2. Large Signboard Banner on False Front ("STORE")
  ctx.fillStyle = '#2c1e31';
  ctx.fillRect(x + 9, y - 55, 58, 14);
  ctx.fillStyle = '#e4a672';
  ctx.fillRect(x + 10, y - 54, 56, 12);
  ctx.fillStyle = '#f6d6bd';
  ctx.fillRect(x + 11, y - 53, 54, 10);

  // Crisp 5x7 pixel-art "STORE" lettering
  ctx.fillStyle = '#2c1e31';
  const ly = y - 51;
  // S (x + 16)
  ctx.fillRect(x + 16, ly, 5, 1);
  ctx.fillRect(x + 16, ly + 1, 2, 2);
  ctx.fillRect(x + 16, ly + 3, 5, 1);
  ctx.fillRect(x + 19, ly + 4, 2, 2);
  ctx.fillRect(x + 16, ly + 6, 5, 1);
  // T (x + 25)
  ctx.fillRect(x + 25, ly, 5, 1);
  ctx.fillRect(x + 27, ly + 1, 2, 6);
  // O (x + 34)
  ctx.fillRect(x + 34, ly, 5, 1);
  ctx.fillRect(x + 34, ly + 1, 2, 5);
  ctx.fillRect(x + 37, ly + 1, 2, 5);
  ctx.fillRect(x + 34, ly + 6, 5, 1);
  // R (x + 43)
  ctx.fillRect(x + 43, ly, 2, 7);
  ctx.fillRect(x + 45, ly, 3, 1);
  ctx.fillRect(x + 47, ly + 1, 2, 2);
  ctx.fillRect(x + 45, ly + 3, 3, 1);
  ctx.fillRect(x + 46, ly + 4, 2, 1);
  ctx.fillRect(x + 47, ly + 5, 2, 2);
  // E (x + 52)
  ctx.fillRect(x + 52, ly, 2, 7);
  ctx.fillRect(x + 54, ly, 4, 1);
  ctx.fillRect(x + 54, ly + 3, 3, 1);
  ctx.fillRect(x + 54, ly + 6, 4, 1);

  // 3. Storefront Paned Display Windows & Tall Open Doorway (16x26px)
  // Left & Right paned windows
  for (const wx of [x + 9, x + 51]) {
    ctx.fillStyle = '#2c1e31';
    ctx.fillRect(wx, y - 24, 16, 15);
    ctx.fillStyle = '#f7e26b';
    ctx.fillRect(wx + 2, y - 22, 12, 11);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(wx + 3, y - 21, 3, 3);
    // Window muntins & sill
    ctx.fillStyle = '#442434';
    ctx.fillRect(wx + 7, y - 22, 2, 11);
    ctx.fillRect(wx + 2, y - 17, 12, 2);
    ctx.fillStyle = '#e4a672';
    ctx.fillRect(wx - 1, y - 9, 18, 2);
  }

  // Tall center doorway (18px frame, 14x26px opening)
  ctx.fillStyle = '#442434';
  ctx.fillRect(x + 29, y - 29, 18, 27);
  ctx.fillStyle = '#262b44';
  ctx.fillRect(x + 31, y - 27, 14, 25);
  ctx.fillStyle = '#f7e26b';
  ctx.fillRect(x + 31, y - 27, 14, 2); // Transom light

  // 4. Full-Scale Shopkeeper Matt standing on the boardwalk welcoming the party (scale 1.0)
  const porchKeeperGrid = getCharacterFrameGrid(
    NPC_APPEARANCES.shopkeeper,
    'front',
    'idle',
    animTick % 2
  );
  drawCharacterGridAt(ctx, porchKeeperGrid, x + 16, y - 31, 1);

  // 5. High Covered Porch Overhang, Shingled Awning & Support Posts (35px above ground)
  ctx.fillStyle = '#2c1e31';
  ctx.fillRect(x - 2, y - 37, 80, 3);
  ctx.fillStyle = '#442434';
  ctx.fillRect(x - 1, y - 34, 78, 3);
  ctx.fillStyle = '#663931';
  ctx.fillRect(x, y - 31, 76, 1);

  // Porch timber posts with diagonal braces
  for (const px of [x + 1, x + 72]) {
    ctx.fillStyle = '#e4a672';
    ctx.fillRect(px, y - 31, 3, 29);
    ctx.fillStyle = '#b86f50';
    ctx.fillRect(px + 2, y - 31, 1, 29);
  }

  // 6. Raised Wooden Boardwalk Deck & Steps
  ctx.fillStyle = '#2c1e31';
  ctx.fillRect(x - 4, y - 3, 82, 4);
  ctx.fillStyle = '#b86f50';
  ctx.fillRect(x - 3, y - 3, 80, 2);
  ctx.fillStyle = '#663931';
  for (let bx = x; bx < x + 76; bx += 6) {
    ctx.fillRect(bx, y - 3, 1, 3);
  }
  // Step on the left where the trail party walks up
  ctx.fillStyle = '#442434';
  ctx.fillRect(x - 8, y - 1, 5, 2);
  ctx.fillStyle = '#e4a672';
  ctx.fillRect(x - 7, y - 1, 4, 1);

  // 7. Frontier Supply Barrels, Flour Sacks & Hitching Post
  // Banded oak barrel on left of porch
  ctx.fillStyle = '#b86f50';
  ctx.fillRect(x + 5, y - 13, 8, 10);
  ctx.fillStyle = '#8f563b';
  ctx.fillRect(x + 7, y - 13, 4, 10);
  ctx.fillStyle = '#2c1e31';
  ctx.fillRect(x + 5, y - 11, 8, 1);
  ctx.fillRect(x + 5, y - 6, 8, 1);

  // Stacked white flour sacks on right of porch
  ctx.fillStyle = '#f6d6bd';
  ctx.fillRect(x + 60, y - 8, 10, 5);
  ctx.fillStyle = '#e4a672';
  ctx.fillRect(x + 61, y - 12, 8, 4);
  ctx.fillStyle = '#ac2847';
  ctx.fillRect(x + 63, y - 6, 4, 1);

  // Timber hitching rail out front to the left of the boardwalk
  ctx.fillStyle = '#442434';
  ctx.fillRect(x - 18, y - 11, 2, 11);
  ctx.fillRect(x - 10, y - 11, 2, 11);
  ctx.fillStyle = '#b86f50';
  ctx.fillRect(x - 19, y - 10, 12, 2);
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
