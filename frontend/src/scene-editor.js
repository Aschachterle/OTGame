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
  resetAllCustomMasks,
  exportAllMaskOverrides,
  importMaskOverrides,
  getAllCustomMasksObject,
  saveCustomMasksToServer,
  summarizeMemberOutfit
} from './character-designer.js?v=sprite32_1';
import { trailMilestones } from './state.js';
import {
  FERRY_BOARDING_END,
  FERRY_CROSSING_END,
  getWeatherOverlayMeta,
  renderGameLandscapeStage
} from './scene-renderer.js?v=pixi_final_9';
import { DEFAULT_RIVER_DEPTH_FT } from './scene-sprites.js?v=pixi_final_1';

const CROSSING_DURATION_MS = 3600;
const STORE_APPROACH_DURATION_MS = 3300;

const canvas = document.querySelector('#scene-canvas');
const sceneModeControl = document.querySelector('#scene-mode');
const biomeControl = document.querySelector('#biome');
const riverLandmarkControl = document.querySelector('#river-landmark');
const eraControl = document.querySelector('#era');
const weatherOverlayControl = document.querySelector('#weather-overlay');
const methodControl = document.querySelector('#method');
const progressControl = document.querySelector('#progress');
const partySizeControl = document.querySelector('#party-size');
const dialogueSpeakerControl = document.querySelector('#dialogue-speaker');
const movingControl = document.querySelector('#moving');
const playButton = document.querySelector('#play');
const resetButton = document.querySelector('#reset');
const sceneTitle = document.querySelector('#scene-title');
const sceneDescription = document.querySelector('#scene-description');
const progressReadout = document.querySelector('#progress-readout');
const progressFill = document.querySelector('#progress-fill');
const partyReadout = document.querySelector('#party-readout');
const frameReadout = document.querySelector('#frame-readout');
const riverDepthField = document.querySelector('#river-depth-field');
const riverDepthInput = document.querySelector('#river-depth');
const riverDepthResetButton = document.querySelector('#river-depth-reset');
const spriteCharacterControl = document.querySelector('#sprite-character');
const spriteViewControl = document.querySelector('#sprite-view');
const spriteAnimationControl = document.querySelector('#sprite-animation');
const spritePlayButton = document.querySelector('#sprite-play');
const spriteFrameStrip = document.querySelector('#sprite-frame-strip');
const spriteFrameReadout = document.querySelector('#sprite-frame-readout');

const maskEditorCanvas = document.querySelector('#mask-editor-canvas');
const maskPreviewCanvas = document.querySelector('#mask-preview-canvas');
const maskPreviewBackdrop = document.querySelector('#mask-preview-backdrop');
const maskOutfitSummary = document.querySelector('#mask-outfit-summary');
const maskStatusReadout = document.querySelector('#mask-status-readout');
const maskModeDraw = document.querySelector('#mask-mode-draw');
const maskModeErase = document.querySelector('#mask-mode-erase');
const maskBtnReset = document.querySelector('#mask-btn-reset');
const maskBtnClear = document.querySelector('#mask-btn-clear');
const maskBtnCopy = document.querySelector('#mask-btn-copy');
const maskBtnPaste = document.querySelector('#mask-btn-paste');
const maskBtnSaveProject = document.querySelector('#mask-btn-save-project');
const maskBtnDownload = document.querySelector('#mask-btn-download');
const maskBtnLoadFile = document.querySelector('#mask-btn-load-file');
const maskFileInput = document.querySelector('#mask-file-input');
const maskSaveStatus = document.querySelector('#mask-save-status');
const maskTargetReadout = document.querySelector('#mask-target-readout');
const maskPixelInfo = document.querySelector('#mask-pixel-info');
const maskOriginInfo = document.querySelector('#mask-origin-info');

