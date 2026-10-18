import {
  MAX_STRANGENESS_LEVEL,
  OUTFITTING_CATALOG,
  STARTING_CASH,
  TOTAL_TRAIL_MILES,
  WAGON_CAPACITY,
  fallbackTile,
  getCargoWeightTier,
  getCurrentMilestone,
  getEffectiveStrangenessLevel,
  getJourneyPhase,
  getMilesToNextMilestone,
  getNextMilestone,
  getOutfittingTotals,
  getStartingCashForState,
  locationNameForTile,
  paceLabel,
  rationsLabel,
  resourceUnitsLabel,
  trailMilestones,
  toSupplySnapshot,
  wagonLoadWeight
} from './state.js';
import {
  ARCHETYPE_OPTIONS,
  BASE_BODY_TEMPLATES,
  CATEGORIES,
  GENDERS,
  INITIAL_CLOTHING_BOILERPLATE,
  PRESET_COLOR_DYES,
  SELECTABLE_ERAS,
  SKIN_TONES,
  buildNeutralCompositeGrid,
  getCharacterFrameGrid,
  getEraById,
  getPresetsForCategoryAndEra,
  renderCharacterGridToCanvas,
  summarizeMemberOutfit
} from './character-designer.js';
import {
  getWeatherOverlayMeta,
  renderGameLandscapeStage,
  resolveActiveWeatherOverlay
} from './scene-renderer.js?v=pixi_final_3';

function shortHash(value = '', size = 8) {
  const normalized = String(value ?? '');
  return normalized.length > size ? normalized.slice(0, size) : normalized || '--------';
}

function clampRatio(value, max) {
  return Math.max(0, Math.min(1, max > 0 ? value / max : 0));
}

function meterTone(ratio) {
  if (ratio <= 0.25) return 'danger';
  if (ratio <= 0.55) return 'warning';
  return 'safe';
}

function buildLedMeter(value, max, segments = 12) {
  const ratio = clampRatio(value, max);
  const active = Math.round(ratio * segments);
  const tone = meterTone(ratio);
  return `
    <div class="led-meter" aria-hidden="true">
      ${Array.from({ length: segments }, (_, index) => `
        <span class="led-bar ${index < active ? `active ${tone}` : ''}"></span>
      `).join('')}
    </div>
  `;
}

function escapeHtml(text = '') {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function actionProjection(action, state) {
  const text = {
    'press-on': 'Continue west along the trail. Gains miles based on pace, weather, and terrain.',
    camp: 'Make camp. Recovers health and morale, still consumes time and supplies.',
    hunt: 'Hunt for provisions. Can gain food, but costs a day and may vary by biome.',
    gather: 'Gather supplies. Usually gains resources, advances one day, can trigger shortages elsewhere.',
    treat: 'Treat illness. Spends medicine if available, stabilizes health.',
    trade: 'Trade ledger action. Swaps wood for medicine and records a signed commitment.',
    repair: 'Repair the wagon. Reinforces broken parts using wood.',
    scout: 'Send the Guide ahead to inspect the next stretch of trail.'
  };
  if (action === 'scout') {
    const guide = state.wagon.party?.find((member) => member.role === 'Guide');
    return `Send ${guide?.name ?? 'the Guide'} ahead to inspect the next stretch of trail.`;
  }
  return text[action] ?? 'Trail action';
}

const CHARACTER_DELAY_MS = 10;
const COMMA_DELAY_MS = 10;
const PERIOD_DELAY_MS = 10;
const LINE_DELAY_MS = 150;

function splitSentences(text = '') {
  return String(text)
    .match(/[^.!?]+[.!?]*/g)
    ?.map((sentence) => sentence.trim())
    .filter(Boolean) ?? [];
}

function normalizeLine(text = '') {
  return String(text).replace(/\s+/g, ' ').trim();
}

function prefixTerminalLine(text = '') {
  const normalized = normalizeLine(text);
  if (!normalized) return '';
  return normalized.startsWith('>') ? normalized : `> ${normalized}`;
}

function atmosphericLine(locationName, weather) {
  const weatherMood = weather.rain > 70
    ? 'rain needles the canvas and turns every board slick'
    : weather.tempC < 0
      ? 'the cold bites through wool and stiffens every joint'
      : weather.windKph > 28
        ? 'a restless wind worries the wagon canvas and the oxen alike'
        : 'the air feels calm enough, though the trail never truly relaxes';
  return `${locationName} offers no comfort: ${weatherMood}.`;
}

function choiceRangeText(options = []) {
  const keys = options
    .map((option) => option?.hotkey)
    .filter(Boolean);
  if (!keys.length) return 'a number';
  if (keys.length === 1) return keys[0];
  if (keys.length === 2) return `${keys[0]} or ${keys[1]}`;
  return `${keys.slice(0, -1).join(', ')}, or ${keys.at(-1)}`;
}

function chronicleLinesForState(state, locationName, weather, supplies) {
  const selectedTile = state.currentTrailSnapshot ?? fallbackTile;
  const biome = (selectedTile.biome ?? 'frontier').toUpperCase();
  const eraMeta = getEraById(state.selectedEra);
  if (state.turnPhase === 'prologue') {
    const paragraphs = Array.isArray(state.prologueParagraphs) ? state.prologueParagraphs : [];
    const lines = [
      '=============================================================================',
      `=== OPENING PROLOGUE // ${eraMeta.label.toUpperCase()} -> 1848 MISSOURI ===`,
      '=============================================================================',
      `[${state.prologueHeadline || 'THE ARRIVAL AT THE GENERAL STORE'}]`,
      ...paragraphs.map((paragraph) => prefixTerminalLine(paragraph)),
      '',
      `ORIGIN ERA: ${eraMeta.label.toUpperCase()} // STRANGENESS BASELINE: ${getEffectiveStrangenessLevel(state)}/10`,
      '',
      '-----------------------------------------------------------------------------',
      '[SPACE / ENTER / CLICK] WALK TO GENERAL STORE & GET SUPPLIES >>',
      '============================================================================='
    ];
    return lines.map((line) => normalizeLine(line));
  }

  if (state.turnPhase === 'results') {
    const summary = state.lastActionSummary;
    const lines = [
      '=============================================================================',
      `=== MOVE RESULTS // DAY ${state.day} ==================================================`,
      '============================================================================='
    ];
    if (summary) {
      lines.push(prefixTerminalLine(`${summary.title}${summary.location ? ` at ${summary.location}` : ''}`));
      if (summary.detail) lines.push(prefixTerminalLine(summary.detail));
      const metrics = (summary.metrics ?? []).filter((metric) => metric?.label && metric?.delta);
      if (metrics.length) {
        metrics.forEach((metric) => {
          const sign = metric.tone === 'positive' ? '+' : metric.tone === 'negative' ? '-' : '=';
          lines.push(`[STAT ${sign}] ${metric.label.toUpperCase()} ${metric.delta}`);
        });
      }
    } else {
      lines.push(prefixTerminalLine(state.statusMessage || 'The move is resolved.'));
    }
    lines.push('');
    lines.push('-----------------------------------------------------------------------------');
    lines.push('[SPACE / ENTER / CLICK] CONTINUE >>');
    lines.push('=============================================================================');
    return lines.map((line) => normalizeLine(line));
  }

  if (state.turnPhase === 'resolving') {
    return [];
  }

  if (state.turnPhase === 'dispatch' && state.narrationLoading) {
    return [
      '=============================================================================',
      `=== DAY ${state.day} // ${locationName.toUpperCase()} // ${biome} // MILE ${state.milesTraveled} OF ${TOTAL_TRAIL_MILES} ===`,
      '============================================================================='
    ].map((line) => normalizeLine(line));
  }

  const lines = [];
  const nextMilestone = getNextMilestone(state);
  const milesToNext = getMilesToNextMilestone(state);

  lines.push(`=== DAY ${state.day} // ${locationName.toUpperCase()} // ${biome} // MILE ${state.milesTraveled} OF ${TOTAL_TRAIL_MILES} ===`);

  lines.push('[STORY]');
  const narration = state.latestNarration;
  const explicitLines = Array.isArray(narration?.lines)
    ? narration.lines.map(normalizeLine).filter(Boolean)
    : [];
  const storySentences = explicitLines.length >= 2
    ? explicitLines
    : splitSentences(state.narrationText).map(normalizeLine).filter(Boolean);
  if (storySentences.length) {
    storySentences.forEach((line) => lines.push(prefixTerminalLine(line)));
  } else {
    lines.push(prefixTerminalLine(atmosphericLine(locationName, weather)));
  }
  if (narration?.surrealMutation) {
    const mutation = narration.surrealMutation;
    const pending = state.pendingSurrealEffect?.mutationKey === mutation.mutationKey;
    lines.push(prefixTerminalLine(`[REALITY MUTATION // ${mutation.severity.toUpperCase()}] ${mutation.title}`));
    lines.push(prefixTerminalLine(mutation.manifestation));
    lines.push(prefixTerminalLine(`GAMEPLAY TWIST: ${mutation.gameplayTwist} ${pending ? '(pending next action)' : '(resolved)'}`));
  }

  lines.push('');
  lines.push('[NEXT STEPS]');
  if (nextMilestone) {
    lines.push(prefixTerminalLine(`Waypoint: ${nextMilestone.shortName} — ${milesToNext} miles ahead.`));
  } else {
    lines.push(prefixTerminalLine('Waypoint: Willamette Valley reached.'));
  }
  const nextAction = state.wagon.wagonParts.brokenPart
    ? `Repair the ${state.wagon.wagonParts.brokenPart.toLowerCase()} before moving.`
    : state.wagon.water < 10 || state.wagon.food < 10
      ? 'Gather provisions now; food or water is critically low.'
      : state.wagon.health < 45 && state.wagon.medicine > 0
        ? 'Treat the most vulnerable party member before traveling.'
        : state.wagon.morale < 35
          ? 'Make camp to stabilize morale before the next hard push.'
          : state.journeyCompleted
            ? 'The trail is complete. Review the ledger and choose your next settlement action.'
            : `Focus: Press On at ${paceLabel(state.wagon.pace).toLowerCase()} pace to reach the next waypoint.`;
  lines.push(prefixTerminalLine(nextAction));
  lines.push(prefixTerminalLine(`Stores: ${supplies.foodRations} rations • ${supplies.waterGallons} gal water • ${supplies.firewoodBundles} wood • ${supplies.medicineDoses} medicine • ${supplies.ammunitionBoxes} ammo.`));

  const decision = state.activeDecision;
  if (decision) {
    lines.push('');
    lines.push(`[${(decision.eyebrow ?? 'TRAIL DILEMMA').toUpperCase()}: ${decision.title.toUpperCase()}]`);
    if (decision.body) {
      lines.push(prefixTerminalLine(decision.body));
    }
    for (const option of decision.options ?? []) {
      lines.push(`[${option.hotkey ?? '?'}] ${option.label} — ${option.detail}`);
    }
    lines.push(state.pendingMetaDialogue
      ? 'Type your response to the Operator and press Enter to seal it in the ledger.'
      : `Type ${choiceRangeText(decision.options)} and press Enter.`);
  }

  return lines.map((l) => normalizeLine(l));
}

function trailRibbonMarkup(state) {
  const currentMilestone = getCurrentMilestone(state);
  const nextMilestone = getNextMilestone(state);
  const milesToNext = getMilesToNextMilestone(state);
  const progressPercent = Math.round(((state.milesTraveled ?? 0) / TOTAL_TRAIL_MILES) * 100);
  const stops = trailMilestones.map((milestone, index) => {
    if (index < state.currentMilestoneIndex) {
      return `<span class="trail-stop visited">[✓ ${escapeHtml(milestone.shortName)}]</span>`;
    }
    if (index === state.currentMilestoneIndex) {
      return `<span class="trail-stop current">[* ${escapeHtml(milestone.shortName)} *]</span>`;
    }
    return `<span class="trail-stop upcoming">[  ${escapeHtml(milestone.shortName)}]</span>`;
  }).join('<span class="trail-connector">──</span>');

  return `
    <div class="trail-ribbon">
      <div class="trail-ribbon-top">OVERLAND TRAIL PROGRESS // ${state.milesTraveled} / ${TOTAL_TRAIL_MILES} MILES (${progressPercent}%)</div>
      <div class="trail-ribbon-track">${stops}</div>
      <div class="trail-ribbon-bottom">
        <span>Miles Traveled: ${state.milesTraveled} / ${TOTAL_TRAIL_MILES}</span>
        <span>Next Stop: ${nextMilestone ? `${nextMilestone.shortName} (${milesToNext} miles ahead)` : `${currentMilestone.shortName} reached`}</span>
      </div>
    </div>
  `;
}

function landscapeStageStatusLabel(state) {
  const eraMeta = getEraById(state.selectedEra);
  const weatherMeta = getWeatherOverlayMeta(resolveActiveWeatherOverlay(state));
  const weatherTag = weatherMeta.id !== 'none' ? ` // ${weatherMeta.shortLabel}` : '';
  const crossingMethodLabels = {
    ford: 'FORD',
    caulk: 'CAULK & FLOAT',
    ferry: 'FERRY',
    guide: 'GUIDED FORD'
  };
  if (state.riverCrossingAnimation) {
    const method = crossingMethodLabels[state.riverCrossingAnimation.method] ?? 'RIVER CROSSING';
    const base = state.riverCrossingAnimation.phase === 'departed'
      ? `FAR BANK // ${method} COMPLETE`
      : `RIVER CROSSING // ${getCurrentMilestone(state).shortName.toUpperCase()} // ${method}`;
    return `${base}${weatherTag}`;
  }
  if (state.activeDecision?.type === 'river-crossing') {
    const optionLabels = { ford: 'FORD', caulk: 'CAULK & FLOAT', ferry: 'FERRY', guide: 'RIVER GUIDE', wait: 'WAIT' };
    const availableOptions = state.activeDecision.options
      .map((option) => optionLabels[option.id])
      .filter(Boolean)
      .join(' · ');
    return `RIVERBANK // ${getCurrentMilestone(state).shortName.toUpperCase()} // ${availableOptions}${weatherTag}`;
  }
  if (!state.journeyStarted) {
    if (state.setupStage === 'outfitting') {
      const hasOxen = (state.outfittingCart?.oxenYokes ?? 0) > 0;
      return `STAGE: INDEPENDENCE GENERAL STORE // ${hasOxen ? 'OXEN & SCHOONER HITCHED' : 'SELECT OXEN YOKES TO HITCH WAGON'}${weatherTag}`;
    }
    if (state.landscapeMoving) {
      return `STAGE: WALKING FROM ${eraMeta.label.toUpperCase()} HOME TO INDEPENDENCE GENERAL STORE...${weatherTag}`;
    }
    return `STAGE: ${eraMeta.label.toUpperCase()} HOME -> INDEPENDENCE GENERAL STORE (ON FOOT)${weatherTag}`;
  }
  const currentMilestone = getCurrentMilestone(state);
  if (state.landscapeMoving || state.travelAnimationActive) {
    return `CARAVAN IN MOTION // ${currentMilestone.shortName.toUpperCase()} // ${state.wagon.oxenYokes} YOKES HITCHED${weatherTag}`;
  }
  return `CARAVAN STAGE // ${currentMilestone.shortName.toUpperCase()} // ${eraMeta.label.toUpperCase()} CREW + OXEN CART${weatherTag}`;
}

function landscapeStageMarkup(state) {
  return `
    <div class="landscape-stage-wrap" aria-label="8-bit landscape caravan stage">
      <div class="landscape-stage-header">
        <span data-landscape-caption>${escapeHtml(landscapeStageStatusLabel(state))}</span>
        <span>320×96 PIXEL CARAVAN MONITOR</span>
      </div>
      <div class="landscape-canvas-frame">
        <canvas id="landscape-stage-canvas" width="320" height="96"></canvas>
      </div>
    </div>
  `;
}

function renderChronicleMarkup(lines, isStreaming, localReadAloudEnabled) {
  return lines.map((line, index) => {
    const suffix = isStreaming && index === lines.length - 1 ? '<span class="teletype-cursor" aria-hidden="true">█</span>' : '';
    const classes = ['teletype-line'];
    if (!line) classes.push('spacer');
    if (line.startsWith('===')) {
      classes.push('session-header');
    } else if (line.startsWith('[ACTION REPORT')) {
      classes.push('action-report-header');
    } else if (line.startsWith('[EXPEDITION DISPATCH') || line.startsWith('[DISPATCH')) {
      classes.push('dispatch-header');
    } else if (line.startsWith('[TRAIL STATUS') || line.startsWith('[TRAIL REPORT') || line.startsWith('[STATUS NOTE')) {
      classes.push('status-header');
    } else if (line === '[STORY]') {
      classes.push('story-section-header');
    } else if (line === '[MOVE RESULTS]') {
      classes.push('results-section-header');
    } else if (line === '[NEXT STEPS]') {
      classes.push('next-steps-section-header');
    } else if (line.startsWith('[STAT +]')) {
      classes.push('status-change-positive');
    } else if (line.startsWith('[STAT -]')) {
      classes.push('status-change-negative');
    } else if (line.startsWith('[STAT =]')) {
      classes.push('status-change-neutral');
    } else if (line.startsWith('[') && !line.match(/^\[\d+\]/)) {
      classes.push('dilemma-header');
    } else if (line.startsWith('> OUTCOME:')) {
      classes.push('impact');
    } else if (line.startsWith('>')) {
      classes.push('prose');
    }

    const choiceMatch = line.match(/^\[(\d+)\]/);
    const isSectionHeader = ['[STORY]', '[MOVE RESULTS]', '[NEXT STEPS]'].includes(line);
    const canReadLine = Boolean(line.trim()) && !isSectionHeader && (!isStreaming || index < lines.length - 1);
    const readButton = canReadLine && localReadAloudEnabled
      ? `<button class="teletype-read-btn" type="button" data-speak-index="${index}" aria-label="Read this line aloud" title="Read this line aloud">♪</button>`
      : '';
    const lineContent = `<span class="teletype-line-copy">${escapeHtml(line)}${suffix}</span>${readButton}`;

    if (choiceMatch) {
      classes.push('choice');
      return `<div class="${classes.join(' ')}" data-choice-key="${choiceMatch[1]}" style="cursor: pointer;">${lineContent}</div>`;
    }
    return `<div class="${classes.join(' ')}">${lineContent}</div>`;
  }).join('');
}

function chronicleLineForSpeech(line) {
  let spokenLine = line.replace(/^>\s*/, '');
  const choiceMatch = spokenLine.match(/^\[(\d+)\]\s*/);
  if (choiceMatch) {
    spokenLine = spokenLine.replace(/^\[\d+\]\s*/, `Option ${choiceMatch[1]}: `);
  }
  spokenLine = spokenLine
    .replace(/^\[STAT \+\]\s*/i, 'Positive change: ')
    .replace(/^\[STAT -\]\s*/i, 'Negative change: ')
    .replace(/^\[STAT =\]\s*/i, 'Status: ')
    .replace(/^\[([^\]]+)\]\s*/, '$1: ')
    .replace(/^===\s*/, '')
    .replace(/\s*===\s*$/, '')
    .replace(/\s*\/\/\s*/g, '. ');
  return spokenLine.trim();
}

