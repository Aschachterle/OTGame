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
    fgColor: '#1e579c',
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

function isInsideBodyForView(appearance, x, y, baseOrientation = 'front') {
  if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return false;
  const template = getBodyTemplateById(appearance?.bodyTemplateId);
  const map = baseOrientation === 'side' ? template.side : template.front;
  const ch = map[y]?.[x];
  return Boolean(ch && ch !== '.');
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
    case 'F':
      return gender === 'female' ? skin.eye : skin.base;
    case 'P':
      return skin.pupil;
    case 'M':
      return gender === 'female' ? skin.femaleMouth || skin.mouth : skin.mouth;
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

export function buildNeutralCompositeGrid(appearance, baseOrientation = 'front') {
  const grid = createEmptyGrid();
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const bodyColor = getBaseBodyPixel(appearance, x, y, baseOrientation);
      if (bodyColor) {
        grid[y][x] = bodyColor;
      }
    }
  }

  for (const cat of LAYER_DRAW_ORDER) {
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
      if (isInsideBodyForView(appearance, x, y, baseOrientation)) {
        const finalColor = resolvePresetPixelColor(rawColor, role, dyeId);
        if (finalColor) {
          grid[y][x] = finalColor;
        }
      }
    });
  }

  return grid;
}

export function getCharacterFrameGrid(appearance, view = 'front', animMode = 'walk', frameIndex = 0) {
  const isSide = view === 'side_right' || view === 'side_left';
  const baseOrientation = isSide ? 'side' : 'front';
  const neutral = buildNeutralCompositeGrid(appearance, baseOrientation);
  let result = createEmptyGrid();

  if (animMode === 'static') {
    result = neutral;
  } else if (animMode === 'idle') {
    const bob = frameIndex % 2 === 1 ? 1 : 0;
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const srcY = bob === 1 && y <= 20 ? y - 1 : y;
        if (srcY >= 0 && srcY < GRID_SIZE) {
          result[y][x] = neutral[srcY][x];
        }
      }
    }
  } else if (animMode === 'walk') {
    const f = ((frameIndex % 4) + 4) % 4;
    if (!isSide) {
      const isBounce = f === 0 || f === 2;
      const torsoDy = isBounce ? 1 : 0;

      for (let y = 21; y <= 30; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          const isLeftHalf = x < 16;
          let legLift = 0;
          if (f === 0 && !isLeftHalf && y >= 22) legLift = -2;
          if (f === 2 && isLeftHalf && y >= 22) legLift = -2;
          if (f === 1 && !isLeftHalf && y >= 25) legLift = -1;
          if (f === 3 && isLeftHalf && y >= 25) legLift = -1;

          const destY = y + legLift;
          if (destY >= 20 && destY < GRID_SIZE && neutral[y][x]) {
            result[destY][x] = neutral[y][x];
          }
        }
      }

      for (let y = 2; y <= 20; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          const c = neutral[y][x];
          if (!c) continue;
          let dy = torsoDy;
          if (y >= 14 && y <= 20) {
            if (x <= 10) {
              dy = f === 0 ? 1 : f === 2 ? -1 : 0;
            } else if (x >= 21) {
              dy = f === 2 ? 1 : f === 0 ? -1 : 0;
            }
          }
          const destY = y + dy;
          if (destY >= 0 && destY < GRID_SIZE) {
            result[destY][x] = c;
          }
        }
      }
    } else {
      const isStride = f === 0 || f === 2;
      const torsoBounceY = isStride ? 1 : 0;
      let backLegDx = 0;
      let backLegDy = 0;
      let frontLegDx = 0;
      let frontLegDy = 0;
      let armSwingDx = 0;

      if (f === 0) {
        backLegDx = -3;
        frontLegDx = 2;
        armSwingDx = -2;
      } else if (f === 1) {
        backLegDx = -1;
        backLegDy = -1;
        armSwingDx = -1;
      } else if (f === 2) {
        backLegDx = 2;
        frontLegDx = -3;
        armSwingDx = 2;
      } else if (f === 3) {
        frontLegDx = 1;
        frontLegDy = -1;
        armSwingDx = 1;
      }

      for (let y = 22; y <= 30; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          const c = neutral[y][x];
          if (!c) continue;
          const strideFactor = y >= 25 ? 1 : 0.65;
          const dx = Math.round(backLegDx * strideFactor);
          const dy = y >= 26 ? backLegDy : 0;
          const destX = x + dx;
          const destY = y + dy;
          if (destX >= 0 && destX < GRID_SIZE && destY >= 21 && destY < GRID_SIZE) {
            result[destY][destX] = shadeHex(c, -24);
          }
        }
      }

      for (let y = 21; y <= 30; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          const c = neutral[y][x];
          if (!c) continue;
          const strideFactor = y === 21 ? 0 : y >= 25 ? 1 : 0.65;
          const dx = Math.round(frontLegDx * strideFactor);
          const dy = y >= 26 ? frontLegDy : 0;
          const destX = x + dx;
          const destY = y + dy;
          if (destX >= 0 && destX < GRID_SIZE && destY >= 20 && destY < GRID_SIZE) {
            result[destY][destX] = c;
          }
        }
      }

      for (let y = 2; y <= 20; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          const c = neutral[y][x];
          if (!c) continue;
          const destY = y + torsoBounceY;
          if (destY >= 0 && destY < GRID_SIZE) {
            result[destY][x] = c;
          }
        }
      }

      for (let y = 14; y <= 19; y++) {
        for (let x = 13; x <= 17; x++) {
          const c = neutral[y][x];
          if (!c) continue;
          const destX = x + armSwingDx;
          const destY = y + torsoBounceY;
          if (destX >= 0 && destX < GRID_SIZE && destY >= 0 && destY < GRID_SIZE) {
            result[destY][destX] = shadeHex(c, 12);
          }
        }
      }
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

