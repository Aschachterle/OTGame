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
  applyHairColorToSpriteGrid,
  getBaseSpriteGrid,
  HAIR_COLORS,
  getHairColorById,
  getClothingItemDefaultGrid,
  getCustomSpriteOverride,
  setCustomSpriteOverride,
  resetCustomSpriteOverride,
  getAllCustomOverridesObject,
  saveCustomOverridesToServer,
  clearAllCustomOverridesAndStorage,
  hasCachedOptions,
  addCustomClothingItem,
  renameClothingItem,
  deleteCustomClothingItem,
  getAllCustomClothingObject,
  saveCustomClothingToServer,
  getStridingLegFootMask,
  getAllForegroundLimbsMask,
  getTorsoWaistMask,
  getHeadBeardHairMask,
  MASK_SECTIONS,
  MASK_SECTION_COLORS,
  getFrameSectionMap,
  setFrameSectionMap,
  getFrameSkinRoleMap,
  setFrameSkinRoleMap,
  getFrameHairRoleMap,
  setFrameHairRoleMap,
  getAutoDetectedSectionMap,
  sectionMapToGrid,
  sectionGridToMap
} from './character-designer.js?v=clothing_editor_v4';
import { INITIAL_CLOTHING_BOILERPLATE } from './character-presets.js?v=clothing_editor_v4';

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
const studioClothingBtnRename = document.querySelector('#studio-clothing-btn-rename');
const studioClothingBtnNew = document.querySelector('#studio-clothing-btn-new');
const studioClothingBtnDelete = document.querySelector('#studio-clothing-btn-delete');

const dialogNewClothing = document.querySelector('#dialog-new-clothing');
const formNewClothing = document.querySelector('#form-new-clothing');
const newClothingName = document.querySelector('#new-clothing-name');
const newClothingCategory = document.querySelector('#new-clothing-category');
const newClothingHeadwearTypeField = document.querySelector('#new-clothing-headwear-type-field');
const newClothingHeadwearType = document.querySelector('#new-clothing-headwear-type');
const newClothingEra = document.querySelector('#new-clothing-era');
const newClothingGender = document.querySelector('#new-clothing-gender');
const newClothingTemplate = document.querySelector('#new-clothing-template');
const btnSubmitNewClothing = document.querySelector('#btn-submit-new-clothing');

const dialogRenameClothing = document.querySelector('#dialog-rename-clothing');
const formRenameClothing = document.querySelector('#form-rename-clothing');
const renameClothingInput = document.querySelector('#rename-clothing-input');
const btnSubmitRenameClothing = document.querySelector('#btn-submit-rename-clothing');

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
const maskBtnAutodetectLeg = document.querySelector('#mask-btn-autodetect-leg');
const maskBtnAutodetectTorso = document.querySelector('#mask-btn-autodetect-torso');
const maskBtnAutodetectHead = document.querySelector('#mask-btn-autodetect-head');
const maskBtnAutodetectAll = document.querySelector('#mask-btn-autodetect-all');
const maskBtnSwapLimbs = document.querySelector('#mask-btn-swap-limbs');
const maskBtnCopyFrame = document.querySelector('#mask-btn-copy-frame');
const maskBtnPasteFrame = document.querySelector('#mask-btn-paste-frame');
const maskBtnInvert = document.querySelector('#mask-btn-invert');
const maskBtnClearMask = document.querySelector('#mask-btn-clear-mask');

const maskCoverageReadout = document.querySelector('#mask-coverage-readout');
const maskCoverageFill = document.querySelector('#mask-coverage-fill');
const activeSectionBanner = document.querySelector('#active-section-banner');
const activeSectionChip = document.querySelector('#active-section-chip');
const activeSectionName = document.querySelector('#active-section-name');
const activeSectionKey = document.querySelector('#active-section-key');
const maskOverlayButtons = document.querySelectorAll('[data-mask-overlay]');
const maskPreviewModeButtons = document.querySelectorAll('[data-preview-mode]');

let activeMaskSection = 'fg_leg';
let maskOverlayMode = 'solid';
let maskPreviewMode = 'clothed';
let copiedFrameSectionMap = null;

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
const studioActionIcon = document.querySelector('#studio-action-icon');
const studioActionTitle = document.querySelector('#studio-action-title');
const studioActionDetail = document.querySelector('#studio-action-detail');
const studioActionBadge = document.querySelector('#studio-action-badge');
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
const studioBtnClearCache = document.querySelector('#studio-btn-clear-cache');
const maskFileInput = document.querySelector('#mask-file-input');
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
const basePreviewWearOutfit = document.querySelector('#base-preview-wear-outfit');
const basePreviewHairstyle = document.querySelector('#base-preview-hairstyle');

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
let testPlayerHairColor = 'chestnut_brown';

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
let activeSkinRole = null;
let activeHairRole = null;
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
  if (spritePlayButton) {
    spritePlayButton.textContent = '⏸ Pause Walk Cycle';
    spritePlayButton.setAttribute('aria-pressed', 'true');
  }
  if (previewPlayBtn) {
    previewPlayBtn.textContent = '⏸ Pause Walk Cycle';
    previewPlayBtn.setAttribute('aria-pressed', 'true');
    previewPlayBtn.classList.remove('secondary-button');
  }
  spriteAnimationTimer = window.setInterval(() => {
    const memberIndex = Number(spriteCharacterControl?.value) || 0;
    const member = party[memberIndex] ?? party[0];
    const mode = document.body?.dataset?.studioMode || studioModeSelect?.value || 'clothing';
    const previewView = mode === 'clothing'
      ? (studioClothingView?.value || 'side')
      : (mode === 'base'
          ? (studioBaseDirection?.value === 'east' ? 'side' : 'front')
          : (spriteViewControl?.value || 'side_right'));
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
  const memberIndex = Number(spriteCharacterControl?.value) || 0;
  const member = party[memberIndex] ?? party[0];
  if (!member?.appearance || !spriteFrameStrip) return;

  const target = getStudioTargetInfo();
  const view = target.mode === 'base'
    ? (target.direction === 'east' ? 'side_right' : 'front')
    : (spriteViewControl?.value || 'side_right');
  const animationMode = spriteAnimationControl?.value || 'walk';
  const effectiveAppearance = buildCustomPreviewAppearance(member.appearance, target);
  const frameCount = getCharacterFrameCount(effectiveAppearance, view, animationMode) || 1;
  const walkOption = spriteAnimationControl?.querySelector('option[value="walk"]');
  const idleOption = spriteAnimationControl?.querySelector('option[value="idle"]');
  if (walkOption) {
    walkOption.textContent = `Walk · ${getCharacterFrameCount(effectiveAppearance, view, 'walk')} frames`;
  }
  if (idleOption) {
    const idleFrameCount = getCharacterFrameCount(effectiveAppearance, view, 'idle');
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
    const grid = getCharacterFrameGrid(effectiveAppearance, view, animationMode, frameIndex);
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
        && studioClothingCategory
        && (studioClothingFrame.value !== 'all' || isFrameSpecificCategory(studioClothingCategory.value))
        && studioClothingFrame.querySelector(`option[value="${frameVal}"]`)
      ) {
        studioClothingFrame.value = frameVal;
      }
      if (
        studioBaseFrame
        && !(studioBaseApplyAll && studioBaseApplyAll.checked)
        && studioBaseFrame.querySelector(`option[value="${frameVal}"]`)
      ) {
        studioBaseFrame.value = frameVal;
      }
      renderSpriteViewer();
    });
    spriteFrameStrip.append(tile);
  }

  if (spriteFrameReadout) {
    const stripTitle = target.mode === 'base'
      ? (target.gender === 'female' ? '32Woman' : '32Man')
      : member.name;
    spriteFrameReadout.textContent = `${animationMode.toUpperCase()} · FRAME ${selectedSpriteFrame + 1}/${frameCount} · ${stripTitle}`;
  }
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
  if (studioActiveColor && /^#[0-9a-f]{6}$/i.test(clean)) {
    studioActiveColor.value = clean;
  }
  if (studioHexInput) {
    studioHexInput.value = clean.toUpperCase();
  }
  if (studioColorNameReadout) {
    studioColorNameReadout.textContent = lookupColorName(clean);
  }
  highlightActiveSwatches();
  updateStudioActionReadout();
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
    if (!t.btn) continue;
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
  updateStudioActionReadout();
}

function updateStudioActionReadout(target = getStudioTargetInfo()) {
  if (!studioActionTitle || !studioActionDetail || !studioActionBadge) return;

  const role = target.mode === 'base' ? (activeSkinRole || activeHairRole) : null;
  const roleNames = {
    highlight: 'highlight',
    base: 'main',
    shadow: 'shadow',
    'far-limb': 'far-limb'
  };
  const roleType = activeSkinRole ? 'skin' : activeHairRole ? 'hair' : '';
  const roleDescription = role ? `${roleType} ${roleNames[role] || role}` : '';
  const color = studioBrushColor.toUpperCase();

  let icon = '✏️';
  let title = 'Draw with brush color';
  let detail = `Left-click paints ${color}. Right-click erases. Choose a skin or hair role to make base pixels recolor in the preview.`;
  let badge = 'DRAW';

  if (activeStudioTool === 'eraser') {
    icon = '🧹';
    title = 'Erase pixels';
    detail = target.mode === 'mask'
      ? 'Left-click or drag to remove the selected section assignment. Right-click also erases.'
      : 'Left-click or drag to clear source pixels and remove any skin or hair role. Right-click also erases.';
    badge = 'ERASE';
  } else if (activeStudioTool === 'picker') {
    icon = '💧';
    title = target.mode === 'mask' ? 'Pick a section' : 'Pick a color';
    detail = target.mode === 'mask'
      ? 'Click a mapped pixel to select its section; the editor returns to Draw.'
      : 'Click a painted pixel to sample its source color; the editor returns to Draw.';
    badge = 'PICK';
  } else if (activeStudioTool === 'fill') {
    icon = '🪣';
    title = roleDescription ? `Fill with ${roleDescription}` : 'Flood-fill area';
    detail = target.mode === 'mask'
      ? `Click a connected area to assign the selected section. Right-click fills it as unassigned.`
      : `Click a connected area to fill with ${color}${roleDescription ? ` and tag it as ${roleDescription}` : ''}. Right-click clears the area.`;
    badge = 'FILL';
  } else if (target.mode === 'mask') {
    icon = '🖌️';
    title = 'Paint section assignment';
    detail = 'Left-click paints the selected Z-mask section. Right-click erases the assignment.';
    badge = 'SECTION';
  } else if (roleDescription) {
    title = `Draw ${roleDescription}`;
    detail = `Left-click paints ${color} and tags the pixel as ${roleDescription}; the live preview remaps it. Right-click erases.`;
    badge = `${roleType.toUpperCase()} · ${roleNames[role].toUpperCase()}`;
  }

  if (studioActionIcon) studioActionIcon.textContent = icon;
  studioActionTitle.textContent = title;
  studioActionDetail.textContent = detail;
  studioActionBadge.textContent = badge;
}