if (
  !(canvas instanceof HTMLCanvasElement)
  || !(riverDepthField instanceof HTMLElement)
  || !(riverDepthInput instanceof HTMLInputElement)
  || !(riverDepthResetButton instanceof HTMLButtonElement)
  || !(spriteCharacterControl instanceof HTMLSelectElement)
  || !(spriteViewControl instanceof HTMLSelectElement)
  || !(spriteAnimationControl instanceof HTMLSelectElement)
  || !(spritePlayButton instanceof HTMLButtonElement)
  || !(spriteFrameStrip instanceof HTMLElement)
  || !(spriteFrameReadout instanceof HTMLOutputElement)
  || !(maskEditorCanvas instanceof HTMLCanvasElement)
  || !(maskPreviewCanvas instanceof HTMLCanvasElement)
  || !(maskPreviewBackdrop instanceof HTMLInputElement)
  || !(maskOutfitSummary instanceof HTMLElement)
  || !(maskStatusReadout instanceof HTMLOutputElement)
  || !(maskModeDraw instanceof HTMLButtonElement)
  || !(maskModeErase instanceof HTMLButtonElement)
  || !(maskBtnReset instanceof HTMLButtonElement)
  || !(maskBtnClear instanceof HTMLButtonElement)
  || !(maskBtnCopy instanceof HTMLButtonElement)
  || !(maskBtnPaste instanceof HTMLButtonElement)
  || !(maskBtnSaveProject instanceof HTMLButtonElement)
  || !(maskBtnDownload instanceof HTMLButtonElement)
  || !(maskBtnLoadFile instanceof HTMLButtonElement)
  || !(maskFileInput instanceof HTMLInputElement)
  || !(maskSaveStatus instanceof HTMLElement)
  || !(maskTargetReadout instanceof HTMLElement)
  || !(maskPixelInfo instanceof HTMLElement)
  || !(maskOriginInfo instanceof HTMLElement)
) {
  throw new Error('Scene editor controls were not found.');
}

const editorPartySpecs = [
  { name: 'Jedediah', role: 'Guide', sampleLine: 'The western sky is changing; keep watch on the ridge.' },
  { name: 'Abigail', role: 'Doctor', sampleLine: 'Keep your water covered; the dust is thick today.' },
  { name: 'Sarah', role: 'Carpenter', sampleLine: 'A sound wheel is worth more than a fast mile.' },
  { name: 'Caleb', role: 'Farmer', sampleLine: 'Watch the oxen; we still have hard miles ahead.' }
];
const party = editorPartySpecs.map((spec, index) => ({
  id: `editor-traveler-${index + 1}`,
  name: spec.name,
  role: spec.role,
  health: 100
}));
const riverLandmarks = trailMilestones.filter((milestone) => milestone.biome === 'river' && milestone.river);

function buildEditorDialogueOverride(speakerSelection, mode, method) {
  if (!speakerSelection || speakerSelection === 'none') return 'none';
  if (speakerSelection.startsWith('traveler-')) {
    const idx = Number(speakerSelection.replace('traveler-', ''));
    const spec = editorPartySpecs[idx] ?? editorPartySpecs[0];
    return {
      speakerId: `editor-traveler-${idx + 1}`,
      speakerName: spec.name,
      speakerRole: spec.role,
      targetType: 'party',
      text: spec.sampleLine
    };
  }
  if (speakerSelection === 'npc') {
    if (mode === 'store-interior' || mode === 'prologue' || mode === 'store-approach') {
      return {
        speakerId: 'shopkeeper',
        speakerName: 'Matt',
        speakerRole: 'Shopkeeper',
        targetType: 'npc',
        text: 'Take plenty of spare parts and flour before you roll west.'
      };
    }
    if (mode === 'crossing' && method === 'ferry') {
      return {
        speakerId: 'ferryOperator',
        speakerName: 'Ferryman',
        speakerRole: 'Ferry Attendant',
        targetType: 'npc',
        text: 'Keep the team steady while I pole us across the main channel.'
      };
    }
    if (mode === 'crossing' && method === 'guide') {
      return {
        speakerId: 'riverGuide',
        speakerName: 'River Guide',
        speakerRole: 'Guide',
        targetType: 'npc',
        text: 'Follow my staff along the gravel bar; the deep trench lies to the left.'
      };
    }
    return {
      speakerId: 'editor-traveler-1',
      speakerName: editorPartySpecs[0].name,
      speakerRole: editorPartySpecs[0].role,
      targetType: 'party',
      text: editorPartySpecs[0].sampleLine
    };
  }
  if (mode === 'store-interior') {
    return {
      speakerId: 'shopkeeper',
      speakerName: 'Matt',
      speakerRole: 'Shopkeeper',
      targetType: 'npc',
      text: 'At least two yokes of oxen and plenty of flour will see you to Fort Kearny.'
    };
  }
  if (mode === 'prologue' || mode === 'store-approach') {
    return {
      speakerId: 'editor-traveler-3',
      speakerName: 'Sarah',
      speakerRole: 'Carpenter',
      targetType: 'party',
      text: 'If we leave, we go together, and we make the best of what we have.'
    };
  }
  if (mode === 'crossing' && method === 'ferry') {
    return {
      speakerId: 'ferryOperator',
      speakerName: 'Ferryman',
      speakerRole: 'Ferry Attendant',
      targetType: 'npc',
      text: 'Hold fast to the wagon brake until we touch the far bank.'
    };
  }
  if (mode === 'crossing' && method === 'guide') {
    return {
      speakerId: 'riverGuide',
      speakerName: 'River Guide',
      speakerRole: 'Guide',
      targetType: 'npc',
      text: 'Keep the oxen on the shoal shelf and stay clear of the dark water.'
    };
  }
  return {
    speakerId: 'editor-traveler-1',
    speakerName: editorPartySpecs[0].name,
    speakerRole: editorPartySpecs[0].role,
    targetType: 'party',
    text: editorPartySpecs[0].sampleLine
  };
}

