import {
  SELECTABLE_ERAS,
  getCharacterFrameCount,
  getCharacterFrameGrid,
  renderCharacterGridToCanvas,
  syncAllPartyAppearancesToEra,
  preloadBoilerplateSprites,
  getBaseBoilerplateGrid,
  getDefaultFrameMask,
  getFrameCustomMask,
  getFrameActiveMask,
  setFrameCustomMask,
  resetFrameCustomMask,
  importMaskOverrides,
  getAllCustomMasksObject,
  saveCustomMasksToServer,
  summarizeMemberOutfit,
  applySkinToneToSpriteGrid,
  getClothingItemDefaultGrid,
  getCustomSpriteOverride,
  setCustomSpriteOverride,
  resetCustomSpriteOverride,
  getAllCustomOverridesObject,
  saveCustomOverridesToServer
} from './character-designer.js?v=sprite32_1';
import { INITIAL_CLOTHING_BOILERPLATE } from './character-presets.js';

// DOM Elements
const eraControl = document.querySelector('#era');
const spriteCharacterControl = document.querySelector('#sprite-character');
const spriteViewControl = document.querySelector('#sprite-view');
const spriteAnimationControl = document.querySelector('#sprite-animation');
const spritePlayButton = document.querySelector('#sprite-play');
const spriteFrameStrip = document.querySelector('#sprite-frame-strip');
const spriteFrameReadout = document.querySelector('#sprite-frame-readout');

const studioModeSelect = document.querySelector('#studio-mode-select');
const modeTabButtons = document.querySelectorAll('.mode-tab-btn');

const studioClothingControls = document.querySelector('#studio-clothing-controls');
const studioClothingEra = document.querySelector('#studio-clothing-era');
const studioClothingGender = document.querySelector('#studio-clothing-gender');
const studioClothingCategory = document.querySelector('#studio-clothing-category');
const studioClothingPreset = document.querySelector('#studio-clothing-preset');
const studioClothingView = document.querySelector('#studio-clothing-view');
const studioClothingFrame = document.querySelector('#studio-clothing-frame');
const studioFrameOptAll = document.querySelector('#studio-frame-opt-all');
const studioFrameBehaviorBadge = document.querySelector('#studio-frame-behavior-badge');

const studioBaseControls = document.querySelector('#studio-base-controls');
const studioBaseGender = document.querySelector('#studio-base-gender');
const studioBaseDirection = document.querySelector('#studio-base-direction');
const studioBaseFrame = document.querySelector('#studio-base-frame');
const studioBaseFrameOptAll = document.querySelector('#studio-base-frame-opt-all');
const studioBaseApplyAll = document.querySelector('#studio-base-apply-all');
const studioBaseSkintone = document.querySelector('#studio-base-skintone');
const studioBtnApplySkintone = document.querySelector('#studio-btn-apply-skintone');

const studioMaskBanner = document.querySelector('#studio-mask-banner');
const maskBtnAutodetect = document.querySelector('#mask-btn-autodetect');
const maskBtnInvert = document.querySelector('#mask-btn-invert');
const maskBtnClearMask = document.querySelector('#mask-btn-clear-mask');

const studioBreadcrumbTrail = document.querySelector('#studio-breadcrumb-trail');
const studioPropagationRule = document.querySelector('#studio-propagation-rule');

const studioCanvasTitle = document.querySelector('#studio-canvas-title');
const studioTargetName = document.querySelector('#studio-target-name');
const studioShowUnderlay = document.querySelector('#studio-show-underlay');
const studioShowGrid = document.querySelector('#studio-show-grid');
const maskCanvasLegend = document.querySelector('#mask-canvas-legend');

const studioPrevFrame = document.querySelector('#studio-prev-frame');
const studioNextFrame = document.querySelector('#studio-next-frame');
const studioFrameStepperLabel = document.querySelector('#studio-frame-stepper-label');

const studioToolPencil = document.querySelector('#studio-tool-pencil');
const studioToolEraser = document.querySelector('#studio-tool-eraser');
const studioToolPicker = document.querySelector('#studio-tool-picker');
const studioToolFill = document.querySelector('#studio-tool-fill');

const studioBtnUndo = document.querySelector('#studio-btn-undo');
const studioBtnRedo = document.querySelector('#studio-btn-redo');
const studioBtnReset = document.querySelector('#studio-btn-reset');
const studioBtnClear = document.querySelector('#studio-btn-clear');

const studioColorPanel = document.querySelector('#studio-color-panel');
const studioActiveColor = document.querySelector('#studio-active-color');
const studioHexInput = document.querySelector('#studio-hex-input');
const studioColorNameReadout = document.querySelector('#studio-color-name-readout');
const studioUsedColorsCount = document.querySelector('#studio-used-colors-count');
const studioUsedColorsGrid = document.querySelector('#studio-used-colors-grid');
const studioPresetColorsGrid = document.querySelector('#studio-preset-colors-grid');

const maskEditorCanvas = document.querySelector('#mask-editor-canvas');
const maskPreviewCanvas = document.querySelector('#mask-preview-canvas');
const previewPlayBtn = document.querySelector('#preview-play-btn');
const maskPreviewBackdrop = document.querySelector('#mask-preview-backdrop');
const maskOutfitSummary = document.querySelector('#mask-outfit-summary');
const maskStatusReadout = document.querySelector('#mask-status-readout');

const maskBtnCopy = document.querySelector('#mask-btn-copy');
const maskBtnPaste = document.querySelector('#mask-btn-paste');
const maskBtnSaveProject = document.querySelector('#mask-btn-save-project');
const maskBtnDownload = document.querySelector('#mask-btn-download');
const maskBtnLoadFile = document.querySelector('#mask-btn-load-file');
const maskFileInput = document.querySelector('#mask-file-input');
const maskSaveStatus = document.querySelector('#mask-save-status');
const maskPixelInfo = document.querySelector('#mask-pixel-info');
const maskOriginInfo = document.querySelector('#mask-origin-info');

const previewOutfitSolo = document.querySelector('#preview-outfit-solo');
const previewOutfitAll = document.querySelector('#preview-outfit-all');
const previewOutfitNone = document.querySelector('#preview-outfit-none');
const previewWearCheckboxes = {
  hats: document.querySelector('#preview-wear-hats'),
  shirts: document.querySelector('#preview-wear-shirts'),
  pants: document.querySelector('#preview-wear-pants'),
  shoes: document.querySelector('#preview-wear-shoes'),
  accessories: document.querySelector('#preview-wear-accessories')
};
const previewPresetSelects = {
  hats: document.querySelector('#preview-select-hats'),
  shirts: document.querySelector('#preview-select-shirts'),
  pants: document.querySelector('#preview-select-pants'),
  shoes: document.querySelector('#preview-select-shoes'),
  accessories: document.querySelector('#preview-select-accessories')
};

// Party Travelers
const editorPartySpecs = [
  { name: 'Jedediah', role: 'Guide' },
  { name: 'Abigail', role: 'Doctor' },
  { name: 'Sarah', role: 'Carpenter' },
  { name: 'Caleb', role: 'Farmer' }
];
const party = editorPartySpecs.map((spec, index) => ({
  id: `editor-traveler-${index + 1}`,
  name: spec.name,
  role: spec.role,
  health: 100
}));

let selectedEra = 'oregon_trail';
let spriteAnimationTimer = null;
let selectedSpriteFrame = 0;

// Backdrop modes: 'dark-grid' | 'light-grid' | 'white' | 'black' | 'prairie'
let editorBgMode = 'dark-grid';
let previewBgMode = 'dark-grid';
let testPlayerSkinTone = 'warm_ivory';

// Populate Era Select
for (const era of SELECTABLE_ERAS) {
  const option = document.createElement('option');
  option.value = era.id;
  option.textContent = era.label || era.id;
  eraControl.append(option);
}
eraControl.value = selectedEra;

// Populate Traveler Select grouped by Gender
const maleGroup = document.createElement('optgroup');
maleGroup.label = 'Male Travelers';
const femaleGroup = document.createElement('optgroup');
femaleGroup.label = 'Female Travelers';
for (const [index, spec] of editorPartySpecs.entries()) {
  const option = document.createElement('option');
  option.value = String(index);
  option.textContent = `${spec.name} · ${spec.role}`;
  if (index === 0 || index === 3) {
    maleGroup.append(option);
  } else {
    femaleGroup.append(option);
  }
}
spriteCharacterControl.append(maleGroup, femaleGroup);

await preloadBoilerplateSprites();
syncAllPartyAppearancesToEra(party, selectedEra);

const ERA_DISPLAY_NAMES = {
  all: 'All Eras',
  oregon_trail: 'Oregon Trail (1840s–1860s)',
  '1500s': "1500's Tudor & Renaissance",
  '1600s': "1600's Baroque & Cavalier",
  '1700s': "1700's Georgian & Colonial",
  '1800s': "1800's Victorian & Industrial",
  '1900_1920': '1900–1920 Edwardian',
  '1921_1940': '1921–1940 Roaring 20s & 30s',
  '1941_1950': '1941–1950 Wartime 40s',
  '1950s': "1950's Rockabilly & Diner",
  '1960s': "1960's Mod & Counterculture",
  '1970s': "1970's Disco & Funk",
  '1980s': "1980's Arcade & Synthwave",
  '1990s': "1990's Grunge & Skate",
  '2000s': "2000's Y2K & Pop Punk",
  '2010s': "2010's Indie & Athleisure",
  '2020s': "2020's Modern Techwear"
};

const CATEGORY_DISPLAY_NAMES = {
  hats: '👒 Hair / Hat',
  shirts: '👕 Shirts & Coats',
  pants: '👖 Pants & Skirts',
  shoes: '🥾 Shoes & Boots',
  accessories: '🧣 Accessories'
};