function selectActiveMaskSection(sectionId) {
  const section = MASK_SECTIONS.find((s) => s.id === sectionId);
  if (!section) return;
  activeMaskSection = sectionId;
  if (activeSectionChip) activeSectionChip.style.background = section.color;
  if (activeSectionName) activeSectionName.textContent = section.label;
  if (activeSectionKey) activeSectionKey.textContent = `[Key ${section.shortcut}]`;

  document.querySelectorAll('#mask-section-palette .section-brush-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-section-id') === sectionId);
  });

  if (activeStudioTool === 'eraser' || activeStudioTool === 'picker') {
    setActiveTool('pencil');
  }
}

// ============================================================================
// UNDO / REDO SYSTEM
// ============================================================================
function captureTargetStateSnapshot() {
  const target = getStudioTargetInfo();
  if (target.mode === 'mask') {
    const baseGrid = getBaseBoilerplateGrid(target.gender, target.view, target.animMode, target.frameIndex);
    const sectionMap = getFrameSectionMap(target.gender, target.view, target.animMode, target.frameIndex, baseGrid);
    return {
      mode: 'mask',
      gender: target.gender,
      view: target.view,
      animMode: target.animMode,
      frameIndex: target.frameIndex,
      sectionMap: JSON.parse(JSON.stringify(sectionMap))
    };
  }

  const savedGrid = getCustomSpriteOverride(target.key);
  const frameBackups = {};
  const skinRoleBackups = {};
  const hairRoleBackups = {};
  if (target.mode === 'clothing' && target.isAllFrames) {
    for (let f = 0; f < 8; f++) {
      const fKey = `clothing:${target.presetId}:${target.view}:walk:${f}`;
      const fGrid = getCustomSpriteOverride(fKey);
      frameBackups[fKey] = fGrid ? fGrid.map((r) => [...r]) : null;
    }
    const idleKey = `clothing:${target.presetId}:${target.view}:idle:0`;
    const idleGrid = getCustomSpriteOverride(idleKey);
    frameBackups[idleKey] = idleGrid ? idleGrid.map((r) => [...r]) : null;
  } else if (target.mode === 'base') {
    for (let f = 0; f < 8; f++) {
      const fKey = `base:${target.gender}:${target.direction}:walk:${f}`;
      const fGrid = getCustomSpriteOverride(fKey);
      frameBackups[fKey] = fGrid ? fGrid.map((r) => [...r]) : null;
      skinRoleBackups[fKey] = getFrameSkinRoleMap(
        target.gender,
        target.direction === 'south' ? 'front' : 'side',
        'walk',
        f
      );
      hairRoleBackups[fKey] = getFrameHairRoleMap(
        target.gender,
        target.direction === 'south' ? 'front' : 'side',
        'walk',
        f
      );
    }
    const idleKey = `base:${target.gender}:${target.direction}:idle:0`;
    const idleGrid = getCustomSpriteOverride(idleKey);
    frameBackups[idleKey] = idleGrid ? idleGrid.map((r) => [...r]) : null;
    skinRoleBackups[idleKey] = getFrameSkinRoleMap(
      target.gender,
      target.direction === 'south' ? 'front' : 'side',
      'idle',
      0
    );
    hairRoleBackups[idleKey] = getFrameHairRoleMap(
      target.gender,
      target.direction === 'south' ? 'front' : 'side',
      'idle',
      0
    );
  }
  return {
    mode: target.mode,
    key: target.key,
    hadCustomOverride: savedGrid !== null,
    grid: savedGrid ? savedGrid.map((row) => [...row]) : null,
    frameBackups,
    skinRoleBackups,
    hairRoleBackups
  };
}