function wagonMetrics(state) {
  const { wagon } = state;
  const supplies = toSupplySnapshot(wagon);
  const startingCash = getStartingCashForState(state);
  return {
    supplies,
    load: wagonLoadWeight(wagon),
    loadTier: getCargoWeightTier(wagonLoadWeight(wagon)),
    metrics: [
      { label: 'HEALTH', value: wagon.health, max: 100, text: `${wagon.health}%` },
      { label: 'MORALE', value: wagon.morale, max: 100, text: `${wagon.morale}%` },
      { label: 'CASH', value: wagon.cash, max: Math.max(startingCash, wagon.cash, STARTING_CASH), text: `$${wagon.cash.toFixed(2)}` },
      { label: 'FOOD', value: supplies.foodRations, max: Math.max(400, supplies.foodRations), text: `${supplies.foodRations} rations` },
      { label: 'WATER', value: supplies.waterGallons, max: Math.max(80, supplies.waterGallons), text: `${supplies.waterGallons} gal` },
      { label: 'WOOD', value: supplies.firewoodBundles, max: Math.max(12, supplies.firewoodBundles), text: `${supplies.firewoodBundles} bundles` },
      { label: 'MEDICINE', value: supplies.medicineDoses, max: 20, text: `${supplies.medicineDoses} doses` },
      { label: 'AMMO', value: supplies.ammunitionBoxes, max: 24, text: `${supplies.ammunitionBoxes} boxes` },
      { label: 'CARGO', value: Math.min(wagonLoadWeight(wagon), WAGON_CAPACITY), max: WAGON_CAPACITY, text: `${Math.round(wagonLoadWeight(wagon))} lbs` }
    ]
  };
}