// 42 Curated Pixel-Art & Historical Period Swatches
const PRESET_COLOR_SWATCHES = [
  // Outlines & Neutrals
  { hex: '#140c1c', name: 'Deep Ink Outline' },
  { hex: '#221e29', name: 'Warm Charcoal' },
  { hex: '#2d2936', name: 'Slate Shadow' },
  { hex: '#3a4466', name: 'Iron Blue-Grey' },
  { hex: '#5a6988', name: 'Stone Grey' },
  { hex: '#8b93af', name: 'Pewter Grey' },
  { hex: '#c2c3c7', name: 'Silver Ash' },
  { hex: '#ffffff', name: 'Pure White' },
  // Skin, Hair & Fur
  { hex: '#f6d6bd', name: 'Pale Ivory Skin' },
  { hex: '#eec39a', name: 'Warm Peach Skin' },
  { hex: '#e4a672', name: 'Sunlit Tan' },
  { hex: '#b86f50', name: 'Frontier Bronze' },
  { hex: '#8f563b', name: 'Buckskin / Umber' },
  { hex: '#663931', name: 'Chestnut Hair' },
  { hex: '#442434', name: 'Deep Espresso' },
  { hex: '#2c1e31', name: 'Dark Bark' },
  { hex: '#ac2847', name: 'Auburn / Rose' },
  { hex: '#f7e26b', name: 'Golden Blonde' },
  // Leathers & Frontier Earth
  { hex: '#4a2518', name: 'Trail Mud Leather' },
  { hex: '#743f39', name: 'Saddle Brown' },
  { hex: '#9a5a3c', name: 'Rawhide Tan' },
  { hex: '#b54b35', name: 'Terracotta' },
  { hex: '#de5d3a', name: 'Rust Ochre' },
  { hex: '#e98537', name: 'Amber Ochre' },
  { hex: '#d2a84b', name: 'Dry Prairie Grass' },
  { hex: '#526b2d', name: 'Olive Drab' },
  // Period Dyes & Fabrics
  { hex: '#ec273f', name: 'Madder Red' },
  { hex: '#d95763', name: 'Calico Rose' },
  { hex: '#ff7777', name: 'Coral Pink' },
  { hex: '#6b2643', name: 'Berry Plum' },
  { hex: '#7b5480', name: 'Royal Violet' },
  { hex: '#262b44', name: 'Navy Wool' },
  { hex: '#1e579c', name: 'Dark Indigo' },
  { hex: '#0098dc', name: 'Denim Blue' },
  { hex: '#31a2f2', name: 'Sky Calico' },
  { hex: '#b2dce8', name: 'Powder Blue' },
  { hex: '#00b5a1', name: 'Turquoise Bead' },
  { hex: '#2f484e', name: 'Pine Forest' },
  { hex: '#44891a', name: 'Sage Green' },
  { hex: '#6abe30', name: 'Meadow Green' },
  { hex: '#a3ce27', name: 'Spring Moss' },
  { hex: '#e5b842', name: 'Mustard Dye' }
];

function isFrameSpecificCategory(category) {
  return category === 'pants' || category === 'shoes' || category === 'shirts';
}

let activeStudioTool = 'pencil';
let studioBrushColor = '#8f563b';
let isStudioPainting = false;
let studioHoverCoords = null;

// Undo / Redo Stacks
const MAX_HISTORY_STEPS = 60;
const undoStack = [];
const redoStack = [];
let pendingStrokeSnapshot = null;

// ============================================================================
// PLAYBACK & ANIMATION STRIP
// ============================================================================
function stopSpritePlayback() {
  if (spriteAnimationTimer !== null) {
    window.clearInterval(spriteAnimationTimer);
    spriteAnimationTimer = null;
  }
  spritePlayButton.textContent = '▶ Play Walk Cycle';
  spritePlayButton.setAttribute('aria-pressed', 'false');
  if (previewPlayBtn) {
    previewPlayBtn.textContent = '▶ Play Walk Cycle';
    previewPlayBtn.setAttribute('aria-pressed', 'false');
    previewPlayBtn.classList.add('secondary-button');
  }
}

function startSpritePlayback() {
  spritePlayButton.textContent = '⏸ Pause Walk Cycle';
  spritePlayButton.setAttribute('aria-pressed', 'true');
  if (previewPlayBtn) {
    previewPlayBtn.textContent = '⏸ Pause Walk Cycle';
    previewPlayBtn.setAttribute('aria-pressed', 'true');
    previewPlayBtn.classList.remove('secondary-button');
  }
  spriteAnimationTimer = window.setInterval(() => {
    const memberIndex = Number(spriteCharacterControl.value) || 0;
    const member = party[memberIndex] ?? party[0];
    const previewView = studioModeSelect.value === 'clothing'
      ? studioClothingView.value
      : (studioModeSelect.value === 'base'
          ? (studioBaseDirection.value === 'east' ? 'side' : 'front')
          : spriteViewControl.value);
    const frameCount = getCharacterFrameCount(member?.appearance, previewView, 'walk') || 8;
    selectedSpriteFrame = (selectedSpriteFrame + 1) % frameCount;
    renderSpriteViewer();
  }, 180);
}

function toggleSpritePlayback() {
  if (spriteAnimationTimer !== null) {
    stopSpritePlayback();
    renderStudioEditor();
  } else {
    startSpritePlayback();
  }
}

function renderSpriteViewer() {
  const memberIndex = Number(spriteCharacterControl.value) || 0;
  const member = party[memberIndex] ?? party[0];
  if (!member?.appearance) return;

  const view = spriteViewControl.value;
  const animationMode = spriteAnimationControl.value;
  const frameCount = getCharacterFrameCount(member.appearance, view, animationMode);
  const walkOption = spriteAnimationControl.querySelector('option[value="walk"]');
  const idleOption = spriteAnimationControl.querySelector('option[value="idle"]');
  if (walkOption) {
    walkOption.textContent = `Walk · ${getCharacterFrameCount(member.appearance, view, 'walk')} frames`;
  }
  if (idleOption) {
    const idleFrameCount = getCharacterFrameCount(member.appearance, view, 'idle');
    idleOption.textContent = `Idle · ${idleFrameCount} frame${idleFrameCount === 1 ? '' : 's'}`;
  }

  selectedSpriteFrame = ((selectedSpriteFrame % frameCount) + frameCount) % frameCount;
  spriteFrameStrip.replaceChildren();

  for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'sprite-frame';
    tile.setAttribute('aria-pressed', String(frameIndex === selectedSpriteFrame));
    tile.setAttribute('aria-label', `${member.name}, ${view === 'front' ? 'front' : 'side'} ${animationMode} frame ${frameIndex + 1} of ${frameCount}`);

    const frameCanvas = document.createElement('canvas');
    frameCanvas.width = 32;
    frameCanvas.height = 32;
    frameCanvas.setAttribute('aria-hidden', 'true');
    const grid = getCharacterFrameGrid(member.appearance, view, animationMode, frameIndex);
    renderCharacterGridToCanvas(frameCanvas, grid, { bgColor: '#020904', includeBackdrop: false });

    const label = document.createElement('span');
    label.className = 'sprite-frame-label';
    label.textContent = `FRAME ${frameIndex + 1}`;

    tile.append(frameCanvas, label);
    tile.addEventListener('click', () => {
      stopSpritePlayback();
      selectedSpriteFrame = frameIndex;
      const frameVal = `${animationMode}:${frameIndex}`;
      if (
        studioClothingFrame
        && (studioClothingFrame.value !== 'all' || isFrameSpecificCategory(studioClothingCategory.value))
        && studioClothingFrame.querySelector(`option[value="${frameVal}"]`)
      ) {
        studioClothingFrame.value = frameVal;
      }
      if (studioBaseFrame && studioBaseFrame.querySelector(`option[value="${frameVal}"]`)) {
        studioBaseFrame.value = frameVal;
      }
      renderSpriteViewer();
    });
    spriteFrameStrip.append(tile);
  }

  spriteFrameReadout.textContent = `${animationMode.toUpperCase()} · FRAME ${selectedSpriteFrame + 1}/${frameCount} · ${member.name}`;
  renderStudioEditor();
}

// ============================================================================
// COLOR PICKER & PALETTES
// ============================================================================
function lookupColorName(hex) {
  if (!hex) return 'Transparent';
  const clean = hex.toLowerCase();
  const found = PRESET_COLOR_SWATCHES.find((s) => s.hex.toLowerCase() === clean);
  return found ? found.name : `Custom (${clean.toUpperCase()})`;
}

function setActiveBrushColor(hexColor) {
  if (!hexColor) return;
  const clean = hexColor.toLowerCase();
  studioBrushColor = clean;
  if (/^#[0-9a-f]{6}$/i.test(clean)) {
    studioActiveColor.value = clean;
  }
  studioHexInput.value = clean.toUpperCase();
  if (studioColorNameReadout) {
    studioColorNameReadout.textContent = lookupColorName(clean);
  }
  highlightActiveSwatches();
}

function highlightActiveSwatches() {
  const clean = studioBrushColor.toLowerCase();
  document.querySelectorAll('.studio-swatch').forEach((btn) => {
    const c = (btn.getAttribute('data-color') || '').toLowerCase();
    btn.classList.toggle('active-swatch', c === clean);
  });
}

function renderPresetColorPalette() {
  if (!studioPresetColorsGrid) return;
  studioPresetColorsGrid.replaceChildren();
  for (const swatch of PRESET_COLOR_SWATCHES) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'studio-swatch';
    btn.style.background = swatch.hex;
    btn.setAttribute('data-color', swatch.hex);
    btn.title = `${swatch.name} (${swatch.hex.toUpperCase()})`;
    btn.addEventListener('click', () => {
      setActiveBrushColor(swatch.hex);
      if (activeStudioTool === 'eraser' || activeStudioTool === 'picker') {
        setActiveTool('pencil');
      }
    });
    studioPresetColorsGrid.append(btn);
  }
  highlightActiveSwatches();
}