const state = {
  journeyStarted: true,
  milesTraveled: 570,
  selectedEra: 'oregon_trail',
  weatherOverlay: 'none',
  weatherSeed: Math.floor(Math.random() * 1000000),
  dialogueOverride: 'none',
  currentTrailSnapshot: { biome: 'plains', weather: { tempC: 12, overlay: 'none' } },
  wagon: { oxenYokes: 2, party },
  activeDecision: null,
  riverCrossingAnimation: null,
  landscapeMoving: false,
  landscapeScrollX: 0
};

for (const era of SELECTABLE_ERAS) {
  const option = document.createElement('option');
  option.value = era.id;
  option.textContent = era.label || era.id;
  eraControl.append(option);
}
eraControl.value = state.selectedEra;

for (const [index, spec] of editorPartySpecs.entries()) {
  const option = document.createElement('option');
  option.value = String(index);
  option.textContent = `${spec.name} · ${spec.role}`;
  spriteCharacterControl.append(option);
}

for (const landmark of riverLandmarks) {
  const option = document.createElement('option');
  option.value = landmark.id;
  option.textContent = landmark.name;
  riverLandmarkControl.append(option);
}
riverLandmarkControl.value = riverLandmarks[0]?.id ?? '';

let frame = 0;
let isPlaying = false;
let lastFrameAt = 0;
let lastProgressAt = null;
let animationTimer = null;
let previewDepthLandmarkId = null;
let previewDepthFt = null;
let spriteAnimationTimer = null;
let selectedSpriteFrame = 0;

await preloadBoilerplateSprites();

function stopSpritePlayback() {
  if (spriteAnimationTimer !== null) {
    window.clearInterval(spriteAnimationTimer);
    spriteAnimationTimer = null;
  }
  spritePlayButton.textContent = 'Play cycle';
  spritePlayButton.setAttribute('aria-pressed', 'false');
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
      renderSpriteViewer();
    });
    spriteFrameStrip.append(tile);
  }

  spriteFrameReadout.textContent = `${animationMode.toUpperCase()} · FRAME ${selectedSpriteFrame + 1}/${frameCount} · ${member.name}`;
  renderMaskEditor();
}

function syncDepthPreview(landmark, isRiverCrossing) {
  if (!isRiverCrossing || !landmark) {
    previewDepthLandmarkId = null;
    previewDepthFt = null;
    return;
  }
  if (landmark.id === previewDepthLandmarkId) return;

  previewDepthLandmarkId = landmark.id;
  const landmarkDepthFt = Number(landmark.river.depthFt);
  previewDepthFt = Number.isFinite(landmarkDepthFt) && landmarkDepthFt > 0
    ? landmarkDepthFt
    : DEFAULT_RIVER_DEPTH_FT;
  riverDepthInput.value = String(previewDepthFt);
  riverDepthInput.setCustomValidity('');
  riverDepthInput.removeAttribute('aria-invalid');
}

function handleDepthPreviewInput() {
  const rawValue = riverDepthInput.value.trim();
  const depthFt = Number(rawValue);
  if (!rawValue || !Number.isFinite(depthFt) || depthFt < 0.1) {
    riverDepthInput.setCustomValidity('Enter a water depth of at least 0.1 feet.');
    riverDepthInput.setAttribute('aria-invalid', 'true');
    return;
  }

  riverDepthInput.setCustomValidity('');
  riverDepthInput.removeAttribute('aria-invalid');
  previewDepthFt = depthFt;
  updateState();
}

