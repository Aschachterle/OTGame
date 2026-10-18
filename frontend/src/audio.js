import { debugNarration } from './state.js';

const CLOUD_NARRATION_CACHE_LIMIT = 24;
const SETUP_MUSIC_URL = new URL('../assets/OTTitle-setup.wav', import.meta.url).href;
const SETUP_MUSIC_VOLUME = 0.28;
const SETUP_MUSIC_FADE_DURATION_MS = 1800;
const SETUP_MUSIC_FADE_INTERVAL_MS = 40;

export function createAudioController({ state, api, onCloudAvailabilityChanged = () => {} }) {
  let cloudNarrationAudio = null;
  let cloudNarrationUrl = null;
  const cloudNarrationBlobCache = new Map();
  const cloudNarrationPending = new Map();
  let setupMusicAudio = null;
  let setupMusicFadeTimer = null;
  let setupMusicFadeResolve = null;
  let setupMusicGeneration = 0;
  let setupMusicFailureLogged = false;

  function clearSetupMusicFade() {
    if (setupMusicFadeTimer !== null) {
      window.clearInterval(setupMusicFadeTimer);
      setupMusicFadeTimer = null;
    }
    if (setupMusicFadeResolve) {
      const resolve = setupMusicFadeResolve;
      setupMusicFadeResolve = null;
      resolve();
    }
  }

  function getSetupMusicAudio() {
    if (!setupMusicAudio) {
      setupMusicAudio = new Audio(SETUP_MUSIC_URL);
      setupMusicAudio.loop = true;
      setupMusicAudio.preload = 'auto';
      setupMusicAudio.volume = SETUP_MUSIC_VOLUME;
    }
    return setupMusicAudio;
  }

  async function playSetupMusic() {
    const audio = getSetupMusicAudio();
    setupMusicGeneration += 1;
    clearSetupMusicFade();
    audio.volume = SETUP_MUSIC_VOLUME;
    if (!audio.paused) return true;

    try {
      await audio.play();
      setupMusicFailureLogged = false;
      return true;
    } catch (error) {
      const autoplayBlocked = error instanceof DOMException && error.name === 'NotAllowedError';
      if (!setupMusicFailureLogged) {
        console.warn(
          autoplayBlocked
            ? 'Setup music is waiting for a user interaction before playback.'
            : 'Setup music playback failed.',
          error
        );
        setupMusicFailureLogged = true;
      }
      return false;
    }
  }

  function fadeOutSetupMusic(durationMs = SETUP_MUSIC_FADE_DURATION_MS) {
    const audio = setupMusicAudio;
    if (!audio || audio.paused) return Promise.resolve();

    setupMusicGeneration += 1;
    clearSetupMusicFade();
    const generation = setupMusicGeneration;
    const startVolume = audio.volume;
    const startTime = performance.now();

    return new Promise((resolve) => {
      setupMusicFadeResolve = resolve;
      setupMusicFadeTimer = window.setInterval(() => {
        if (generation !== setupMusicGeneration) {
          clearSetupMusicFade();
          return;
        }
        const progress = Math.min(1, (performance.now() - startTime) / durationMs);
        audio.volume = startVolume * (1 - progress);
        if (progress >= 1) {
          window.clearInterval(setupMusicFadeTimer);
          setupMusicFadeTimer = null;
          setupMusicFadeResolve = null;
          audio.pause();
          audio.currentTime = 0;
          audio.volume = SETUP_MUSIC_VOLUME;
          resolve();
        }
      }, SETUP_MUSIC_FADE_INTERVAL_MS);
    });
  }

  function stopNarration() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  function stopCloudNarration() {
    if (cloudNarrationAudio) {
      cloudNarrationAudio.pause();
      cloudNarrationAudio.currentTime = 0;
      cloudNarrationAudio = null;
    }
    if (cloudNarrationUrl) {
      URL.revokeObjectURL(cloudNarrationUrl);
      cloudNarrationUrl = null;
    }
  }

  function stopAllNarration() {
    stopNarration();
    stopCloudNarration();
  }

  function setCloudNarrationCacheEntry(cacheKey, blob) {
    if (!cacheKey || !blob) {
      return;
    }

    if (cloudNarrationBlobCache.has(cacheKey)) {
      cloudNarrationBlobCache.delete(cacheKey);
    }
    cloudNarrationBlobCache.set(cacheKey, blob);

    while (cloudNarrationBlobCache.size > CLOUD_NARRATION_CACHE_LIMIT) {
      const oldestKey = cloudNarrationBlobCache.keys().next().value;
      if (!oldestKey) {
        break;
      }
      cloudNarrationBlobCache.delete(oldestKey);
    }
  }

  function getCloudNarrationCacheEntry(cacheKey) {
    if (!cacheKey || !cloudNarrationBlobCache.has(cacheKey)) {
      return null;
    }

    const blob = cloudNarrationBlobCache.get(cacheKey);
    cloudNarrationBlobCache.delete(cacheKey);
    cloudNarrationBlobCache.set(cacheKey, blob);
    return blob;
  }

  async function hashNarrationText(text) {
    const normalized = String(text ?? '').trim();
    if (!normalized) {
      return 'empty-narration';
    }

    if (!window.crypto?.subtle) {
      return normalized;
    }

    const bytes = new TextEncoder().encode(normalized);
    const digest = await window.crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(digest)].map((part) => part.toString(16).padStart(2, '0')).join('');
  }

  async function requestCloudNarrationBlob(text, cacheKey) {
    debugNarration(state, 'playNarration:cloud-fetch', { cacheKey, text });
    const blob = await api.getNarrationAudio(text);
    setCloudNarrationCacheEntry(cacheKey, blob);
    return blob;
  }

  async function getCloudNarrationBlob(text) {
    const narrationText = text || state.narrationText || state.latestNarration?.body || 'The wagon writes its own history.';
    const cacheKey = await hashNarrationText(narrationText);
    const cachedBlob = getCloudNarrationCacheEntry(cacheKey);
    if (cachedBlob) {
      debugNarration(state, 'playNarration:cloud-cache-hit', { cacheKey });
      return cachedBlob;
    }

    const pending = cloudNarrationPending.get(cacheKey);
    if (pending) {
      debugNarration(state, 'playNarration:cloud-cache-pending', { cacheKey });
      return pending;
    }

    debugNarration(state, 'playNarration:cloud-cache-miss', { cacheKey });
    const request = requestCloudNarrationBlob(narrationText, cacheKey).finally(() => {
      cloudNarrationPending.delete(cacheKey);
    });
    cloudNarrationPending.set(cacheKey, request);
    return request;
  }

  function isCloudNarrationEnabled() {
    return state.cloudNarrationPreferred && state.elevenLabsAvailable;
  }

  function scoreVoice(voice) {
    let score = 0;
    const name = (voice.name || '').toLowerCase();
    const lang = (voice.lang || '').toLowerCase();

    if (lang.startsWith('en')) score += 5;
    if (name.includes('natural')) score += 8;
    if (name.includes('neural')) score += 8;
    if (name.includes('enhanced')) score += 6;
    if (name.includes('google')) score += 5;
    if (name.includes('microsoft')) score += 4;
    if (name.includes('apple')) score += 4;
    if (name.includes('samantha') || name.includes('alex') || name.includes('serena') || name.includes('victoria')) score += 5;
    if (voice.default) score += 1;
    return score;
  }

  function pickBestVoice(voices) {
    if (!voices.length) return null;
    if (state.selectedVoiceName) {
      const selected = voices.find((voice) => voice.name === state.selectedVoiceName);
      if (selected) return selected;
    }
    return [...voices].sort((a, b) => scoreVoice(b) - scoreVoice(a))[0] ?? null;
  }

  function populateVoiceSelect(voiceSelect) {
    if (!voiceSelect) return;

    const voices = window.speechSynthesis?.getVoices?.() ?? [];
    state.availableVoices = voices;

    if (!voices.length) {
      voiceSelect.innerHTML = '<option value="">Default browser voice</option>';
      voiceSelect.disabled = true;
      return;
    }

    const bestVoice = pickBestVoice(voices);
    if (bestVoice && !state.selectedVoiceName) {
      state.selectedVoiceName = bestVoice.name;
    }

    voiceSelect.disabled = false;
    voiceSelect.innerHTML = voices
      .map((voice) => {
        const label = `${voice.name} (${voice.lang})`;
        const selected = voice.name === state.selectedVoiceName ? 'selected' : '';
        return `<option value="${voice.name}" ${selected}>${label}</option>`;
      })
      .join('');

    if (state.selectedVoiceName) {
      voiceSelect.value = state.selectedVoiceName;
    }
  }

  function speakNarration(text) {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance || !text) {
      return;
    }

    stopNarration();
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = pickBestVoice(state.availableVoices);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }
    utterance.rate = 0.92;
    utterance.pitch = 0.88;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  }

  async function playCloudNarration(speechId) {
    const blob = await getCloudNarrationBlob(state.narrationText || state.latestNarration?.body || 'The wagon writes its own history.');
    if (speechId !== state.narrationSpeechId) {
      return false;
    }
    stopCloudNarration();
    cloudNarrationUrl = URL.createObjectURL(blob);
    cloudNarrationAudio = new Audio(cloudNarrationUrl);
    cloudNarrationAudio.onended = stopCloudNarration;
    try {
      await cloudNarrationAudio.play();
      return true;
    } catch (error) {
      stopCloudNarration();
      console.warn('Cloud narration playback blocked', error);
      return false;
    }
  }

  async function playNarration() {
    const speechId = ++state.narrationSpeechId;
    debugNarration(state, 'playNarration:start', { speechId, narrationText: state.narrationText });
    stopNarration();
    stopCloudNarration();

    if (isCloudNarrationEnabled()) {
      try {
        const played = await playCloudNarration(speechId);
        if (speechId !== state.narrationSpeechId) {
          debugNarration(state, 'playNarration:stale-cloud', { speechId, currentSpeechId: state.narrationSpeechId });
          return;
        }
        state.elevenLabsAvailable = true;
        onCloudAvailabilityChanged();
        debugNarration(state, 'playNarration:cloud-result', { speechId, played });
        if (played) {
          return;
        }
        return;
      } catch (error) {
        if (speechId !== state.narrationSpeechId) {
          debugNarration(state, 'playNarration:stale-cloud-error', { speechId, currentSpeechId: state.narrationSpeechId, error: String(error) });
          return;
        }
        state.elevenLabsAvailable = false;
        onCloudAvailabilityChanged();
        debugNarration(state, 'playNarration:cloud-error', { speechId, error: String(error) });
        return;
      }
    }

    if (speechId !== state.narrationSpeechId) {
      debugNarration(state, 'playNarration:stale-browser', { speechId, currentSpeechId: state.narrationSpeechId });
      return;
    }
    debugNarration(state, 'playNarration:browser-speak', { speechId, narrationText: state.narrationText });
    speakNarration(state.narrationText || 'The wagon writes its own history.');
  }

  function primeCloudNarrationCache(text) {
    if (!isCloudNarrationEnabled() || !text) {
      return;
    }

    void getCloudNarrationBlob(text).catch((error) => {
      debugNarration(state, 'playNarration:cloud-prefetch-error', { error: String(error) });
    });
  }

  function isBrowserSpeechAvailable() {
    return Boolean(window.speechSynthesis && window.SpeechSynthesisUtterance);
  }

  function speakTextLocally(text) {
    const spokenText = String(text ?? '').trim();
    state.narrationSpeechId += 1;
    stopAllNarration();
    if (!spokenText || !isBrowserSpeechAvailable()) {
      return false;
    }
    speakNarration(spokenText);
    return true;
  }

  function getStoryRenderState() {
    return {
      cloudNarrationEnabled: isCloudNarrationEnabled(),
      useBrowserFallback: !isCloudNarrationEnabled(),
      cloudStatusLabel: state.elevenLabsAvailable
        ? (state.cloudNarrationPreferred ? 'Cloud narration: on' : 'Cloud narration: off')
        : 'Cloud narration: unavailable',
      cloudToggleDisabled: !state.elevenLabsAvailable
    };
  }

  return {
    fadeOutSetupMusic,
    getStoryRenderState,
    isCloudNarrationEnabled,
    isBrowserSpeechAvailable,
    playSetupMusic,
    playNarration,
    speakTextLocally,
    populateVoiceSelect,
    primeCloudNarrationCache,
    stopAllNarration,
    stopNarration
  };
}