function renderUsedColorsPalette(grid) {
  if (!studioUsedColorsGrid || !studioUsedColorsCount) return;
  const colorCounts = new Map();
  if (Array.isArray(grid)) {
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 32; x++) {
        const col = grid[y]?.[x];
        if (col && typeof col === 'string') {
          const norm = col.toLowerCase();
          colorCounts.set(norm, (colorCounts.get(norm) || 0) + 1);
        }
      }
    }
  }

  const usedColors = Array.from(colorCounts.keys());
  studioUsedColorsCount.textContent = `${usedColors.length} color${usedColors.length === 1 ? '' : 's'}`;
  studioUsedColorsGrid.replaceChildren();

  if (usedColors.length === 0) {
    const emptyMsg = document.createElement('span');
    emptyMsg.style.fontSize = '8px';
    emptyMsg.style.color = '#748a7a';
    emptyMsg.style.gridColumn = '1 / -1';
    emptyMsg.textContent = 'No pixels on layer yet';
    studioUsedColorsGrid.append(emptyMsg);
    return;
  }

  for (const hex of usedColors) {
    const count = colorCounts.get(hex);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'studio-swatch';
    if (hex === studioBrushColor.toLowerCase()) {
      btn.classList.add('active-swatch');
    }
    btn.style.background = hex;
    btn.setAttribute('data-color', hex);
    btn.title = `${lookupColorName(hex)} ${hex.toUpperCase()} (${count} px)`;
    btn.addEventListener('click', () => {
      setActiveBrushColor(hex);
      if (activeStudioTool === 'eraser' || activeStudioTool === 'picker') {
        setActiveTool('pencil');
      }
    });
    studioUsedColorsGrid.append(btn);
  }
}

function setActiveTool(tool) {
  activeStudioTool = tool;
  const tools = [
    { btn: studioToolPencil, id: 'pencil' },
    { btn: studioToolEraser, id: 'eraser' },
    { btn: studioToolPicker, id: 'picker' },
    { btn: studioToolFill, id: 'fill' }
  ];
  for (const t of tools) {
    if (t.id === tool) {
      t.btn.classList.add('active');
      t.btn.classList.remove('secondary-button');
      t.btn.setAttribute('aria-pressed', 'true');
    } else {
      t.btn.classList.remove('active');
      t.btn.classList.add('secondary-button');
      t.btn.setAttribute('aria-pressed', 'false');
    }
  }
}

// ============================================================================
// UNDO / REDO SYSTEM
// ============================================================================
function captureTargetStateSnapshot() {
  const target = getStudioTargetInfo();
  if (target.mode === 'mask') {
    const customMask = getFrameCustomMask(target.gender, target.view, target.animMode, target.frameIndex);
    return {
      mode: 'mask',
      gender: target.gender,
      view: target.view,
      animMode: target.animMode,
      frameIndex: target.frameIndex,
      hadCustomMask: customMask !== null,
      maskCoords: customMask ? customMask.map((pt) => [...pt]) : null
    };
  }

  const savedGrid = getCustomSpriteOverride(target.key);
  const frameBackups = {};
  if (target.mode === 'clothing' && target.isAllFrames) {
    for (let f = 0; f < 8; f++) {
      const fKey = `clothing:${target.presetId}:${target.view}:walk:${f}`;
      const fGrid = getCustomSpriteOverride(fKey);
      if (fGrid) frameBackups[fKey] = fGrid.map((r) => [...r]);
    }
    const idleKey = `clothing:${target.presetId}:${target.view}:idle:0`;
    const idleGrid = getCustomSpriteOverride(idleKey);
    if (idleGrid) frameBackups[idleKey] = idleGrid.map((r) => [...r]);
  }
  return {
    mode: target.mode,
    key: target.key,
    hadCustomOverride: savedGrid !== null,
    grid: savedGrid ? savedGrid.map((row) => [...row]) : null,
    frameBackups
  };
}

function restoreTargetStateSnapshot(snapshot) {
  if (!snapshot) return;
  if (snapshot.mode === 'mask') {
    if (snapshot.hadCustomMask && snapshot.maskCoords) {
      setFrameCustomMask(snapshot.gender, snapshot.view, snapshot.animMode, snapshot.frameIndex, snapshot.maskCoords);
    } else {
      resetFrameCustomMask(snapshot.gender, snapshot.view, snapshot.animMode, snapshot.frameIndex);
    }
  } else {
    if (snapshot.hadCustomOverride && snapshot.grid) {
      setCustomSpriteOverride(snapshot.key, snapshot.grid);
    } else {
      resetCustomSpriteOverride(snapshot.key);
    }
    if (snapshot.frameBackups) {
      for (const [fKey, fGrid] of Object.entries(snapshot.frameBackups)) {
        setCustomSpriteOverride(fKey, fGrid);
      }
    }
  }
}

function statesAreEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function updateUndoRedoButtons() {
  if (studioBtnUndo) {
    studioBtnUndo.disabled = undoStack.length === 0;
    studioBtnUndo.textContent = undoStack.length > 0 ? `↩️ Undo (${undoStack.length})` : '↩️ Undo';
  }
  if (studioBtnRedo) {
    studioBtnRedo.disabled = redoStack.length === 0;
    studioBtnRedo.textContent = redoStack.length > 0 ? `↪️ Redo (${redoStack.length})` : '↪️ Redo';
  }
}

function commitUndoSnapshotIfChanged(beforeSnapshot) {
  if (!beforeSnapshot) return;
  const afterSnapshot = captureTargetStateSnapshot();
  if (statesAreEqual(beforeSnapshot, afterSnapshot)) return;
  undoStack.push(beforeSnapshot);
  if (undoStack.length > MAX_HISTORY_STEPS) {
    undoStack.shift();
  }
  redoStack.length = 0;
  updateUndoRedoButtons();
}

function performUndo() {
  if (undoStack.length === 0) return;
  const currentSnapshot = captureTargetStateSnapshot();
  const prevSnapshot = undoStack.pop();
  redoStack.push(currentSnapshot);
  restoreTargetStateSnapshot(prevSnapshot);
  updateUndoRedoButtons();
  renderSpriteViewer();
  showSaveStatus('Undid last action', false);
}

function performRedo() {
  if (redoStack.length === 0) return;
  const currentSnapshot = captureTargetStateSnapshot();
  const nextSnapshot = redoStack.pop();
  undoStack.push(currentSnapshot);
  restoreTargetStateSnapshot(nextSnapshot);
  updateUndoRedoButtons();
  renderSpriteViewer();
  showSaveStatus('Redid action', false);
}

// ============================================================================
// SMART CATEGORY FRAME RULES & TRAVELER DEFAULTS SYNC
// ============================================================================
function syncCategoryFrameBehavior() {
  const category = studioClothingCategory.value;
  const perFrameRequired = isFrameSpecificCategory(category);

  if (studioFrameOptAll) {
    studioFrameOptAll.hidden = perFrameRequired;
    studioFrameOptAll.disabled = perFrameRequired;
  }

  if (perFrameRequired) {
    if (studioClothingFrame.value === 'all') {
      const animMode = spriteAnimationControl.value || 'walk';
      const frameIdx = animMode === 'idle' ? 0 : (selectedSpriteFrame % 8);
      const nextVal = `${animMode}:${frameIdx}`;
      studioClothingFrame.value = studioClothingFrame.querySelector(`option[value="${nextVal}"]`)
        ? nextVal
        : 'walk:0';
    }
    if (studioFrameBehaviorBadge) {
      studioFrameBehaviorBadge.textContent = '🔒 Per-Frame (Auto)';
      studioFrameBehaviorBadge.className = 'frame-behavior-badge per-frame';
    }
  } else {
    if (studioFrameBehaviorBadge) {
      studioFrameBehaviorBadge.textContent = '🔓 1-Frame Default';
      studioFrameBehaviorBadge.className = 'frame-behavior-badge shared';
    }
  }
}

function populateClothingPresets() {
  const selectedEraFilter = studioClothingEra.value;
  const selectedGender = studioClothingGender.value;
  const category = studioClothingCategory.value;
  const allPresets = INITIAL_CLOTHING_BOILERPLATE[category] || [];

  const previousValue = studioClothingPreset.value;
  studioClothingPreset.replaceChildren();

  const eraOrder = [
    'oregon_trail',
    '1500s', '1600s', '1700s', '1800s',
    '1900_1920', '1921_1940', '1941_1950',
    '1950s', '1960s', '1970s', '1980s',
    '1990s', '2000s', '2010s', '2020s',
    'all'
  ];
  const targetEras = selectedEraFilter === 'all' ? eraOrder : [selectedEraFilter];

  let totalOptions = 0;

  for (const eraId of targetEras) {
    const eraPresets = allPresets.filter((p) => !p.isNone && (p.era === eraId || (!p.era && eraId === 'all')));
    if (eraPresets.length === 0) continue;

    const eraName = ERA_DISPLAY_NAMES[eraId] || eraId;
    const genderBuckets = [
      { id: 'male', label: 'Male' },
      { id: 'female', label: 'Female' },
      { id: 'unisex', label: 'Unisex' }
    ];

    for (const gBucket of genderBuckets) {
      if (selectedGender !== 'all' && gBucket.id !== selectedGender && gBucket.id !== 'unisex') continue;
      const matchingPresets = eraPresets.filter((p) => (p.gender || 'unisex') === gBucket.id);
      if (matchingPresets.length === 0) continue;

      const optgroup = document.createElement('optgroup');
      optgroup.label = `${eraName} → ${gBucket.label}`;

      for (const preset of matchingPresets) {
        const opt = document.createElement('option');
        opt.value = preset.id;
        opt.textContent = preset.name;
        optgroup.append(opt);
        totalOptions++;
      }
      studioClothingPreset.append(optgroup);
    }
  }

  if (totalOptions === 0) {
    const emptyOpt = document.createElement('option');
    emptyOpt.value = '';
    emptyOpt.textContent = 'No presets matching filters';
    studioClothingPreset.append(emptyOpt);
  } else if (previousValue && studioClothingPreset.querySelector(`option[value="${previousValue}"]`)) {
    studioClothingPreset.value = previousValue;
  } else {
    studioClothingPreset.selectedIndex = 0;
  }

  syncCategoryFrameBehavior();
}

function syncStudioToActiveTravelerDefaults() {
  const memberIndex = Number(spriteCharacterControl.value) || 0;
  const member = party[memberIndex] ?? party[0];
  if (!member?.appearance) return;

  const travelerGender = member.appearance.gender === 'female' ? 'female' : 'male';

  if (studioClothingGender) studioClothingGender.value = travelerGender;
  if (studioBaseGender) studioBaseGender.value = travelerGender;
  if (studioClothingEra && selectedEra && studioClothingEra.value !== 'all') {
    studioClothingEra.value = selectedEra;
  }

  populateClothingPresets();

  const activeCat = studioClothingCategory.value;
  const equippedPresetId = member.appearance.equippedPresets?.[activeCat];
  if (equippedPresetId && studioClothingPreset) {
    if (studioClothingPreset.querySelector(`option[value="${equippedPresetId}"]`)) {
      studioClothingPreset.value = equippedPresetId;
    }
  }

  for (const cat of ['hats', 'shirts', 'pants', 'shoes', 'accessories']) {
    if (previewWearCheckboxes[cat]) previewWearCheckboxes[cat].checked = true;
    if (previewPresetSelects[cat]) previewPresetSelects[cat].value = '__active__';
  }
}