function resetDepthPreview() {
  previewDepthLandmarkId = null;
  updateState();
}

function updateState() {
  const eraChanged = state.selectedEra !== eraControl.value;
  const mode = sceneModeControl.value;
  const isRiverCrossing = mode === 'crossing';
  const isPrologue = mode === 'prologue';
  const isStoreApproach = mode === 'store-approach';
  const isStoreInterior = mode === 'store-interior';
  const showProgress = isStoreApproach || (isRiverCrossing && methodControl.value !== 'none');
  const method = methodControl.value;
  const progress = Number(progressControl.value);
  const weatherOverlay = weatherOverlayControl ? weatherOverlayControl.value : 'none';
  if (state.weatherOverlay !== weatherOverlay || !state.weatherSeed) {
    state.weatherSeed = Math.floor(Math.random() * 1000000);
  }
  const weatherMeta = getWeatherOverlayMeta(weatherOverlay);
  const speakerSelection = dialogueSpeakerControl ? dialogueSpeakerControl.value : 'none';
  const selectedRiver = riverLandmarks.find((landmark) => landmark.id === riverLandmarkControl.value) ?? null;
  syncDepthPreview(selectedRiver, isRiverCrossing);
  const temperature = biomeControl.value === 'snow' ? -5 : 12;
  if (isPlaying && isRiverCrossing && method === 'none' && weatherOverlay === 'none') {
    isPlaying = false;
    clearInterval(animationTimer);
    animationTimer = null;
  }

  state.journeyStarted = !(isPrologue || isStoreApproach || isStoreInterior);
  state.setupStage = isPrologue || isStoreApproach
    ? 'prologue'
    : isStoreInterior
      ? 'outfitting'
      : undefined;
  state.generalStoreApproachProgress = isStoreApproach ? progress : 0;
  state.selectedEra = eraControl.value;
  syncAllPartyAppearancesToEra(party, state.selectedEra);
  if (eraChanged) renderSpriteViewer();
  state.weatherOverlay = weatherOverlay;
  state.dialogueOverride = buildEditorDialogueOverride(speakerSelection, mode, method);
  state.milesTraveled = isRiverCrossing ? (selectedRiver?.mile ?? 0) : 570;
  state.currentTrailSnapshot = {
    tileId: isRiverCrossing ? selectedRiver?.id : undefined,
    biome: isRiverCrossing ? 'river' : biomeControl.value,
    river: isRiverCrossing && selectedRiver?.river
      ? { ...selectedRiver.river, depthFt: previewDepthFt }
      : null,
    weather: { tempC: temperature, overlay: weatherOverlay }
  };
  state.activeDecision = isRiverCrossing ? { type: 'river-crossing' } : null;
  state.riverCrossingAnimation = isRiverCrossing && method !== 'none'
    ? { method, phase: 'crossing', progress }
    : null;
  state.wagonAnimationFrame = frame;
  state.landscapeMoving = movingControl.checked || (isPlaying && (!isRiverCrossing || method !== 'none'));
  state.landscapeScrollX = frame * 2;
  state.wagon.party = party.slice(0, Number(partySizeControl.value));

  let crossingDescription = `${methodControl.selectedOptions[0].textContent} crossing`;
  if (method === 'none') {
    crossingDescription = 'Waiting together at the near bank';
  } else if (method === 'ferry') {
    crossingDescription = progress < FERRY_BOARDING_END
      ? 'Family and wagon boarding the ferry'
      : progress <= FERRY_CROSSING_END
        ? 'Ferry carrying the party across'
        : progress < 1
          ? 'Family and wagon disembarking on the far bank'
          : 'Ferry crossing complete; party on far bank';
  }

  const baseDescription = isStoreInterior
    ? 'Party at the general store counter'
    : isStoreApproach
      ? 'Party walks through the foreground, then recedes near the store'
      : isPrologue
        ? 'Era-specific home and the party before outfitting'
        : isRiverCrossing
          ? `${selectedRiver?.shortName ?? 'River'} · ${crossingDescription} · ${previewDepthFt ?? 2.8} ft / ${selectedRiver?.river?.flowRate ?? 205} cfs`
          : `${biomeControl.selectedOptions[0].textContent} trail`;
  const weatherSuffix = weatherMeta.id !== 'none' ? ` · ${weatherMeta.label}` : '';

  progressControl.disabled = !showProgress || isPlaying;
  document.querySelector('#method-field').hidden = !isRiverCrossing;
  document.querySelector('#river-landmark-field').hidden = !isRiverCrossing;
  riverDepthField.hidden = !isRiverCrossing;
  document.querySelector('#progress-field').hidden = !showProgress;
  progressReadout.hidden = !showProgress;
  document.querySelector('.progress-track').hidden = !showProgress;
  document.querySelector('#progress-title').textContent = isStoreApproach ? 'Walk to the store' : 'Crossing progress';
  document.querySelector('#progress-start-label').textContent = isStoreApproach ? 'Home' : 'Near bank';
  document.querySelector('#progress-end-label').textContent = isStoreApproach ? 'General store' : 'Far bank';
  sceneTitle.textContent = isStoreInterior
    ? 'General store interior'
    : isStoreApproach
      ? 'Home to General Store'
      : isPrologue
        ? 'Prologue / home'
        : isRiverCrossing
        ? `${selectedRiver?.shortName ?? 'River'} crossing`
          : 'Trail scene';
  sceneDescription.textContent = `${baseDescription}${weatherSuffix}`;
  progressReadout.textContent = `${Math.round(progress * 100)}%`;
  progressFill.style.width = `${progress * 100}%`;
  partyReadout.textContent = `${state.wagon.party.length} ${state.wagon.party.length === 1 ? 'traveler' : 'travelers'}`;
  frameReadout.textContent = `FRAME ${((frame % 6) + 6) % 6 + 1}/6`;
  playButton.disabled = isRiverCrossing && method === 'none' && weatherOverlay === 'none';
  playButton.textContent = isPlaying
    ? 'Pause'
    : isStoreApproach
      ? progress >= 1
        ? 'Walk again'
        : 'Walk to store'
      : isRiverCrossing
        ? progress >= 1
          ? 'Play again'
          : method === 'none'
            ? weatherOverlay !== 'none'
              ? 'Animate storm'
              : 'Choose a method'
            : 'Play crossing'
        : 'Animate scene';
  resetButton.textContent = isStoreApproach
    ? 'Reset walk'
    : isRiverCrossing
      ? 'Reset crossing'
      : 'Reset preview';
  renderGameLandscapeStage(canvas, state, frame);
}