function restoreTargetStateSnapshot(snapshot) {
  if (!snapshot) return;
  if (snapshot.mode === 'mask') {
    if (snapshot.sectionMap) {
      setFrameSectionMap(snapshot.gender, snapshot.view, snapshot.animMode, snapshot.frameIndex, snapshot.sectionMap);
    } else if (snapshot.hadCustomMask && snapshot.maskCoords) {
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
        if (fGrid) {
          setCustomSpriteOverride(fKey, fGrid);
        } else {
          resetCustomSpriteOverride(fKey);
        }
      }
    }
    if (snapshot.skinRoleBackups) {
      for (const [key, roles] of Object.entries(snapshot.skinRoleBackups)) {
        const [, gender, direction, animMode, frameIndex] = key.split(':');
        setFrameSkinRoleMap(
          gender,
          direction === 'south' ? 'front' : 'side',
          animMode,
          Number(frameIndex),
          roles
        );
      }
    }
    if (snapshot.hairRoleBackups) {
      for (const [key, roles] of Object.entries(snapshot.hairRoleBackups)) {
        const [, gender, direction, animMode, frameIndex] = key.split(':');
        setFrameHairRoleMap(
          gender,
          direction === 'south' ? 'front' : 'side',
          animMode,
          Number(frameIndex),
          roles
        );
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
  renderStudioEditor();
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
  renderStudioEditor();
  showSaveStatus('Redid action', false);
}

// ============================================================================
// SMART CATEGORY FRAME RULES & TRAVELER DEFAULTS SYNC
// ============================================================================
function syncCategoryFrameBehavior() {
  if (!studioClothingCategory || !studioClothingFrame) return;
  const category = studioClothingCategory.value;
  const perFrameRequired = isFrameSpecificCategory(category);

  if (studioFrameOptAll) {
    studioFrameOptAll.hidden = perFrameRequired;
    studioFrameOptAll.disabled = perFrameRequired;
  }

  if (perFrameRequired) {
    if (studioClothingFrame.value === 'all') {
      const animMode = spriteAnimationControl?.value || 'walk';
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
  if (!studioClothingPreset || !studioClothingEra || !studioClothingGender || !studioClothingCategory) return;
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

function syncNewClothingHeadwearType() {
  if (!newClothingHeadwearTypeField) return;
  newClothingHeadwearTypeField.hidden = newClothingCategory?.value !== 'hats';
}

function syncStudioToActiveTravelerDefaults() {
  const memberIndex = Number(spriteCharacterControl?.value) || 0;
  const member = party[memberIndex] ?? party[0];
  if (!member?.appearance) return;

  const travelerGender = member.appearance.gender === 'female' ? 'female' : 'male';

  if (studioClothingGender) studioClothingGender.value = travelerGender;
  if (studioBaseGender) studioBaseGender.value = travelerGender;
  populateBasePreviewHairstyles();
  if (studioClothingEra && selectedEra && studioClothingEra.value !== 'all') {
    studioClothingEra.value = selectedEra;
  }

  populateClothingPresets();

  if (studioClothingCategory && studioClothingPreset) {
    const activeCat = studioClothingCategory.value;
    const equippedPresetId = member.appearance.equippedPresets?.[activeCat];
    if (equippedPresetId && studioClothingPreset.querySelector(`option[value="${equippedPresetId}"]`)) {
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

function populateBasePreviewHairstyles() {
  if (!basePreviewHairstyle) return;
  const gender = studioBaseGender?.value === 'female' ? 'female' : 'male';
  const previousValue = basePreviewHairstyle.value;
  const presets = (INITIAL_CLOTHING_BOILERPLATE.hats || [])
    .filter((preset) => !preset.isNone && preset.subType === 'hair')
    .filter((preset) => !preset.gender || preset.gender === 'unisex' || preset.gender === gender)
    .sort((a, b) => `${a.era || ''}:${a.name}`.localeCompare(`${b.era || ''}:${b.name}`));

  basePreviewHairstyle.replaceChildren();
  const noneOption = document.createElement('option');
  noneOption.value = '__none__';
  noneOption.textContent = 'No hairstyle · bald base';
  basePreviewHairstyle.append(noneOption);

  const eraGroups = new Map();
  for (const preset of presets) {
    const era = preset.era || 'Custom';
    if (!eraGroups.has(era)) {
      const group = document.createElement('optgroup');
      group.label = era === 'oregon_trail' ? 'Oregon Trail' : era;
      eraGroups.set(era, group);
    }
    const option = document.createElement('option');
    option.value = preset.id;
    option.textContent = `${preset.name}${preset.isCustom ? ' · Clothing Studio' : ''}`;
    eraGroups.get(era).append(option);
  }
  for (const group of eraGroups.values()) basePreviewHairstyle.append(group);

  if (previousValue && basePreviewHairstyle.querySelector(`option[value="${CSS.escape(previousValue)}"]`)) {
    basePreviewHairstyle.value = previousValue;
  } else {
    basePreviewHairstyle.value = '__none__';
  }
}

function buildCustomPreviewAppearance(baseAppearance, target) {
  const equipped = { ...(baseAppearance?.equippedPresets || {}) };
  const categories = ['hats', 'shirts', 'pants', 'shoes', 'accessories'];

  document.querySelectorAll('.studio-outfit-slot-row').forEach((row) => {
    const slot = row.getAttribute('data-slot');
    row.classList.toggle('active-editing-slot', target.mode === 'clothing' && target.category === slot);
  });

  // In Base Sprite Studio mode, default to bare body unless 'Overlay Default Pioneer Outfit' is checked!
  if (target.mode === 'base' && basePreviewWearOutfit) {
    if (!basePreviewWearOutfit.checked) {
      for (const cat of categories) {
        const nonePreset = (INITIAL_CLOTHING_BOILERPLATE[cat] || []).find((p) => p.isNone);
        equipped[cat] = nonePreset ? nonePreset.id : '';
      }
    } else {
      const refTraveler = party.find((m) => m.appearance?.gender === target.gender) || party[0];
      Object.assign(equipped, refTraveler?.appearance?.equippedPresets || {});
    }
    const nonePreset = (INITIAL_CLOTHING_BOILERPLATE.hats || []).find((preset) => preset.isNone);
    equipped.hats = basePreviewHairstyle?.value && basePreviewHairstyle.value !== '__none__'
      ? basePreviewHairstyle.value
      : (nonePreset?.id || '');
    return {
      ...baseAppearance,
      gender: target.gender,
      skinToneId: testPlayerSkinTone || baseAppearance?.skinToneId || 'warm_ivory',
      hairColorId: testPlayerHairColor || baseAppearance?.hairColorId || 'chestnut_brown',
      equippedPresets: equipped
    };
  }

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
    hairColorId: testPlayerHairColor || baseAppearance.hairColorId || 'chestnut_brown',
    equippedPresets: equipped
  };
}

// ============================================================================
// TARGET & WORKING GRID RESOLUTION
// ============================================================================
function getStudioTargetInfo() {
  const mode = document.body?.dataset?.studioMode || studioModeSelect?.value || 'clothing';
  const memberIndex = Number(spriteCharacterControl?.value) || 0;
  const member = party[memberIndex] ?? party[0];

  if (mode === 'clothing') {
    const category = studioClothingCategory?.value || 'hats';
    const presetId = studioClothingPreset?.value || '';
    const view = studioClothingView?.value || 'side';
    const perFrameRequired = isFrameSpecificCategory(category);
    const rawFrameVal = studioClothingFrame?.value || (perFrameRequired ? 'walk:0' : 'all');
    const isAllFrames = !perFrameRequired && rawFrameVal === 'all';

    let animMode = 'walk';
    let frameIndex = 0;
    let key = '';
    if (isAllFrames) {
      key = `clothing:${presetId}:${view}`;
      animMode = spriteAnimationControl?.value || 'walk';
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
    const gender = studioBaseGender?.value || 'male';
    const direction = studioBaseDirection?.value || 'east';
    const rawVal = studioBaseFrame?.value || 'all';
    const isApplyAllChecked = studioBaseApplyAll ? studioBaseApplyAll.checked : (rawVal === 'all');
    const isAllFrames = direction === 'south' ? false : (rawVal === 'all' || isApplyAllChecked);

    let animMode = direction === 'south' ? 'idle' : 'walk';
    let frameIndex = 0;
    let key = '';
    if (direction === 'south') {
      animMode = 'idle';
      frameIndex = 0;
      key = `base:${gender}:south:idle:0`;
    } else if (isAllFrames) {
      animMode = spriteAnimationControl?.value || 'walk';
      frameIndex = selectedSpriteFrame;
      key = `base:${gender}:${direction}:${animMode}:${frameIndex}`;
    } else {
      const [aMode, fStr] = rawVal.split(':');
      animMode = aMode || 'walk';
      frameIndex = Number(fStr) || 0;
      key = `base:${gender}:${direction}:${animMode}:${frameIndex}`;
    }
    const frameLabel = direction === 'south'
      ? 'Front Idle (1/1)'
      : isAllFrames
        ? `All Frames (Viewing ${animMode.toUpperCase()} #${frameIndex + 1})`
        : `${animMode.toUpperCase()} Frame ${frameIndex + 1}`;
    const name = `${gender === 'female' ? '32Woman' : '32Man'} · ${direction === 'east' ? 'Side' : 'Front'} · ${frameLabel}`;
    return { mode, member, gender, direction, animMode, frameIndex, isAllFrames, key, name };
  }

  // mode === 'mask'
  const gender = member?.appearance?.gender === 'female' ? 'female' : 'male';
  const view = spriteViewControl?.value || 'side_right';
  const animMode = view === 'front' ? 'idle' : (spriteAnimationControl?.value || 'walk');
  const frameCount = view === 'front' ? 1 : getCharacterFrameCount(member?.appearance, view, animMode);
  const activeFrame = view === 'front' ? 0 : (((selectedSpriteFrame % frameCount) + frameCount) % frameCount);
  const key = `mask:${gender}:${view}:${animMode}:${activeFrame}`;
  const name = `Z-Mask: ${member.name} (${view === 'front' ? 'Front Idle' : `Side ${animMode.toUpperCase()} Frame ${activeFrame + 1}`})`;
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
    const sourceGrid = getBaseSpriteGrid(
      target.gender,
      target.direction,
      target.animMode,
      target.frameIndex
    );
    if (!sourceGrid) return Array.from({ length: 32 }, () => Array(32).fill(null));
    return sourceGrid.map((row) => [...row]);
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
  updateStudioActionReadout(target);
  if (studioTargetName) studioTargetName.textContent = target.name;
  updateContextBreadcrumbAndRule(target);

  // Sync mode tab buttons
  modeTabButtons.forEach((btn) => {
    const isMatch = btn.getAttribute('data-mode') === target.mode;
    btn.classList.toggle('active', isMatch);
    btn.setAttribute('aria-selected', String(isMatch));
  });

  if (target.mode === 'clothing') {
    if (studioClothingControls) studioClothingControls.hidden = false;
    if (studioBaseControls) studioBaseControls.hidden = true;
    if (studioMaskBanner) studioMaskBanner.hidden = true;
    if (studioColorPanel) studioColorPanel.hidden = false;
    if (maskCanvasLegend) maskCanvasLegend.hidden = true;
    if (studioShowUnderlay?.parentElement) studioShowUnderlay.parentElement.hidden = false;
    if (studioCanvasTitle) studioCanvasTitle.textContent = '32×32 CLOTHING EDITOR';
    if (studioClothingBtnDelete) {
      const isCustomItem = Boolean(target.preset?.isCustom);
      studioClothingBtnDelete.hidden = !isCustomItem;
    }
  } else if (target.mode === 'base') {
    if (studioClothingControls) studioClothingControls.hidden = true;
    if (studioBaseControls) studioBaseControls.hidden = false;
    if (studioMaskBanner) studioMaskBanner.hidden = true;
    if (studioColorPanel) studioColorPanel.hidden = false;
    if (maskCanvasLegend) maskCanvasLegend.hidden = true;
    if (studioShowUnderlay?.parentElement) studioShowUnderlay.parentElement.hidden = true;
    if (studioCanvasTitle) studioCanvasTitle.textContent = 'EDIT SOURCE PIXELS · 32×32';
  } else {
    if (studioClothingControls) studioClothingControls.hidden = true;
    if (studioBaseControls) studioBaseControls.hidden = true;
    if (studioMaskBanner) studioMaskBanner.hidden = false;
    if (studioColorPanel) studioColorPanel.hidden = true;
    if (maskCanvasLegend) maskCanvasLegend.hidden = false;
    if (studioShowUnderlay?.parentElement) studioShowUnderlay.parentElement.hidden = true;
    if (studioCanvasTitle) studioCanvasTitle.textContent = '32×32 DEPTH Z-MASK EDITOR';
  }

  if (studioFrameStepperLabel) {
    if (target.mode === 'clothing' && target.isAllFrames) {
      studioFrameStepperLabel.textContent = `Shared · Pose #${(selectedSpriteFrame % 8) + 1}/8`;
    } else {
      studioFrameStepperLabel.textContent = `${target.animMode.toUpperCase()} Frame ${target.frameIndex + 1}`;
    }
  }

  const ctx = maskEditorCanvas?.getContext('2d');
  if (!ctx) return;
  const w = maskEditorCanvas.width;
  const h = maskEditorCanvas.height;
  const cellSize = w / 32;

  ctx.clearRect(0, 0, w, h);
  drawBackdropOnCanvas(ctx, w, h, editorBgMode);

  // Draw underlay if clothing mode and checked
  if (target.mode === 'clothing' && studioShowUnderlay?.checked) {
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
    const sectionMap = getFrameSectionMap(target.gender, target.view, target.animMode, target.frameIndex, baseGrid);
    const sectionGrid = sectionMapToGrid(sectionMap);
    const customMask = getFrameCustomMask(target.gender, target.view, target.animMode, target.frameIndex);
    isCustom = customMask !== null;

    // Update section counts on palette buttons
    for (const s of MASK_SECTIONS) {
      const cnt = (sectionMap[s.id] || []).length;
      const cntBadge = document.querySelector(`#count-${s.id}`);
      if (cntBadge) cntBadge.textContent = `${cnt} px`;
    }

    // Compute mapping coverage
    let totalBodyPixels = 0;
    let mappedBodyPixels = 0;
    if (baseGrid) {
      for (let y = 0; y < 32; y++) {
        for (let x = 0; x < 32; x++) {
          if (baseGrid[y]?.[x]) {
            totalBodyPixels++;
            if (sectionGrid[y]?.[x]) mappedBodyPixels++;
          }
        }
      }
    }
    pixelCount = mappedBodyPixels;
    const unassignedBodyPixels = Math.max(0, totalBodyPixels - mappedBodyPixels);
    const coveragePct = totalBodyPixels > 0 ? Math.round((mappedBodyPixels / totalBodyPixels) * 100) : 100;

    if (maskCoverageReadout) {
      if (unassignedBodyPixels === 0) {
        maskCoverageReadout.textContent = `Mapped: ${mappedBodyPixels}/${totalBodyPixels} px (100% Fully Mapped ✨)`;
        maskCoverageReadout.classList.add('complete');
      } else {
        maskCoverageReadout.textContent = `Mapped: ${mappedBodyPixels}/${totalBodyPixels} px (${coveragePct}% · ${unassignedBodyPixels} unassigned)`;
        maskCoverageReadout.classList.remove('complete');
      }
    }
    if (maskCoverageFill) {
      maskCoverageFill.style.width = `${coveragePct}%`;
      maskCoverageFill.style.background = coveragePct === 100
        ? 'linear-gradient(90deg, #00d4ff, #00ff66)'
        : 'linear-gradient(90deg, #ffcc00, #ff6600)';
    }

    // Draw canvas based on maskOverlayMode: 'solid' | 'blended' | 'base'
    if (maskOverlayMode === 'base') {
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
    } else if (maskOverlayMode === 'blended') {
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
      for (let y = 0; y < 32; y++) {
        for (let x = 0; x < 32; x++) {
          const secId = sectionGrid[y]?.[x];
          if (secId && MASK_SECTION_COLORS[secId]) {
            const col = MASK_SECTION_COLORS[secId];
            ctx.globalAlpha = 0.62;
            ctx.fillStyle = col;
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            ctx.globalAlpha = 1.0;
            ctx.strokeStyle = col;
            ctx.lineWidth = 1;
            ctx.strokeRect(x * cellSize + 0.5, y * cellSize + 0.5, cellSize - 1, cellSize - 1);
          }
        }
      }
    } else {
      // Solid Map: show all 10 distinct colors on screen simultaneously
      if (baseGrid) {
        for (let y = 0; y < 32; y++) {
          for (let x = 0; x < 32; x++) {
            const baseCol = baseGrid[y]?.[x];
            const secId = sectionGrid[y]?.[x];
            if (secId && MASK_SECTION_COLORS[secId]) {
              ctx.fillStyle = MASK_SECTION_COLORS[secId];
              ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
              ctx.strokeStyle = 'rgba(0, 0, 0, 0.22)';
              ctx.lineWidth = 1;
              ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
            } else if (baseCol) {
              // Highlight unassigned body pixel so user spots missing mappings instantly
              ctx.fillStyle = '#3a3a3a';
              ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
              ctx.fillStyle = '#ff3333';
              ctx.fillRect(x * cellSize + cellSize * 0.28, y * cellSize + cellSize * 0.28, cellSize * 0.44, cellSize * 0.44);
            }
          }
        }
      }
      for (let y = 0; y < 32; y++) {
        for (let x = 0; x < 32; x++) {
          if (!baseGrid?.[y]?.[x]) {
            const secId = sectionGrid[y]?.[x];
            if (secId && MASK_SECTION_COLORS[secId]) {
              ctx.globalAlpha = 0.75;
              ctx.fillStyle = MASK_SECTION_COLORS[secId];
              ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
              ctx.globalAlpha = 1.0;
            }
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

    if (studioHoverCoords && maskPixelInfo) {
      const { x: hx, y: hy } = studioHoverCoords;
      if (hx >= 0 && hx < 32 && hy >= 0 && hy < 32) {
        ctx.strokeStyle = hoverStrokeColor;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(hx * cellSize + 0.5, hy * cellSize + 0.5, cellSize - 1, cellSize - 1);
        const secId = sectionGrid[hy]?.[hx];
        const sec = secId ? MASK_SECTIONS.find((s) => s.id === secId) : null;
        const basePixel = baseGrid?.[hy]?.[hx] || 'transparent';
        if (sec) {
          maskPixelInfo.textContent = `X: ${hx}, Y: ${hy} · Section: ${sec.label} (${sec.color}) · Base: ${basePixel}`;
        } else if (basePixel !== 'transparent') {
          maskPixelInfo.textContent = `X: ${hx}, Y: ${hy} · Section: ⚠️ UNASSIGNED BODY PIXEL · Base: ${basePixel}`;
        } else {
          maskPixelInfo.textContent = `X: ${hx}, Y: ${hy} · Section: None · Base: ${basePixel}`;
        }
      }
    }
  } else {
    const customFrame = getCustomSpriteOverride(target.key);
    const customOrientation = target.mode === 'clothing'
      ? getCustomSpriteOverride(`clothing:${target.presetId}:${target.view}`)
      : getCustomSpriteOverride(`base:${target.gender}:${target.direction}`);
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

    if (studioHoverCoords && maskPixelInfo) {
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
  if (maskStatusReadout) maskStatusReadout.textContent = `${isCustom ? 'CUSTOM' : 'DEFAULT'} · ${pixelCount} PX`;
  if (maskOriginInfo) maskOriginInfo.textContent = originLabel;

  // Render Live Clothed Preview with selected Preview Background
  const previewMember = target.member ?? party[0];
  const previewView = target.mode === 'clothing'
    ? target.view
    : target.mode === 'base'
      ? (target.direction === 'east' ? 'side' : 'front')
      : (spriteViewControl?.value || 'side_right');
  const isPlayingCycle = spriteAnimationTimer !== null;
  const previewAnimMode = isPlayingCycle
    ? 'walk'
    : ((target.mode === 'clothing' || target.mode === 'base')
        ? target.animMode
        : (spriteAnimationControl?.value || 'walk'));
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

  if (maskPreviewCanvas) {
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
  }

  if (maskOutfitSummary) {
    if (target.mode === 'base' && basePreviewWearOutfit && !basePreviewWearOutfit.checked) {
      maskOutfitSummary.textContent = `Bare Base Sprite · Skin: ${lookupSkinToneName(testPlayerSkinTone)} · Hair: ${lookupHairColorName(testPlayerHairColor)}`;
    } else {
      maskOutfitSummary.textContent = summarizeMemberOutfit({ appearance: previewAppearance, name: previewMember.name });
    }
  }
}

// ============================================================================
// PIXEL PAINTING & FLOOD FILL
// ============================================================================
function floodFill(grid, startX, startY, newColor) {
  const targetColor = grid[startY]?.[startX] ?? null;

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
  return Array.from(visited, (key) => key.split(',').map(Number));
}

function updateSkinRolePixels(gender, direction, animMode, frameIndex, coords, role) {
  if (!Array.isArray(coords) || coords.length === 0) return;
  const view = direction === 'south' ? 'front' : 'side';
  const roles = getFrameSkinRoleMap(gender, view, animMode, frameIndex);
  const edited = new Set(coords.map(([x, y]) => `${x},${y}`));
  const hasRoleToClear = Object.values(roles).some((roleCoords) =>
    Array.isArray(roleCoords) && roleCoords.some(([x, y]) => edited.has(`${x},${y}`))
  );
  if (!role && !hasRoleToClear) return;
  for (const existingRole of Object.keys(roles)) {
    roles[existingRole] = (roles[existingRole] || []).filter(([x, y]) => !edited.has(`${x},${y}`));
  }
  if (role) {
    roles[role] = [...(roles[role] || []), ...coords.map(([x, y]) => [x, y])];
  }
  setFrameSkinRoleMap(gender, view, animMode, frameIndex, roles);
}

function updateHairRolePixels(gender, direction, animMode, frameIndex, coords, role) {
  if (!Array.isArray(coords) || coords.length === 0) return;
  const view = direction === 'south' ? 'front' : 'side';
  const roles = getFrameHairRoleMap(gender, view, animMode, frameIndex);
  const edited = new Set(coords.map(([x, y]) => `${x},${y}`));
  const hasRoleToClear = Object.values(roles).some((roleCoords) =>
    Array.isArray(roleCoords) && roleCoords.some(([x, y]) => edited.has(`${x},${y}`))
  );
  if (!role && !hasRoleToClear) return;
  for (const existingRole of Object.keys(roles)) {
    roles[existingRole] = (roles[existingRole] || []).filter(([x, y]) => !edited.has(`${x},${y}`));
  }
  if (role) roles[role] = [...(roles[role] || []), ...coords.map(([x, y]) => [x, y])];
  setFrameHairRoleMap(gender, view, animMode, frameIndex, roles);
}

function clearSkinRolesForBaseTarget(target, allFrames = false) {
  const view = target.direction === 'south' ? 'front' : 'side';
  const frames = allFrames
    ? [...Array.from({ length: 8 }, (_, frameIndex) => ['walk', frameIndex]), ['idle', 0]]
    : [[target.animMode, target.frameIndex]];
  for (const [animMode, frameIndex] of frames) {
    setFrameSkinRoleMap(target.gender, view, animMode, frameIndex, {});
    setFrameHairRoleMap(target.gender, view, animMode, frameIndex, {});
  }
}

function applyStudioPixel(x, y, isRightClick = false) {
  if (x < 0 || x >= 32 || y < 0 || y >= 32) return;
  const target = getStudioTargetInfo();

  if (target.mode === 'mask') {
    const baseGrid = getBaseBoilerplateGrid(target.gender, target.view, target.animMode, target.frameIndex);
    const sectionMap = getFrameSectionMap(target.gender, target.view, target.animMode, target.frameIndex, baseGrid);
    const sectionGrid = sectionMapToGrid(sectionMap);

    if (activeStudioTool === 'picker') {
      const pickedSec = sectionGrid[y]?.[x];
      if (pickedSec) {
        selectActiveMaskSection(pickedSec);
        showSaveStatus(`Selected section: ${pickedSec}`, false);
      }
      setActiveTool('pencil');
      renderStudioEditor();
      return;
    }

    if (activeStudioTool === 'fill') {
      const targetVal = sectionGrid[y]?.[x] ?? null;
      const replaceVal = (activeStudioTool === 'eraser' || isRightClick) ? null : activeMaskSection;
      if (targetVal !== replaceVal) {
        floodFill(sectionGrid, x, y, replaceVal);
        const updatedMap = sectionGridToMap(sectionGrid);
        setFrameSectionMap(target.gender, target.view, target.animMode, target.frameIndex, updatedMap);
      }
    } else if (activeStudioTool === 'eraser' || isRightClick) {
      if (sectionGrid[y]?.[x] === null) return;
      sectionGrid[y][x] = null;
      const updatedMap = sectionGridToMap(sectionGrid);
      setFrameSectionMap(target.gender, target.view, target.animMode, target.frameIndex, updatedMap);
    } else {
      if (sectionGrid[y]?.[x] === activeMaskSection) return;
      sectionGrid[y][x] = activeMaskSection;
      const updatedMap = sectionGridToMap(sectionGrid);
      setFrameSectionMap(target.gender, target.view, target.animMode, target.frameIndex, updatedMap);
    }
  } else {
    const grid = getStudioWorkingGrid(target);
    let paintedPixels = [];
    const skinRoleToAssign = activeStudioTool === 'eraser' || isRightClick ? null : activeSkinRole;
    const hairRoleToAssign = activeStudioTool === 'eraser' || isRightClick ? null : activeHairRole;

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
      paintedPixels = floodFill(grid, x, y, fillColor);
      setCustomSpriteOverride(target.key, grid);
    } else if (activeStudioTool === 'eraser' || isRightClick) {
      if (grid[y][x] === null) {
        paintedPixels = [[x, y]];
      } else {
        paintedPixels = [[x, y]];
      }
      grid[y][x] = null;
      setCustomSpriteOverride(target.key, grid);
    } else {
      paintedPixels = [[x, y]];
      grid[y][x] = studioBrushColor;
      setCustomSpriteOverride(target.key, grid);
    }

    if (target.mode === 'clothing' && target.isAllFrames) {
      for (let f = 0; f < 8; f++) {
        resetCustomSpriteOverride(`clothing:${target.presetId}:${target.view}:walk:${f}`);
      }
      resetCustomSpriteOverride(`clothing:${target.presetId}:${target.view}:idle:0`);
    } else if (target.mode === 'base' && target.direction === 'south') {
      setCustomSpriteOverride(`base:${target.gender}:south:idle:0`, grid.map((r) => [...r]));
      setCustomSpriteOverride(`base:${target.gender}:south:walk:0`, grid.map((r) => [...r]));
      updateSkinRolePixels(target.gender, 'south', 'idle', 0, paintedPixels, skinRoleToAssign);
      updateSkinRolePixels(target.gender, 'south', 'walk', 0, paintedPixels, skinRoleToAssign);
      updateHairRolePixels(target.gender, 'south', 'idle', 0, paintedPixels, hairRoleToAssign);
      updateHairRolePixels(target.gender, 'south', 'walk', 0, paintedPixels, hairRoleToAssign);
    } else if (target.mode === 'base' && target.isAllFrames) {
      // Propagate the pixel edit to all 8 walk frames and idle frame while preserving each frame's pose
      const fillColor = (activeStudioTool === 'eraser' || isRightClick) ? null : studioBrushColor;
      for (let f = 0; f < 8; f++) {
        const fKey = `base:${target.gender}:${target.direction}:walk:${f}`;
        const fGrid = getCustomSpriteOverride(fKey) || getBaseBoilerplateGrid(target.gender, target.direction === 'south' ? 'front' : 'side', 'walk', f);
        if (fGrid) {
          const copy = fGrid.map((r) => [...r]);
          let framePixels;
          if (activeStudioTool === 'fill') framePixels = floodFill(copy, x, y, fillColor);
          else {
            framePixels = [[x, y]];
            if (activeStudioTool === 'eraser' || isRightClick) copy[y][x] = null;
            else copy[y][x] = studioBrushColor;
          }
          setCustomSpriteOverride(fKey, copy);
          updateSkinRolePixels(target.gender, target.direction, 'walk', f, framePixels, skinRoleToAssign);
          updateHairRolePixels(target.gender, target.direction, 'walk', f, framePixels, hairRoleToAssign);
        }
      }
      const idleKey = `base:${target.gender}:${target.direction}:idle:0`;
      const idleGrid = getCustomSpriteOverride(idleKey) || getBaseBoilerplateGrid(target.gender, target.direction === 'south' ? 'front' : 'side', 'idle', 0);
      if (idleGrid) {
        const copy = idleGrid.map((r) => [...r]);
        let idlePixels;
        if (activeStudioTool === 'fill') idlePixels = floodFill(copy, x, y, fillColor);
        else {
          idlePixels = [[x, y]];
          if (activeStudioTool === 'eraser' || isRightClick) copy[y][x] = null;
          else copy[y][x] = studioBrushColor;
        }
        setCustomSpriteOverride(idleKey, copy);
        updateSkinRolePixels(target.gender, target.direction, 'idle', 0, idlePixels, skinRoleToAssign);
        updateHairRolePixels(target.gender, target.direction, 'idle', 0, idlePixels, hairRoleToAssign);
      }
    } else if (target.mode === 'base') {
      updateSkinRolePixels(target.gender, target.direction, target.animMode, target.frameIndex, paintedPixels, skinRoleToAssign);
      updateHairRolePixels(target.gender, target.direction, target.animMode, target.frameIndex, paintedPixels, hairRoleToAssign);
    }
  }

  renderSpriteViewer();
  renderStudioEditor();
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

maskEditorCanvas?.addEventListener('mousedown', (evt) => {
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

maskEditorCanvas?.addEventListener('mousemove', (evt) => {
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
    renderStudioEditor();
  }
});

maskEditorCanvas?.addEventListener('mouseleave', () => {
  studioHoverCoords = null;
  if (maskPixelInfo) maskPixelInfo.textContent = 'Hover canvas to inspect';
  renderStudioEditor();
});

maskEditorCanvas?.addEventListener('contextmenu', (evt) => {
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
    return;
  } else if ((evt.metaKey || evt.ctrlKey) && evt.key.toLowerCase() === 'y') {
    evt.preventDefault();
    performRedo();
    return;
  }

  const target = getStudioTargetInfo();
  if (target.mode === 'mask') {
    const key = evt.key;
    const sec = MASK_SECTIONS.find((s) => s.shortcut === key || s.shortcut.toLowerCase() === key.toLowerCase());
    if (sec) {
      evt.preventDefault();
      selectActiveMaskSection(sec.id);
      return;
    }
    if (key.toLowerCase() === 'b' || key.toLowerCase() === 'p') {
      setActiveTool('pencil');
    } else if (key.toLowerCase() === 'e' || key.toLowerCase() === 'x') {
      setActiveTool('eraser');
    } else if (key.toLowerCase() === 'i') {
      setActiveTool('picker');
    } else if (key.toLowerCase() === 'g') {
      setActiveTool('fill');
    }
  }
});

// ============================================================================
// UI EVENT LISTENERS
// ============================================================================
modeTabButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const mode = btn.getAttribute('data-mode');
    if (mode && studioModeSelect) {
      studioModeSelect.value = mode;
      renderStudioEditor();
    }
  });
});

studioModeSelect?.addEventListener('change', () => {
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

// 10-Section Palette Click Handlers
document.querySelectorAll('#mask-section-palette .section-brush-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const secId = btn.getAttribute('data-section-id');
    if (secId) {
      selectActiveMaskSection(secId);
    }
  });
});

// Mask Display & Preview Mode Toggles
maskOverlayButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    maskOverlayMode = btn.getAttribute('data-mask-overlay') || 'solid';
    maskOverlayButtons.forEach((b) => b.classList.toggle('active', b === btn));
    renderStudioEditor();
  });
});

maskPreviewModeButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    maskPreviewMode = btn.getAttribute('data-preview-mode') || 'clothed';
    maskPreviewModeButtons.forEach((b) => b.classList.toggle('active', b === btn));
    renderStudioEditor();
  });
});

// 10-Section Action Helpers
if (maskBtnAutodetectAll) {
  maskBtnAutodetectAll.addEventListener('click', () => {
    const before = captureTargetStateSnapshot();
    const target = getStudioTargetInfo();
    const baseGrid = getBaseBoilerplateGrid(target.gender, target.view, target.animMode, target.frameIndex);
    const autoMap = getAutoDetectedSectionMap(target.gender, target.view, target.animMode, target.frameIndex, baseGrid);
    setFrameSectionMap(target.gender, target.view, target.animMode, target.frameIndex, autoMap);
    commitUndoSnapshotIfChanged(before);
    renderSpriteViewer();
    renderStudioEditor();
    showSaveStatus('Auto-detected and mapped all 16 anatomical sections!', false);
  });
}

if (maskBtnSwapLimbs) {
  maskBtnSwapLimbs.addEventListener('click', () => {
    const before = captureTargetStateSnapshot();
    const target = getStudioTargetInfo();
    const baseGrid = getBaseBoilerplateGrid(target.gender, target.view, target.animMode, target.frameIndex);
    const sectionMap = getFrameSectionMap(target.gender, target.view, target.animMode, target.frameIndex, baseGrid);
    const swapped = {
      ...sectionMap,
      fg_sleeve: sectionMap.bg_sleeve || [],
      bg_sleeve: sectionMap.fg_sleeve || [],
      fg_arm: sectionMap.bg_arm || [],
      bg_arm: sectionMap.fg_arm || [],
      fg_hand: sectionMap.bg_hand || [],
      bg_hand: sectionMap.fg_hand || [],
      fg_leg: sectionMap.bg_leg || [],
      bg_leg: sectionMap.fg_leg || [],
      fg_boot: sectionMap.bg_boot || [],
      bg_boot: sectionMap.fg_boot || [],
      fg_foot: sectionMap.bg_foot || [],
      bg_foot: sectionMap.fg_foot || []
    };
    setFrameSectionMap(target.gender, target.view, target.animMode, target.frameIndex, swapped);
    commitUndoSnapshotIfChanged(before);
    renderSpriteViewer();
    renderStudioEditor();
    showSaveStatus('Swapped Near and Far limbs (foreground <-> background)!', false);
  });
}

if (maskBtnCopyFrame) {
  maskBtnCopyFrame.addEventListener('click', () => {
    const target = getStudioTargetInfo();
    const baseGrid = getBaseBoilerplateGrid(target.gender, target.view, target.animMode, target.frameIndex);
    copiedFrameSectionMap = getFrameSectionMap(target.gender, target.view, target.animMode, target.frameIndex, baseGrid);
    showSaveStatus(`Copied section map for ${target.animMode.toUpperCase()} Frame ${target.frameIndex + 1}!`, false);
  });
}

if (maskBtnPasteFrame) {
  maskBtnPasteFrame.addEventListener('click', () => {
    if (!copiedFrameSectionMap) {
      showSaveStatus('No frame section map copied yet! Click "Copy Frame Map" first.', true);
      return;
    }
    const before = captureTargetStateSnapshot();
    const target = getStudioTargetInfo();
    setFrameSectionMap(target.gender, target.view, target.animMode, target.frameIndex, copiedFrameSectionMap);
    commitUndoSnapshotIfChanged(before);
    renderSpriteViewer();
    renderStudioEditor();
    showSaveStatus(`Pasted section map into ${target.animMode.toUpperCase()} Frame ${target.frameIndex + 1}!`, false);
  });
}

if (maskBtnClearMask) {
  maskBtnClearMask.addEventListener('click', () => {
    const before = captureTargetStateSnapshot();
    const target = getStudioTargetInfo();
    const emptyMap = {};
    for (const s of MASK_SECTIONS) emptyMap[s.id] = [];
    setFrameSectionMap(target.gender, target.view, target.animMode, target.frameIndex, emptyMap);
    commitUndoSnapshotIfChanged(before);
    renderSpriteViewer();
    renderStudioEditor();
    showSaveStatus('Cleared section map for this frame!', false);
  });
}

eraControl?.addEventListener('change', () => {
  selectedEra = eraControl.value;
  syncAllPartyAppearancesToEra(party, selectedEra);
  if (studioClothingEra && studioClothingEra.value !== 'all') {
    studioClothingEra.value = selectedEra;
  }
  syncStudioToActiveTravelerDefaults();
  renderSpriteViewer();
});

spriteCharacterControl?.addEventListener('change', () => {
  stopSpritePlayback();
  selectedSpriteFrame = 0;
  syncStudioToActiveTravelerDefaults();
  renderSpriteViewer();
});

spriteViewControl?.addEventListener('change', () => {
  stopSpritePlayback();
  selectedSpriteFrame = 0;
  const isFront = spriteViewControl.value === 'front';
  if (studioClothingView) studioClothingView.value = isFront ? 'front' : 'side';
  if (studioBaseDirection) studioBaseDirection.value = isFront ? 'south' : 'east';
  renderSpriteViewer();
});

spriteAnimationControl?.addEventListener('change', () => {
  stopSpritePlayback();
  selectedSpriteFrame = 0;
  renderSpriteViewer();
});

spritePlayButton?.addEventListener('click', toggleSpritePlayback);
if (previewPlayBtn) previewPlayBtn.addEventListener('click', toggleSpritePlayback);

studioToolPencil?.addEventListener('click', () => setActiveTool('pencil'));
studioToolEraser?.addEventListener('click', () => setActiveTool('eraser'));
studioToolPicker?.addEventListener('click', () => setActiveTool('picker'));
studioToolFill?.addEventListener('click', () => setActiveTool('fill'));

if (studioBtnUndo) studioBtnUndo.addEventListener('click', performUndo);
if (studioBtnRedo) studioBtnRedo.addEventListener('click', performRedo);

studioActiveColor?.addEventListener('input', () => {
  setActiveBrushColor(studioActiveColor.value);
  if (activeStudioTool === 'eraser' || activeStudioTool === 'picker') {
    setActiveTool('pencil');
  }
});

studioHexInput?.addEventListener('input', () => {
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
  const mode = document.body?.dataset?.studioMode || studioModeSelect?.value || 'clothing';
  const nextIdx = (selectedSpriteFrame + delta + 8) % 8;
  selectedSpriteFrame = nextIdx;

  if (mode === 'clothing') {
    if (studioClothingFrame && studioClothingCategory && (studioClothingFrame.value !== 'all' || isFrameSpecificCategory(studioClothingCategory.value))) {
      studioClothingFrame.value = `walk:${nextIdx}`;
      if (spriteAnimationControl) spriteAnimationControl.value = 'walk';
    }
  } else if (mode === 'base') {
    if (studioBaseFrame && !(studioBaseApplyAll && studioBaseApplyAll.checked)) {
      studioBaseFrame.value = `walk:${nextIdx}`;
    }
    if (spriteAnimationControl) spriteAnimationControl.value = 'walk';
  }
  renderSpriteViewer();
}

if (studioPrevFrame) studioPrevFrame.addEventListener('click', () => stepStudioFrame(-1));
if (studioNextFrame) studioNextFrame.addEventListener('click', () => stepStudioFrame(1));

studioClothingEra?.addEventListener('change', () => {
  populateClothingPresets();
  renderStudioEditor();
});

studioClothingGender?.addEventListener('change', () => {
  if (studioBaseGender && (studioClothingGender.value === 'male' || studioClothingGender.value === 'female')) {
    studioBaseGender.value = studioClothingGender.value;
  }
  populateClothingPresets();
  renderStudioEditor();
});

studioClothingCategory?.addEventListener('change', () => {
  populateClothingPresets();
  const memberIndex = Number(spriteCharacterControl?.value) || 0;
  const member = party[memberIndex] ?? party[0];
  const activeCat = studioClothingCategory.value;
  const equippedPresetId = member?.appearance?.equippedPresets?.[activeCat];
  if (equippedPresetId && studioClothingPreset?.querySelector(`option[value="${equippedPresetId}"]`)) {
    studioClothingPreset.value = equippedPresetId;
  }
  renderStudioEditor();
});

studioClothingPreset?.addEventListener('change', () => {
  renderStudioEditor();
});

// Clothing Preset Action Listeners: Add New, Rename, Delete
document.querySelectorAll('[data-close-dialog]').forEach((btn) => {
  btn.addEventListener('click', (evt) => {
    evt.preventDefault();
    const dialogId = btn.getAttribute('data-close-dialog');
    const dlg = document.getElementById(dialogId);
    dlg?.close();
  });
});

function performRenameClothing() {
  const activeCat = studioClothingCategory?.value || 'shirts';
  const presetId = studioClothingPreset?.value;
  const newName = renameClothingInput?.value?.trim();
  if (!presetId || !newName) return;

  renameClothingItem(presetId, newName);
  populateClothingPresets();
  if (studioClothingPreset) {
    studioClothingPreset.value = presetId;
  }
  dialogRenameClothing?.close();
  renderSpriteViewer();
  renderStudioEditor();
  showSaveStatus(`Renamed item to "${newName}"!`, false);
}

function performCreateNewClothing() {
  const name = newClothingName?.value?.trim();
  const category = newClothingCategory?.value || studioClothingCategory?.value || 'shirts';
  const era = newClothingEra?.value || studioClothingEra?.value || 'oregon_trail';
  const gender = newClothingGender?.value || 'unisex';
  const subType = category === 'hats' ? (newClothingHeadwearType?.value || 'hair') : null;
  const templateMode = newClothingTemplate?.value || 'blank';
  const basePresetId = templateMode === 'clone' ? studioClothingPreset?.value : null;

  if (!name) return;

  const newItem = addCustomClothingItem({
    name,
    category,
    era,
    gender,
    subType,
    basePresetId
  });

  if (basePresetId) {
    for (let f = 0; f < 8; f++) {
      for (const view of ['side', 'front']) {
        const srcWalk = getCustomSpriteOverride(`clothing:${basePresetId}:${view}:walk:${f}`);
        if (srcWalk) setCustomSpriteOverride(`clothing:${newItem.id}:${view}:walk:${f}`, srcWalk);
      }
    }
    for (const view of ['side', 'front']) {
      const srcIdle = getCustomSpriteOverride(`clothing:${basePresetId}:${view}:idle:0`);
      if (srcIdle) setCustomSpriteOverride(`clothing:${newItem.id}:${view}:idle:0`, srcIdle);
      const srcUniversal = getCustomSpriteOverride(`clothing:${basePresetId}:${view}`);
      if (srcUniversal) setCustomSpriteOverride(`clothing:${newItem.id}:${view}`, srcUniversal);
    }
  }

  if (studioClothingCategory) studioClothingCategory.value = category;
  if (studioClothingEra) studioClothingEra.value = era;
  if (studioClothingGender) {
    studioClothingGender.value = gender === 'unisex' ? 'all' : gender;
  }
  populateClothingPresets();
  if (studioClothingPreset) {
    studioClothingPreset.value = newItem.id;
  }

  dialogNewClothing?.close();
  renderSpriteViewer();
  renderStudioEditor();
  showSaveStatus(`Created new item "${newItem.name}"!`, false);
}

studioClothingBtnRename?.addEventListener('click', (evt) => {
  evt.preventDefault();
  evt.stopPropagation();
  const activeCat = studioClothingCategory?.value || 'shirts';
  const presetId = studioClothingPreset?.value;
  const preset = (INITIAL_CLOTHING_BOILERPLATE[activeCat] || []).find((p) => p.id === presetId);
  if (!preset) return;

  if (dialogRenameClothing && typeof dialogRenameClothing.showModal === 'function') {
    if (renameClothingInput) {
      renameClothingInput.value = preset.name;
    }
    dialogRenameClothing.showModal();
    renameClothingInput?.focus();
    renameClothingInput?.select();
  } else {
    const promptName = prompt('Enter new name for clothing item:', preset.name);
    if (promptName && promptName.trim()) {
      if (renameClothingInput) renameClothingInput.value = promptName.trim();
      performRenameClothing();
    }
  }
});

formRenameClothing?.addEventListener('submit', (evt) => {
  evt.preventDefault();
  performRenameClothing();
});

btnSubmitRenameClothing?.addEventListener('click', (evt) => {
  evt.preventDefault();
  performRenameClothing();
});

studioClothingBtnNew?.addEventListener('click', (evt) => {
  evt.preventDefault();
  evt.stopPropagation();
  if (newClothingName) newClothingName.value = '';
  if (newClothingCategory && studioClothingCategory) {
    newClothingCategory.value = studioClothingCategory.value;
  }
  if (newClothingHeadwearType) {
    newClothingHeadwearType.value = 'hair';
  }
  syncNewClothingHeadwearType();
  if (newClothingEra && studioClothingEra) {
    newClothingEra.value = studioClothingEra.value !== 'all' ? studioClothingEra.value : 'oregon_trail';
  }
  if (newClothingGender && studioClothingGender) {
    newClothingGender.value = (studioClothingGender.value === 'male' || studioClothingGender.value === 'female')
      ? studioClothingGender.value
      : 'unisex';
  }
  if (newClothingTemplate) {
    newClothingTemplate.value = 'blank';
  }

  if (dialogNewClothing && typeof dialogNewClothing.showModal === 'function') {
    dialogNewClothing.showModal();
    newClothingName?.focus();
  } else {
    const promptName = prompt('Enter name for new clothing item:');
    if (promptName && promptName.trim()) {
      if (newClothingName) newClothingName.value = promptName.trim();
      performCreateNewClothing();
    }
  }
});

newClothingCategory?.addEventListener('change', syncNewClothingHeadwearType);

formNewClothing?.addEventListener('submit', (evt) => {
  evt.preventDefault();
  performCreateNewClothing();
});

btnSubmitNewClothing?.addEventListener('click', (evt) => {
  evt.preventDefault();
  performCreateNewClothing();
});

studioClothingBtnDelete?.addEventListener('click', () => {
  const activeCat = studioClothingCategory?.value || 'shirts';
  const presetId = studioClothingPreset?.value;
  const preset = (INITIAL_CLOTHING_BOILERPLATE[activeCat] || []).find((p) => p.id === presetId);
  if (!preset || !preset.isCustom) return;

  const ok = confirm(`Delete custom clothing item "${preset.name}"?`);
  if (!ok) return;

  for (let f = 0; f < 8; f++) {
    for (const view of ['side', 'front']) {
      resetCustomSpriteOverride(`clothing:${presetId}:${view}:walk:${f}`);
    }
  }
  for (const view of ['side', 'front']) {
    resetCustomSpriteOverride(`clothing:${presetId}:${view}:idle:0`);
    resetCustomSpriteOverride(`clothing:${presetId}:${view}`);
  }

  deleteCustomClothingItem(presetId);
  populateClothingPresets();
  renderSpriteViewer();
  renderStudioEditor();
  showSaveStatus(`Deleted custom clothing item "${preset.name}"!`, false);
});

studioClothingView?.addEventListener('change', () => {
  const isFront = studioClothingView.value === 'front';
  if (spriteViewControl) spriteViewControl.value = isFront ? 'front' : 'side_right';
  if (studioBaseDirection) studioBaseDirection.value = isFront ? 'south' : 'east';
  renderSpriteViewer();
});

studioClothingFrame?.addEventListener('change', () => {
  if (studioClothingFrame.value !== 'all') {
    const [animMode, frameStr] = studioClothingFrame.value.split(':');
    const frameIndex = Number(frameStr) || 0;
    selectedSpriteFrame = frameIndex;
    if (spriteAnimationControl && spriteAnimationControl.value !== animMode) {
      spriteAnimationControl.value = animMode;
    }
  }
  renderSpriteViewer();
});

studioBaseGender?.addEventListener('change', () => {
  if (studioClothingGender) studioClothingGender.value = studioBaseGender.value;
  populateBasePreviewHairstyles();
  populateClothingPresets();
  renderSpriteViewer();
  renderStudioEditor();
});

basePreviewHairstyle?.addEventListener('change', () => {
  renderSpriteViewer();
});

function syncQuickPoseButtons() {
  const mode = document.body?.dataset?.studioMode || studioModeSelect?.value || 'clothing';
  const isFront = mode === 'base'
    ? studioBaseDirection?.value === 'south'
    : spriteViewControl?.value === 'front';
  const isIdle = mode === 'base'
    ? (isFront || studioBaseFrame?.value === 'idle:0')
    : (isFront || spriteAnimationControl?.value === 'idle');
  const activePose = isFront ? 'front-idle' : (isIdle ? 'side-idle' : 'side-walk');
  document.querySelectorAll('.pose-quick-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-quick-pose') === activePose);
  });
}