export function drawPixelBackdropScene(ctx, W, H, backdropId, scrollOffset, charFootY = 55) {
  const bd = BACKDROPS[backdropId] || BACKDROPS.prairie;
  const horizonY = Math.max(12, charFootY - 20);
  const pathStartY = Math.max(18, charFootY - 6);
  const pathEndY = Math.min(H - 2, charFootY + 4);

  // 1. Sky Bands
  const skyBand1 = Math.floor(horizonY * 0.38);
  const skyBand2 = Math.floor(horizonY * 0.72);
  ctx.fillStyle = bd.skyTop;
  ctx.fillRect(0, 0, W, skyBand1);
  ctx.fillStyle = bd.skyMid;
  ctx.fillRect(0, skyBand1, W, skyBand2 - skyBand1);
  ctx.fillStyle = bd.skyHorizon;
  ctx.fillRect(0, skyBand2, W, horizonY - skyBand2);

  // 2. Sun / Moon Disc
  const sunX = Math.floor(W * 0.78);
  const sunY = Math.max(4, Math.floor(horizonY * 0.25));
  ctx.fillStyle = bd.sunColor;
  ctx.fillRect(sunX - 2, sunY - 3, 5, 7);
  ctx.fillRect(sunX - 3, sunY - 2, 7, 5);

  // 3. Drifting 8-Bit Clouds
  const cloudScroll = Math.floor(scrollOffset * 0.15);
  ctx.fillStyle = backdropId === 'desert' ? '#f6d6bd' : '#ffffff';
  for (let c = 0; c < 4; c++) {
    const cx = (((c * 47 + 12 - cloudScroll) % (W + 24)) + (W + 24)) % (W + 24) - 12;
    const cy = 4 + (c % 2) * 5;
    if (cy + 3 < horizonY) {
      ctx.fillRect(cx, cy + 1, 10, 2);
      ctx.fillRect(cx + 2, cy, 6, 1);
    }
  }

  // 4. Distant Horizon Silhouettes
  const farScroll = Math.floor(scrollOffset * 0.3);
  for (let x = 0; x < W; x++) {
    const worldX = x + farScroll;
    if (backdropId === 'mountains' || backdropId === 'snow') {
      const peakWave =
        Math.abs(((worldX * 0.7) % 36) - 18) * 0.8 +
        Math.abs(((worldX * 0.35 + 11) % 24) - 12) * 0.5;
      const peakTop = Math.max(3, Math.floor(horizonY - 18 + peakWave));
      ctx.fillStyle = bd.distantColor;
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
      ctx.fillStyle = bd.distantColor;
      ctx.fillRect(x, topY, 1, mesaHeight);
      if (mesaHeight >= 9) {
        ctx.fillStyle = '#de5d3a';
        ctx.fillRect(x, topY + 3, 1, 1);
        ctx.fillRect(x, topY + 7, 1, 1);
      }
    } else {
      const hillH = Math.floor(4 + Math.sin(worldX * 0.08) * 2.5 + Math.cos(worldX * 0.035) * 2);
      ctx.fillStyle = bd.distantColor;
      ctx.fillRect(x, horizonY - hillH, 1, hillH);
    }
  }

  // 5. Mid-ground Band
  ctx.fillStyle = bd.midHillColor;
  ctx.fillRect(0, horizonY, W, pathStartY - horizonY);

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
    ctx.fillStyle = '#e4a672';
    ctx.fillRect(0, horizonY + 2, W, 2);
    ctx.fillStyle = '#1e579c';
    ctx.fillRect(0, horizonY + 4, W, pathStartY - (horizonY + 4));
    const waterShift = Math.floor(Date.now() / 120);
    ctx.fillStyle = '#b2dce8';
    for (let ry = horizonY + 5; ry < pathStartY; ry += 2) {
      for (let rx = 0; rx < W; rx += 11) {
        const wx = (rx + waterShift + ry * 3) % W;
        ctx.fillRect(wx, ry, 3, 1);
      }
    }
  }

  // 6. Trail Path Surface
  const pathScroll = Math.floor(scrollOffset);
  ctx.fillStyle = bd.pathTop;
  ctx.fillRect(0, pathStartY, W, 1);
  ctx.fillStyle = bd.pathMain;
  ctx.fillRect(0, pathStartY + 1, W, pathEndY - pathStartY - 1);
  ctx.fillStyle = bd.pathRut;
  ctx.fillRect(0, pathEndY - 1, W, 1);

  for (let x = 0; x < W; x++) {
    const wx = x + pathScroll;
    if (backdropId === 'river') {
      if (hashInt(wx * 3) > 0.72) {
        ctx.fillStyle = '#1e579c';
        ctx.fillRect(x, pathStartY + 2 + (Math.abs(wx) % 5), 2, 1);
      }
      if ((wx + Math.floor(Date.now() / 90)) % 14 === 0) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, pathStartY + 3 + (Math.abs(wx) % 4), 3, 1);
      }
    } else {
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

  // 7. Foreground Verge
  ctx.fillStyle = bd.fgColor;
  ctx.fillRect(0, pathEndY, W, H - pathEndY);
  for (let x = 0; x < W; x += 3) {
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

/**
 * Draws the 1848 Independence General Store ("MATT'S OUTFITTING POST")
 */
export function drawGeneralStoreBuilding(ctx, baseX, groundY) {
  const x = Math.round(baseX);
  const y = Math.round(groundY);
  if (x + 56 < 0 || x > 640) return;

  // False-front timber facade
  ctx.fillStyle = '#8f563b';
  ctx.fillRect(x + 4, y - 27, 34, 27);
  ctx.fillStyle = '#663931';
  ctx.fillRect(x + 4, y - 27, 34, 2);
  ctx.fillRect(x + 4, y - 19, 34, 2);
  for (let py = y - 17; py < y; py += 3) {
    ctx.fillRect(x + 4, py, 34, 1);
  }

  // Signboard banner on false front
  ctx.fillStyle = '#f6d6bd';
  ctx.fillRect(x + 7, y - 25, 28, 5);
  ctx.fillStyle = '#442434';
  // Pixel-art "STORE" lettering blocks
  ctx.fillRect(x + 10, y - 24, 3, 3);
  ctx.fillRect(x + 15, y - 24, 3, 3);
  ctx.fillRect(x + 20, y - 24, 3, 3);
  ctx.fillRect(x + 25, y - 24, 3, 3);
  ctx.fillRect(x + 30, y - 24, 3, 3);

  // Porch overhang & support posts
  ctx.fillStyle = '#442434';
  ctx.fillRect(x, y - 13, 40, 2);
  ctx.fillStyle = '#e4a672';
  ctx.fillRect(x + 1, y - 11, 2, 11);
  ctx.fillRect(x + 36, y - 11, 2, 11);

  // Storefront windows & open double door
  ctx.fillStyle = '#f7e26b';
  ctx.fillRect(x + 8, y - 10, 6, 5);
  ctx.fillRect(x + 28, y - 10, 6, 5);
  ctx.fillStyle = '#262b44';
  ctx.fillRect(x + 17, y - 10, 8, 10);

  // Supply barrels & hitching rail out front
  ctx.fillStyle = '#b86f50';
  ctx.fillRect(x + 4, y - 5, 4, 5);
  ctx.fillStyle = '#442434';
  ctx.fillRect(x + 4, y - 4, 4, 1);
  ctx.fillRect(x - 6, y - 5, 6, 1);
  ctx.fillRect(x - 5, y - 5, 1, 5);
}

/**
 * Draws the Pixel-Art Oxen Team & Covered Prairie Schooner Wagon Cart
 */
export function drawOxenAndWagonCart(ctx, baseX, groundY, frameIndex = 0, isMoving = false, oxenYokes = 2) {
  const x = Math.round(baseX);
  const y = Math.round(groundY);
  const bounce = isMoving && frameIndex % 2 === 1 ? 1 : 0;

  // Ground shadow under wagon & oxen
  ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
  ctx.fillRect(x - 2, y, 52, 2);

  // 1. Covered Wagon White Canvas Bonnet (with ribbed hoops)
  const canvasTopY = y - 22 + bounce;
  ctx.fillStyle = '#f6d6bd';
  ctx.fillRect(x + 2, canvasTopY + 2, 24, 10);
  ctx.fillRect(x + 4, canvasTopY, 20, 2);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 4, canvasTopY + 1, 20, 3);
  // Canvas hoop ribs
  ctx.fillStyle = '#c2c3c7';
  ctx.fillRect(x + 7, canvasTopY + 1, 1, 11);
  ctx.fillRect(x + 14, canvasTopY + 1, 1, 11);
  ctx.fillRect(x + 21, canvasTopY + 1, 1, 11);

  // 2. Wooden Schooner Box / Bed
  const bedTopY = y - 10 + bounce;
  ctx.fillStyle = '#8f563b';
  ctx.fillRect(x, bedTopY, 28, 5);
  ctx.fillStyle = '#663931';
  ctx.fillRect(x, bedTopY + 2, 28, 1);
  ctx.fillRect(x, bedTopY + 4, 28, 1);
  ctx.fillStyle = '#e4a672';
  ctx.fillRect(x + 2, bedTopY + 1, 24, 1);

  // 3. Spoked Wagon Wheels (Rear & Front)
  const drawWheel = (wx, wy, radius) => {
    ctx.fillStyle = '#442434';
    ctx.fillRect(wx - radius, wy - 1, radius * 2 + 1, 3);
    ctx.fillRect(wx - 1, wy - radius, 3, radius * 2 + 1);
    ctx.fillRect(wx - radius + 1, wy - radius + 1, radius * 2 - 1, radius * 2 - 1);
    ctx.fillStyle = '#b86f50';
    ctx.fillRect(wx - radius + 2, wy - radius + 2, radius * 2 - 3, radius * 2 - 3);
    // Rotating spokes
    ctx.fillStyle = '#f7e26b';
    if (!isMoving || frameIndex % 2 === 0) {
      ctx.fillRect(wx, wy - radius + 1, 1, radius * 2 - 1);
      ctx.fillRect(wx - radius + 1, wy, radius * 2 - 1, 1);
    } else {
      ctx.fillRect(wx - 2, wy - 2, 1, 1);
      ctx.fillRect(wx + 2, wy + 2, 1, 1);
      ctx.fillRect(wx + 2, wy - 2, 1, 1);
      ctx.fillRect(wx - 2, wy + 2, 1, 1);
    }
    ctx.fillStyle = '#442434';
    ctx.fillRect(wx, wy, 1, 1);
  };
  drawWheel(x + 6, y - 4, 4);
  drawWheel(x + 22, y - 4, 3);

  // 4. Wagon Tongue & Hitch
  ctx.fillStyle = '#663931';
  ctx.fillRect(x + 27, y - 6 + bounce, 18, 1);

  // 5. Draft Oxen Team (in front of wagon to the right)
  const oxX = x + 32;
  const oxY = y - 12;
  const strideA = isMoving ? (frameIndex % 2 === 0 ? -1 : 1) : 0;
  const strideB = isMoving ? (frameIndex % 2 === 0 ? 1 : -1) : 0;

  // Back ox silhouette (second ox in yoke)
  ctx.fillStyle = '#663931';
  ctx.fillRect(oxX + 2, oxY - 1 + bounce, 12, 6);
  ctx.fillRect(oxX + 13, oxY - 2 + bounce, 4, 5);

  // Lead ox body
  ctx.fillStyle = '#8f563b';
  ctx.fillRect(oxX, oxY + bounce, 13, 6);
  ctx.fillStyle = '#e4a672';
  ctx.fillRect(oxX + 1, oxY + 1 + bounce, 9, 2);
  // Ox head & horns
  ctx.fillStyle = '#8f563b';
  ctx.fillRect(oxX + 12, oxY - 1 + bounce, 5, 5);
  ctx.fillStyle = '#ffffff'; // Horns
  ctx.fillRect(oxX + 14, oxY - 3 + bounce, 3, 1);
  ctx.fillRect(oxX + 16, oxY - 4 + bounce, 1, 2);
  // Wooden yoke
  ctx.fillStyle = '#f3a833';
  ctx.fillRect(oxX + 11, oxY - 1 + bounce, 2, 6);
  // Animated ox legs
  ctx.fillStyle = '#442434';
  ctx.fillRect(oxX + 2 + strideA, oxY + 6, 2, 6);
  ctx.fillRect(oxX + 5 + strideB, oxY + 6, 2, 6);
  ctx.fillRect(oxX + 9 + strideB, oxY + 6, 2, 6);
  ctx.fillRect(oxX + 11 + strideA, oxY + 6, 2, 6);
}

/**
 * Draws the complete 320x96 Widescreen Interactive Landscape & Caravan Stage for OTGame
 */
export function renderGameLandscapeStage(canvas, state, animTick = 0) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = canvas.width;  // 320
  const H = canvas.height; // 96
  const charFootY = Math.max(55, H - 14); // 82 on 320x96

  const isPreTrail = !state.journeyStarted;
  const selectedTile = state.currentTrailSnapshot || {};
  const backdropId = isPreTrail
    ? 'prairie'
    : mapBiomeToBackdropId(selectedTile.biome, selectedTile.weather);

  const isMoving = Boolean(state.landscapeMoving || state.travelAnimationActive || state.actionInProgress);
  const scrollOffset = state.landscapeScrollX || 0;
  const frameIndex = animTick % 4;

  // 1. Draw the 8-bit backdrop
  drawPixelBackdropScene(ctx, W, H, backdropId, scrollOffset, charFootY);

  // 2. Draw Era Home & General Store when in Pre-Trail Setup or departing Independence (Mile 0)
  const eraId = state.selectedEra || DEFAULT_PARTY_ERA_ID;
  const storeX = W - 54;
  if (isPreTrail) {
    // Era-appropriate home on the left, General Store on the right
    drawEraHomeBuilding(ctx, eraId, 12, charFootY - 4);
    drawGeneralStoreBuilding(ctx, storeX, charFootY - 4);

    // Subtle temporal shimmer portal when a non-Oregon-Trail era is selected
    if (eraId !== 'oregon_trail') {
      const shimmerY = charFootY - 28;
      ctx.fillStyle = animTick % 2 === 0 ? 'rgba(0, 255, 102, 0.55)' : 'rgba(49, 162, 242, 0.55)';
      ctx.fillRect(54, shimmerY, 2, 24);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(54, shimmerY + ((animTick * 3) % 21), 2, 3);
    }
  } else if ((state.milesTraveled || 0) === 0 && scrollOffset < 180) {
    // General Store scrolling behind the party as they depart Independence with their oxen cart
    drawGeneralStoreBuilding(ctx, 24 - Math.floor(scrollOffset * 0.8), charFootY - 4);
  }

  // 3. Draw Campfire when halted at camp on the trail
  if (!isPreTrail && !isMoving && state.lastActionContext?.actionType === 'camp') {
    const fireX = W - 46;
    const fireY = charFootY - 2;
    ctx.fillStyle = '#663931';
    ctx.fillRect(fireX - 3, fireY, 7, 2);
    ctx.fillStyle = animTick % 2 === 0 ? '#ec273f' : '#e98537';
    ctx.fillRect(fireX - 2, fireY - 3, 5, 3);
    ctx.fillStyle = '#f7e26b';
    ctx.fillRect(fireX - 1, fireY - 4 - (animTick % 2), 3, 3);
  }

  // 4. Draw Oxen Cart (only once at or departing the General Store!)
  const hasOxenCart = state.journeyStarted || (state.setupStage === 'outfitting' && (state.outfittingCart?.oxenYokes ?? 0) > 0);
  if (hasOxenCart) {
    const cartX = isPreTrail ? storeX - 64 : Math.floor(W * 0.58);
    const yokes = state.journeyStarted ? (state.wagon?.oxenYokes || 2) : (state.outfittingCart?.oxenYokes || 2);
    drawOxenAndWagonCart(ctx, cartX, charFootY - 1, frameIndex, isMoving && state.journeyStarted, yokes);
  }

  // 5. Draw the 4 Custom 32x32 Party Members with generous 20px spacing
  const party = (state.wagon?.party || []).filter((member) => (member.health ?? 100) > 0);
  syncAllPartyAppearancesToEra(party, eraId);

  const memberSpacing = 20;
  const baseLeaderX = isPreTrail
    ? (state.landscapeCharX ?? (state.setupStage === 'outfitting' ? storeX - 78 : 116))
    : Math.floor(W * 0.46);

  const effectiveAnimMode = isMoving ? 'walk' : 'idle';
  party.forEach((member, idx) => {
    const memberGrid = getCharacterFrameGrid(
      member.appearance,
      'side_right',
      effectiveAnimMode,
      (frameIndex + idx) % 4
    );
    const drawX = Math.round(baseLeaderX - idx * memberSpacing);
    const drawY = charFootY - 30 + (idx % 2 === 0 ? 0 : -1);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.30)';
    ctx.fillRect(drawX + 10, charFootY, 12, 2);

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const color = memberGrid[y][x];
        if (color) {
          if (backdropId === 'river' && y >= 29) {
            ctx.fillStyle = y === 30 ? '#1e579c' : '#31a2f2';
          } else {
            ctx.fillStyle = color;
          }
          ctx.fillRect(drawX + x, drawY + y, 1, 1);
        }
      }
    }

    if (isMoving) {
      const bd = BACKDROPS[backdropId] || BACKDROPS.prairie;
      ctx.fillStyle = bd.dustColor;
      const puffOffset = (frameIndex + idx) % 2;
      ctx.fillRect(drawX + 8 - puffOffset, charFootY - 1 - puffOffset, 2, 1);
    }
  });
}