function animate() {
  if (!isPlaying) {
    clearInterval(animationTimer);
    animationTimer = null;
    return;
  }
  const timestamp = performance.now();
  if (timestamp - lastFrameAt >= 150) {
    frame += 1;
    lastFrameAt = timestamp;
  }
  const mode = sceneModeControl.value;
  const isRiverCrossing = mode === 'crossing' && methodControl.value !== 'none';
  const isStoreApproach = mode === 'store-approach';
  if (isRiverCrossing || isStoreApproach) {
    const elapsed = lastProgressAt === null ? 0 : Math.max(0, timestamp - lastProgressAt);
    const duration = isStoreApproach ? STORE_APPROACH_DURATION_MS : CROSSING_DURATION_MS;
    const nextProgress = Math.min(1, Number(progressControl.value) + elapsed / duration);
    progressControl.value = String(nextProgress);
    lastProgressAt = timestamp;
    if (nextProgress >= 1) {
      isPlaying = false;
    }
  }
  updateState();
  if (!isPlaying) {
    clearInterval(animationTimer);
    animationTimer = null;
  }
}

function togglePlayback() {
  if (isPlaying) {
    isPlaying = false;
    clearInterval(animationTimer);
    animationTimer = null;
    updateState();
    return;
  }
  if (
    (sceneModeControl.value === 'crossing' || sceneModeControl.value === 'store-approach')
    && Number(progressControl.value) >= 1
  ) {
    progressControl.value = '0';
  }
  isPlaying = true;
  lastFrameAt = 0;
  lastProgressAt = performance.now();
  animationTimer = setInterval(animate, 1000 / 30);
  updateState();
}

if (weatherOverlayControl) {
  weatherOverlayControl.addEventListener('change', () => {
    state.weatherSeed = Math.floor(Math.random() * 1000000);
    updateState();
  });
}

