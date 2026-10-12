import {
  MAX_STRANGENESS_LEVEL,
  TOTAL_TRAIL_MILES,
  WAGON_CAPACITY,
  fallbackTile,
  getCurrentMilestone,
  getJourneyPhase,
  getMilesToNextMilestone,
  getNextMilestone,
  locationNameForTile,
  paceLabel,
  rationsLabel,
  resourceUnitsLabel,
  trailMilestones,
  toSupplySnapshot,
  wagonLoadWeight
} from './state.js';

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
    .replaceAll('>', '&gt;');
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
    scout: 'Send Jedediah ahead to inspect the next stretch of trail.'
  };
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

function normalizeCompareText(text = '') {
  return normalizeLine(text).toLowerCase().replace(/[^a-z0-9\s]/g, '');
}

function prefixTerminalLine(text = '') {
  const normalized = normalizeLine(text);
  if (!normalized) return '';
  return normalized.startsWith('>') ? normalized : `> ${normalized}`;
}

function atmosphericLine(locationName, weather, state) {
  const weatherMood = weather.rain > 70
    ? 'rain needles the canvas and turns every board slick'
    : weather.tempC < 0
      ? 'the cold bites through wool and stiffens every joint'
      : weather.windKph > 28
        ? 'a restless wind worries the wagon canvas and the oxen alike'
        : 'the air feels calm enough, though the trail never truly relaxes';
  const strangenessMood = state.strangenessLevel >= 6
    ? 'even the oxen seem to listen for a voice beyond the horizon'
    : state.strangenessLevel >= 3
      ? 'something faintly wrong lingers at the edge of the day'
      : 'the country watches in the old indifferent way';
  return `${locationName} offers no comfort: ${weatherMood}, and ${strangenessMood}.`;
}

function supplyLine(supplies, state) {
  return `The day closes with ${supplies.foodRations} rations, ${supplies.waterGallons} gal water, ${supplies.firewoodBundles} wood, ${supplies.medicineDoses} medicine, and morale at ${state.wagon.morale}%.`;
}

