import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

function loadLocalEnv(): void {
  const envPath = resolve(dirname(fileURLToPath(import.meta.url)), '../.env');
  try {
    const contents = readFileSync(envPath, 'utf8');
    for (const line of contents.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex <= 0) continue;

      const key = trimmed.slice(0, separatorIndex).trim();
      if (process.env[key] !== undefined) continue;

      let value = trimmed.slice(separatorIndex + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      process.env[key] = value;
    }
  } catch {
    // No local .env file; use the current process environment as-is.
  }
}

loadLocalEnv();

export const config = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl:
    process.env.DATABASE_URL ??
    '******localhost:5432/immutable_trail',
  worldSeed: process.env.WORLD_SEED ?? 'otgame-v1-seed',
  rulesVersion: process.env.RULES_VERSION ?? 'v1',
  epochStart: process.env.EPOCH_START ?? '1848-01-01T00:00:00Z',
  elevenLabsEnabled: process.env.ENABLE_ELEVENLABS_TTS === 'true',
  elevenLabsApiKey: process.env.ELEVENLABS_API_KEY ?? '',
  elevenLabsVoiceId: process.env.ELEVENLABS_VOICE_ID ?? '',
  llmNarrationEnabled: process.env.ENABLE_LLM_NARRATION === 'true',
  googleAiStudioApiKey: process.env.GOOGLE_AI_STUDIO_API_KEY ?? '',
  googleAiStudioModel: process.env.GOOGLE_AI_STUDIO_MODEL ?? 'gemini-3.5-flash-lite'
};