for (const control of [sceneModeControl, biomeControl, riverLandmarkControl, eraControl, weatherOverlayControl, methodControl, progressControl, partySizeControl, dialogueSpeakerControl, movingControl]) {
  if (!control) continue;
  control.addEventListener('input', updateState);
  control.addEventListener('change', updateState);
}

playButton.addEventListener('click', togglePlayback);
resetButton.addEventListener('click', () => {
  progressControl.value = '0';
  frame = 0;
  if (isPlaying) {
    isPlaying = false;
    clearInterval(animationTimer);
    animationTimer = null;
  }
  updateState();
});

spriteCharacterControl.addEventListener('change', () => {
  stopSpritePlayback();
  selectedSpriteFrame = 0;
  renderSpriteViewer();
});
spriteViewControl.addEventListener('change', () => {
  stopSpritePlayback();
  selectedSpriteFrame = 0;
  renderSpriteViewer();
});
spriteAnimationControl.addEventListener('change', () => {
  stopSpritePlayback();
  selectedSpriteFrame = 0;
  renderSpriteViewer();
});
spritePlayButton.addEventListener('click', () => {
  if (spriteAnimationTimer !== null) {
    stopSpritePlayback();
    return;
  }
  spritePlayButton.textContent = 'Pause cycle';
  spritePlayButton.setAttribute('aria-pressed', 'true');
  spriteAnimationTimer = window.setInterval(() => {
    const memberIndex = Number(spriteCharacterControl.value) || 0;
    const member = party[memberIndex] ?? party[0];
    const frameCount = getCharacterFrameCount(member.appearance, spriteViewControl.value, spriteAnimationControl.value);
    selectedSpriteFrame = (selectedSpriteFrame + 1) % frameCount;
    renderSpriteViewer();
  }, 180);
});

riverDepthInput.addEventListener('input', handleDepthPreviewInput);
riverDepthInput.addEventListener('change', handleDepthPreviewInput);
riverDepthResetButton.addEventListener('click', resetDepthPreview);

let maskDrawMode = 'draw';
let isMaskPainting = false;
let maskHoverCoords = null;

function getActiveMaskTargetInfo() {
  const memberIndex = Number(spriteCharacterControl.value) || 0;
  const member = party[memberIndex] ?? party[0];
  const gender = member?.appearance?.gender === 'female' ? 'female' : 'male';
  const view = spriteViewControl.value;
  const animationMode = spriteAnimationControl.value;
  const frameCount = getCharacterFrameCount(member?.appearance, view, animationMode);
  const activeFrame = ((selectedSpriteFrame % frameCount) + frameCount) % frameCount;
  return { member, gender, view, animationMode, frameIndex: activeFrame, frameCount };
}