// ============================================================================
// PREVIEW OUTFIT CUSTOMIZER
// ============================================================================
function populatePreviewOutfitSelectors() {
  const categories = ['hats', 'shirts', 'pants', 'shoes', 'accessories'];
  for (const cat of categories) {
    const selectEl = previewPresetSelects[cat];
    if (!selectEl) continue;
    const prevVal = selectEl.value || '__active__';
    selectEl.replaceChildren();

    const activeOpt = document.createElement('option');
    activeOpt.value = '__active__';
    activeOpt.textContent = '⚡ Auto (Editor / Traveler)';
    selectEl.append(activeOpt);

    const presets = (INITIAL_CLOTHING_BOILERPLATE[cat] || []).filter((p) => !p.isNone);
    const oregonPresets = presets.filter((p) => p.era === 'oregon_trail');
    const otherPresets = presets.filter((p) => p.era !== 'oregon_trail');

    if (oregonPresets.length > 0) {
      const ogGroup = document.createElement('optgroup');
      ogGroup.label = 'Oregon Trail';
      for (const p of oregonPresets) {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = `${p.name} (${p.gender || 'unisex'})`;
        ogGroup.append(opt);
      }
      selectEl.append(ogGroup);
    }

    if (otherPresets.length > 0) {
      const otherGroup = document.createElement('optgroup');
      otherGroup.label = 'Other Historical Eras';
      for (const p of otherPresets) {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = `[${p.era}] ${p.name}`;
        otherGroup.append(opt);
      }
      selectEl.append(otherGroup);
    }

    if (selectEl.querySelector(`option[value="${prevVal}"]`)) {
      selectEl.value = prevVal;
    } else {
      selectEl.value = '__active__';
    }
  }
}

function buildCustomPreviewAppearance(baseAppearance, target) {
  const equipped = { ...(baseAppearance?.equippedPresets || {}) };
  const categories = ['hats', 'shirts', 'pants', 'shoes', 'accessories'];

  document.querySelectorAll('.studio-outfit-slot-row').forEach((row) => {
    const slot = row.getAttribute('data-slot');
    row.classList.toggle('active-editing-slot', target.mode === 'clothing' && target.category === slot);
  });

  for (const cat of categories) {
    const wearChecked = previewWearCheckboxes[cat] ? previewWearCheckboxes[cat].checked : true;
    if (!wearChecked) {
      const nonePreset = (INITIAL_CLOTHING_BOILERPLATE[cat] || []).find((p) => p.isNone);
      equipped[cat] = nonePreset ? nonePreset.id : '';
      continue;
    }

    const customPick = previewPresetSelects[cat]?.value || '__active__';
    if (customPick !== '__active__') {
      equipped[cat] = customPick;
    } else if (target.mode === 'clothing' && target.category === cat && target.presetId) {
      equipped[cat] = target.presetId;
    }
  }

  return {
    ...baseAppearance,
    gender: target.mode === 'base' ? target.gender : baseAppearance.gender,
    skinToneId: testPlayerSkinTone || baseAppearance.skinToneId || 'warm_ivory',
    equippedPresets: equipped
  };
}

// ============================================================================
// TARGET & WORKING GRID RESOLUTION
// ============================================================================
function getStudioTargetInfo() {
  const mode = studioModeSelect.value;
  const memberIndex = Number(spriteCharacterControl.value) || 0;
  const member = party[memberIndex] ?? party[0];

  if (mode === 'clothing') {
    const category = studioClothingCategory.value;
    const presetId = studioClothingPreset.value;
    const view = studioClothingView.value;
    const perFrameRequired = isFrameSpecificCategory(category);
    const rawFrameVal = studioClothingFrame.value || (perFrameRequired ? 'walk:0' : 'all');
    const isAllFrames = !perFrameRequired && rawFrameVal === 'all';

    let animMode = 'walk';
    let frameIndex = 0;
    let key = '';
    if (isAllFrames) {
      key = `clothing:${presetId}:${view}`;
      animMode = spriteAnimationControl.value || 'walk';
      frameIndex = selectedSpriteFrame;
    } else {
      const [aMode, fStr] = (rawFrameVal === 'all' ? 'walk:0' : rawFrameVal).split(':');
      animMode = aMode || 'walk';
      frameIndex = Number(fStr) || 0;
      key = `clothing:${presetId}:${view}:${animMode}:${frameIndex}`;
    }
    const preset = (INITIAL_CLOTHING_BOILERPLATE[category] || []).find((p) => p.id === presetId);
    const frameLabel = isAllFrames
      ? 'All Frames (Shared)'
      : `${animMode.toUpperCase()} Frame ${frameIndex + 1}`;
    const name = preset ? `${preset.name} (${frameLabel})` : 'Clothing Item';
    return { mode, member, category, presetId, view, animMode, frameIndex, isAllFrames, key, name, preset };
  }

  if (mode === 'base') {
    const gender = studioBaseGender.value;
    const direction = studioBaseDirection.value;
    const rawVal = studioBaseFrame.value || 'all';
    const isApplyAllChecked = studioBaseApplyAll ? studioBaseApplyAll.checked : true;
    const isAllFrames = rawVal === 'all' || isApplyAllChecked;

    let animMode = 'walk';
    let frameIndex = 0;
    let key = '';
    if (isAllFrames) {
      key = `base:${gender}:${direction}`;
      animMode = spriteAnimationControl.value || 'walk';
      frameIndex = selectedSpriteFrame;
    } else {
      const [aMode, fStr] = rawVal.split(':');
      animMode = aMode || 'walk';
      frameIndex = Number(fStr) || 0;
      key = `base:${gender}:${direction}:${animMode}:${frameIndex}`;
    }
    const frameLabel = isAllFrames ? 'All Frames (Universal)' : `${animMode.toUpperCase()} Frame ${frameIndex + 1}`;
    const name = `${gender === 'female' ? '32Woman' : '32Man'} · ${direction === 'east' ? 'Side' : 'Front'} · ${frameLabel}`;
    return { mode, member, gender, direction, animMode, frameIndex, isAllFrames, key, name };
  }

  // mode === 'mask'
  const gender = member?.appearance?.gender === 'female' ? 'female' : 'male';
  const view = spriteViewControl.value;
  const animMode = spriteAnimationControl.value;
  const frameCount = getCharacterFrameCount(member?.appearance, view, animMode);
  const activeFrame = ((selectedSpriteFrame % frameCount) + frameCount) % frameCount;
  const key = `mask:${gender}:${view}:${animMode}:${activeFrame}`;
  const name = `Z-Mask: ${member.name} (${view === 'front' ? 'Front' : 'Side'} Frame ${activeFrame + 1})`;
  return { mode, member, gender, view, animMode, frameIndex: activeFrame, frameCount, isAllFrames: false, key, name };
}

function getStudioWorkingGrid(target) {
  if (target.mode === 'clothing') {
    const gender = target.preset?.gender === 'female' ? 'female' : 'male';
    if (target.isAllFrames) {
      const customUniversal = getCustomSpriteOverride(target.key);
      if (customUniversal) return customUniversal;
      return getClothingItemDefaultGrid(target.category, target.presetId, gender, target.view, 'default', 'walk', 0);
    } else {
      const customSpecific = getCustomSpriteOverride(target.key);
      if (customSpecific) return customSpecific;
      const universalKey = `clothing:${target.presetId}:${target.view}`;
      const customUniversal = getCustomSpriteOverride(universalKey);
      if (customUniversal) return customUniversal;
      return getClothingItemDefaultGrid(
        target.category,
        target.presetId,
        gender,
        target.view,
        'default',
        target.animMode,
        target.frameIndex
      );
    }
  }
  if (target.mode === 'base') {
    if (target.isAllFrames) {
      const customUniversal = getCustomSpriteOverride(target.key);
      if (customUniversal) return customUniversal;
      const fKey = `base:${target.gender}:${target.direction}:${target.animMode}:${target.frameIndex}`;
      const customFrame = getCustomSpriteOverride(fKey);
      if (customFrame) return customFrame;
      const boilerplate = getBaseBoilerplateGrid(target.gender, target.direction === 'south' ? 'front' : 'side', target.animMode, target.frameIndex, target.member?.appearance?.skinToneId);
      if (boilerplate) return boilerplate.map((row) => [...row]);
      return Array.from({ length: 32 }, () => Array(32).fill(null));
    } else {
      const customFrame = getCustomSpriteOverride(target.key);
      if (customFrame) return customFrame;
      const universalKey = `base:${target.gender}:${target.direction}`;
      const customUniversal = getCustomSpriteOverride(universalKey);
      if (customUniversal) return customUniversal;
      const boilerplate = getBaseBoilerplateGrid(target.gender, target.direction === 'south' ? 'front' : 'side', target.animMode, target.frameIndex, target.member?.appearance?.skinToneId);
      if (boilerplate) return boilerplate.map((row) => [...row]);
      return Array.from({ length: 32 }, () => Array(32).fill(null));
    }
  }
  return null;
}

// ============================================================================
// MULTI-BACKDROP CANVAS DRAWING
// ============================================================================
function drawBackdropOnCanvas(ctx, width, height, bgMode) {
  const cellSize = width / 32;
  if (bgMode === 'white') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    return;
  }
  if (bgMode === 'black') {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    return;
  }
  if (bgMode === 'light-grid') {
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 32; x++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? '#ffffff' : '#dfe6e1';
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
    return;
  }
  if (bgMode === 'prairie') {
    // Sky, hills, grass, and trail path
    ctx.fillStyle = '#31a2f2';
    ctx.fillRect(0, 0, width, Math.floor(height * 0.45));
    ctx.fillStyle = '#b2dce8';
    ctx.fillRect(0, Math.floor(height * 0.45), width, Math.floor(height * 0.15));
    ctx.fillStyle = '#44891a';
    ctx.fillRect(0, Math.floor(height * 0.58), width, Math.floor(height * 0.18));
    ctx.fillStyle = '#a3ce27';
    ctx.fillRect(0, Math.floor(height * 0.76), width, Math.floor(height * 0.08));
    ctx.fillStyle = '#e4a672';
    ctx.fillRect(0, Math.floor(height * 0.84), width, height - Math.floor(height * 0.84));
    return;
  }
  // Default: 'dark-grid'
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? '#09130c' : '#040906';
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }
}