document.querySelectorAll('.pose-quick-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const pose = btn.getAttribute('data-quick-pose');
    stopSpritePlayback();
    if (pose === 'front-idle') {
      if (spriteViewControl) spriteViewControl.value = 'front';
      if (spriteAnimationControl) spriteAnimationControl.value = 'idle';
      if (studioBaseDirection) studioBaseDirection.value = 'south';
      if (studioBaseFrame) studioBaseFrame.value = 'idle:0';
      if (studioBaseApplyAll) studioBaseApplyAll.checked = false;
      selectedSpriteFrame = 0;
    } else if (pose === 'side-idle') {
      if (spriteViewControl) spriteViewControl.value = 'side_right';
      if (spriteAnimationControl) spriteAnimationControl.value = 'idle';
      if (studioBaseDirection) studioBaseDirection.value = 'east';
      if (studioBaseFrame) studioBaseFrame.value = 'idle:0';
      if (studioBaseApplyAll) studioBaseApplyAll.checked = false;
      selectedSpriteFrame = 0;
    } else {
      if (spriteViewControl) spriteViewControl.value = 'side_right';
      if (spriteAnimationControl) spriteAnimationControl.value = 'walk';
      if (studioBaseDirection) studioBaseDirection.value = 'east';
      if (studioBaseFrame) studioBaseFrame.value = 'all';
      if (studioBaseApplyAll) studioBaseApplyAll.checked = true;
      selectedSpriteFrame = 0;
    }
    syncQuickPoseButtons();
    renderSpriteViewer();
    renderStudioEditor();
  });
});