function renderMaskEditor() {
  const target = getActiveMaskTargetInfo();
  if (!target.member?.appearance) return;

  const baseGrid = getBaseBoilerplateGrid(target.gender, target.view, target.animationMode, target.frameIndex);
  const activeMaskCoords = getFrameActiveMask(target.gender, target.view, target.animationMode, target.frameIndex, baseGrid);
  const customMask = getFrameCustomMask(target.gender, target.view, target.animationMode, target.frameIndex);
  const isCustom = customMask !== null;

  const maskSet = new Set(activeMaskCoords.map(([x, y]) => `${x},${y}`));
  maskStatusReadout.textContent = `${isCustom ? 'CUSTOM' : 'DEFAULT'} · ${maskSet.size} PIXEL${maskSet.size === 1 ? '' : 'S'}`;
  maskTargetReadout.textContent = `${target.member.name} (${target.gender}) · ${target.view === 'front' ? 'Front' : 'Side'} · ${target.animationMode.toUpperCase()} Frame ${target.frameIndex + 1}/${target.frameCount}`;
  maskOriginInfo.textContent = isCustom ? 'Custom override (saved in browser)' : 'Default heuristic mask';

  const ctx = maskEditorCanvas.getContext('2d');
  if (!ctx) return;
  const w = maskEditorCanvas.width;
  const h = maskEditorCanvas.height;
  const cellSize = w / 32;

  ctx.clearRect(0, 0, w, h);

  // Background checkerboard
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? '#09130c' : '#040906';
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }

  // Draw base sprite pixels
  if (baseGrid) {
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 32; x++) {
        const color = baseGrid[y]?.[x];
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }
  }

  // Draw subtle grid lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= 32; i++) {
    ctx.moveTo(i * cellSize, 0);
    ctx.lineTo(i * cellSize, h);
    ctx.moveTo(0, i * cellSize);
    ctx.lineTo(w, i * cellSize);
  }
  ctx.stroke();

  // Draw masked pixels (semi-transparent bright cyan/green overlay with crisp border)
  for (const [mx, my] of activeMaskCoords) {
    if (mx < 0 || mx >= 32 || my < 0 || my >= 32) continue;
    ctx.fillStyle = 'rgba(0, 255, 128, 0.45)';
    ctx.fillRect(mx * cellSize, my * cellSize, cellSize, cellSize);
    ctx.strokeStyle = 'rgba(0, 255, 128, 0.9)';
    ctx.lineWidth = 1;
    ctx.strokeRect(mx * cellSize + 0.5, my * cellSize + 0.5, cellSize - 1, cellSize - 1);
  }

  // Hover cursor highlight
  if (maskHoverCoords) {
    const { x: hx, y: hy } = maskHoverCoords;
    if (hx >= 0 && hx < 32 && hy >= 0 && hy < 32) {
      ctx.strokeStyle = '#f7e26b';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(hx * cellSize + 0.5, hy * cellSize + 0.5, cellSize - 1, cellSize - 1);

      const isMasked = maskSet.has(`${hx},${hy}`);
      const basePixel = baseGrid?.[hy]?.[hx] || 'transparent';
      maskPixelInfo.textContent = `X: ${hx}, Y: ${hy} | ${isMasked ? 'MASKED' : 'UNMASKED'} (${basePixel})`;
    }
  }

  // Render clothed preview with fitted outfits and Z-mask applied
  const clothedGrid = getCharacterFrameGrid(
    target.member.appearance,
    target.view,
    target.animationMode,
    target.frameIndex
  );
  renderCharacterGridToCanvas(maskPreviewCanvas, clothedGrid, {
    bgColor: '#020904',
    includeBackdrop: maskPreviewBackdrop.checked,
    backdropId: state.currentTrailSnapshot?.biome || 'prairie'
  });
  maskOutfitSummary.textContent = summarizeMemberOutfit(target.member);
}

function applyMaskPixel(x, y, mode) {
  if (x < 0 || x >= 32 || y < 0 || y >= 32) return;
  const target = getActiveMaskTargetInfo();
  const baseGrid = getBaseBoilerplateGrid(target.gender, target.view, target.animationMode, target.frameIndex);
  const currentCoords = getFrameActiveMask(target.gender, target.view, target.animationMode, target.frameIndex, baseGrid);

  const maskSet = new Set(currentCoords.map(([cx, cy]) => `${cx},${cy}`));
  const key = `${x},${y}`;
  if (mode === 'draw') {
    if (maskSet.has(key)) return;
    maskSet.add(key);
  } else {
    if (!maskSet.has(key)) return;
    maskSet.delete(key);
  }

  const newCoords = Array.from(maskSet).map((k) => k.split(',').map(Number));
  setFrameCustomMask(target.gender, target.view, target.animationMode, target.frameIndex, newCoords);

  renderMaskEditor();
  renderSpriteViewer();
  updateState();
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
  evt.preventDefault();
  isMaskPainting = true;
  const mode = evt.button === 2 || evt.shiftKey ? 'erase' : maskDrawMode;
  const { x, y } = getCanvasCellCoords(evt);
  applyMaskPixel(x, y, mode);
});

maskEditorCanvas.addEventListener('mousemove', (evt) => {
  const { x, y } = getCanvasCellCoords(evt);
  maskHoverCoords = { x, y };
  if (isMaskPainting) {
    const mode = evt.buttons === 2 || evt.shiftKey ? 'erase' : maskDrawMode;
    applyMaskPixel(x, y, mode);
  } else {
    renderMaskEditor();
  }
});

maskEditorCanvas.addEventListener('contextmenu', (evt) => {
  evt.preventDefault();
});

window.addEventListener('mouseup', () => {
  if (isMaskPainting) {
    isMaskPainting = false;
  }
});

maskEditorCanvas.addEventListener('mouseleave', () => {
  maskHoverCoords = null;
  maskPixelInfo.textContent = 'X: --, Y: --';
  renderMaskEditor();
});

maskModeDraw.addEventListener('click', () => {
  maskDrawMode = 'draw';
  maskModeDraw.classList.add('active');
  maskModeDraw.setAttribute('aria-pressed', 'true');
  maskModeErase.classList.remove('active');
  maskModeErase.setAttribute('aria-pressed', 'false');
});