function updateContextBreadcrumbAndRule(target) {
  const memberName = target.member?.name || 'Traveler';
  const memberGender = target.member?.appearance?.gender === 'female' ? 'Female' : 'Male';

  if (target.mode === 'clothing') {
    const catLabel = CATEGORY_DISPLAY_NAMES[target.category] || target.category;
    const presetLabel = target.preset?.name || 'Garment';
    const facingLabel = target.view === 'front' ? 'Front View' : 'Side Profile';
    const frameLabel = target.isAllFrames
      ? 'All Frames (Shared)'
      : `${target.animMode.toUpperCase()} Frame ${target.frameIndex + 1}`;
    studioBreadcrumbTrail.textContent = `${memberName} (${memberGender}) › ${catLabel} › ${presetLabel} › ${facingLabel} › ${frameLabel}`;

    if (target.isAllFrames) {
      studioPropagationRule.textContent = 'ℹ️ Universal Template: Edits apply across all 8 walk frames and bob naturally with the head.';
    } else if (isFrameSpecificCategory(target.category)) {
      studioPropagationRule.textContent = `ℹ️ Frame-Specific: Limbs animate per frame. You are editing ${target.animMode.toUpperCase()} Frame ${target.frameIndex + 1} only.`;
    } else {
      studioPropagationRule.textContent = `ℹ️ Single-Frame Override: Editing ${target.animMode.toUpperCase()} Frame ${target.frameIndex + 1} specifically for this item.`;
    }
  } else if (target.mode === 'base') {
    const gLabel = target.gender === 'female' ? 'Female (32Woman)' : 'Male (32Man)';
    const dirLabel = target.direction === 'south' ? 'Front View (South)' : 'Side Profile (East)';
    const fLabel = `${target.animMode.toUpperCase()} Frame ${target.frameIndex + 1}`;
    studioBreadcrumbTrail.textContent = `Base Body Sprite › ${gLabel} › ${dirLabel} › ${fLabel}`;
    studioPropagationRule.textContent = `ℹ️ Base Body Anatomy: Editing underlying character pixels for ${gLabel} on ${fLabel}.`;
  } else {
    const facingLabel = target.view === 'front' ? 'Front View' : 'Side Profile';
    const fLabel = `${target.animMode.toUpperCase()} Frame ${target.frameIndex + 1}`;
    studioBreadcrumbTrail.textContent = `Depth Z-Mask › ${memberName} (${memberGender}) › ${facingLabel} › ${fLabel}`;
    studioPropagationRule.textContent = `ℹ️ Foreground Z-Mask: Cyan pixels mark hands or gear that stay IN FRONT of all clothing layers on ${fLabel}.`;
  }
}

// ============================================================================
// MAIN STUDIO RENDERER
// ============================================================================
function renderStudioEditor() {
  syncCategoryFrameBehavior();
  const target = getStudioTargetInfo();
  studioTargetName.textContent = target.name;
  updateContextBreadcrumbAndRule(target);

  // Sync mode tab buttons
  modeTabButtons.forEach((btn) => {
    const isMatch = btn.getAttribute('data-mode') === target.mode;
    btn.classList.toggle('active', isMatch);
    btn.setAttribute('aria-selected', String(isMatch));
  });

  if (target.mode === 'clothing') {
    studioClothingControls.hidden = false;
    studioBaseControls.hidden = true;
    studioMaskBanner.hidden = true;
    studioColorPanel.hidden = false;
    maskCanvasLegend.hidden = true;
    studioShowUnderlay.parentElement.hidden = false;
    studioCanvasTitle.textContent = '32×32 CLOTHING EDITOR';
  } else if (target.mode === 'base') {
    studioClothingControls.hidden = true;
    studioBaseControls.hidden = false;
    studioMaskBanner.hidden = true;
    studioColorPanel.hidden = false;
    maskCanvasLegend.hidden = true;
    studioShowUnderlay.parentElement.hidden = true;
    studioCanvasTitle.textContent = '32×32 BASE SPRITE EDITOR';
  } else {
    studioClothingControls.hidden = true;
    studioBaseControls.hidden = true;
    studioMaskBanner.hidden = false;
    studioColorPanel.hidden = true;
    maskCanvasLegend.hidden = false;
    studioShowUnderlay.parentElement.hidden = true;
    studioCanvasTitle.textContent = '32×32 DEPTH Z-MASK EDITOR';
  }

  if (studioFrameStepperLabel) {
    if (target.mode === 'clothing' && target.isAllFrames) {
      studioFrameStepperLabel.textContent = `Shared · Pose #${(selectedSpriteFrame % 8) + 1}/8`;
    } else {
      studioFrameStepperLabel.textContent = `${target.animMode.toUpperCase()} Frame ${target.frameIndex + 1}`;
    }
  }

  const ctx = maskEditorCanvas.getContext('2d');
  if (!ctx) return;
  const w = maskEditorCanvas.width;
  const h = maskEditorCanvas.height;
  const cellSize = w / 32;

  ctx.clearRect(0, 0, w, h);
  drawBackdropOnCanvas(ctx, w, h, editorBgMode);

  // Draw underlay if clothing mode and checked
  if (target.mode === 'clothing' && studioShowUnderlay.checked) {
    const underlayGender = target.preset?.gender === 'female' ? 'female' : 'male';
    const underlayFrame = target.isAllFrames ? selectedSpriteFrame : target.frameIndex;
    const underlayGrid = getBaseBoilerplateGrid(underlayGender, target.view, target.animMode, underlayFrame);
    if (underlayGrid) {
      ctx.globalAlpha = editorBgMode === 'white' || editorBgMode === 'light-grid' ? 0.28 : 0.24;
      for (let y = 0; y < 32; y++) {
        for (let x = 0; x < 32; x++) {
          const col = underlayGrid[y]?.[x];
          if (col) {
            ctx.fillStyle = col;
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
          }
        }
      }
      ctx.globalAlpha = 1.0;
    }
  }

  let pixelCount = 0;
  let isCustom = false;
  const showGridLines = studioShowGrid ? studioShowGrid.checked : true;
  const isLightBg = editorBgMode === 'white' || editorBgMode === 'light-grid';
  const gridLineColor = isLightBg ? 'rgba(0, 0, 0, 0.14)' : 'rgba(255, 255, 255, 0.08)';
  const hoverStrokeColor = isLightBg ? '#d91b42' : '#f7e26b';

  if (target.mode === 'mask') {
    const baseGrid = getBaseBoilerplateGrid(target.gender, target.view, target.animMode, target.frameIndex);
    const activeMaskCoords = getFrameActiveMask(target.gender, target.view, target.animMode, target.frameIndex, baseGrid);
    const customMask = getFrameCustomMask(target.gender, target.view, target.animMode, target.frameIndex);
    isCustom = customMask !== null;
    const maskSet = new Set(activeMaskCoords.map(([x, y]) => `${x},${y}`));
    pixelCount = maskSet.size;

    if (baseGrid) {
      for (let y = 0; y < 32; y++) {
        for (let x = 0; x < 32; x++) {
          const col = baseGrid[y]?.[x];
          if (col) {
            ctx.fillStyle = col;
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
          }
        }
      }
    }

    if (showGridLines) {
      ctx.strokeStyle = gridLineColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i <= 32; i++) {
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, h);
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(w, i * cellSize);
      }
      ctx.stroke();
    }

    for (const [mx, my] of activeMaskCoords) {
      if (mx < 0 || mx >= 32 || my < 0 || my >= 32) continue;
      ctx.fillStyle = 'rgba(0, 255, 128, 0.48)';
      ctx.fillRect(mx * cellSize, my * cellSize, cellSize, cellSize);
      ctx.strokeStyle = '#00b862';
      ctx.lineWidth = 1;
      ctx.strokeRect(mx * cellSize + 0.5, my * cellSize + 0.5, cellSize - 1, cellSize - 1);
    }

    if (studioHoverCoords) {
      const { x: hx, y: hy } = studioHoverCoords;
      if (hx >= 0 && hx < 32 && hy >= 0 && hy < 32) {
        ctx.strokeStyle = hoverStrokeColor;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(hx * cellSize + 0.5, hy * cellSize + 0.5, cellSize - 1, cellSize - 1);
        const isMasked = maskSet.has(`${hx},${hy}`);
        const basePixel = baseGrid?.[hy]?.[hx] || 'transparent';
        maskPixelInfo.textContent = `X: ${hx}, Y: ${hy} · ${isMasked ? 'MASKED (In Front)' : 'UNMASKED'} (${basePixel})`;
      }
    }
  } else {
    const customFrame = getCustomSpriteOverride(target.key);
    const customOrientation = target.mode === 'clothing' ? getCustomSpriteOverride(`clothing:${target.presetId}:${target.view}`) : null;
    isCustom = customFrame !== null || customOrientation !== null;
    const grid = getStudioWorkingGrid(target);

    if (grid) {
      for (let y = 0; y < 32; y++) {
        for (let x = 0; x < 32; x++) {
          const col = grid[y]?.[x];
          if (col) {
            pixelCount += 1;
            ctx.fillStyle = col;
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
          }
        }
      }
    }

    renderUsedColorsPalette(grid);

    if (showGridLines) {
      ctx.strokeStyle = gridLineColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i <= 32; i++) {
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, h);
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(w, i * cellSize);
      }
      ctx.stroke();
    }

    if (studioHoverCoords) {
      const { x: hx, y: hy } = studioHoverCoords;
      if (hx >= 0 && hx < 32 && hy >= 0 && hy < 32) {
        ctx.strokeStyle = hoverStrokeColor;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(hx * cellSize + 0.5, hy * cellSize + 0.5, cellSize - 1, cellSize - 1);
        const pxCol = grid?.[hy]?.[hx] || null;
        maskPixelInfo.textContent = pxCol
          ? `X: ${hx}, Y: ${hy} · ${pxCol.toUpperCase()} (${lookupColorName(pxCol)})`
          : `X: ${hx}, Y: ${hy} · Transparent`;
      }
    }
  }

  // Update status readouts
  let originLabel = 'Default preset';
  if (target.mode === 'mask') {
    originLabel = isCustom ? 'Custom Z-Mask (Saved)' : 'Default Heuristic Hand Mask';
  } else if (target.mode === 'clothing') {
    if (target.isAllFrames) {
      const hasUniversal = getCustomSpriteOverride(`clothing:${target.presetId}:${target.view}`);
      originLabel = hasUniversal
        ? 'Custom Universal (Shared on all frames)'
        : 'Default 1-Frame Template (Shared)';
    } else {
      const hasSpecific = getCustomSpriteOverride(target.key);
      if (hasSpecific) {
        originLabel = `Custom Frame #${target.frameIndex + 1} Override`;
      } else {
        const hasUniversal = getCustomSpriteOverride(`clothing:${target.presetId}:${target.view}`);
        originLabel = hasUniversal
          ? 'Inheriting Universal Override'
          : `Default Pose for Frame #${target.frameIndex + 1}`;
      }
    }
  } else {
    originLabel = isCustom ? 'Custom Base Frame Override' : 'Default Base Sprite';
  }
  maskStatusReadout.textContent = `${isCustom ? 'CUSTOM' : 'DEFAULT'} · ${pixelCount} PX`;
  maskOriginInfo.textContent = originLabel;

  // Render Live Clothed Preview with selected Preview Background
  const previewMember = target.member ?? party[0];
  const previewView = target.mode === 'clothing'
    ? target.view
    : target.mode === 'base'
      ? (target.direction === 'east' ? 'side' : 'front')
      : spriteViewControl.value;
  const isPlayingCycle = spriteAnimationTimer !== null;
  const previewAnimMode = isPlayingCycle
    ? 'walk'
    : ((target.mode === 'clothing' || target.mode === 'base')
        ? target.animMode
        : spriteAnimationControl.value);
  const frameCount = getCharacterFrameCount(previewMember?.appearance, previewView, previewAnimMode) || 8;
  const previewFrame = isPlayingCycle
    ? (((selectedSpriteFrame % frameCount) + frameCount) % frameCount)
    : ((target.mode === 'clothing' || target.mode === 'base')
        ? target.frameIndex
        : (((selectedSpriteFrame % frameCount) + frameCount) % frameCount));

  const previewAppearance = buildCustomPreviewAppearance(previewMember.appearance, target);
  const clothedGrid = getCharacterFrameGrid(
    previewAppearance,
    previewView,
    previewAnimMode,
    previewFrame
  );

  if (previewBgMode === 'prairie') {
    renderCharacterGridToCanvas(maskPreviewCanvas, clothedGrid, {
      bgColor: '#020904',
      includeBackdrop: true,
      backdropId: 'prairie'
    });
  } else {
    const pCtx = maskPreviewCanvas.getContext('2d');
    if (pCtx) {
      const pw = maskPreviewCanvas.width;
      const ph = maskPreviewCanvas.height;
      const pCell = pw / 32;
      pCtx.clearRect(0, 0, pw, ph);
      drawBackdropOnCanvas(pCtx, pw, ph, previewBgMode);
      if (clothedGrid) {
        for (let y = 0; y < 32; y++) {
          for (let x = 0; x < 32; x++) {
            const c = clothedGrid[y]?.[x];
            if (c) {
              pCtx.fillStyle = c;
              pCtx.fillRect(x * pCell, y * pCell, pCell, pCell);
            }
          }
        }
      }
    }
  }

  maskOutfitSummary.textContent = summarizeMemberOutfit({ appearance: previewAppearance, name: previewMember.name });
}

