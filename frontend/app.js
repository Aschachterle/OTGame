import { appState } from './src/state.js';
import { getOptionalPlayerIdentity } from './src/crypto.js';
import { createApiClient } from './src/api.js';
import { createAudioController } from './src/audio.js';
import { playHazardAlert, playRetroClick, playWagonClatter } from './src/sfx.js';
import { createUI } from './src/ui.js?v=pixi_final_3';
import { createGameController } from './src/game.js';

const ui = createUI();
const playerIdentityPromise = getOptionalPlayerIdentity();
void playerIdentityPromise;
const api = createApiClient({
  getPlayerIdentity: () => playerIdentityPromise
});

let game = null;

function choiceRangeText(options = []) {
  const keys = options
    .map((option) => option?.hotkey)
    .filter(Boolean);
  if (!keys.length) return 'a valid number';
  if (keys.length === 1) return keys[0];
  if (keys.length === 2) return `${keys[0]} or ${keys[1]}`;
  return `${keys.slice(0, -1).join(', ')}, or ${keys.at(-1)}`;
}

function triggerAction(actionType) {
  if (!actionType) return;
  if (actionType === 'press-on') {
    void playWagonClatter();
  }
  void game.handleAction(actionType);
}

function registerKeyboardControls() {
  const actionMap = {
    1: 'camp',
    2: 'hunt',
    3: 'gather',
    4: 'treat',
    5: 'trade',
    6: 'repair',
    7: 'scout'
  };

  window.addEventListener('keydown', (event) => {
    const tagName = event.target?.tagName;
    const key = event.key.toLowerCase();
    if (!appState.journeyStarted && !appState.journeyLoading && appState.setupStage === 'outfitting') {
      if (key === 'r' && !['INPUT', 'SELECT', 'TEXTAREA'].includes(tagName)) {
        event.preventDefault();
        game.applyRecommendedOutfit();
        return;
      }
      if (event.key === ' ') {
        event.preventDefault();
        void game.beginJourney();
        return;
      }
    }
    if (appState.turnPhase === 'results') {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(tagName)) return;
      if (tagName === 'BUTTON' && [' ', 'enter'].includes(key)) return;
      if (key === ' ' || key === 'enter') {
        event.preventDefault();
        if (ui.isTeletypeStreaming()) {
          ui.skipTeletype();
          return;
        }
        void playRetroClick();
        game.continueToDispatch();
      }
      return;
    }
    if (appState.pendingMetaDialogue && !['INPUT', 'SELECT', 'TEXTAREA'].includes(tagName)) {
      if (key === 'enter') {
        event.preventDefault();
        if (ui.isTeletypeStreaming()) {
          ui.skipTeletype();
          return;
        }
        const response = ui.getDecisionInputBuffer().trim();
        if (!response) {
          ui.setDecisionInputFeedback('Type a response before sending it to the Operator.');
          return;
        }
        const { choiceId } = appState.pendingMetaDialogue;
        ui.clearDecisionInputBuffer(appState);
        void game.resolveDecisionChoice(choiceId, response);
        return;
      }
      if (key === 'backspace' || key === 'delete') {
        event.preventDefault();
        ui.setDecisionInputBuffer(ui.getDecisionInputBuffer().slice(0, -1));
        return;
      }
      if (key === 'escape') {
        event.preventDefault();
        game.cancelMetaDialogue();
        return;
      }
      if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        ui.setDecisionInputBuffer(`${ui.getDecisionInputBuffer()}${event.key}`);
      }
      return;
    }
    if (tagName === 'INPUT' || tagName === 'SELECT' || tagName === 'TEXTAREA') {
      return;
    }
    if (tagName === 'BUTTON' && [' ', 'enter'].includes(event.key.toLowerCase())) {
      return;
    }
    const decisionOptions = appState.activeDecision?.options ?? [];
    if (decisionOptions.length && !appState.actionInProgress) {
      if (/^[1-9]$/.test(key)) {
        event.preventDefault();
        if (ui.isTeletypeStreaming()) {
          ui.skipTeletype();
          return;
        }
        void playRetroClick();
        ui.setDecisionInputBuffer(key);
        return;
      }
      if (key === 'backspace' || key === 'delete' || key === 'escape') {
        event.preventDefault();
        ui.clearDecisionInputBuffer(appState);
        return;
      }
      if (key === 'enter') {
        event.preventDefault();
        if (ui.isTeletypeStreaming()) {
          ui.skipTeletype();
          return;
        }
        const buffer = ui.getDecisionInputBuffer();
        const selectedOption = decisionOptions.find((option) => String(option.hotkey ?? '') === buffer);
        if (!selectedOption) {
          ui.setDecisionInputFeedback(`Invalid selection. Type ${choiceRangeText(decisionOptions)} and press Enter.`);
          return;
        }
        void playRetroClick();
        ui.clearDecisionInputBuffer(appState);
        void game.resolveDecisionChoice(selectedOption.id);
        return;
      }
    }
    if (appState.turnPhase === 'prologue' && (key === ' ' || key === 'enter')) {
      event.preventDefault();
      if (ui.isTeletypeStreaming()) {
        ui.skipTeletype();
        return;
      }
      if (appState.journeyLoading || !appState.prologueReady) return;
      void playRetroClick();
      void game.startTrailAfterPrologue();
      return;
    }
    if ((key === ' ' || key === 'enter') && ui.isTeletypeStreaming()) {
      event.preventDefault();
      ui.skipTeletype();
      return;
    }
    if (key === ' ' || key === 'enter') {
      event.preventDefault();
      void playRetroClick();
      const button = document.querySelector('[data-action="press-on"]');
      if (button?.disabled) {
        return;
      }
      triggerAction('press-on');
      return;
    }
    const actionType = actionMap[key];
    if (!actionType) {
      return;
    }
    const button = document.querySelector(`[data-action="${actionType}"]`);
    if (button?.disabled) {
      return;
    }
    event.preventDefault();
    void playRetroClick();
    triggerAction(actionType);
  });
}

