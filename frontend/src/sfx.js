let audioContext = null;

function getAudioContext() {
  if (!audioContext) {
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) {
      return null;
    }
    audioContext = new AudioContextCtor();
  }
  return audioContext;
}

async function prepareContext() {
  const context = getAudioContext();
  if (!context) return null;
  if (context.state === 'suspended') {
    await context.resume();
  }
  return context;
}

function connectOscillator(context, { type, frequency, endFrequency, duration, gainLevel }) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, context.currentTime);
  if (endFrequency) {
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, context.currentTime + duration);
  }
  gain.gain.setValueAtTime(gainLevel, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + duration);
}

export async function playRetroClick() {
  const context = await prepareContext();
  if (!context) return;
  connectOscillator(context, {
    type: 'square',
    frequency: 860,
    endFrequency: 180,
    duration: 0.04,
    gainLevel: 0.12
  });
}

export async function playHazardAlert() {
  const context = await prepareContext();
  if (!context) return;
  connectOscillator(context, {
    type: 'sawtooth',
    frequency: 360,
    endFrequency: 520,
    duration: 0.14,
    gainLevel: 0.08
  });
  setTimeout(() => {
    connectOscillator(context, {
      type: 'square',
      frequency: 520,
      endFrequency: 360,
      duration: 0.16,
      gainLevel: 0.06
    });
  }, 70);
}

export async function playWagonClatter() {
  const context = await prepareContext();
  if (!context) return;
  connectOscillator(context, {
    type: 'triangle',
    frequency: 180,
    endFrequency: 90,
    duration: 0.06,
    gainLevel: 0.09
  });
  setTimeout(() => {
    connectOscillator(context, {
      type: 'square',
      frequency: 220,
      endFrequency: 120,
      duration: 0.05,
      gainLevel: 0.07
    });
  }, 35);
}