// ============================================================================
// PIXEL PAINTING & FLOOD FILL
// ============================================================================
function floodFill(grid, startX, startY, newColor) {
  const targetColor = grid[startY]?.[startX] ?? null;
  if (targetColor === newColor) return;

  const queue = [[startX, startY]];
  const visited = new Set();
  visited.add(`${startX},${startY}`);

  while (queue.length > 0) {
    const [cx, cy] = queue.pop();
    grid[cy][cx] = newColor;

    const neighbors = [
      [cx + 1, cy],
      [cx - 1, cy],
      [cx, cy + 1],
      [cx, cy - 1]
    ];
    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < 32 && ny >= 0 && ny < 32) {
        const nKey = `${nx},${ny}`;
        if (!visited.has(nKey)) {
          const c = grid[ny]?.[nx] ?? null;
          if (c === targetColor) {
            visited.add(nKey);
            queue.push([nx, ny]);
          }
        }
      }
    }
  }
}

function applyStudioPixel(x, y, isRightClick = false) {
  if (x < 0 || x >= 32 || y < 0 || y >= 32) return;
  const target = getStudioTargetInfo();

  if (target.mode === 'mask') {
    const baseGrid = getBaseBoilerplateGrid(target.gender, target.view, target.animMode, target.frameIndex);
    const currentCoords = getFrameActiveMask(target.gender, target.view, target.animMode, target.frameIndex, baseGrid);
    const maskSet = new Set(currentCoords.map(([cx, cy]) => `${cx},${cy}`));
    const key = `${x},${y}`;
    if (activeStudioTool === 'eraser' || isRightClick) {
      if (!maskSet.has(key)) return;
      maskSet.delete(key);
    } else {
      if (maskSet.has(key)) return;
      maskSet.add(key);
    }
    const newCoords = Array.from(maskSet).map((k) => k.split(',').map(Number));
    setFrameCustomMask(target.gender, target.view, target.animMode, target.frameIndex, newCoords);
  } else {
    const grid = getStudioWorkingGrid(target);

    if (activeStudioTool === 'picker') {
      const picked = grid[y]?.[x] || null;
      if (picked) {
        setActiveBrushColor(picked);
        setActiveTool('pencil');
        showSaveStatus(`Picked color: ${picked.toUpperCase()} (${lookupColorName(picked)})`, false);
      }
      renderStudioEditor();
      return;
    }

    if (activeStudioTool === 'fill') {
      const fillColor = (activeStudioTool === 'eraser' || isRightClick) ? null : studioBrushColor;
      floodFill(grid, x, y, fillColor);
      setCustomSpriteOverride(target.key, grid);
    } else if (activeStudioTool === 'eraser' || isRightClick) {
      if (grid[y][x] === null) return;
      grid[y][x] = null;
      setCustomSpriteOverride(target.key, grid);
    } else {
      if (grid[y][x] === studioBrushColor) return;
      grid[y][x] = studioBrushColor;
      setCustomSpriteOverride(target.key, grid);
    }

    if (target.mode === 'clothing' && target.isAllFrames) {
      for (let f = 0; f < 8; f++) {
        resetCustomSpriteOverride(`clothing:${target.presetId}:${target.view}:walk:${f}`);
      }
      resetCustomSpriteOverride(`clothing:${target.presetId}:${target.view}:idle:0`);
    } else if (target.mode === 'base' && target.isAllFrames) {
      // Propagate the pixel edit to all 8 walk frames and idle frame
      const fillColor = (activeStudioTool === 'eraser' || isRightClick) ? null : studioBrushColor;
      for (let f = 0; f < 8; f++) {
        const fKey = `base:${target.gender}:${target.direction}:walk:${f}`;
        const fGrid = getCustomSpriteOverride(fKey) || getBaseBoilerplateGrid(target.gender, target.direction === 'south' ? 'front' : 'side', 'walk', f, target.member?.appearance?.skinToneId);
        if (fGrid) {
          const copy = fGrid.map((r) => [...r]);
          if (activeStudioTool === 'fill') floodFill(copy, x, y, fillColor);
          else if (activeStudioTool === 'eraser' || isRightClick) copy[y][x] = null;
          else copy[y][x] = studioBrushColor;
          setCustomSpriteOverride(fKey, copy);
        }
      }
      const idleKey = `base:${target.gender}:${target.direction}:idle:0`;
      const idleGrid = getCustomSpriteOverride(idleKey) || getBaseBoilerplateGrid(target.gender, target.direction === 'south' ? 'front' : 'side', 'idle', 0, target.member?.appearance?.skinToneId);
      if (idleGrid) {
        const copy = idleGrid.map((r) => [...r]);
        if (activeStudioTool === 'fill') floodFill(copy, x, y, fillColor);
        else if (activeStudioTool === 'eraser' || isRightClick) copy[y][x] = null;
        else copy[y][x] = studioBrushColor;
        setCustomSpriteOverride(idleKey, copy);
      }
    }
  }

  renderSpriteViewer();
}

function getCanvasCellCoords(evt) {
  const rect = maskEditorCanvas.getBoundingClientRect();
  const scaleX = maskEditorCanvas.width / rect.width;
  const scaleY = maskEditorCanvas.height / rect.height;
  const px = (evt.clientX - rect.left) * scaleX;
  const py = (evt.clientY - rect.top) * scaleY;
  const cellSize = maskEditorCanvas.width / 32;
  const x = Math.floor(px / cellSize);
  const y = Math.floor(py / cellSize);
  return { x: Math.max(0, Math.min(31, x)), y: Math.max(0, Math.min(31, y)) };
}

maskEditorCanvas.addEventListener('mousedown', (evt) => {
  if (activeStudioTool !== 'picker') {
    pendingStrokeSnapshot = captureTargetStateSnapshot();
  }
  isStudioPainting = true;
  const { x, y } = getCanvasCellCoords(evt);
  applyStudioPixel(x, y, evt.button === 2);
  if (activeStudioTool === 'fill') {
    commitUndoSnapshotIfChanged(pendingStrokeSnapshot);
    pendingStrokeSnapshot = null;
  }
});