function chronicleBeatsForState(state, locationName, weather, supplies) {
  const explicitLines = Array.isArray(state.latestNarration?.lines)
    ? state.latestNarration.lines.map(normalizeLine).filter(Boolean)
    : [];
  if (explicitLines.length >= 3) {
    return explicitLines.slice(0, 3).map((line) => prefixTerminalLine(line));
  }

  const bodySentences = splitSentences(state.narrationText).map(normalizeLine).filter(Boolean);
  const headline = normalizeLine(state.latestNarration?.headline);
  const actionBeat = bodySentences[0]
    || headline
    || `${locationName} on day ${state.day} waits for the next hard choice.`;
  const atmosphereBeat = bodySentences[1] || atmosphericLine(locationName, weather, state);
  const outcomeBeat = bodySentences[2]
    || state.statusMessage
    || supplyLine(supplies, state);

  return [
    prefixTerminalLine(actionBeat),
    prefixTerminalLine(atmosphereBeat),
    prefixTerminalLine(`${outcomeBeat} ${supplyLine(supplies, state)}`.trim())
  ];
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

function decisionLinesForState(state) {
  const decision = state.activeDecision;
  if (!decision) return [];
  const lines = [
    '',
    `[${decision.eyebrow ?? 'Decision'}] ${decision.title}`,
    decision.body
  ];
  for (const option of decision.options ?? []) {
    lines.push(`[${option.hotkey ?? '?'}] ${option.label} — ${option.detail}`);
  }
  lines.push(`Type ${choiceRangeText(decision.options)} and press Enter.`);
  return lines.map((line) => normalizeLine(line));
}

function chronicleLinesForState(state, locationName, weather, supplies) {
  return [
    ...chronicleBeatsForState(state, locationName, weather, supplies),
    ...decisionLinesForState(state)
  ];
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

function renderChronicleMarkup(lines, isStreaming) {
  return lines.map((line, index) => {
    const suffix = isStreaming && index === lines.length - 1 ? '<span class="teletype-cursor" aria-hidden="true">█</span>' : '';
    const classes = ['teletype-line'];
    if (!line) classes.push('spacer');
    if (line.startsWith('[') && !line.startsWith('[1') && !line.startsWith('[2') && !line.startsWith('[3') && !line.startsWith('[4') && !line.startsWith('[5') && !line.startsWith('[6') && !line.startsWith('[7') && !line.startsWith('[8') && !line.startsWith('[9')) {
      classes.push('system');
    }
    const choiceMatch = line.match(/^\[(\d+)\]/);
    if (choiceMatch) {
      classes.push('choice');
      return `<div class="${classes.join(' ')}" data-choice-key="${choiceMatch[1]}" style="cursor: pointer;">${escapeHtml(line)}${suffix}</div>`;
    }
    return `<div class="${classes.join(' ')}">${escapeHtml(line)}${suffix}</div>`;
  }).join('');
}

function wagonMetrics(state) {
  const { wagon } = state;
  const supplies = toSupplySnapshot(wagon);
  return {
    supplies,
    load: wagonLoadWeight(wagon),
    metrics: [
      { label: 'HEALTH', value: wagon.health, max: 100, text: `${wagon.health}%` },
      { label: 'MORALE', value: wagon.morale, max: 100, text: `${wagon.morale}%` },
      { label: 'FOOD', value: supplies.foodRations, max: 220, text: `${supplies.foodRations} rations` },
      { label: 'WATER', value: supplies.waterGallons, max: 240, text: `${supplies.waterGallons} gal` },
      { label: 'WOOD', value: supplies.firewoodBundles, max: 70, text: `${supplies.firewoodBundles} bundles` },
      { label: 'MEDICINE', value: supplies.medicineDoses, max: 20, text: `${supplies.medicineDoses} doses` },
      { label: 'AMMO', value: supplies.ammunitionBoxes, max: 24, text: `${supplies.ammunitionBoxes} boxes` }
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
    loaderEl: document.querySelector('#journey-loader'),
    beginJourneyBtn: document.querySelector('#begin-journey-btn'),
    menuNewGameBtn: document.querySelector('#menu-new-game'),
    menuBeginJourneyBtn: document.querySelector('#menu-begin-journey'),
    menuLedgerJumpBtn: document.querySelector('#menu-ledger-jump'),
    menuPlayVoiceBtn: document.querySelector('#menu-play-voice'),
    menuCloudToggle: document.querySelector('#menu-cloud-toggle'),
    menuAutoReadToggle: document.querySelector('#menu-auto-read-toggle'),
    menuStorySourceToggle: document.querySelector('#menu-story-source-toggle'),
    menuVoiceSelect: document.querySelector('#menu-voice-select')
  };

  const handlers = {
    onAction: () => {},
    onBeginJourney: () => {},
    onRefresh: () => {},
    onJourneyLlmToggle: () => {},
    onJourneyCloudToggle: () => {},
    onJourneyAutoReadToggle: () => {},
    onNewGame: () => {},
    onBeginJourneyFromMenu: () => {},
    onLedgerJump: () => {},
    onReadNarration: () => {},
    onStorySourceToggle: () => {},
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
  const chroniclePlayback = {
    key: '',
    fullLines: [],
    renderedLines: [],
    lineIndex: 0,
    charIndex: 0,
    streaming: false,
    timer: null
  };
  const terminalDecisionInput = {
    decisionKey: '',
    buffer: '',
    feedback: ''
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

  function chronicleElements() {
    const logEl = refs.mapEl?.querySelector('.teletype-log');
    const screenEl = refs.mapEl?.querySelector('.teletype-screen');
    return { logEl, screenEl };
  }

  function paintChronicle(autoScroll = true) {
    const { logEl, screenEl } = chronicleElements();
    if (!(logEl instanceof HTMLElement)) return;
    logEl.innerHTML = renderChronicleMarkup(chroniclePlayback.renderedLines, chroniclePlayback.streaming);
    const promptShellEl = screenEl?.querySelector('.teletype-prompt-shell');
    if (promptShellEl instanceof HTMLElement) {
      promptShellEl.innerHTML = renderTerminalPromptMarkup();
    }
    if (autoScroll && screenEl instanceof HTMLElement) {
      const cursorEl = screenEl.querySelector('.teletype-cursor');
      if (cursorEl instanceof HTMLElement) {
        cursorEl.scrollIntoView({ block: 'nearest', behavior: 'auto' });
      }
    }
  }

  function finishChronicleImmediately() {
    clearChronicleTimer();
    chroniclePlayback.renderedLines = [...chroniclePlayback.fullLines];
    chroniclePlayback.lineIndex = chroniclePlayback.fullLines.length;
    chroniclePlayback.charIndex = 0;
    chroniclePlayback.streaming = false;
    paintChronicle(false);
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

    let matchCount = 0;
    while (
      matchCount < previousRendered.length &&
      matchCount < lines.length &&
      previousRendered[matchCount] === lines[matchCount]
    ) {
      matchCount++;
    }

    console.log('[teletype-debug] beginChronicle', {
      key,
      matchCount,
      totalLines: lines.length,
      isExtension: matchCount > 0 && matchCount < lines.length,
      previousRenderedCount: previousRendered.length,
      lines
    });

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
      options: (decision.options ?? []).map((option) => ({
        hotkey: option.hotkey,
        id: option.id,
        label: option.label
      }))
    });
  }

  function defaultDecisionFeedback(state) {
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
      terminalDecisionInput.feedback = defaultDecisionFeedback(state);
      return;
    }
    if (!terminalDecisionInput.feedback) {
      terminalDecisionInput.feedback = defaultDecisionFeedback(state);
    }
  }

  function renderTerminalPromptMarkup() {
    if (!terminalDecisionInput.decisionKey) return '';
    const classes = ['teletype-prompt'];
    if (terminalDecisionInput.feedback.toLowerCase().startsWith('invalid')) {
      classes.push('invalid');
    }
    const buffer = terminalDecisionInput.buffer || '';
    return `
      <div class="${classes.join(' ')}">
        <div class="teletype-prompt-line">
          <span class="teletype-prompt-label">CHOICE&gt;</span>
          <span class="teletype-prompt-value">${escapeHtml(buffer)}</span>
          <span class="teletype-cursor" aria-hidden="true">█</span>
        </div>
        <div class="teletype-prompt-hint">${escapeHtml(terminalDecisionInput.feedback)}</div>
      </div>
    `;
  }

  function syncChronicle(state, locationName, weather, supplies) {
    syncDecisionInputState(state);
    const lines = chronicleLinesForState(state, locationName, weather, supplies);
    const key = JSON.stringify({
      day: state.day,
      locationName,
      headline: state.latestNarration?.headline ?? '',
      body: state.narrationText ?? '',
      lines: Array.isArray(state.latestNarration?.lines) ? state.latestNarration.lines : [],
      statusMessage: state.statusMessage,
      actionType: state.lastActionContext?.actionType ?? '',
      actionOutcome: state.lastActionContext?.outcome ?? '',
      decisionTitle: state.activeDecision?.title ?? '',
      decisionBody: state.activeDecision?.body ?? '',
      decisionOptions: (state.activeDecision?.options ?? []).map((option) => `${option.hotkey}:${option.label}:${option.detail}`)
    });

    const keyChanged = chroniclePlayback.key !== key;

    if (state.actionInProgress && chroniclePlayback.streaming && !keyChanged) {
      return;
    }
    console.log('[teletype-debug] syncChronicle', {
      keyChanged,
      actionInProgress: state.actionInProgress,
      streaming: chroniclePlayback.streaming,
      lineCount: lines.length,
      lines
    });

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

  function bindStaticControls() {
    refs.refreshBtn?.addEventListener('click', () => {
      invokeUiClick('refresh');
      handlers.onRefresh();
    });
    refs.beginJourneyBtn?.addEventListener('click', () => {
      invokeUiClick('begin');
      handlers.onBeginJourney();
    });
    refs.mapEl?.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const choiceEl = target.closest('[data-choice-key]');
      if (choiceEl instanceof HTMLElement && choiceEl.dataset.choiceKey) {
        invokeUiClick('choice');
        handlers.onDecisionChoice(choiceEl.dataset.choiceKey);
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

  function setJourneyLoading(isLoading) {
    document.body.classList.toggle('journey-loading', isLoading);
    if (refs.loaderEl) refs.loaderEl.hidden = !isLoading;
  }

  function showJourneyModal() {
    document.body.classList.add('journey-setup');
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
      ? `<p class="story-glitch">Mutation noted: ${narration.surrealMutation.description}</p>`
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
      <h3>${narration?.headline ?? 'The trail waits'}</h3>
      ${controls}
      <p>${narration?.body ?? 'Move the party, and the trail will tell the story.'}</p>
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

  function renderWagonState(state) {
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
        <h3>${obstacle.description}</h3>
        <p class="hazard-banner-copy"><strong>Dilemma:</strong> Choose how to respond; each option spends a different resource.</p>
        <p class="hazard-banner-copy"><strong>Options:</strong> ${obstacle.choices.map((choice) => choice.label).join(' • ')}</p>
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
        <h3>${summary.title} • ${summary.location}</h3>
        <p class="action-summary-copy">${summary.detail}</p>
        <div class="wagon-readout">
          ${(summary.metrics ?? []).map((metric) => `
            <div><strong>${metric.label}</strong> ${metric.delta}</div>
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
        <p><strong>${state.statusMessage}</strong></p>
        <p>Use the restart control in the title bar to assemble a new wagon.</p>
      `;
      refs.statusBannerEl.classList.add('game-over');
      return;
    }

    refs.statusBannerEl.classList.remove('game-over');
    refs.statusBannerEl.innerHTML = `
      <p class="eyebrow">Trail bulletin</p>
      <h3>Current dispatch</h3>
      <p><strong>${state.statusMessage}</strong></p>
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
              <strong>${label}</strong>
              <span class="event-meta">${eventHash}</span>
            </div>
            <div class="event-detail">${detail}</div>
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

    const selectedTile = state.currentTrailSnapshot ?? fallbackTile;
    const currentMilestone = getCurrentMilestone(state);
    const locationName = currentMilestone.shortName;
    const weather = selectedTile.weather ?? { rain: 0, tempC: 0, windKph: 0 };
    const displayedTemp = state.strangenessLevel >= 3
      ? Number((weather.tempC + (((state.day + state.currentMilestoneIndex) % 5) - 2) * 3.4).toFixed(1))
      : weather.tempC;
    const displayedFlow = selectedTile.biome === 'river' && selectedTile.river
      ? (state.strangenessLevel >= 3 && state.day % 2 === 0 ? -selectedTile.river.flowRate : selectedTile.river.flowRate)
      : null;
    const { supplies, load, metrics } = wagonMetrics(state);
    const warpUnlocked = state.strangenessLevel >= 8;
    const partyMarkup = (state.wagon.party ?? []).map((member) => `
      <li>
        <strong>${member.name}</strong>
        <span>${member.role} • ${member.health} HP • ${member.status}</span>
      </li>
    `).join('');
    refs.mapEl.innerHTML = `
      <div class="scene-layout">
        <div class="scene-viewport retro-inset${state.travelAnimationActive ? ' is-traveling' : ''}" data-biome="${selectedTile.biome ?? 'unknown'}">
          <div class="viewport-hud viewport-hud-top">
            <span class="scene-tag">${locationName}</span>
            <span class="hud-chip">${selectedTile.biome ?? 'unknown'}</span>
            <span class="hud-chip">DAY ${state.day}</span>
            <span class="hud-chip">${displayedTemp}°C</span>
            <span class="hud-chip">RAIN ${Math.round(weather.rain)}%</span>
            <span class="hud-chip">WIND ${weather.windKph} KPH</span>
            ${displayedFlow !== null ? `<span class="hud-chip">FLOW ${displayedFlow} CFS</span>` : ''}
            <span class="hud-chip">HEALTH ${state.wagon.health}%</span>
            <span class="hud-chip">FOOD ${supplies.foodRations}</span>
            <span class="hud-chip">WATER ${supplies.waterGallons}</span>
            <span class="hud-chip">WOOD ${supplies.firewoodBundles}</span>
            <span class="hud-chip">AMMO ${supplies.ammunitionBoxes}</span>
          </div>
          ${trailRibbonMarkup(state)}
          <div class="teletype-screen" aria-label="Teletype chronicle">
            <div class="teletype-screen-glow"></div>
            <div class="teletype-log" aria-live="polite"></div>
            <div class="teletype-prompt-shell"></div>
          </div>
          <div class="viewport-command-dock">
            <div class="viewport-primary-travel" aria-label="Primary travel control">
              <button class="action-btn hud-btn press-on-btn" type="button" data-action="press-on">
                <span class="keycap keycap-wide">SPACE / ENTER</span>
                <span>PRESS ON</span>
                <small>Continue West</small>
              </button>
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
                ${warpUnlocked ? '<button class="action-btn hud-btn utility warp" type="button" data-action="warp-west"><span>WARP</span></button>' : ''}
              </div>
              <div class="viewport-selectors">
                <label class="hud-selector">PACE
                  <select id="hud-pace-select">
                    <option value="steady" ${state.wagon.pace === 'steady' ? 'selected' : ''}>Steady</option>
                    <option value="strenuous" ${state.wagon.pace === 'strenuous' ? 'selected' : ''}>Strenuous</option>
                    <option value="grueling" ${state.wagon.pace === 'grueling' ? 'selected' : ''}>Grueling</option>
                  </select>
                </label>
                <label class="hud-selector">RATIONS
                  <select id="hud-rations-select">
                    <option value="filling" ${state.wagon.rations === 'filling' ? 'selected' : ''}>Filling</option>
                    <option value="meager" ${state.wagon.rations === 'meager' ? 'selected' : ''}>Meager</option>
                    <option value="bare-bones" ${state.wagon.rations === 'bare-bones' ? 'selected' : ''}>Bare Bones</option>
                  </select>
                </label>
              </div>
            </div>
          </div>
        </div>
        <div class="map-board">
          <p class="eyebrow">Wagon gauges</p>
          <h3>Supply monitor</h3>
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
              <div><strong>LOAD:</strong> ${Math.round(load)} / ${WAGON_CAPACITY} lbs</div>
              <div><strong>STATUS:</strong> ${state.wagon.status}</div>
              <div><strong>DAY:</strong> ${state.day}</div>
              <div><strong>STRANGENESS:</strong> ${state.strangenessLevel}/${MAX_STRANGENESS_LEVEL}</div>
              <div><strong>PACE:</strong> ${paceLabel(state.wagon.pace)}</div>
              <div><strong>RATIONS:</strong> ${rationsLabel(state.wagon.rations)}</div>
              <div><strong>AXLE:</strong> ${state.wagon.wagonParts.axle}%</div>
              <div><strong>WHEELS:</strong> ${state.wagon.wagonParts.wheels}%</div>
            </div>
            <div class="party-manifest">
              <p class="eyebrow">Party roster</p>
              <ul>${partyMarkup}</ul>
            </div>
          </div>
        </div>
      </div>
    `;
    syncChronicle(state, locationName, weather, supplies);
  }

  function updateActionState(state) {
    document.querySelectorAll('[data-action]').forEach((button) => {
      const action = button.dataset.action;
      button.title = actionProjection(action, state);

      if (state.gameOver || state.actionInProgress || state.activeDecision) {
        button.disabled = true;
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
      if (action === 'warp-west' && (state.strangenessLevel < 8 || state.journeyCompleted)) {
        button.disabled = true;
        return;
      }
      if (state.journeyCompleted && (action === 'press-on' || action === 'warp-west')) {
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
    terminalDecisionInput.buffer = String(value ?? '').slice(0, 1);
    terminalDecisionInput.feedback = terminalDecisionInput.buffer
      ? 'Press Enter to confirm this choice.'
      : 'Choice cleared.';
    paintChronicle();
  }

  function clearDecisionInputBuffer(state) {
    terminalDecisionInput.buffer = '';
    terminalDecisionInput.feedback = state ? defaultDecisionFeedback(state) : '';
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
    renderEventLog,
    renderHazardBanner,
    renderActionSummary,
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
    showJourneyModal,
    skipTeletype,
    syncJourneyControls,
    updateActionState
  };
}