studioBaseDirection?.addEventListener('change', () => {
  const isFront = studioBaseDirection.value === 'south';
  if (spriteViewControl) spriteViewControl.value = isFront ? 'front' : 'side_right';
  if (spriteAnimationControl) spriteAnimationControl.value = isFront ? 'idle' : 'walk';
  if (studioClothingView) studioClothingView.value = isFront ? 'front' : 'side';
  if (isFront) {
    if (studioBaseFrame) studioBaseFrame.value = 'idle:0';
    if (studioBaseApplyAll) studioBaseApplyAll.checked = false;
    selectedSpriteFrame = 0;
  }
  syncQuickPoseButtons();
  renderSpriteViewer();
  renderStudioEditor();
});

studioBaseFrame?.addEventListener('change', () => {
  if (studioBaseFrame.value === 'all') {
    if (studioBaseApplyAll) studioBaseApplyAll.checked = true;
  } else {
    if (studioBaseApplyAll) studioBaseApplyAll.checked = false;
    const [animMode, frameStr] = studioBaseFrame.value.split(':');
    const frameIndex = Number(frameStr) || 0;
    selectedSpriteFrame = frameIndex;
    if (spriteAnimationControl && spriteAnimationControl.value !== animMode) {
      spriteAnimationControl.value = animMode;
    }
  }
  syncQuickPoseButtons();
  renderSpriteViewer();
  renderStudioEditor();
});

