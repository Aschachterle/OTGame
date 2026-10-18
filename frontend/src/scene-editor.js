import { SELECTABLE_ERAS } from './character-designer.js';
import { trailMilestones } from './state.js';
import {
  FERRY_BOARDING_END,
  FERRY_CROSSING_END,
  getWeatherOverlayMeta,
  renderGameLandscapeStage
} from './scene-renderer.js?v=pixi_final_3';
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

if (
  !(canvas instanceof HTMLCanvasElement)
  || !(riverDepthField instanceof HTMLElement)
  || !(riverDepthInput instanceof HTMLInputElement)
  || !(riverDepthResetButton instanceof HTMLButtonElement)
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
  frameReadout.textContent = `FRAME ${frame % 4}`;
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

riverDepthInput.addEventListener('input', handleDepthPreviewInput);
riverDepthInput.addEventListener('change', handleDepthPreviewInput);
riverDepthResetButton.addEventListener('click', resetDepthPreview);

updateState();