maskEditorCanvas.addEventListener('mousemove', (evt) => {
  const { x, y } = getCanvasCellCoords(evt);
  studioHoverCoords = { x, y };
  if (isStudioPainting && activeStudioTool !== 'picker' && activeStudioTool !== 'fill') {
    applyStudioPixel(x, y, evt.buttons === 2);
  } else {
    renderStudioEditor();
  }
});

window.addEventListener('mouseup', () => {
  if (isStudioPainting) {
    isStudioPainting = false;
    if (pendingStrokeSnapshot) {
      commitUndoSnapshotIfChanged(pendingStrokeSnapshot);
      pendingStrokeSnapshot = null;
    }
  }
});

maskEditorCanvas.addEventListener('mouseleave', () => {
  studioHoverCoords = null;
  maskPixelInfo.textContent = 'Hover canvas to inspect';
  renderStudioEditor();
});

maskEditorCanvas.addEventListener('contextmenu', (evt) => {
  evt.preventDefault();
});

// Keyboard shortcuts
window.addEventListener('keydown', (evt) => {
  const tag = document.activeElement?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  if ((evt.metaKey || evt.ctrlKey) && evt.key.toLowerCase() === 'z') {
    evt.preventDefault();
    if (evt.shiftKey) performRedo();
    else performUndo();
  } else if ((evt.metaKey || evt.ctrlKey) && evt.key.toLowerCase() === 'y') {
    evt.preventDefault();
    performRedo();
  }
});

// ============================================================================
// UI EVENT LISTENERS
// ============================================================================
modeTabButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const mode = btn.getAttribute('data-mode');
    if (mode) {
      studioModeSelect.value = mode;
      renderStudioEditor();
    }
  });
});

studioModeSelect.addEventListener('change', () => {
  renderStudioEditor();
});

// Backdrop Switcher Pills
document.querySelectorAll('[data-editor-bg]').forEach((btn) => {
  btn.addEventListener('click', () => {
    editorBgMode = btn.getAttribute('data-editor-bg') || 'dark-grid';
    document.querySelectorAll('[data-editor-bg]').forEach((b) => b.classList.toggle('active', b === btn));
    renderStudioEditor();
  });
});

document.querySelectorAll('[data-preview-bg]').forEach((btn) => {
  btn.addEventListener('click', () => {
    previewBgMode = btn.getAttribute('data-preview-bg') || 'dark-grid';
    document.querySelectorAll('[data-preview-bg]').forEach((b) => b.classList.toggle('active', b === btn));
    renderStudioEditor();
  });
});

// Z-Mask Helper Buttons
if (maskBtnAutodetect) {
  maskBtnAutodetect.addEventListener('click', () => {
    const before = captureTargetStateSnapshot();
    const target = getStudioTargetInfo();
    resetFrameCustomMask(target.gender, target.view, target.animMode, target.frameIndex);
    commitUndoSnapshotIfChanged(before);
    renderSpriteViewer();
    showSaveStatus('Restored auto-detected hand Z-mask pixels!', false);
  });
}

if (maskBtnInvert) {
  maskBtnInvert.addEventListener('click', () => {
    const before = captureTargetStateSnapshot();
    const target = getStudioTargetInfo();
    const baseGrid = getBaseBoilerplateGrid(target.gender, target.view, target.animMode, target.frameIndex);
    const currentCoords = getFrameActiveMask(target.gender, target.view, target.animMode, target.frameIndex, baseGrid);
    const maskSet = new Set(currentCoords.map(([cx, cy]) => `${cx},${cy}`));
    const inverted = [];
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 32; x++) {
        if (baseGrid?.[y]?.[x] && !maskSet.has(`${x},${y}`)) {
          inverted.push([x, y]);
        }
      }
    }
    setFrameCustomMask(target.gender, target.view, target.animMode, target.frameIndex, inverted);
    commitUndoSnapshotIfChanged(before);
    renderSpriteViewer();
    showSaveStatus('Inverted Z-mask on body pixels!', false);
  });
}

if (maskBtnClearMask) {
  maskBtnClearMask.addEventListener('click', () => {
    const before = captureTargetStateSnapshot();
    const target = getStudioTargetInfo();
    setFrameCustomMask(target.gender, target.view, target.animMode, target.frameIndex, []);
    commitUndoSnapshotIfChanged(before);
    renderSpriteViewer();
    showSaveStatus('Cleared Z-mask for this frame!', false);
  });
}

eraControl.addEventListener('change', () => {
  selectedEra = eraControl.value;
  syncAllPartyAppearancesToEra(party, selectedEra);
  if (studioClothingEra && studioClothingEra.value !== 'all') {
    studioClothingEra.value = selectedEra;
  }
  syncStudioToActiveTravelerDefaults();
  renderSpriteViewer();
});

spriteCharacterControl.addEventListener('change', () => {
  stopSpritePlayback();
  selectedSpriteFrame = 0;
  syncStudioToActiveTravelerDefaults();
  renderSpriteViewer();
});

spriteViewControl.addEventListener('change', () => {
  stopSpritePlayback();
  selectedSpriteFrame = 0;
  const isFront = spriteViewControl.value === 'front';
  studioClothingView.value = isFront ? 'front' : 'side';
  studioBaseDirection.value = isFront ? 'south' : 'east';
  renderSpriteViewer();
});

spriteAnimationControl.addEventListener('change', () => {
  stopSpritePlayback();
  selectedSpriteFrame = 0;
  renderSpriteViewer();
});

spritePlayButton.addEventListener('click', toggleSpritePlayback);
if (previewPlayBtn) previewPlayBtn.addEventListener('click', toggleSpritePlayback);

studioToolPencil.addEventListener('click', () => setActiveTool('pencil'));
studioToolEraser.addEventListener('click', () => setActiveTool('eraser'));
studioToolPicker.addEventListener('click', () => setActiveTool('picker'));
studioToolFill.addEventListener('click', () => setActiveTool('fill'));

if (studioBtnUndo) studioBtnUndo.addEventListener('click', performUndo);
if (studioBtnRedo) studioBtnRedo.addEventListener('click', performRedo);

studioActiveColor.addEventListener('input', () => {
  setActiveBrushColor(studioActiveColor.value);
  if (activeStudioTool === 'eraser' || activeStudioTool === 'picker') {
    setActiveTool('pencil');
  }
});

studioHexInput.addEventListener('input', () => {
  const hex = studioHexInput.value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
    setActiveBrushColor(hex);
    if (activeStudioTool === 'eraser' || activeStudioTool === 'picker') {
      setActiveTool('pencil');
    }
  }
});

function stepStudioFrame(delta) {
  stopSpritePlayback();
  const mode = studioModeSelect.value;
  const nextIdx = (selectedSpriteFrame + delta + 8) % 8;
  selectedSpriteFrame = nextIdx;

  if (mode === 'clothing') {
    if (studioClothingFrame.value !== 'all' || isFrameSpecificCategory(studioClothingCategory.value)) {
      studioClothingFrame.value = `walk:${nextIdx}`;
      spriteAnimationControl.value = 'walk';
    }
  } else if (mode === 'base') {
    studioBaseFrame.value = `walk:${nextIdx}`;
    spriteAnimationControl.value = 'walk';
  }
  renderSpriteViewer();
}

if (studioPrevFrame) studioPrevFrame.addEventListener('click', () => stepStudioFrame(-1));
if (studioNextFrame) studioNextFrame.addEventListener('click', () => stepStudioFrame(1));

studioClothingEra.addEventListener('change', () => {
  populateClothingPresets();
  renderStudioEditor();
});

studioClothingGender.addEventListener('change', () => {
  if (studioBaseGender && (studioClothingGender.value === 'male' || studioClothingGender.value === 'female')) {
    studioBaseGender.value = studioClothingGender.value;
  }
  populateClothingPresets();
  renderStudioEditor();
});

studioClothingCategory.addEventListener('change', () => {
  populateClothingPresets();
  const memberIndex = Number(spriteCharacterControl.value) || 0;
  const member = party[memberIndex] ?? party[0];
  const activeCat = studioClothingCategory.value;
  const equippedPresetId = member?.appearance?.equippedPresets?.[activeCat];
  if (equippedPresetId && studioClothingPreset.querySelector(`option[value="${equippedPresetId}"]`)) {
    studioClothingPreset.value = equippedPresetId;
  }
  renderStudioEditor();
});

studioClothingPreset.addEventListener('change', () => {
  renderStudioEditor();
});

studioClothingView.addEventListener('change', () => {
  const isFront = studioClothingView.value === 'front';
  spriteViewControl.value = isFront ? 'front' : 'side_right';
  studioBaseDirection.value = isFront ? 'south' : 'east';
  renderSpriteViewer();
});

studioClothingFrame.addEventListener('change', () => {
  if (studioClothingFrame.value !== 'all') {
    const [animMode, frameStr] = studioClothingFrame.value.split(':');
    const frameIndex = Number(frameStr) || 0;
    selectedSpriteFrame = frameIndex;
    if (spriteAnimationControl.value !== animMode) {
      spriteAnimationControl.value = animMode;
    }
  }
  renderSpriteViewer();
});

studioBaseGender.addEventListener('change', () => {
  if (studioClothingGender) studioClothingGender.value = studioBaseGender.value;
  populateClothingPresets();
  renderStudioEditor();
});

studioBaseDirection.addEventListener('change', () => {
  const isFront = studioBaseDirection.value === 'south';
  spriteViewControl.value = isFront ? 'front' : 'side_right';
  studioClothingView.value = isFront ? 'front' : 'side';
  renderSpriteViewer();
});

studioBaseFrame.addEventListener('change', () => {
  const [animMode, frameStr] = studioBaseFrame.value.split(':');
  const frameIndex = Number(frameStr) || 0;
  selectedSpriteFrame = frameIndex;
  if (spriteAnimationControl.value !== animMode) {
    spriteAnimationControl.value = animMode;
  }
  renderSpriteViewer();
});

studioShowUnderlay.addEventListener('change', () => renderStudioEditor());
if (studioShowGrid) studioShowGrid.addEventListener('change', () => renderStudioEditor());

for (const cat of ['hats', 'shirts', 'pants', 'shoes', 'accessories']) {
  previewWearCheckboxes[cat]?.addEventListener('change', () => renderStudioEditor());
  previewPresetSelects[cat]?.addEventListener('change', () => {
    if (previewWearCheckboxes[cat] && !previewWearCheckboxes[cat].checked) {
      previewWearCheckboxes[cat].checked = true;
    }
    renderStudioEditor();
  });
}