studioShowUnderlay?.addEventListener('change', () => renderStudioEditor());
if (studioShowGrid) studioShowGrid.addEventListener('change', () => renderStudioEditor());
if (basePreviewWearOutfit) {
  basePreviewWearOutfit.addEventListener('change', () => {
    renderSpriteViewer();
    renderStudioEditor();
  });
}

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
    const target = getStudioTargetInfo();
    if (target.mode === 'base') {
      for (const cat of ['hats', 'shirts', 'pants', 'shoes', 'accessories']) {
        if (previewWearCheckboxes[cat]) previewWearCheckboxes[cat].checked = false;
      }
    } else {
      const activeCat = studioClothingCategory?.value || 'hats';
      for (const cat of ['hats', 'shirts', 'pants', 'shoes', 'accessories']) {
        if (previewWearCheckboxes[cat]) previewWearCheckboxes[cat].checked = (cat === activeCat);
      }
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
  if (isError) {
    console.error(message);
  }
}

studioBtnReset?.addEventListener('click', () => {
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
  } else if (target.mode === 'base') {
    resetCustomSpriteOverride(target.key);
    resetCustomSpriteOverride(`base:${target.gender}:${target.direction}`);
    if (target.isAllFrames) {
      for (let f = 0; f < 8; f++) {
        resetCustomSpriteOverride(`base:${target.gender}:${target.direction}:walk:${f}`);
      }
      resetCustomSpriteOverride(`base:${target.gender}:${target.direction}:idle:0`);
    }
    clearSkinRolesForBaseTarget(target, target.isAllFrames);
  } else {
    resetCustomSpriteOverride(target.key);
  }
  commitUndoSnapshotIfChanged(before);
  renderSpriteViewer();
  renderStudioEditor();
  showSaveStatus(`Reset ${target.name} to default!`, false);
});