export function createUI() {
  const refs = {
    mapEl: document.querySelector('#map'),
    worldMetaEl: document.querySelector('#world-meta'),
    selectedTileEl: document.querySelector('#selected-tile'),
    wagonStateEl: document.querySelector('#wagon-state'),
    objectiveCardEl: document.querySelector('#objective-card'),
    storyCardEl: document.querySelector('#story-card'),
    hazardBannerEl: document.querySelector('#hazard-banner'),
    actionSummaryEl: document.querySelector('#action-summary'),
    statusBannerEl: document.querySelector('#status-banner'),
    eventLogEl: document.querySelector('#event-log'),
    refreshBtn: document.querySelector('#refresh-btn'),
    journeyModalEl: document.querySelector('#journey-modal'),
    journeyModalCardEl: document.querySelector('#journey-modal-card'),
    loaderEl: document.querySelector('#journey-loader'),
    menuNewGameBtn: document.querySelector('#menu-new-game'),
    menuBeginJourneyBtn: document.querySelector('#menu-begin-journey'),
    menuLedgerJumpBtn: document.querySelector('#menu-ledger-jump'),
    menuPlayVoiceBtn: document.querySelector('#menu-play-voice'),
    menuCloudToggle: document.querySelector('#menu-cloud-toggle'),
    menuAutoReadToggle: document.querySelector('#menu-auto-read-toggle'),
    menuStorySourceToggle: document.querySelector('#menu-story-source-toggle'),
    menuStrangenessOverride: document.querySelector('#menu-strangeness-override'),
    menuWeatherOverlay: document.querySelector('#menu-weather-overlay'),
    menuLandmarkWarpSelect: document.querySelector('#menu-landmark-warp-select'),
    menuLandmarkWarpButton: document.querySelector('#menu-warp-before-landmark'),
    menuVoiceSelect: document.querySelector('#menu-voice-select')
  };

  const handlers = {
    onAction: () => {},
    onContinueDispatch: () => {},
    onStartTrail: () => {},
    onBeginJourney: () => {},
    onSetupInteraction: () => {},
    onRegisterParty: () => {},
    onSelectPartyEra: () => {},
    onSelectCreatorMember: () => {},
    onUpdateCreatorMember: () => {},
    onOutfittingQuantityChange: () => {},
    onRecommendedOutfit: () => {},
    onBackToRegister: () => {},
    onRefresh: () => {},
    onJourneyLlmToggle: () => {},
    onJourneyCloudToggle: () => {},
    onJourneyAutoReadToggle: () => {},
    onNewGame: () => {},
    onBeginJourneyFromMenu: () => {},
    onLedgerJump: () => {},
    onReadNarration: () => {},
    onReadText: () => {},
    onStorySourceToggle: () => {},
    onStrangenessOverrideChange: () => {},
    onWeatherOverlayChange: () => {},
    onWarpBeforeLandmark: () => {},
    onVoiceChange: () => {},
    onPaceChange: () => {},
    onRationsChange: () => {},
    onDecisionChoice: () => {},
    onTileSelect: () => {},
    onUiClick: () => {},
    onHazardAlert: () => {}
  };

  let lastHazardKey = '';
  let activeMenuName = null;
  let lastRenderedState = null;
  let animTick = 0;

  const chroniclePlayback = {
    key: '',
    fullLines: [],
    renderedLines: [],
    lineIndex: 0,
    charIndex: 0,
    streaming: false,
    localReadAloudEnabled: true,
    timer: null
  };
  const terminalDecisionInput = {
    decisionKey: '',
    buffer: '',
    feedback: '',
    mode: 'choice'
  };

  function invokeUiClick(kind) {
    handlers.onUiClick(kind);
  }

  function clearChronicleTimer() {
    if (chroniclePlayback.timer) {
      window.clearTimeout(chroniclePlayback.timer);
      chroniclePlayback.timer = null;
    }
  }

  let narrationLoadingActive = false;
  let activeChroniclePhase = 'dispatch';

  function renderLoaderMarkup() {
    return `
      <div class="teletype-loader" role="status" aria-live="polite">
        <span class="loader-label">&gt; RECEIVING DISPATCH</span>
        <span class="loader-dots" aria-hidden="true">
          <span class="dot">●</span>
          <span class="dot">●</span>
          <span class="dot">●</span>
        </span>
      </div>
    `;
  }

  function setNarrationLoading(isLoading, state) {
    narrationLoadingActive = Boolean(isLoading);
    if (state) {
      state.narrationLoading = narrationLoadingActive;
    }
    const { screenEl } = chronicleElements();
    const loaderEl = screenEl?.querySelector('.teletype-loader-shell');
    if (loaderEl instanceof HTMLElement) {
      const showLoader = narrationLoadingActive && activeChroniclePhase !== 'results';
      loaderEl.hidden = !showLoader;
      loaderEl.innerHTML = showLoader ? renderLoaderMarkup() : '';
      if (showLoader && screenEl instanceof HTMLElement) {
        screenEl.scrollTop = screenEl.scrollHeight;
      }
    }
  }

  function chronicleElements() {
    const logEl = refs.mapEl?.querySelector('.teletype-log');
    const screenEl = refs.mapEl?.querySelector('.teletype-screen');
    return { logEl, screenEl };
  }

  function paintChronicle(autoScroll = true) {
    const { logEl, screenEl } = chronicleElements();
    if (!(logEl instanceof HTMLElement)) return;
    logEl.innerHTML = renderChronicleMarkup(
      chroniclePlayback.renderedLines,
      chroniclePlayback.streaming,
      chroniclePlayback.localReadAloudEnabled
    );
    const loaderEl = screenEl?.querySelector('.teletype-loader-shell');
    if (loaderEl instanceof HTMLElement) {
      const showLoader = narrationLoadingActive && activeChroniclePhase !== 'results';
      loaderEl.hidden = !showLoader;
      loaderEl.innerHTML = showLoader ? renderLoaderMarkup() : '';
    }
    const promptShellEl = screenEl?.querySelector('.teletype-prompt-shell');
    if (promptShellEl instanceof HTMLElement) {
      promptShellEl.innerHTML = renderTerminalPromptMarkup();
    }
    if (autoScroll && screenEl instanceof HTMLElement) {
      screenEl.scrollTop = screenEl.scrollHeight;
    }
  }

  function setLocalReadAloudEnabled(enabled) {
    const nextEnabled = Boolean(enabled);
    if (chroniclePlayback.localReadAloudEnabled === nextEnabled) return;
    chroniclePlayback.localReadAloudEnabled = nextEnabled;
    paintChronicle(false);
  }

  function finishChronicleImmediately() {
    clearChronicleTimer();
    chroniclePlayback.renderedLines = [...chroniclePlayback.fullLines];
    chroniclePlayback.lineIndex = chroniclePlayback.fullLines.length;
    chroniclePlayback.charIndex = 0;
    chroniclePlayback.streaming = false;
    paintChronicle(true);
  }

  function nextChronicleDelay(character) {
    if (character === ',') return COMMA_DELAY_MS;
    if (character === '.' || character === '!' || character === '?') return PERIOD_DELAY_MS;
    return CHARACTER_DELAY_MS;
  }

  function advanceChronicle() {
    if (!chroniclePlayback.streaming) {
      clearChronicleTimer();
      return;
    }

    const currentLine = chroniclePlayback.fullLines[chroniclePlayback.lineIndex] ?? '';
    if (chroniclePlayback.charIndex < currentLine.length) {
      chroniclePlayback.renderedLines[chroniclePlayback.lineIndex] += currentLine[chroniclePlayback.charIndex];
      const delay = nextChronicleDelay(currentLine[chroniclePlayback.charIndex]);
      chroniclePlayback.charIndex += 1;
      paintChronicle(true);
      chroniclePlayback.timer = window.setTimeout(advanceChronicle, delay);
      return;
    }

    chroniclePlayback.lineIndex += 1;
    chroniclePlayback.charIndex = 0;
    if (chroniclePlayback.lineIndex >= chroniclePlayback.fullLines.length) {
      chroniclePlayback.streaming = false;
      paintChronicle(false);
      clearChronicleTimer();
      return;
    }

    chroniclePlayback.renderedLines.push('');
    paintChronicle(true);
    chroniclePlayback.timer = window.setTimeout(advanceChronicle, LINE_DELAY_MS);
  }

  function beginChronicle(lines, key) {
    clearChronicleTimer();
    const previousRendered = [...chroniclePlayback.renderedLines];
    chroniclePlayback.key = key;
    chroniclePlayback.fullLines = lines;
    if (!lines.length) {
      chroniclePlayback.renderedLines = [];
      chroniclePlayback.lineIndex = 0;
      chroniclePlayback.charIndex = 0;
      chroniclePlayback.streaming = false;
      paintChronicle(false);
      return;
    }

    let matchCount = 0;
    while (
      matchCount < previousRendered.length &&
      matchCount < lines.length &&
      previousRendered[matchCount] === lines[matchCount]
    ) {
      matchCount++;
    }

    if (matchCount > 0 && matchCount < lines.length) {
      chroniclePlayback.renderedLines = lines.slice(0, matchCount);
      chroniclePlayback.renderedLines.push('');
      chroniclePlayback.lineIndex = matchCount;
      chroniclePlayback.charIndex = 0;
      chroniclePlayback.streaming = true;
      paintChronicle(true);
      chroniclePlayback.timer = window.setTimeout(advanceChronicle, CHARACTER_DELAY_MS);
      return;
    }

    chroniclePlayback.renderedLines = [''];
    chroniclePlayback.lineIndex = 0;
    chroniclePlayback.charIndex = 0;
    chroniclePlayback.streaming = true;
    const { screenEl } = chronicleElements();
    if (screenEl instanceof HTMLElement) {
      screenEl.scrollTop = 0;
    }
    paintChronicle(false);
    chroniclePlayback.timer = window.setTimeout(advanceChronicle, CHARACTER_DELAY_MS);
  }

  function activeDecisionKey(state) {
    const decision = state.activeDecision;
    if (!decision) return '';
    return JSON.stringify({
      type: decision.type,
      title: decision.title,
      body: decision.body,
      mode: state.pendingMetaDialogue ? 'meta-dialogue' : 'choice',
      options: (decision.options ?? []).map((option) => ({
        hotkey: option.hotkey,
        id: option.id,
        label: option.label
      }))
    });
  }

  function defaultDecisionFeedback(state) {
    if (state.pendingMetaDialogue) {
      return 'Type a short response to the Operator, then press Enter.';
    }
    const options = state.activeDecision?.options ?? [];
    if (!options.length) return '';
    return `Awaiting choice. Type ${choiceRangeText(options)} and press Enter.`;
  }

  function syncDecisionInputState(state) {
    const decisionKey = activeDecisionKey(state);
    if (!decisionKey) {
      terminalDecisionInput.decisionKey = '';
      terminalDecisionInput.buffer = '';
      terminalDecisionInput.feedback = '';
      return;
    }
    if (terminalDecisionInput.decisionKey !== decisionKey) {
      terminalDecisionInput.decisionKey = decisionKey;
      terminalDecisionInput.buffer = '';
      terminalDecisionInput.mode = state.pendingMetaDialogue ? 'meta-dialogue' : 'choice';
      terminalDecisionInput.feedback = defaultDecisionFeedback(state);
      return;
    }
    terminalDecisionInput.mode = state.pendingMetaDialogue ? 'meta-dialogue' : 'choice';
    if (!terminalDecisionInput.feedback) {
      terminalDecisionInput.feedback = defaultDecisionFeedback(state);
    }
  }

  function renderTerminalPromptMarkup() {
    if (activeChroniclePhase === 'results' || activeChroniclePhase === 'resolving' || activeChroniclePhase === 'prologue') return '';
    if (chroniclePlayback.streaming) return '';
    if (!terminalDecisionInput.decisionKey) return '';
    const classes = ['teletype-prompt'];
    if (terminalDecisionInput.feedback.toLowerCase().startsWith('invalid')) {
      classes.push('invalid');
    }
    const buffer = terminalDecisionInput.buffer || '';
    return `
      <div class="${classes.join(' ')}">
        <div class="teletype-prompt-line">
          <span class="teletype-prompt-label">${terminalDecisionInput.mode === 'meta-dialogue' ? 'SPEAK&gt;' : 'CHOICE&gt;'}</span>
          <span class="teletype-prompt-value">${escapeHtml(buffer)}</span>
          <span class="teletype-cursor" aria-hidden="true">█</span>
        </div>
        <div class="teletype-prompt-hint">${escapeHtml(terminalDecisionInput.feedback)}</div>
      </div>
    `;
  }

  function syncChronicle(state, locationName, weather, supplies) {
    activeChroniclePhase = state.turnPhase ?? 'dispatch';
    syncDecisionInputState(state);
    const lines = chronicleLinesForState(state, locationName, weather, supplies);
    const key = JSON.stringify(state.turnPhase === 'results' || state.turnPhase === 'resolving'
      ? {
          turnPhase: state.turnPhase,
          day: state.day,
          statusMessage: state.statusMessage,
          actionSummary: state.lastActionSummary
        }
      : {
          day: state.day,
          turnPhase: state.turnPhase,
          narrationLoading: Boolean(state.narrationLoading),
          prologueHeadline: state.prologueHeadline ?? '',
          prologueParagraphs: state.prologueParagraphs ?? [],
          locationName,
          headline: state.latestNarration?.headline ?? '',
          body: state.narrationText ?? '',
          lines: Array.isArray(state.latestNarration?.lines) ? state.latestNarration.lines : [],
          statusMessage: state.statusMessage,
          actionType: state.lastActionContext?.actionType ?? '',
          actionOutcome: state.lastActionContext?.outcome ?? '',
          actionSummary: state.lastActionSummary,
          decisionTitle: state.activeDecision?.title ?? '',
          decisionBody: state.activeDecision?.body ?? '',
          pendingMetaDialogue: state.pendingMetaDialogue?.choiceId ?? '',
          decisionOptions: (state.activeDecision?.options ?? []).map((option) => `${option.hotkey}:${option.label}:${option.detail}`)
        });

    const keyChanged = chroniclePlayback.key !== key;

    if (state.actionInProgress && chroniclePlayback.streaming && !keyChanged) {
      return;
    }

    if (keyChanged) {
      beginChronicle(lines, key);
      return;
    }

    if (chroniclePlayback.streaming) {
      paintChronicle(true);
      return;
    }

    chroniclePlayback.fullLines = lines;
    chroniclePlayback.renderedLines = [...lines];
    paintChronicle(false);
  }

  function skipTeletype() {
    if (!chroniclePlayback.streaming) return false;
    finishChronicleImmediately();
    return true;
  }

  function isTeletypeStreaming() {
    return chroniclePlayback.streaming;
  }

  function refreshLandscapeCanvas(state = lastRenderedState) {
    if (!state) return;
    lastRenderedState = state;
    const stageCanvas = document.querySelector('#landscape-stage-canvas');
    if (stageCanvas instanceof HTMLCanvasElement) {
      renderGameLandscapeStage(stageCanvas, state, animTick);
    }
    const captionEl = document.querySelector('[data-landscape-caption]');
    if (captionEl instanceof HTMLElement) {
      captionEl.textContent = landscapeStageStatusLabel(state);
    }
    const party = state.wagon?.party ?? [];
    document.querySelectorAll('[data-party-portrait-canvas]').forEach((el) => {
      if (!(el instanceof HTMLCanvasElement)) return;
      const idx = Number(el.dataset.partyPortraitCanvas);
      const member = party[idx];
      if (!member?.appearance) return;
      const moving = Boolean(state.landscapeMoving || state.travelAnimationActive);
      const grid = getCharacterFrameGrid(
        member.appearance,
        moving ? 'side_right' : 'front',
        moving ? 'walk' : 'idle',
        (animTick + idx) % (moving ? 4 : 2)
      );
      renderCharacterGridToCanvas(el, grid, '#030c05');
    });
  }

  function refreshCreatorLiveCanvases(state = lastRenderedState) {
    if (!state || !refs.journeyModalCardEl) return;
    const party = state.wagon?.party ?? [];
    const activeIdx = Math.max(0, Math.min(party.length - 1, Number(state.activeCreatorMemberIndex) || 0));
    const activeMember = party[activeIdx];

    party.forEach((member, idx) => {
      const miniCanvas = refs.journeyModalCardEl.querySelector(`[data-member-mini-canvas="${idx}"]`);
      if (miniCanvas instanceof HTMLCanvasElement && member?.appearance) {
        const frameGrid = getCharacterFrameGrid(member.appearance, 'front', 'idle', (animTick + idx) % 2);
        renderCharacterGridToCanvas(miniCanvas, frameGrid, { includeBackdrop: true, backdropId: 'prairie', scrollOffset: animTick });
      }
    });

    if (activeMember?.appearance) {
      const frontCanvas = refs.journeyModalCardEl.querySelector('#creator-front-canvas');
      if (frontCanvas instanceof HTMLCanvasElement) {
        const frontGrid = getCharacterFrameGrid(activeMember.appearance, 'front', 'idle', animTick % 2);
        renderCharacterGridToCanvas(frontCanvas, frontGrid, { includeBackdrop: true, backdropId: 'prairie', scrollOffset: 0, drawGridLines: true });
      }
      const sideCanvas = refs.journeyModalCardEl.querySelector('#creator-side-canvas');
      if (sideCanvas instanceof HTMLCanvasElement) {
        const sideGrid = getCharacterFrameGrid(activeMember.appearance, 'side_right', 'walk', animTick % 4);
        renderCharacterGridToCanvas(sideCanvas, sideGrid, { includeBackdrop: true, backdropId: 'prairie', scrollOffset: animTick * 2, drawGridLines: true });
      }
    }

    const creatorLandscape = refs.journeyModalCardEl.querySelector('#creator-landscape-canvas');
    if (creatorLandscape instanceof HTMLCanvasElement) {
      renderGameLandscapeStage(creatorLandscape, state, animTick);
    }
  }

  function refreshCreatorPresetThumbnails(state = lastRenderedState) {
    if (!state || !refs.journeyModalCardEl) return;
    const party = state.wagon?.party ?? [];
    const activeIdx = Math.max(0, Math.min(party.length - 1, Number(state.activeCreatorMemberIndex) || 0));
    const activeMember = party[activeIdx];
    if (!activeMember?.appearance) return;
    const activeCategory = state.creatorCategory || 'hats';

    refs.journeyModalCardEl.querySelectorAll('[data-preset-thumb-canvas]').forEach((el) => {
      if (!(el instanceof HTMLCanvasElement)) return;
      const presetId = el.dataset.presetThumbCanvas;
      const previewAppearance = {
        ...activeMember.appearance,
        equippedPresets: {
          ...activeMember.appearance.equippedPresets,
          [activeCategory]: presetId === '__none__' ? '' : presetId
        }
      };
      const grid = buildNeutralCompositeGrid(previewAppearance, 'front');
      renderCharacterGridToCanvas(el, grid, '#020804');
    });
  }

  function refreshCreatorCanvases(state = lastRenderedState) {
    if (!state) return;
    lastRenderedState = state;
    refreshCreatorLiveCanvases(state);
    refreshCreatorPresetThumbnails(state);
  }

  window.setInterval(() => {
    animTick = (animTick + 1) % 64;
    if (!lastRenderedState) return;
    if (refs.journeyModalEl && !refs.journeyModalEl.hidden && lastRenderedState.setupStage === 'register') {
      refreshCreatorLiveCanvases(lastRenderedState);
    }
    refreshLandscapeCanvas(lastRenderedState);
  }, 190);

  function collectRegisterFormPayload(form) {
    const formData = new FormData(form);
    const members = Array.from({ length: 4 }, (_, idx) => ({
      name: formData.get(`memberName_${idx}`),
      role: formData.get(`memberRole_${idx}`)
    }));
    return {
      expeditionName: formData.get('expeditionName'),
      selectedEra: formData.get('selectedEra'),
      members
    };
  }

  function bindStaticControls() {
    refs.refreshBtn?.addEventListener('click', () => {
      invokeUiClick('refresh');
      handlers.onRefresh();
    });
    refs.journeyModalEl?.addEventListener('submit', (event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      event.preventDefault();
      if (form.id === 'expedition-register-form') {
        invokeUiClick('register-confirm');
        handlers.onRegisterParty(collectRegisterFormPayload(form));
        return;
      }
      if (form.id === 'outfitting-form') {
        invokeUiClick('begin');
        handlers.onBeginJourney();
      }
    });
    refs.journeyModalEl?.addEventListener('pointerdown', () => {
      handlers.onSetupInteraction();
    });
    refs.journeyModalEl?.addEventListener('keydown', () => {
      handlers.onSetupInteraction();
    });
    refs.journeyModalEl?.addEventListener('input', (event) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement)) return;
      if (input.dataset.cartKey) {
        handlers.onOutfittingQuantityChange(input.dataset.cartKey, input.value);
        return;
      }
      if (input.dataset.expeditionNameInput !== undefined && lastRenderedState) {
        handlers.onUpdateCreatorMember({ expeditionName: input.value, renderModal: false });
        return;
      }
      if (input.dataset.memberNameInput !== undefined) {
        const memberIndex = Number(input.dataset.memberNameInput);
        handlers.onUpdateCreatorMember({ memberIndex, name: input.value, renderModal: false });
        const cardTitle = refs.journeyModalCardEl?.querySelector(`[data-member-tab-name="${memberIndex}"]`);
        if (cardTitle) cardTitle.textContent = input.value.trim() || `Traveler ${memberIndex + 1}`;
      }
    });
    refs.journeyModalEl?.addEventListener('change', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLSelectElement)) return;
      if (target.dataset.partyEraSelect !== undefined) {
        invokeUiClick('era-change');
        handlers.onSelectPartyEra(target.value);
        return;
      }
      if (target.dataset.memberRoleSelect !== undefined) {
        const memberIndex = Number(target.dataset.memberRoleSelect);
        invokeUiClick('role-change');
        handlers.onUpdateCreatorMember({ memberIndex, role: target.value });
        return;
      }
      if (target.dataset.creatorBody !== undefined) {
        invokeUiClick('body-change');
        handlers.onUpdateCreatorMember({ bodyTemplateId: target.value });
      }
    });
    refs.journeyModalEl?.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const selectMemberBtn = target.closest('[data-select-creator-member]');
      if (selectMemberBtn instanceof HTMLElement) {
        if (target.closest('input, select')) return;
        const memberIdx = Number(selectMemberBtn.dataset.selectCreatorMember);
        invokeUiClick('member-tab');
        handlers.onSelectCreatorMember(memberIdx);
        return;
      }

      const genderBtn = target.closest('[data-creator-gender]');
      if (genderBtn instanceof HTMLButtonElement) {
        invokeUiClick('gender');
        handlers.onUpdateCreatorMember({ gender: genderBtn.dataset.creatorGender });
        return;
      }

      const skinBtn = target.closest('[data-creator-skin]');
      if (skinBtn instanceof HTMLButtonElement) {
        invokeUiClick('skin');
        handlers.onUpdateCreatorMember({ skinToneId: skinBtn.dataset.creatorSkin });
        return;
      }

      const catBtn = target.closest('[data-creator-category]');
      if (catBtn instanceof HTMLButtonElement) {
        invokeUiClick('category');
        handlers.onUpdateCreatorMember({ creatorCategory: catBtn.dataset.creatorCategory });
        return;
      }

      const subFilterBtn = target.closest('[data-creator-headwear-filter]');
      if (subFilterBtn instanceof HTMLButtonElement) {
        invokeUiClick('subfilter');
        handlers.onUpdateCreatorMember({ headwearSubFilter: subFilterBtn.dataset.creatorHeadwearFilter });
        return;
      }

      const dyeBtn = target.closest('[data-creator-dye]');
      if (dyeBtn instanceof HTMLButtonElement) {
        invokeUiClick('dye');
        const activeCategory = lastRenderedState?.creatorCategory || 'hats';
        handlers.onUpdateCreatorMember({
          dyeCategory: activeCategory,
          dyeId: dyeBtn.dataset.creatorDye || 'default'
        });
        return;
      }

      const presetBtn = target.closest('[data-creator-preset]');
      if (presetBtn instanceof HTMLButtonElement) {
        invokeUiClick('preset');
        const activeCategory = lastRenderedState?.creatorCategory || 'hats';
        const rawPreset = presetBtn.dataset.creatorPreset;
        handlers.onUpdateCreatorMember({
          presetCategory: activeCategory,
          presetId: rawPreset === '__none__' ? '' : rawPreset
        });
        return;
      }

      const quickActionBtn = target.closest('[data-creator-action]');
      if (quickActionBtn instanceof HTMLButtonElement) {
        invokeUiClick('creator-quick');
        handlers.onUpdateCreatorMember({
          action: quickActionBtn.dataset.creatorAction
        });
        return;
      }

      const quantityButton = target.closest('[data-cart-key][data-quantity-delta]');
      if (quantityButton instanceof HTMLButtonElement) {
        const input = refs.journeyModalEl.querySelector(`[data-cart-input="${quantityButton.dataset.cartKey}"]`);
        if (input instanceof HTMLInputElement) {
          const nextQuantity = Math.max(0, Number(input.value || 0) + Number(quantityButton.dataset.quantityDelta));
          handlers.onOutfittingQuantityChange(quantityButton.dataset.cartKey, nextQuantity);
          input.value = String(nextQuantity);
        }
        return;
      }
      if (target.closest('[data-outfit-preset]')) {
        handlers.onRecommendedOutfit();
        return;
      }
      if (target.closest('[data-back-to-register]')) {
        handlers.onBackToRegister();
      }
    });
    refs.mapEl?.addEventListener('submit', (event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement) || form.id !== 'outfitting-form') return;
      event.preventDefault();
      invokeUiClick('begin');
      handlers.onBeginJourney();
    });
    refs.mapEl?.addEventListener('pointerdown', (event) => {
      if (event.target instanceof Element && event.target.closest('#outfitting-form')) {
        handlers.onSetupInteraction();
      }
    });
    refs.mapEl?.addEventListener('keydown', (event) => {
      if (event.target instanceof Element && event.target.closest('#outfitting-form')) {
        handlers.onSetupInteraction();
      }
    });
    refs.mapEl?.addEventListener('input', (event) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement) || !input.dataset.cartKey) return;
      handlers.onOutfittingQuantityChange(input.dataset.cartKey, input.value);
    });
    refs.mapEl?.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      if (target.closest('[data-continue-dispatch]')) {
        invokeUiClick('continue-dispatch');
        handlers.onContinueDispatch();
        return;
      }

      if (target.closest('[data-start-trail]')) {
        invokeUiClick('start-trail');
        handlers.onStartTrail();
        return;
      }

      const quantityButton = target.closest('[data-cart-key][data-quantity-delta]');
      if (quantityButton instanceof HTMLButtonElement) {
        const input = refs.mapEl.querySelector(`[data-cart-input="${quantityButton.dataset.cartKey}"]`);
        if (input instanceof HTMLInputElement) {
          const nextQuantity = Math.max(0, Number(input.value || 0) + Number(quantityButton.dataset.quantityDelta));
          handlers.onOutfittingQuantityChange(quantityButton.dataset.cartKey, nextQuantity);
          input.value = String(nextQuantity);
        }
        return;
      }
      if (target.closest('[data-outfit-preset]')) {
        handlers.onRecommendedOutfit();
        return;
      }
      if (target.closest('[data-back-to-register]')) {
        handlers.onBackToRegister();
        return;
      }

      const readLineButton = target.closest('[data-speak-index]');
      if (readLineButton instanceof HTMLButtonElement) {
        event.preventDefault();
        event.stopPropagation();
        const lineIndex = Number(readLineButton.dataset.speakIndex);
        const line = Number.isInteger(lineIndex) ? chroniclePlayback.fullLines[lineIndex] : '';
        const spokenLine = line ? chronicleLineForSpeech(line) : '';
        if (spokenLine) {
          invokeUiClick('read-line');
          handlers.onReadText(spokenLine);
        }
        return;
      }

      const choiceEl = target.closest('[data-choice-key]');
      if (choiceEl instanceof HTMLElement && choiceEl.dataset.choiceKey) {
        invokeUiClick('choice');
        handlers.onDecisionChoice(choiceEl.dataset.choiceKey);
        return;
      }

      const voiceBtn = target.closest('#terminal-voice-btn');
      if (voiceBtn) {
        invokeUiClick('play-voice');
        handlers.onReadNarration();
        return;
      }

      if (
        chroniclePlayback.streaming &&
        target.closest('.teletype-screen') &&
        !target.closest('button, select, input, label')
      ) {
        invokeUiClick('teletype-skip');
        skipTeletype();
        return;
      }
      const actionButton = target.closest('[data-action]');
      if (actionButton instanceof HTMLButtonElement) {
        invokeUiClick(actionButton.dataset.action);
        handlers.onAction(actionButton.dataset.action);
        return;
      }

      const tileButton = target.closest('[data-tile-id]');
      if (tileButton instanceof HTMLButtonElement) {
        invokeUiClick('tile');
        handlers.onTileSelect(tileButton.dataset.tileId);
      }
    });
    refs.mapEl?.addEventListener('change', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLSelectElement)) return;
      if (target.id === 'hud-pace-select') {
        handlers.onPaceChange(target.value);
      }
      if (target.id === 'hud-rations-select') {
        handlers.onRationsChange(target.value);
      }
    });

    document.querySelectorAll('.menu-btn[data-menu-trigger]').forEach((button) => {
      button.addEventListener('click', (event) => {
        const menuName = button.dataset.menuTrigger;
        if (!menuName) return;
        event.stopPropagation();
        invokeUiClick('menu');
        toggleMenu(menuName);
      });
    });

    refs.menuNewGameBtn?.addEventListener('click', () => {
      invokeUiClick('new-game');
      closeMenus();
      handlers.onNewGame();
    });
    refs.menuBeginJourneyBtn?.addEventListener('click', () => {
      invokeUiClick('begin-from-menu');
      closeMenus();
      handlers.onBeginJourneyFromMenu();
    });
    refs.menuLedgerJumpBtn?.addEventListener('click', () => {
      invokeUiClick('ledger-jump');
      closeMenus();
      handlers.onLedgerJump();
    });
    refs.menuPlayVoiceBtn?.addEventListener('click', () => {
      invokeUiClick('play-voice');
      closeMenus();
      handlers.onReadNarration();
    });
    refs.menuCloudToggle?.addEventListener('change', () => {
      handlers.onJourneyCloudToggle(refs.menuCloudToggle.checked);
    });
    refs.menuAutoReadToggle?.addEventListener('change', () => {
      handlers.onJourneyAutoReadToggle(refs.menuAutoReadToggle.checked);
    });
    refs.menuStorySourceToggle?.addEventListener('change', () => {
      handlers.onStorySourceToggle(refs.menuStorySourceToggle.checked);
    });
    refs.menuStrangenessOverride?.addEventListener('change', () => {
      handlers.onStrangenessOverrideChange(refs.menuStrangenessOverride.value);
    });
    refs.menuWeatherOverlay?.addEventListener('change', () => {
      handlers.onWeatherOverlayChange(refs.menuWeatherOverlay.value);
    });
    refs.menuLandmarkWarpSelect?.addEventListener('change', () => {
      if (refs.menuLandmarkWarpButton) {
        refs.menuLandmarkWarpButton.disabled = refs.menuLandmarkWarpSelect.disabled || !refs.menuLandmarkWarpSelect.value;
      }
    });
    refs.menuLandmarkWarpButton?.addEventListener('click', () => {
      const landmarkId = refs.menuLandmarkWarpSelect?.value;
      if (!landmarkId || refs.menuLandmarkWarpButton.disabled) return;
      invokeUiClick('warp-before-landmark');
      closeMenus();
      handlers.onWarpBeforeLandmark(landmarkId);
    });
    refs.menuVoiceSelect?.addEventListener('change', () => {
      handlers.onVoiceChange(refs.menuVoiceSelect.value);
    });

    document.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest('.menu-group')) return;
      closeMenus();
    });
  }

  function setHandlers(nextHandlers) {
    Object.assign(handlers, nextHandlers);
  }

  function setJourneyLoading(isLoading, stage = 'trail') {
    document.body.classList.toggle('journey-loading', isLoading);
    if (refs.loaderEl) refs.loaderEl.hidden = !isLoading;
    const isOpeningPrologue = stage === 'prologue';
    const eyebrow = refs.loaderEl?.querySelector('[data-journey-loader-eyebrow]');
    const title = refs.loaderEl?.querySelector('[data-journey-loader-title]');
    const description = refs.loaderEl?.querySelector('[data-journey-loader-description]');
    if (eyebrow) eyebrow.textContent = isOpeningPrologue ? 'Opening prologue' : 'Loading trail';
    if (title) title.textContent = isOpeningPrologue ? 'Tracing the family’s origin' : 'Preparing the wagon';
    if (description) {
      description.textContent = isOpeningPrologue
        ? 'Gathering the family’s era, wardrobe, and story before the Independence General Store.'
        : 'Reading the world, waking the narration, and laying out the frontier.';
    }
  }

  function setupStageMarkup(state) {
    const startingCash = getStartingCashForState(state);
    const eraMeta = getEraById(state.selectedEra);

    if (state.setupStage === 'outfitting') {
      return `
        <section class="store-viewer retro-inset" aria-labelledby="store-viewer-title">
          <header class="store-viewer-header">
            <p class="eyebrow">Independence General Store // May 1848 // Party Era: ${escapeHtml(eraMeta.label)}</p>
            <h2 id="store-viewer-title">Pack the prairie schooner</h2>
            <p class="crt-setup-copy">${escapeHtml(state.expeditionName)} has $${startingCash.toFixed(2)} in starting funds. Your party has entered the Independence General Store and gathered at the outfitting counter—purchase oxen yokes and provisions to hitch your wagon cart.</p>
          </header>
          ${landscapeStageMarkup(state)}
          <form id="outfitting-form" class="outfitting-form">
            <div class="outfitting-summary" aria-live="polite">
              <span>FUNDS REMAINING <strong data-outfitting-cash></strong></span>
              <span>CARGO LOAD <strong data-outfitting-load></strong></span>
              <span>PAYLOAD TIER <strong data-outfitting-tier></strong></span>
            </div>
            <div class="outfitting-catalog" role="table" aria-label="General store catalog">
              <div class="outfitting-heading" role="row">
                <span>PROVISIONS</span><span>PRICE</span><span>WEIGHT</span><span>QUANTITY</span><span>SUBTOTAL</span>
              </div>
              ${OUTFITTING_CATALOG.map((item) => `
                <div class="outfitting-row" role="row" data-outfitting-row="${item.key}">
                  <span class="outfitting-item-name"><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.detail)}</small></span>
                  <span>$${item.price.toFixed(2)} / ${escapeHtml(item.unit)}</span>
                  <span>${item.cargoWeight ? `${item.cargoWeight} lbs` : escapeHtml(item.displayWeight ?? 'Draft only')}</span>
                  <span class="outfitting-quantity">
                    <button type="button" data-cart-key="${item.key}" data-quantity-delta="-1" aria-label="Remove one ${escapeHtml(item.name)}">−</button>
                    <input type="number" inputmode="numeric" min="0" max="999" step="1" name="${item.key}" data-cart-key="${item.key}" data-cart-input="${item.key}" aria-label="${escapeHtml(item.name)} quantity">
                    <button type="button" data-cart-key="${item.key}" data-quantity-delta="1" aria-label="Add one ${escapeHtml(item.name)}">+</button>
                  </span>
                  <strong data-item-total="${item.key}">$0.00</strong>
                </div>
              `).join('')}
            </div>
            <p class="setup-error" data-setup-error role="alert"></p>
            <div class="outfitting-footer">
              <button class="crt-secondary-btn" type="button" data-back-to-register>Back to character creator</button>
              <button class="crt-secondary-btn" type="button" data-outfit-preset>[R] Recommended Standard Outfit</button>
              <button class="crt-primary-btn" type="submit">Purchase Supplies &amp; Hitch Oxen Cart [SPACE / ENTER]</button>
            </div>
            <p class="crt-help">TAB cycles fields · adjust quantities directly or with − / + · unspent cash stays in the wagon.</p>
          </form>
        </section>
      `;
    }

    const party = state.wagon.party ?? [];
    const activeIdx = Math.max(0, Math.min(party.length - 1, Number(state.activeCreatorMemberIndex) || 0));
    const activeMember = party[activeIdx] ?? party[0];
    const activeApp = activeMember?.appearance ?? {};
    const activeCategory = state.creatorCategory || 'hats';
    const headwearSubFilter = state.creatorHeadwearSubFilter || 'all';
    const presets = getPresetsForCategoryAndEra(
      activeCategory,
      state.selectedEra,
      activeApp.gender || 'male',
      headwearSubFilter
    ).filter((p) => !p.isNone);
    const nonePreset = (INITIAL_CLOTHING_BOILERPLATE[activeCategory] || []).find((p) => p.isNone);
    const equippedId = activeApp.equippedPresets?.[activeCategory] || '';
    const isNoneEquipped = !equippedId || equippedId === nonePreset?.id;
    const activeDye = activeApp.categoryDyes?.[activeCategory] || 'default';
    const isNonFrontierEra = state.selectedEra !== 'oregon_trail';

    return `
      <div class="creator-shell-header">
        <div>
          <p class="eyebrow">Expedition Register &amp; 32×32 Character Studio // Independence, Missouri (1848)</p>
          <h2>Design Your Overland Party</h2>
        </div>
        <div class="creator-funds-chip">
          STARTING FUNDS: <strong>$${startingCash.toFixed(2)}</strong>
        </div>
      </div>
      <p class="crt-setup-copy">
        Customize all four travelers in 8-bit 32×32 pixel art and choose <strong>one historical era</strong> for the entire party.
        ${isNonFrontierEra
          ? `<span class="era-anomaly-note">TIME-DISPLACEMENT ACTIVE (${escapeHtml(eraMeta.label)}): The AI narrator will explain how your party was transported from their ${escapeHtml(eraMeta.label)} home to 1848 Missouri.</span>`
          : 'Your party begins in their 1848 frontier homestead before walking to the Independence General Store.'}
      </p>
      <form id="expedition-register-form" class="register-form creator-register-form">
        <div class="creator-top-controls">
          <label class="register-expedition-field">
            <span>EXPEDITION / FAMILY SURNAME</span>
            <input name="expeditionName" data-expedition-name-input type="text" maxlength="48" required value="${escapeHtml(state.expeditionName)}" autocomplete="off">
          </label>
          <label class="register-expedition-field">
            <span>SHARED PARTY ERA (APPLIES TO ALL 4 TRAVELERS)</span>
            <select name="selectedEra" data-party-era-select class="crt-select">
              ${SELECTABLE_ERAS.map((era) => `
                <option value="${escapeHtml(era.id)}" ${era.id === state.selectedEra ? 'selected' : ''}>
                  ${escapeHtml(era.label)} (${escapeHtml(era.years)})
                </option>
              `).join('')}
            </select>
          </label>
        </div>

        <div class="creator-landscape-preview">
          <div class="landscape-stage-header">
            <span>ORIGIN HOME STAGE // ${escapeHtml(eraMeta.label.toUpperCase())} HOME (LEFT) TO INDEPENDENCE GENERAL STORE (RIGHT)</span>
            <span>320×96 PARTY PREVIEW</span>
          </div>
          <div class="landscape-canvas-frame">
            <canvas id="creator-landscape-canvas" width="320" height="96"></canvas>
          </div>
        </div>

        <fieldset class="register-roster creator-party-strip">
          <legend>SELECT &amp; NAME PARTY MEMBERS (CLICK CARD TO CUSTOMIZE SPRITE)</legend>
          <div class="creator-member-cards">
            ${party.map((member, idx) => {
              const isSelected = idx === activeIdx;
              const roleMeta = ARCHETYPE_OPTIONS.find((opt) => opt.role === member.role) ?? ARCHETYPE_OPTIONS[0];
              const outfitText = summarizeMemberOutfit(member);
              return `
                <div class="creator-member-card ${isSelected ? 'is-selected' : ''}" data-select-creator-member="${idx}">
                  <div class="creator-member-card-top">
                    <canvas class="creator-mini-canvas" data-member-mini-canvas="${idx}" width="64" height="64"></canvas>
                    <div class="creator-member-card-meta">
                      <span class="creator-member-badge">TRAVELER ${idx + 1} ${isSelected ? '● EDITING' : ''}</span>
                      <strong data-member-tab-name="${idx}">${escapeHtml(member.name)}</strong>
                      <small>${escapeHtml(member.appearance?.gender === 'female' ? '♀ Female' : '♂ Male')} · ${escapeHtml(roleMeta.shortLabel)}</small>
                    </div>
                  </div>
                  <label class="creator-inline-field">
                    <span>FIRST NAME</span>
                    <input name="memberName_${idx}" data-member-name-input="${idx}" type="text" maxlength="24" required value="${escapeHtml(member.name)}" autocomplete="off">
                  </label>
                  <label class="creator-inline-field">
                    <span>ARCHETYPE / ROLE</span>
                    <select name="memberRole_${idx}" data-member-role-select="${idx}" class="crt-select">
                      ${ARCHETYPE_OPTIONS.map((opt) => `
                        <option value="${escapeHtml(opt.role)}" ${opt.role === member.role ? 'selected' : ''}>
                          ${escapeHtml(opt.label)} — ${escapeHtml(opt.description)}
                        </option>
                      `).join('')}
                    </select>
                  </label>
                  <div class="creator-member-outfit-line" title="${escapeHtml(outfitText)}">${escapeHtml(outfitText)}</div>
                  <button type="button" class="crt-secondary-btn creator-select-btn" data-select-creator-member="${idx}">
                    ${isSelected ? 'Customizing Sprite ▼' : 'Customize Sprite'}
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        </fieldset>

        <section class="creator-studio-grid" aria-label="32x32 Character Designer Studio">
          <div class="creator-inspector-panel">
            <div class="creator-panel-header">
              <span>ACTIVE TRAVELER: <strong>${escapeHtml(activeMember?.name ?? 'Traveler')}</strong> (${escapeHtml(eraMeta.shortLabel || eraMeta.label)})</span>
              <span>32×32 PIXEL GRID</span>
            </div>
            <div class="creator-dual-canvases">
              <div class="creator-canvas-box">
                <canvas id="creator-front-canvas" width="192" height="192"></canvas>
                <span>FRONT IDLE (32×32)</span>
              </div>
              <div class="creator-canvas-box">
                <canvas id="creator-side-canvas" width="192" height="192"></canvas>
                <span>TRAIL WALK (32×32)</span>
              </div>
            </div>

            <div class="creator-quick-actions">
              <button type="button" class="crt-secondary-btn" data-creator-action="randomize-member">🎲 Randomize ${escapeHtml(activeMember?.name ?? 'Member')}</button>
              <button type="button" class="crt-secondary-btn" data-creator-action="randomize-party">🎲 Randomize All 4</button>
              <button type="button" class="crt-secondary-btn" data-creator-action="equip-era-hat">🎩 Era Hat</button>
              <button type="button" class="crt-secondary-btn" data-creator-action="equip-era-hair">💇 Era Hair</button>
            </div>

            <div class="creator-body-controls">
              <div class="creator-control-group">
                <span class="creator-control-label">GENDER PRESENTATION</span>
                <div class="creator-segmented">
                  ${GENDERS.map((g) => `
                    <button type="button" class="crt-secondary-btn ${activeApp.gender === g.id ? 'is-active' : ''}" data-creator-gender="${escapeHtml(g.id)}">
                      ${escapeHtml(g.icon)} ${escapeHtml(g.label)}
                    </button>
                  `).join('')}
                </div>
              </div>

              <label class="creator-control-group">
                <span class="creator-control-label">BODY FRAME</span>
                <select data-creator-body class="crt-select">
                  ${BASE_BODY_TEMPLATES.map((body) => `
                    <option value="${escapeHtml(body.id)}" ${activeApp.bodyTemplateId === body.id ? 'selected' : ''}>
                      ${escapeHtml(body.name)} — ${escapeHtml(body.description)}
                    </option>
                  `).join('')}
                </select>
              </label>

              <div class="creator-control-group">
                <span class="creator-control-label">SKIN TONE</span>
                <div class="creator-swatch-row">
                  ${SKIN_TONES.map((tone) => `
                    <button
                      type="button"
                      class="creator-swatch ${activeApp.skinToneId === tone.id ? 'is-active' : ''}"
                      data-creator-skin="${escapeHtml(tone.id)}"
                      title="${escapeHtml(tone.name)}"
                      aria-label="Skin tone ${escapeHtml(tone.name)}"
                      style="background:${escapeHtml(tone.base)};"
                    ></button>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>

          <div class="creator-wardrobe-panel">
            <div class="creator-panel-header">
              <span>ERA WARDROBE // LOCKED TO <strong>${escapeHtml((eraMeta.shortLabel || eraMeta.label).toUpperCase())}</strong></span>
              <span>5 LAYER CATEGORIES</span>
            </div>

            <div class="creator-category-tabs" role="tablist">
              ${CATEGORIES.map((cat) => {
                const catPresetId = activeApp.equippedPresets?.[cat.id];
                const equippedPreset = (INITIAL_CLOTHING_BOILERPLATE[cat.id] || []).find((p) => p.id === catPresetId);
                return `
                  <button
                    type="button"
                    role="tab"
                    aria-selected="${activeCategory === cat.id}"
                    class="crt-secondary-btn creator-cat-tab ${activeCategory === cat.id ? 'is-active' : ''}"
                    data-creator-category="${escapeHtml(cat.id)}"
                  >
                    <span>${escapeHtml(cat.label)}</span>
                    <small>${escapeHtml(equippedPreset && !equippedPreset.isNone ? equippedPreset.name : 'None')}</small>
                  </button>
                `;
              }).join('')}
            </div>

            ${activeCategory === 'hats' ? `
              <div class="creator-subfilter-bar">
                <span>HEADWEAR MODE (HAIR OR HAT IS MUTUALLY EXCLUSIVE):</span>
                <div class="creator-subfilter-pills">
                  <button type="button" class="crt-secondary-btn ${headwearSubFilter === 'all' ? 'is-active' : ''}" data-creator-headwear-filter="all">All (${escapeHtml(eraMeta.shortLabel || eraMeta.label)})</button>
                  <button type="button" class="crt-secondary-btn ${headwearSubFilter === 'hat' ? 'is-active' : ''}" data-creator-headwear-filter="hat">Hats Only</button>
                  <button type="button" class="crt-secondary-btn ${headwearSubFilter === 'hair' ? 'is-active' : ''}" data-creator-headwear-filter="hair">Hair Only</button>
                </div>
              </div>
            ` : ''}

            <div class="creator-dye-bar">
              <span class="creator-control-label">CATEGORY COLOR DYE:</span>
              <div class="creator-swatch-row">
                ${PRESET_COLOR_DYES.map((dye) => (
                  dye.id === 'default'
                    ? `<button
                        type="button"
                        class="crt-secondary-btn creator-dye-default ${(!activeDye || activeDye === 'default') ? 'is-active' : ''}"
                        data-creator-dye="default"
                        title="${escapeHtml(dye.name)}"
                      >Era Default</button>`
                    : `<button
                        type="button"
                        class="creator-swatch ${activeDye === dye.id ? 'is-active' : ''}"
                        data-creator-dye="${escapeHtml(dye.id)}"
                        title="Dye: ${escapeHtml(dye.name)}"
                        aria-label="Dye ${escapeHtml(dye.name)}"
                        style="background:${escapeHtml(dye.primary)};"
                      ></button>`
                )).join('')}
              </div>
            </div>

            <div class="creator-preset-grid" role="listbox" aria-label="${escapeHtml(activeCategory)} presets for ${escapeHtml(eraMeta.label)}">
              <button
                type="button"
                class="creator-preset-card ${isNoneEquipped ? 'is-active' : ''}"
                data-creator-preset="${escapeHtml(nonePreset?.id || '__none__')}"
              >
                <canvas data-preset-thumb-canvas="__none__" width="32" height="32"></canvas>
                <strong>None / Clear</strong>
                <small>Remove layer</small>
              </button>
              ${presets.map((preset) => `
                <button
                  type="button"
                  class="creator-preset-card ${equippedId === preset.id ? 'is-active' : ''}"
                  data-creator-preset="${escapeHtml(preset.id)}"
                >
                  <canvas data-preset-thumb-canvas="${escapeHtml(preset.id)}" width="32" height="32"></canvas>
                  <strong>${escapeHtml(preset.name)}</strong>
                  <small>${escapeHtml(preset.subType === 'hair' ? 'Hair' : preset.subType === 'hat' ? 'Hat' : (eraMeta.shortLabel || eraMeta.label))}</small>
                </button>
              `).join('')}
            </div>
          </div>
        </section>

        <p class="setup-error" data-setup-error role="alert">${escapeHtml(state.setupError)}</p>
        <div class="creator-submit-row">
          <button class="crt-primary-btn" type="submit">Confirm Party &amp; Generate Opening Prologue [ENTER]</button>
        </div>
        <p class="crt-help">Click any traveler card to customize their 32×32 sprite · All 4 travelers share the selected era · ENTER confirms the roster</p>
      </form>
    `;
  }

  function renderJourneyModal(state) {
    if (!refs.journeyModalCardEl) return;
    lastRenderedState = state;
    const activeElement = document.activeElement;
    const focusedNameAttr = activeElement instanceof HTMLInputElement ? activeElement.name : null;
    const selectionStart = activeElement instanceof HTMLInputElement ? activeElement.selectionStart : null;

    refs.journeyModalCardEl.innerHTML = setupStageMarkup(state);
    if (state.setupStage === 'outfitting') {
      updateOutfittingCart(state, true);
      refreshLandscapeCanvas(state);
      refs.journeyModalCardEl.querySelector('[data-cart-input="oxenYokes"]')?.focus({ preventScroll: true });
    } else {
      refreshCreatorCanvases(state);
      if (focusedNameAttr) {
        const restored = refs.journeyModalCardEl.querySelector(`input[name="${focusedNameAttr}"]`);
        if (restored instanceof HTMLInputElement) {
          restored.focus({ preventScroll: true });
          if (typeof selectionStart === 'number') {
            restored.setSelectionRange(selectionStart, selectionStart);
          }
        }
      }
    }
  }

  function updateOutfittingCart(state, syncQuantities = false) {
    lastRenderedState = state;
    const root = state.setupStage === 'outfitting' && !state.journeyStarted
      ? refs.mapEl
      : refs.journeyModalCardEl;
    if (!root || state.setupStage !== 'outfitting') return;
    if (syncQuantities) {
      OUTFITTING_CATALOG.forEach((item) => {
        const input = root.querySelector(`[data-cart-input="${item.key}"]`);
        if (input instanceof HTMLInputElement) input.value = String(state.outfittingCart[item.key] ?? 0);
      });
    }
    const startingCash = getStartingCashForState(state);
    const totals = getOutfittingTotals(state.outfittingCart);
    const remainingCash = startingCash - totals.cost;
    const tier = getCargoWeightTier(totals.cargoWeight);
    const cashEl = root.querySelector('[data-outfitting-cash]');
    const loadEl = root.querySelector('[data-outfitting-load]');
    const tierEl = root.querySelector('[data-outfitting-tier]');
    if (cashEl) cashEl.textContent = `$${remainingCash.toFixed(2)} / $${startingCash.toFixed(2)}`;
    if (loadEl) loadEl.textContent = `${Math.round(totals.cargoWeight).toLocaleString()} / ${WAGON_CAPACITY.toLocaleString()} lbs`;
    if (tierEl) {
      tierEl.textContent = tier.toUpperCase();
      tierEl.dataset.tier = tier;
    }
    OUTFITTING_CATALOG.forEach((item) => {
      const totalEl = root.querySelector(`[data-item-total="${item.key}"]`);
      if (totalEl) totalEl.textContent = `$${(Math.max(0, Number(state.outfittingCart[item.key]) || 0) * item.price).toFixed(2)}`;
    });
    const errorEl = root.querySelector('[data-setup-error]');
    if (errorEl) errorEl.textContent = state.setupError ?? '';
    root.classList.toggle('has-setup-error', Boolean(state.setupError));
    refreshLandscapeCanvas(state);
  }

  function showJourneyModal(state) {
    document.body.classList.add('journey-setup');
    if (state) renderJourneyModal(state);
    if (refs.journeyModalEl) refs.journeyModalEl.hidden = false;
    if (refs.loaderEl) refs.loaderEl.hidden = true;
  }

  function hideJourneyModal() {
    document.body.classList.remove('journey-setup');
    if (refs.journeyModalEl) refs.journeyModalEl.hidden = true;
  }

  function syncJourneyControls(state) {
    updateMenuControls(state);
  }

  function updateMenuControls(state) {
    if (refs.menuCloudToggle) {
      refs.menuCloudToggle.checked = state.cloudNarrationPreferred;
      refs.menuCloudToggle.disabled = !state.elevenLabsAvailable;
    }
    if (refs.menuAutoReadToggle) {
      refs.menuAutoReadToggle.checked = state.narrationAutoPlay;
    }
    if (refs.menuStorySourceToggle) {
      refs.menuStorySourceToggle.checked = state.llmNarrationPreferred;
      refs.menuStorySourceToggle.disabled = !state.llmNarrationAvailable;
    }
    if (refs.menuStrangenessOverride) {
      refs.menuStrangenessOverride.value = state.strangenessLevelOverride === null
        ? ''
        : String(state.strangenessLevelOverride);
      refs.menuStrangenessOverride.disabled = state.journeyLoading
        || state.setupStage === 'prologue'
        || state.setupStage === 'outfitting'
        || state.journeyStarted;
    }
    if (refs.menuWeatherOverlay) {
      refs.menuWeatherOverlay.value = resolveActiveWeatherOverlay(state);
    }
    if (refs.menuLandmarkWarpSelect) {
      const landmarks = trailMilestones.filter((milestone) => milestone.mile > 0);
      if (refs.menuLandmarkWarpSelect.options.length !== landmarks.length + 1) {
        const selectedId = refs.menuLandmarkWarpSelect.value;
        refs.menuLandmarkWarpSelect.innerHTML = [
          '<option value="">Choose a landmark</option>',
          ...landmarks.map((milestone) =>
            `<option value="${escapeHtml(milestone.id)}">${escapeHtml(milestone.name)} (Mile ${milestone.mile - 1})</option>`
          )
        ].join('');
        refs.menuLandmarkWarpSelect.value = landmarks.some((milestone) => milestone.id === selectedId) ? selectedId : '';
      }
      if (!state.journeyStarted) refs.menuLandmarkWarpSelect.value = '';
      refs.menuLandmarkWarpSelect.disabled = !state.journeyStarted
        || state.gameOver
        || state.journeyLoading
        || state.actionInProgress
        || state.narrationLoading
        || state.turnPhase === 'results'
        || state.turnPhase === 'resolving';
      if (refs.menuLandmarkWarpButton) {
        refs.menuLandmarkWarpButton.disabled = refs.menuLandmarkWarpSelect.disabled || !refs.menuLandmarkWarpSelect.value;
      }
    }
    if (refs.menuBeginJourneyBtn) {
      refs.menuBeginJourneyBtn.disabled = state.journeyStarted && !state.journeyLoading;
    }
  }

  function closeMenus() {
    activeMenuName = null;
    document.querySelectorAll('.menu-btn[data-menu-trigger]').forEach((button) => {
      button.classList.remove('is-active');
      button.setAttribute('aria-expanded', 'false');
    });
    document.querySelectorAll('.menu-dropdown[data-menu]').forEach((menu) => {
      menu.hidden = true;
    });
  }

  function toggleMenu(menuName) {
    const opening = activeMenuName !== menuName;
    closeMenus();
    if (!opening) return;
    activeMenuName = menuName;
    const trigger = document.querySelector(`.menu-btn[data-menu-trigger="${menuName}"]`);
    const dropdown = document.querySelector(`.menu-dropdown[data-menu="${menuName}"]`);
    if (!(trigger instanceof HTMLElement) || !(dropdown instanceof HTMLElement)) {
      activeMenuName = null;
      return;
    }
    trigger.classList.add('is-active');
    trigger.setAttribute('aria-expanded', 'true');
    dropdown.hidden = false;
  }

  function renderWorldMeta(world) {
    if (!refs.worldMetaEl) return;
    refs.worldMetaEl.innerHTML = `
      <span class="meta-chip">SEED ${world.worldSeed}</span>
      <span class="meta-chip">RULES ${world.rulesVersion}</span>
      <span class="meta-chip">EPOCH ${new Date(world.epochStart).toLocaleDateString()}</span>
    `;
  }

  function renderSelectedTile(tile) {
    const locationName = locationNameForTile(tile.tileId, tile.biome);
    const weather = tile.weather ?? { rain: 0, tempC: 0, windKph: 0 };
    const riverRow = tile.biome === 'river' && tile.river
      ? `<div><dt>River</dt><dd>${tile.river.depthFt} ft / ${tile.river.flowRate} cfs</dd></div>`
      : '';
    const resourceRows = (tile.resources ?? []).map((resource) => `
      <tr>
        <td>${resource.resourceType}</td>
        <td>${resource.remaining} ${resourceUnitsLabel(resource.resourceType)}</td>
      </tr>
    `).join('');

    refs.selectedTileEl.innerHTML = `
      <p class="eyebrow">Survey notes</p>
      <h3>${locationName}</h3>
      <dl>
        <div><dt>Biome</dt><dd>${tile.biome}</dd></div>
        <div><dt>Elevation</dt><dd>${tile.elevation} ft</dd></div>
        <div><dt>Rain</dt><dd>${Math.round(weather.rain)}%</dd></div>
        <div><dt>Temperature</dt><dd>${weather.tempC}°C</dd></div>
        <div><dt>Wind</dt><dd>${weather.windKph} kph</dd></div>
        ${riverRow}
        <div><dt>Ledger node</dt><dd>${tile.tileId}</dd></div>
      </dl>
      <table class="resources-ledger">
        <tbody>${resourceRows}</tbody>
      </table>
    `;
  }

  function bindStoryControls() {
    const readBtn = document.querySelector('#story-read-btn');
    if (readBtn) {
      readBtn.onclick = () => {
        invokeUiClick('read');
        handlers.onReadNarration();
      };
    }
  }

  function renderStory(state, renderState) {
    if (!refs.storyCardEl) return;

    const narration = state.latestNarration;
    const storySourceLabel = narration?.source === 'llm'
      ? 'Story source: Gemini'
      : narration?.source === 'deterministic'
        ? 'Story source: fallback'
        : 'Story source: pending';
    const mutationNotice = narration?.surrealMutation
      ? `<p class="story-glitch"><strong>${escapeHtml(narration.surrealMutation.title)}</strong> // ${escapeHtml(narration.surrealMutation.severity)}<br>${escapeHtml(narration.surrealMutation.manifestation)}<br><span>GAMEPLAY TWIST: ${escapeHtml(narration.surrealMutation.gameplayTwist)}</span></p>`
      : '';

    const controls = `
      <div class="story-controls">
        <span class="story-source">${storySourceLabel}</span>
        <span class="story-source">${renderState.cloudNarrationEnabled ? 'Voice: cloud' : 'Voice: browser'}</span>
        <button id="story-read-btn" class="action-btn" type="button">Play voice</button>
      </div>
    `;

    refs.storyCardEl.innerHTML = `
      <p class="eyebrow">Expedition journal</p>
      <h3>${escapeHtml(narration?.headline ?? 'The trail waits')}</h3>
      ${controls}
      <p>${escapeHtml(narration?.body ?? 'Move the party, and the trail will tell the story.')}</p>
      ${mutationNotice}
    `;
    bindStoryControls();
  }

  function renderObjective(state) {
    const currentMilestone = getCurrentMilestone(state);
    const nextMilestone = getNextMilestone(state);
    const remainingMiles = Math.max(0, TOTAL_TRAIL_MILES - state.milesTraveled);
    const remainingDays = Math.max(1, Math.ceil(remainingMiles / 16));
    const phase = getJourneyPhase(state);

    let summary = 'Keep moving west, conserve supplies, and let the ledger remember every choice.';
    if (state.journeyCompleted) {
      summary = 'You reached the frontier. The ledger remains open for the aftermath.';
    } else if (remainingMiles <= 200) {
      summary = 'The frontier is close now. Every stop matters more.';
    } else if (state.wagon.food < 10 || state.wagon.water < 10) {
      summary = 'Critical shortages loom. Empty stores now bleed directly into health.';
    }

    refs.objectiveCardEl.innerHTML = `
      <p class="eyebrow">Expedition docket</p>
      <h3>Independence to Willamette Valley</h3>
      <p><strong>Current position:</strong> ${currentMilestone.name}</p>
      <p><strong>Distance remaining:</strong> ${remainingMiles} miles</p>
      <p><strong>Estimated travel:</strong> ${remainingDays} days</p>
      <p><strong>Next stop:</strong> ${nextMilestone ? `${nextMilestone.name} (${getMilesToNextMilestone(state)} miles)` : 'Willamette reached'}</p>
      <p><strong>Chapter:</strong> ${state.gameOver ? 'Failed expedition' : phase === 'start' ? 'Departure' : phase === 'finish' ? 'Arrival' : 'Overland crossing'}</p>
      <p>${summary}</p>
    `;
  }

  function renderWagonState() {
    refs.wagonStateEl.hidden = true;
    refs.wagonStateEl.innerHTML = '';
  }

  function renderHazardBanner(state) {
    if (!refs.hazardBannerEl) return;

    const obstacle = state.activeObstacle;
    if (!obstacle || state.gameOver) {
      refs.hazardBannerEl.hidden = true;
      refs.hazardBannerEl.innerHTML = '';
      lastHazardKey = '';
      return;
    }

    const hazardKey = `${obstacle.description}:${obstacle.choices.map((choice) => choice.id).join(':')}`;
    if (hazardKey !== lastHazardKey) {
      handlers.onHazardAlert();
      lastHazardKey = hazardKey;
    }

    refs.hazardBannerEl.hidden = false;
    refs.hazardBannerEl.innerHTML = `
      <div class="hazard-banner-card" role="status" aria-live="polite">
        <p class="eyebrow">Hazard alert</p>
        <h3>${escapeHtml(obstacle.description)}</h3>
        <p class="hazard-banner-copy"><strong>Dilemma:</strong> Choose how to respond; each option spends a different resource.</p>
        <p class="hazard-banner-copy"><strong>Options:</strong> ${obstacle.choices.map((choice) => escapeHtml(choice.label)).join(' • ')}</p>
      </div>
    `;
  }

  function renderActionSummary(state) {
    if (!refs.actionSummaryEl) return;
    const summary = state.lastActionSummary;
    if (!summary) {
      refs.actionSummaryEl.hidden = true;
      refs.actionSummaryEl.innerHTML = '';
      return;
    }

    refs.actionSummaryEl.hidden = false;
    refs.actionSummaryEl.innerHTML = `
      <div class="action-summary-card" role="status" aria-live="polite">
        <p class="eyebrow">Action summary</p>
        <h3>${escapeHtml(summary.title)} • ${escapeHtml(summary.location)}</h3>
        <p class="action-summary-copy">${escapeHtml(summary.detail)}</p>
        <div class="wagon-readout">
          ${(summary.metrics ?? []).map((metric) => `
            <div><strong>${escapeHtml(metric.label)}</strong> ${escapeHtml(metric.delta)}</div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderStatusBanner(state) {
    if (state.gameOver) {
      refs.statusBannerEl.innerHTML = `
        <p class="eyebrow">Dispatch</p>
        <h3>Expedition over</h3>
        <p><strong>${escapeHtml(state.statusMessage)}</strong></p>
        <p>Use the restart control in the title bar to assemble a new wagon.</p>
      `;
      refs.statusBannerEl.classList.add('game-over');
      return;
    }

    refs.statusBannerEl.classList.remove('game-over');
    refs.statusBannerEl.innerHTML = `
      <p class="eyebrow">Trail bulletin</p>
      <h3>Current dispatch</h3>
      <p><strong>${escapeHtml(state.statusMessage)}</strong></p>
      ${state.journeyCompleted ? '<p>The route is complete, but the ledger remains active for aftermath choices.</p>' : ''}
    `;
  }

  function renderEventLog(events = []) {
    const visibleEvents = events.filter((event) => !['resource_consumed', 'claim_finalized'].includes(event.eventType ?? ''));
    const items = (visibleEvents.length ? visibleEvents : [{ eventType: 'world', payload: { note: 'No events yet; the trail is still quiet.' } }])
      .slice(0, 8)
      .map((event) => {
        const payload = event.payload ?? {};
        let detail = payload.note ?? payload.actionType ?? payload.resourceType ?? 'trail report';
        if ((event.eventType ?? '') === 'trade_committed' && detail === 'trail report') {
          const offer = Object.entries(payload.offer ?? {}).map(([resource, amount]) => `${amount} ${resource}`).join(', ');
          const request = Object.entries(payload.request ?? {}).map(([resource, amount]) => `${amount} ${resource}`).join(', ');
          detail = `Committed trade: gave ${offer || 'nothing'} for ${request || 'nothing'}.`;
        }
        const label = (event.eventType ?? 'world').replace(/_/g, ' ');
        const eventHash = shortHash(event.eventHash ?? event.event_hash ?? '');
        const actor = shortHash(event.actorPubkey ?? event.actor_pubkey ?? '', 12);
        return `
          <li>
            <div class="event-line">
              <strong>${escapeHtml(label)}</strong>
              <span class="event-meta">${eventHash}</span>
            </div>
            <div class="event-detail">${escapeHtml(detail)}</div>
            <div class="event-meta">actor ${actor}</div>
          </li>
        `;
      })
      .join('');

    refs.eventLogEl.innerHTML = `
      <p class="eyebrow">Immutable ledger</p>
      <h3>Recent chain entries</h3>
      <ul>${items}</ul>
    `;
  }

  function resetActionButtons() {
    document.querySelectorAll('[data-action]').forEach((button) => {
      button.disabled = false;
    });
  }

  function renderMap(state) {
    if (!refs.mapEl) return;
    const prevScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    const prevScrollX = typeof window !== 'undefined' ? window.scrollX : 0;
    lastRenderedState = state;
    if (state.setupStage === 'outfitting' && !state.journeyStarted) {
      refs.mapEl.innerHTML = setupStageMarkup(state);
      updateOutfittingCart(state, true);
      refreshLandscapeCanvas(state);
      refs.mapEl.querySelector('[data-cart-input="oxenYokes"]')?.focus({ preventScroll: true });
      return;
    }

    const selectedTile = state.currentTrailSnapshot ?? fallbackTile;
    const currentMilestone = getCurrentMilestone(state);
    const locationName = currentMilestone.shortName;
    const weather = selectedTile.weather ?? { rain: 0, tempC: 0, windKph: 0 };
    const displayedFlow = selectedTile.biome === 'river' && selectedTile.river
      ? selectedTile.river.flowRate
      : null;
    const { supplies, load, loadTier, metrics } = wagonMetrics(state);
    const eraMeta = getEraById(state.selectedEra);
    const isResultsPhase = state.turnPhase === 'results';
    const isResolvingPhase = state.turnPhase === 'resolving';
    const isProloguePhase = state.turnPhase === 'prologue';
    const showNarrationLoader = narrationLoadingActive && !isResultsPhase && !isProloguePhase;
    const partyMarkup = (state.wagon.party ?? []).map((member, idx) => `
      <li class="party-manifest-row">
        <div class="party-manifest-person">
          <canvas class="party-portrait-canvas" data-party-portrait-canvas="${idx}" width="32" height="32"></canvas>
          <strong>${escapeHtml(member.name)}</strong>
        </div>
        <span>${escapeHtml(member.role)} • ${member.health} HP • ${escapeHtml(member.status)}</span>
      </li>
    `).join('');
    refs.mapEl.innerHTML = `
      <div class="scene-layout">
        <div class="scene-viewport retro-inset${state.travelAnimationActive ? ' is-traveling' : ''}" data-biome="${selectedTile.biome ?? 'unknown'}">
          <div class="viewport-hud viewport-hud-top">
            <span class="scene-tag">${escapeHtml(state.expeditionName)}</span>
            <span class="scene-tag">${escapeHtml(eraMeta.label)}</span>
            <span class="scene-tag">${locationName}</span>
            <span class="hud-chip">${selectedTile.biome ?? 'unknown'}</span>
            <span class="hud-chip">DAY ${state.day}</span>
            <span class="hud-chip">${weather.tempC}°C</span>
            <span class="hud-chip">RAIN ${Math.round(weather.rain)}%</span>
            <span class="hud-chip">WIND ${weather.windKph} KPH</span>
            ${displayedFlow !== null ? `<span class="hud-chip">FLOW ${displayedFlow} CFS</span>` : ''}
            <span class="hud-chip">HEALTH ${state.wagon.health}%</span>
            <span class="hud-chip">FOOD ${supplies.foodRations}</span>
            <span class="hud-chip">WATER ${supplies.waterGallons}</span>
            <span class="hud-chip">WOOD ${supplies.firewoodBundles}</span>
            <span class="hud-chip">AMMO ${supplies.ammunitionBoxes}</span>
            <span class="hud-chip">CASH $${state.wagon.cash.toFixed(2)}</span>
            <button id="terminal-voice-btn" class="action-btn hud-btn voice-btn" type="button" title="Play Voice Audio" ${isResultsPhase || isResolvingPhase || isProloguePhase || state.narrationLoading ? 'disabled' : ''}>▶ PLAY VOICE</button>
          </div>
          ${trailRibbonMarkup(state)}
          ${landscapeStageMarkup(state)}
          <div class="teletype-screen" aria-label="Teletype chronicle">
            <div class="teletype-screen-glow"></div>
            <div class="teletype-log" aria-live="polite"></div>
            <div class="teletype-loader-shell" ${showNarrationLoader ? '' : 'hidden'}>${showNarrationLoader ? renderLoaderMarkup() : ''}</div>
            <div class="teletype-prompt-shell"></div>
          </div>
          <div class="viewport-command-dock">
            <div class="viewport-primary-travel" aria-label="Primary travel control">
              ${isResultsPhase ? `
              <button class="action-btn hud-btn continue-dispatch-btn" type="button" data-continue-dispatch>
                <span class="keycap keycap-wide">SPACE / ENTER</span>
                <span>CONTINUE</span>
                <small>Open trail dispatch</small>
              </button>
              ` : isResolvingPhase ? `
              <button class="action-btn hud-btn continue-dispatch-btn" type="button" disabled>
                <span>RESOLVING TURN</span>
                <small>Waiting for the next dispatch</small>
              </button>
              ` : isProloguePhase ? `
              <button class="action-btn hud-btn continue-dispatch-btn" type="button" data-start-trail ${state.journeyLoading || !state.prologueReady || state.landscapeMoving ? 'disabled' : ''}>
                <span class="keycap keycap-wide">SPACE / ENTER</span>
                <span>GET SUPPLIES</span>
                <small>Walk to General Store</small>
              </button>
              ` : `<button class="action-btn hud-btn press-on-btn" type="button" data-action="press-on">
                <span class="keycap keycap-wide">SPACE / ENTER</span>
                <span>PRESS ON</span>
                <small>Continue West</small>
              </button>`}
            </div>
            <div class="viewport-action-cluster">
              <div class="viewport-utility-bar" aria-label="Trail actions">
                <button class="action-btn hud-btn utility" type="button" data-action="camp"><span class="keycap">1</span><span>CAMP</span></button>
                <button class="action-btn hud-btn utility" type="button" data-action="hunt"><span class="keycap">2</span><span>HUNT</span></button>
                <button class="action-btn hud-btn utility" type="button" data-action="gather"><span class="keycap">3</span><span>GATHER</span></button>
                <button class="action-btn hud-btn utility" type="button" data-action="treat"><span class="keycap">4</span><span>TREAT</span></button>
                <button class="action-btn hud-btn utility" type="button" data-action="trade"><span class="keycap">5</span><span>TRADE</span></button>
                <button class="action-btn hud-btn utility" type="button" data-action="repair"><span class="keycap">6</span><span>REPAIR</span></button>
                <button class="action-btn hud-btn utility" type="button" data-action="scout"><span class="keycap">7</span><span>SCOUT</span></button>
              </div>
              <div class="viewport-selectors">
                <label class="hud-selector">PACE
                  <select id="hud-pace-select" ${isResultsPhase || isResolvingPhase || isProloguePhase || state.narrationLoading || !state.journeyStarted ? 'disabled' : ''}>
                    <option value="steady" ${state.wagon.pace === 'steady' ? 'selected' : ''}>Steady</option>
                    <option value="strenuous" ${state.wagon.pace === 'strenuous' ? 'selected' : ''}>Strenuous</option>
                    <option value="grueling" ${state.wagon.pace === 'grueling' ? 'selected' : ''}>Grueling</option>
                  </select>
                </label>
                <label class="hud-selector">RATIONS
                  <select id="hud-rations-select" ${isResultsPhase || isResolvingPhase || isProloguePhase || state.narrationLoading || !state.journeyStarted ? 'disabled' : ''}>
                    <option value="filling" ${state.wagon.rations === 'filling' ? 'selected' : ''}>Filling</option>
                    <option value="normal" ${state.wagon.rations === 'normal' ? 'selected' : ''}>Normal</option>
                    <option value="meager" ${state.wagon.rations === 'meager' ? 'selected' : ''}>Meager</option>
                  </select>
                </label>
              </div>
            </div>
          </div>
        </div>
        <div class="map-board">
          <p class="eyebrow">Wagon gauges</p>
          <h3>Supply &amp; System monitor</h3>
          <div class="monitor-screen">
            <div class="gauge-grid">
              ${metrics.map((metric) => `
                <div class="gauge-row">
                  <span class="gauge-label">${metric.label}</span>
                  ${buildLedMeter(metric.value, metric.max)}
                  <strong class="gauge-value">${metric.text}</strong>
                </div>
              `).join('')}
            </div>
            <div class="wagon-readout">
              <div><strong>LOAD:</strong> ${Math.round(load)} / ${WAGON_CAPACITY} lbs (${loadTier.toUpperCase()})</div>
              <div><strong>CASH:</strong> $${state.wagon.cash.toFixed(2)}</div>
              <div><strong>DRAFT:</strong> ${state.wagon.oxenYokes} yokes / ${state.wagon.oxen} oxen</div>
              <div><strong>OXEN FATIGUE:</strong> ${state.wagon.oxenFatigue}%</div>
              <div><strong>STATUS:</strong> ${escapeHtml(state.wagon.status)}</div>
              <div><strong>DAY:</strong> ${state.day}</div>
              <div><strong>PARTY ERA:</strong> ${escapeHtml(eraMeta.label)}</div>
              <div><strong>STRANGENESS:</strong> ${getEffectiveStrangenessLevel(state)}/${MAX_STRANGENESS_LEVEL}${state.strangenessLevelOverride === null ? '' : ' (TEST OVERRIDE)'}</div>
              <div><strong>PACE:</strong> ${paceLabel(state.wagon.pace)}</div>
              <div><strong>RATIONS:</strong> ${rationsLabel(state.wagon.rations)}</div>
              <div><strong>AXLE:</strong> ${state.wagon.wagonParts.axle}% (${state.wagon.spareAxles} spare)</div>
              <div><strong>WHEELS:</strong> ${state.wagon.wagonParts.wheels}% (${state.wagon.spareWheels} spare)</div>
              <div><strong>TONGUE:</strong> ${state.wagon.wagonParts.tongue}% (${state.wagon.spareTongues} spare)</div>
            </div>
            <div class="party-manifest">
              <p class="eyebrow">Party manifest (32×32 crew)</p>
              <ul>${partyMarkup}</ul>
            </div>
            <div class="survey-readout">
              <p class="eyebrow">Waypoint survey</p>
              <div class="survey-grid">
                <div><strong>POSITION:</strong> ${currentMilestone.name}</div>
                <div><strong>NEXT:</strong> ${getNextMilestone(state) ? `${getNextMilestone(state).name} (${getMilesToNextMilestone(state)} mi)` : 'Willamette Valley reached'}</div>
                <div><strong>ELEVATION:</strong> ${selectedTile.elevation ?? 0} ft</div>
                <div><strong>TERRAIN:</strong> ${selectedTile.biome ?? 'grassland'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    refreshLandscapeCanvas(state);
    syncChronicle(state, locationName, weather, supplies);
    if (isResultsPhase || isResolvingPhase || isProloguePhase || state.narrationLoading) updateActionState(state);
    if (typeof window !== 'undefined' && (window.scrollY !== prevScrollY || window.scrollX !== prevScrollX)) {
      window.scrollTo({ left: prevScrollX, top: prevScrollY, behavior: 'instant' });
    }
  }

  function updateActionState(state) {
    updateMenuControls(state);
    document.querySelectorAll('[data-action]').forEach((button) => {
      const action = button.dataset.action;
      button.title = actionProjection(action, state);

      if (state.gameOver || !state.journeyStarted || state.narrationLoading || state.actionInProgress || state.activeDecision || state.turnPhase === 'results' || state.turnPhase === 'resolving' || state.turnPhase === 'prologue') {
        button.disabled = true;
        return;
      }
      if (action === 'press-on' && state.wagon.oxenYokes < 2) {
        button.disabled = true;
        button.title = 'At least 2 yokes (4 oxen) are required to travel.';
        return;
      }
      if (action === 'press-on' && wagonLoadWeight(state.wagon) > WAGON_CAPACITY) {
        button.disabled = true;
        button.title = 'Reduce cargo below 2,400 lbs before traveling.';
        return;
      }
      if (action === 'hunt' && (state.wagon.ammunition ?? 0) <= 0) {
        button.disabled = true;
        return;
      }
      if (action === 'repair' && !state.wagon.wagonParts.brokenPart && state.wagon.wagonParts.axle > 85 && state.wagon.wagonParts.wheels > 85) {
        button.disabled = true;
        return;
      }
      if (state.journeyCompleted && action === 'press-on') {
        button.disabled = true;
        return;
      }
      button.disabled = false;
    });
  }

  function getStoryVoiceSelect() {
    return refs.menuVoiceSelect;
  }

  function setDecisionInputBuffer(value) {
    terminalDecisionInput.buffer = String(value ?? '').slice(0, 240);
    terminalDecisionInput.feedback = terminalDecisionInput.buffer
      ? (terminalDecisionInput.mode === 'meta-dialogue' ? 'Press Enter to send these words.' : 'Press Enter to confirm this choice.')
      : (terminalDecisionInput.mode === 'meta-dialogue' ? 'Response cleared.' : 'Choice cleared.');
    paintChronicle();
  }

  function clearDecisionInputBuffer(state) {
    terminalDecisionInput.buffer = '';
    terminalDecisionInput.feedback = state ? defaultDecisionFeedback(state) : '';
    terminalDecisionInput.mode = state?.pendingMetaDialogue ? 'meta-dialogue' : 'choice';
    paintChronicle();
  }

  function setDecisionInputFeedback(message) {
    terminalDecisionInput.feedback = message;
    paintChronicle();
  }

  function getDecisionInputBuffer() {
    return terminalDecisionInput.buffer;
  }

  bindStaticControls();

  return {
    refs,
    getStoryVoiceSelect,
    hideJourneyModal,
    refreshCreatorCanvases,
    refreshLandscapeCanvas,
    renderEventLog,
    renderHazardBanner,
    renderActionSummary,
    renderJourneyModal,
    renderMap,
    renderObjective,
    renderSelectedTile,
    renderStatusBanner,
    renderStory,
    renderWagonState,
    renderWorldMeta,
    resetActionButtons,
    clearDecisionInputBuffer,
    getDecisionInputBuffer,
    isTeletypeStreaming,
    closeMenus,
    setDecisionInputBuffer,
    setDecisionInputFeedback,
    setHandlers,
    setJourneyLoading,
    updateOutfittingCart,
    setNarrationLoading,
    setLocalReadAloudEnabled,
    showJourneyModal,
    skipTeletype,
    syncJourneyControls,
    updateActionState
  };
}