if (previewOutfitSolo) {
  previewOutfitSolo.addEventListener('click', () => {
    const activeCat = studioClothingCategory.value;
    for (const cat of ['hats', 'shirts', 'pants', 'shoes', 'accessories']) {
      if (previewWearCheckboxes[cat]) previewWearCheckboxes[cat].checked = (cat === activeCat);
    }
    renderStudioEditor();
  });
}

if (previewOutfitAll) {
  previewOutfitAll.addEventListener('click', () => {
    for (const cat of ['hats', 'shirts', 'pants', 'shoes', 'accessories']) {
      if (previewWearCheckboxes[cat]) previewWearCheckboxes[cat].checked = true;
    }
    renderStudioEditor();
  });
}

if (previewOutfitNone) {
  previewOutfitNone.addEventListener('click', () => {
    for (const cat of ['hats', 'shirts', 'pants', 'shoes', 'accessories']) {
      if (previewWearCheckboxes[cat]) previewWearCheckboxes[cat].checked = false;
    }
    renderStudioEditor();
  });
}

function showSaveStatus(message, isError = false) {
  maskSaveStatus.textContent = message;
  maskSaveStatus.className = `save-status-banner ${isError ? 'error' : 'success'}`;
  maskSaveStatus.hidden = false;
  setTimeout(() => {
    maskSaveStatus.hidden = true;
  }, 4500);
}

studioBtnReset.addEventListener('click', () => {
  const before = captureTargetStateSnapshot();
  const target = getStudioTargetInfo();
  if (target.mode === 'mask') {
    resetFrameCustomMask(target.gender, target.view, target.animMode, target.frameIndex);
  } else if (target.mode === 'clothing') {
    resetCustomSpriteOverride(target.key);
    if (target.isAllFrames) {
      for (let f = 0; f < 8; f++) {
        resetCustomSpriteOverride(`clothing:${target.presetId}:${target.view}:walk:${f}`);
      }
      resetCustomSpriteOverride(`clothing:${target.presetId}:${target.view}:idle:0`);
    }
  } else {
    resetCustomSpriteOverride(target.key);
  }
  commitUndoSnapshotIfChanged(before);
  renderSpriteViewer();
  showSaveStatus(`Reset ${target.name} to default!`, false);
});

studioBtnClear.addEventListener('click', () => {
  const before = captureTargetStateSnapshot();
  const target = getStudioTargetInfo();
  if (target.mode === 'mask') {
    setFrameCustomMask(target.gender, target.view, target.animMode, target.frameIndex, []);
  } else {
    const emptyGrid = Array.from({ length: 32 }, () => Array(32).fill(null));
    setCustomSpriteOverride(target.key, emptyGrid);
    if (target.mode === 'clothing' && target.isAllFrames) {
      for (let f = 0; f < 8; f++) {
        resetCustomSpriteOverride(`clothing:${target.presetId}:${target.view}:walk:${f}`);
      }
      resetCustomSpriteOverride(`clothing:${target.presetId}:${target.view}:idle:0`);
    }
  }
  commitUndoSnapshotIfChanged(before);
  renderSpriteViewer();
  showSaveStatus(`Cleared layer for ${target.name}!`, false);
});

maskBtnCopy.addEventListener('click', async () => {
  const data = {
    overrides: getAllCustomOverridesObject(),
    masks: getAllCustomMasksObject()
  };
  try {
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    showSaveStatus('Copied custom sprites & masks JSON to clipboard!', false);
  } catch {
    prompt('Copy custom sprites JSON:', JSON.stringify(data));
  }
});

maskBtnPaste.addEventListener('click', () => {
  const input = prompt('Paste custom sprites & masks JSON:');
  if (!input) return;
  try {
    const parsed = JSON.parse(input);
    let count = 0;
    if (parsed.overrides && typeof parsed.overrides === 'object') {
      for (const [k, v] of Object.entries(parsed.overrides)) {
        setCustomSpriteOverride(k, v);
        count++;
      }
    } else if (!parsed.masks && typeof parsed === 'object') {
      for (const [k, v] of Object.entries(parsed)) {
        setCustomSpriteOverride(k, v);
        count++;
      }
    }
    if (parsed.masks) {
      importMaskOverrides(parsed.masks);
    }
    renderSpriteViewer();
    showSaveStatus(`Imported ${count} sprite override(s)!`, false);
  } catch (err) {
    alert('Invalid JSON: ' + err.message);
  }
});

function downloadSpriteStudioJsonFile() {
  const data = {
    overrides: getAllCustomOverridesObject(),
    masks: getAllCustomMasksObject()
  };
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'custom-sprites-and-masks.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

maskBtnSaveProject.addEventListener('click', async () => {
  maskBtnSaveProject.disabled = true;
  maskBtnSaveProject.textContent = '⏳ Saving...';
  try {
    const [overridesRes, masksRes] = await Promise.allSettled([
      saveCustomOverridesToServer(),
      saveCustomMasksToServer()
    ]);
    const overridesCount = overridesRes.status === 'fulfilled' ? (overridesRes.value?.count ?? 0) : 0;
    const masksCount = masksRes.status === 'fulfilled' ? (masksRes.value?.count ?? 0) : 0;
    showSaveStatus(`Saved ${overridesCount} sprite override(s) and ${masksCount} mask(s) to project files!`, false);
  } catch (err) {
    console.warn('Could not save via dev server endpoint, falling back to download:', err);
    downloadSpriteStudioJsonFile();
    showSaveStatus('Saved via download (custom-sprites-and-masks.json)!', false);
  } finally {
    maskBtnSaveProject.disabled = false;
    maskBtnSaveProject.textContent = '💾 Save to Project';
  }
});

maskBtnDownload.addEventListener('click', () => {
  downloadSpriteStudioJsonFile();
  showSaveStatus('Downloaded custom-sprites-and-masks.json!', false);
});

maskBtnLoadFile.addEventListener('click', () => {
  maskFileInput.click();
});

maskFileInput.addEventListener('change', async (evt) => {
  const file = evt.target?.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    let count = 0;
    if (parsed.overrides && typeof parsed.overrides === 'object') {
      for (const [k, v] of Object.entries(parsed.overrides)) {
        setCustomSpriteOverride(k, v);
        count++;
      }
    } else if (!parsed.masks && typeof parsed === 'object') {
      for (const [k, v] of Object.entries(parsed)) {
        setCustomSpriteOverride(k, v);
        count++;
      }
    }
    if (parsed.masks) {
      importMaskOverrides(parsed.masks);
    }
    renderSpriteViewer();
    showSaveStatus(`Loaded ${count} sprite override(s) from ${file.name}!`, false);
  } catch (err) {
    showSaveStatus(`Failed to load file: ${err.message}`, true);
  } finally {
    maskFileInput.value = '';
  }
});


if (studioBtnApplySkintone) {
  studioBtnApplySkintone.addEventListener('click', () => {
    const before = captureTargetStateSnapshot();
    const target = getStudioTargetInfo();
    const chosenSkinTone = studioBaseSkintone ? studioBaseSkintone.value : 'warm_ivory';

    // Recolor all walk frames 0..7
    for (let f = 0; f < 8; f++) {
      const fKey = `base:${target.gender}:${target.direction}:walk:${f}`;
      const fGrid = getCustomSpriteOverride(fKey) || getBaseBoilerplateGrid(target.gender, target.direction === 'south' ? 'front' : 'side', 'walk', f);
      if (fGrid) {
        const recolored = applySkinToneToSpriteGrid(fGrid, chosenSkinTone, target.gender);
        setCustomSpriteOverride(fKey, recolored);
      }
    }

    // Recolor idle frame
    const idleKey = `base:${target.gender}:${target.direction}:idle:0`;
    const idleGrid = getCustomSpriteOverride(idleKey) || getBaseBoilerplateGrid(target.gender, target.direction === 'south' ? 'front' : 'side', 'idle', 0);
    if (idleGrid) {
      const recolored = applySkinToneToSpriteGrid(idleGrid, chosenSkinTone, target.gender);
      setCustomSpriteOverride(idleKey, recolored);
    }

    // Update active traveler appearance so live preview reflects new skin tone
    if (target.member?.appearance) {
      target.member.appearance.skinToneId = chosenSkinTone;
    }

    commitUndoSnapshotIfChanged(before);
    renderSpriteViewer();
    showSaveStatus(`Recolored skin tone to ${chosenSkinTone} across all frames!`, false);
  });
}

if (studioBaseApplyAll) {
  studioBaseApplyAll.addEventListener('change', () => {
    renderStudioEditor();
  });
}


// Skin Painter Buttons
document.querySelectorAll('.skin-role-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const col = btn.getAttribute('data-color');
    if (col) {
      setActiveBrushColor(col);
      if (activeStudioTool === 'eraser' || activeStudioTool === 'picker') {
        setActiveTool('pencil');
      }
      document.querySelectorAll('.skin-role-btn').forEach((b) => b.classList.toggle('active-role', b === btn));
    }
  });
});

// Test Player Skin Tone Pills in Live Preview
document.querySelectorAll('[data-test-skintone]').forEach((btn) => {
  btn.addEventListener('click', () => {
    testPlayerSkinTone = btn.getAttribute('data-test-skintone') || 'warm_ivory';
    document.querySelectorAll('[data-test-skintone]').forEach((b) => b.classList.toggle('active', b === btn));
    renderStudioEditor();
    showSaveStatus(`Testing player skin tone: ${lookupSkinToneName(testPlayerSkinTone)}`, false);
  });
});

function lookupSkinToneName(id) {
  const map = {
    warm_ivory: 'Warm Ivory',
    golden_tan: 'Golden Tan',
    olive_bronze: 'Olive Bronze',
    deep_umber: 'Deep Umber',
    rich_espresso: 'Rich Espresso',
    porcelain_rose: 'Porcelain Rose'
  };
  return map[id] || id;
}

// Initialize Studio
renderPresetColorPalette();
populatePreviewOutfitSelectors();
syncStudioToActiveTravelerDefaults();
updateUndoRedoButtons();
renderSpriteViewer();