studioBtnClear?.addEventListener('click', () => {
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
    } else if (target.mode === 'base' && target.isAllFrames) {
      for (let f = 0; f < 8; f++) {
        setCustomSpriteOverride(`base:${target.gender}:${target.direction}:walk:${f}`, emptyGrid);
      }
      setCustomSpriteOverride(`base:${target.gender}:${target.direction}:idle:0`, emptyGrid);
    }
    if (target.mode === 'base') clearSkinRolesForBaseTarget(target, target.isAllFrames);
  }
  commitUndoSnapshotIfChanged(before);
  renderSpriteViewer();
  renderStudioEditor();
  showSaveStatus(`Cleared layer for ${target.name}!`, false);
});

maskBtnCopy?.addEventListener('click', async () => {
  const data = {
    overrides: getAllCustomOverridesObject(),
    masks: getAllCustomMasksObject(),
    customClothing: getAllCustomClothingObject()
  };
  try {
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    showSaveStatus('Copied custom sprites, masks & clothing to clipboard!', false);
  } catch {
    prompt('Copy custom sprites JSON:', JSON.stringify(data));
  }
});

maskBtnPaste?.addEventListener('click', () => {
  const input = prompt('Paste custom sprites, masks & clothing JSON:');
  if (!input) return;
  try {
    const parsed = JSON.parse(input);
    let count = 0;
    if (parsed.overrides && typeof parsed.overrides === 'object') {
      for (const [k, v] of Object.entries(parsed.overrides)) {
        setCustomSpriteOverride(k, v);
        count++;
      }
    } else if (!parsed.masks && !parsed.customClothing && typeof parsed === 'object') {
      for (const [k, v] of Object.entries(parsed)) {
        setCustomSpriteOverride(k, v);
        count++;
      }
    }
    if (parsed.masks) {
      importMaskOverrides(parsed.masks);
    }
    if (parsed.customClothing && typeof parsed.customClothing === 'object') {
      if (parsed.customClothing.items) {
        for (const item of Object.values(parsed.customClothing.items)) {
          if (item && item.category) {
            addCustomClothingItem(item);
          }
        }
      }
      if (parsed.customClothing.nameOverrides) {
        for (const [id, newName] of Object.entries(parsed.customClothing.nameOverrides)) {
          renameClothingItem(id, newName);
        }
      }
      populateClothingPresets();
    }
    renderSpriteViewer();
    showSaveStatus(`Imported ${count} sprite override(s) and custom clothing!`, false);
  } catch (err) {
    alert('Invalid JSON: ' + err.message);
  }
});