maskModeErase.addEventListener('click', () => {
  maskDrawMode = 'erase';
  maskModeErase.classList.add('active');
  maskModeErase.setAttribute('aria-pressed', 'true');
  maskModeDraw.classList.remove('active');
  maskModeDraw.setAttribute('aria-pressed', 'false');
});

maskBtnReset.addEventListener('click', () => {
  const target = getActiveMaskTargetInfo();
  resetFrameCustomMask(target.gender, target.view, target.animationMode, target.frameIndex);
  renderMaskEditor();
  renderSpriteViewer();
  updateState();
});

maskBtnClear.addEventListener('click', () => {
  const target = getActiveMaskTargetInfo();
  setFrameCustomMask(target.gender, target.view, target.animationMode, target.frameIndex, []);
  renderMaskEditor();
  renderSpriteViewer();
  updateState();
});

maskBtnCopy.addEventListener('click', async () => {
  const target = getActiveMaskTargetInfo();
  const baseGrid = getBaseBoilerplateGrid(target.gender, target.view, target.animationMode, target.frameIndex);
  const coords = getFrameActiveMask(target.gender, target.view, target.animationMode, target.frameIndex, baseGrid);
  try {
    await navigator.clipboard.writeText(JSON.stringify(coords));
    maskBtnCopy.textContent = 'Copied!';
    setTimeout(() => {
      maskBtnCopy.textContent = 'Copy JSON';
    }, 1200);
  } catch (err) {
    console.error('Failed to copy to clipboard', err);
  }
});

maskBtnPaste.addEventListener('click', () => {
  const input = window.prompt('Paste coordinate array JSON (e.g. [[14, 16], [15, 16]]):');
  if (!input) return;
  try {
    const coords = JSON.parse(input);
    if (!Array.isArray(coords)) throw new Error('Expected an array of [x, y] coordinates');
    const target = getActiveMaskTargetInfo();
    setFrameCustomMask(target.gender, target.view, target.animationMode, target.frameIndex, coords);
    renderMaskEditor();
    renderSpriteViewer();
    updateState();
  } catch (err) {
    alert('Invalid JSON coordinate array: ' + err.message);
  }
});

function showSaveStatus(message, isError = false) {
  maskSaveStatus.textContent = message;
  maskSaveStatus.className = `mask-save-status ${isError ? 'error' : 'success'}`;
  maskSaveStatus.hidden = false;
  setTimeout(() => {
    maskSaveStatus.hidden = true;
  }, 4000);
}

function downloadMasksJsonFile() {
  const data = exportAllMaskOverrides();
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'custom-sprite-masks.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

maskBtnSaveProject.addEventListener('click', async () => {
  maskBtnSaveProject.disabled = true;
  maskBtnSaveProject.textContent = '⏳ Saving...';
  try {
    const res = await saveCustomMasksToServer();
    showSaveStatus(`Saved ${res.count ?? Object.keys(getAllCustomMasksObject()).length} frame mask(s) to custom-sprite-masks.js & .json!`, false);
  } catch (err) {
    console.warn('Could not save via dev server endpoint, falling back to file download:', err);
    downloadMasksJsonFile();
    showSaveStatus('Saved via download (custom-sprite-masks.json)!', false);
  } finally {
    maskBtnSaveProject.disabled = false;
    maskBtnSaveProject.textContent = '💾 Save to Project';
  }
});

maskBtnDownload.addEventListener('click', () => {
  downloadMasksJsonFile();
  showSaveStatus('Downloaded custom-sprite-masks.json!', false);
});

maskBtnLoadFile.addEventListener('click', () => {
  maskFileInput.click();
});

maskFileInput.addEventListener('change', async (evt) => {
  const file = evt.target?.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const ok = importMaskOverrides(text);
    if (!ok) throw new Error('Invalid mask file format');
    renderMaskEditor();
    renderSpriteViewer();
    updateState();
    showSaveStatus(`Loaded masks from ${file.name}!`, false);
  } catch (err) {
    showSaveStatus(`Failed to load file: ${err.message}`, true);
  } finally {
    maskFileInput.value = '';
  }
});

maskPreviewBackdrop.addEventListener('change', () => {
  renderMaskEditor();
});

updateState();
renderSpriteViewer();
renderMaskEditor();