const audio = createAudioController({
  state: appState,
  api,
  onCloudAvailabilityChanged: () => {
    game?.renderStoryPanel();
  }
});

game = createGameController({
  state: appState,
  ui,
  api,
  audio
});

ui.setHandlers({
  onAction: triggerAction,
  onContinueDispatch: () => {
    game.continueToDispatch();
  },
  onStartTrail: () => {
    void game.startTrailAfterPrologue();
  },
  onBeginJourney: () => {
    void game.beginJourney();
  },
  onSetupInteraction: () => {
    if (!appState.journeyStarted && !appState.journeyLoading) {
      void audio.playSetupMusic();
    }
  },
  onRegisterParty: (payload) => {
    game.configureParty(payload);
  },
  onSelectPartyEra: (eraId) => {
    game.setPartyEra(eraId);
  },
  onSelectCreatorMember: (memberIndex) => {
    game.selectCreatorMember(memberIndex);
  },
  onUpdateCreatorMember: (payload) => {
    game.updateCreatorMember(payload);
  },
  onOutfittingQuantityChange: (key, quantity) => {
    game.setOutfittingQuantity(key, quantity);
  },
  onRecommendedOutfit: () => {
    game.applyRecommendedOutfit();
  },
  onBackToRegister: () => {
    game.returnToPartyRegister();
  },
  onRefresh: () => {
    game.resetToJourneySetup();
  },
  onNewGame: () => {
    game.resetToJourneySetup();
  },
  onBeginJourneyFromMenu: () => {
    if (!appState.journeyStarted) {
      void game.beginJourney();
    }
  },
  onLedgerJump: () => {
    const ledgerPanel = document.querySelector('#event-log');
    ledgerPanel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },
  onJourneyLlmToggle: (enabled) => {
    game.setJourneyLlmPreference(enabled);
  },
  onJourneyCloudToggle: (enabled) => {
    game.setJourneyCloudPreference(enabled);
    game.renderStoryPanel();
    if (appState.narrationAutoPlay && appState.narrationText) {
      void audio.playNarration();
    }
  },
  onJourneyAutoReadToggle: (enabled) => {
    game.setJourneyAutoReadPreference(enabled);
    game.renderStoryPanel();
    if (!appState.narrationAutoPlay) {
      audio.stopNarration();
    } else if (appState.narrationText) {
      void audio.playNarration();
    }
  },
  onReadNarration: () => {
    void audio.playNarration();
  },
  onReadText: (text) => {
    audio.speakTextLocally(text);
  },
  onStorySourceToggle: (enabled) => {
    game.setJourneyLlmPreference(enabled);
    game.renderStoryPanel();
  },
  onStrangenessOverrideChange: (value) => {
    game.setStrangenessOverride(value);
  },
  onWeatherOverlayChange: (value) => {
    game.setWeatherOverlay(value);
  },
  onWarpBeforeLandmark: (landmarkId) => {
    game.warpBeforeLandmark(landmarkId);
  },
  onVoiceChange: (voiceName) => {
    appState.selectedVoiceName = voiceName;
    audio.populateVoiceSelect(ui.getStoryVoiceSelect());
    if (appState.narrationText && appState.narrationAutoPlay) {
      void audio.playNarration();
    }
  },
  onPaceChange: (value) => {
    game.setPace(value);
  },
  onRationsChange: (value) => {
    game.setRations(value);
  },
  onDecisionChoice: (choiceId) => {
    void game.resolveDecisionChoice(choiceId);
  },
  onTileSelect: (tileId) => {
    void game.handleTileSelection(tileId);
  },
  onUiClick: () => {
    void playRetroClick();
  },
  onHazardAlert: () => {
    void playHazardAlert();
  }
});

if (window.speechSynthesis) {
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    audio.populateVoiceSelect(ui.getStoryVoiceSelect());
  });
  audio.populateVoiceSelect(ui.getStoryVoiceSelect());
}

registerKeyboardControls();
void game.bootstrapApp();