function downloadSpriteStudioJsonFile() {
  const data = {
    overrides: getAllCustomOverridesObject(),
    masks: getAllCustomMasksObject(),
    customClothing: getAllCustomClothingObject()
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

maskBtnSaveProject?.addEventListener('click', async () => {
  maskBtnSaveProject.disabled = true;
  maskBtnSaveProject.textContent = '⏳ Saving...';
  try {
    const [overridesRes, masksRes, clothingRes] = await Promise.allSettled([
      saveCustomOverridesToServer(),
      saveCustomMasksToServer(),
      saveCustomClothingToServer()
    ]);
    const overridesCount = overridesRes.status === 'fulfilled' ? (overridesRes.value?.count ?? 0) : 0;
    const masksCount = masksRes.status === 'fulfilled' ? (masksRes.value?.count ?? 0) : 0;
    const clothingCount = clothingRes.status === 'fulfilled' ? (clothingRes.value?.count ?? 0) : 0;
    showSaveStatus(`Saved ${overridesCount} sprite override(s), ${masksCount} mask(s), and ${clothingCount} custom clothing item(s) to project files!`, false);
  } catch (err) {
    console.warn('Could not save via dev server endpoint, falling back to download:', err);
    downloadSpriteStudioJsonFile();
    showSaveStatus('Saved via download (custom-sprites-and-masks.json)!', false);
  } finally {
    maskBtnSaveProject.disabled = false;
    maskBtnSaveProject.textContent = '💾 Save to Project';
  }
});

maskBtnDownload?.addEventListener('click', () => {
  downloadSpriteStudioJsonFile();
  showSaveStatus('Downloaded custom-sprites-and-masks.json!', false);
});

maskBtnLoadFile?.addEventListener('click', () => {
  maskFileInput?.click();
});

maskFileInput?.addEventListener('change', async (evt) => {
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
    } else if (!parsed.masks && !parsed.customClothing && typeof parsed === 'object') {
      for (const [k, v] of Object.entries(parsed)) {
        setCustomSpriteOverride(k, v);
        count++;
      }
    }
    if (parsed.masks) {
      importMaskOverrides(parsed.masks);
    }
    if (parsed.customClothing && typeof parsed.customClothing === 'object') {
      if (parsed.customClothing.items) {
        for (const item of Object.values(parsed.customClothing.items)) {
          if (item && item.category) {
            addCustomClothingItem(item);
          }
        }
      }
      if (parsed.customClothing.nameOverrides) {
        for (const [id, newName] of Object.entries(parsed.customClothing.nameOverrides)) {
          renameClothingItem(id, newName);
        }
      }
      populateClothingPresets();
    }
    renderSpriteViewer();
    showSaveStatus(`Loaded ${count} sprite override(s) from ${file.name}!`, false);
  } catch (err) {
    showSaveStatus(`Failed to load file: ${err.message}`, true);
  } finally {
    maskFileInput.value = '';
  }
});

if (studioBtnClearCache) {
  studioBtnClearCache.addEventListener('click', () => {
    const ok = confirm('Clear all cached overrides, drafts, and UI selections from browser storage? This will restore clean project defaults.');
    if (!ok) return;
    clearAllCustomOverridesAndStorage();
    undoStack.length = 0;
    redoStack.length = 0;
    updateUndoRedoButtons();
    syncStudioToActiveTravelerDefaults();
    testPlayerSkinTone = 'warm_ivory';
    testPlayerHairColor = 'chestnut_brown';
    document.querySelectorAll('[data-test-skintone]').forEach((b) => {
      b.classList.toggle('active', b.getAttribute('data-test-skintone') === 'warm_ivory');
    });
    document.querySelectorAll('[data-test-hair]').forEach((b) => {
      b.classList.toggle('active', b.getAttribute('data-test-hair') === 'chestnut_brown');
    });
    renderSpriteViewer();
    renderStudioEditor();
    showSaveStatus('Cleared all cached options and restored project defaults!', false);
  });
}

if (studioBtnApplySkintone) {
  studioBtnApplySkintone.addEventListener('click', () => {
    const before = captureTargetStateSnapshot();
    const target = getStudioTargetInfo();
    const chosenSkinTone = studioBaseSkintone ? studioBaseSkintone.value : 'warm_ivory';

    for (let f = 0; f < 8; f++) {
      const fKey = `base:${target.gender}:${target.direction}:walk:${f}`;
      const fGrid = getCustomSpriteOverride(fKey) || getBaseBoilerplateGrid(target.gender, target.direction === 'south' ? 'front' : 'side', 'walk', f);
      if (fGrid) {
        const skinRoles = getFrameSkinRoleMap(target.gender, target.direction === 'south' ? 'front' : 'side', 'walk', f);
        const recolored = applySkinToneToSpriteGrid(fGrid, chosenSkinTone, target.gender, skinRoles);
        setCustomSpriteOverride(fKey, recolored);
      }
    }

    const idleKey = `base:${target.gender}:${target.direction}:idle:0`;
    const idleGrid = getCustomSpriteOverride(idleKey) || getBaseBoilerplateGrid(target.gender, target.direction === 'south' ? 'front' : 'side', 'idle', 0);
    if (idleGrid) {
      const skinRoles = getFrameSkinRoleMap(target.gender, target.direction === 'south' ? 'front' : 'side', 'idle', 0);
      const recolored = applySkinToneToSpriteGrid(idleGrid, chosenSkinTone, target.gender, skinRoles);
      setCustomSpriteOverride(idleKey, recolored);
    }

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
    if (studioBaseFrame) {
      if (studioBaseApplyAll.checked) {
        studioBaseFrame.value = 'all';
      } else if (studioBaseFrame.value === 'all') {
        studioBaseFrame.value = `walk:${selectedSpriteFrame % 8}`;
      }
    }
    renderSpriteViewer();
    renderStudioEditor();
  });
}

// Skin Painter Buttons
document.querySelectorAll('.skin-role-btn').forEach((btn) => {
  btn.setAttribute('aria-pressed', 'false');
  btn.addEventListener('click', () => {
    const role = btn.getAttribute('data-role');
    if (activeSkinRole === role) {
      activeSkinRole = null;
      document.querySelectorAll('.skin-role-btn').forEach((b) => {
        b.classList.remove('active-role');
        b.setAttribute('aria-pressed', 'false');
      });
      updateStudioActionReadout();
      showSaveStatus('Skin painter off. Repainted pixels will no longer carry a skin tint role.', false);
      return;
    }
    const col = btn.getAttribute('data-color');
    activeSkinRole = role || 'base';
    activeHairRole = null;
    document.querySelectorAll('.hair-role-btn').forEach((b) => {
      b.classList.remove('active-role');
      b.setAttribute('aria-pressed', 'false');
    });
    if (col) setActiveBrushColor(col);
    if (activeStudioTool === 'eraser' || activeStudioTool === 'picker') {
      setActiveTool('pencil');
    }
    document.querySelectorAll('.skin-role-btn').forEach((b) => {
      const selected = b === btn;
      b.classList.toggle('active-role', selected);
      b.setAttribute('aria-pressed', String(selected));
    });
    updateStudioActionReadout();
    showSaveStatus(`Skin painter ${activeSkinRole} role active. Choose any brush color to paint tintable skin pixels.`, false);
  });
});

// Hair Painter Buttons
document.querySelectorAll('.hair-role-btn').forEach((btn) => {
  btn.setAttribute('aria-pressed', 'false');
  btn.addEventListener('click', () => {
    const role = btn.getAttribute('data-hair-role');
    if (activeHairRole === role) {
      activeHairRole = null;
      document.querySelectorAll('.hair-role-btn').forEach((b) => {
        b.classList.remove('active-role');
        b.setAttribute('aria-pressed', 'false');
      });
      updateStudioActionReadout();
      showSaveStatus('Hair painter off. Repainted pixels will no longer carry a hair tint role.', false);
      return;
    }
    const col = btn.getAttribute('data-color');
    activeHairRole = role || 'base';
    activeSkinRole = null;
    document.querySelectorAll('.skin-role-btn').forEach((b) => {
      b.classList.remove('active-role');
      b.setAttribute('aria-pressed', 'false');
    });
    if (col) setActiveBrushColor(col);
    if (activeStudioTool === 'eraser' || activeStudioTool === 'picker') {
      setActiveTool('pencil');
    }
    document.querySelectorAll('.hair-role-btn').forEach((b) => {
      const selected = b === btn;
      b.classList.toggle('active-role', selected);
      b.setAttribute('aria-pressed', String(selected));
    });
    updateStudioActionReadout();
    showSaveStatus(`Hair painter ${activeHairRole} role active. Choose any brush color to paint tintable hair pixels.`, false);
  });
});

// Test Player Skin Tone Pills in Live Preview
document.querySelectorAll('[data-test-skintone]').forEach((btn) => {
  btn.addEventListener('click', () => {
    testPlayerSkinTone = btn.getAttribute('data-test-skintone') || 'warm_ivory';
    document.querySelectorAll('[data-test-skintone]').forEach((b) => b.classList.toggle('active', b === btn));
    renderSpriteViewer();
    renderStudioEditor();
    showSaveStatus(`Testing player skin tone: ${lookupSkinToneName(testPlayerSkinTone)}`, false);
  });
});

// Test Player Hair Color Pills in Live Preview
document.querySelectorAll('[data-test-hair]').forEach((btn) => {
  btn.addEventListener('click', () => {
    testPlayerHairColor = btn.getAttribute('data-test-hair') || 'chestnut_brown';
    document.querySelectorAll('[data-test-hair]').forEach((b) => b.classList.toggle('active', b === btn));
    renderSpriteViewer();
    renderStudioEditor();
    showSaveStatus(`Testing player hair color: ${lookupHairColorName(testPlayerHairColor)}`, false);
  });
});

function lookupHairColorName(id) {
  const hair = HAIR_COLORS.find((h) => h.id === id);
  return hair ? hair.name : id;
}

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
populateBasePreviewHairstyles();
updateUndoRedoButtons();
if (document.querySelector('#mask-section-palette')) {
  selectActiveMaskSection(activeMaskSection);
}
renderSpriteViewer();
