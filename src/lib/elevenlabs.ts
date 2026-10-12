import { createHash } from 'node:crypto';
import { config } from '../config.js';

const AUDIO_CACHE_LIMIT = 48;
const audioCache = new Map<string, Buffer>();
const pendingAudioRequests = new Map<string, Promise<Buffer>>();

function hashNarrationText(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

function getCachedAudio(cacheKey: string): Buffer | null {
  const cached = audioCache.get(cacheKey);
  if (!cached) {
    return null;
  }

  audioCache.delete(cacheKey);
  audioCache.set(cacheKey, cached);
  return cached;
}

function setCachedAudio(cacheKey: string, audio: Buffer): void {
  if (audioCache.has(cacheKey)) {
    audioCache.delete(cacheKey);
  }
  audioCache.set(cacheKey, audio);

  while (audioCache.size > AUDIO_CACHE_LIMIT) {
    const oldestKey = audioCache.keys().next().value;
    if (!oldestKey) {
      break;
    }
    audioCache.delete(oldestKey);
  }
}

export function elevenLabsConfigured(): boolean {
  return Boolean(config.elevenLabsApiKey && config.elevenLabsVoiceId);
}

export async function synthesizeNarrationAudio(text: string): Promise<Buffer> {
  if (!elevenLabsConfigured()) {
    throw new Error('ElevenLabs is not configured');
  }

  const cacheKey = hashNarrationText(text);
  const cached = getCachedAudio(cacheKey);
  if (cached) {
    return cached;
  }

  const pending = pendingAudioRequests.get(cacheKey);
  if (pending) {
    return pending;
  }

  const request = (async () => {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${config.elevenLabsVoiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': config.elevenLabsApiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg'
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        output_format: 'mp3_44100_128',
        voice_settings: {
          stability: 0.45,
          similarity_boost: 0.8,
          style: 0.15,
          use_speaker_boost: true
        }
      })
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`ElevenLabs TTS failed: ${response.status} ${detail}`);
    }

    const audio = Buffer.from(await response.arrayBuffer());
    setCachedAudio(cacheKey, audio);
    return audio;
  })().finally(() => {
    pendingAudioRequests.delete(cacheKey);
  });

  pendingAudioRequests.set(cacheKey, request);
  return request;
}
