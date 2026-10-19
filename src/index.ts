import Fastify from 'fastify';
import cors from '@fastify/cors';
import staticPlugin from '@fastify/static';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFile } from 'fs/promises';
import { config } from './config.js';
import { registerActionRoutes } from './routes/actions.js';
import { registerEventRoutes } from './routes/events.js';
import { registerNarrationRoutes } from './routes/narration.js';
import { registerTradeRoutes } from './routes/trades.js';
import { registerWorldRoutes } from './routes/world.js';
import { initializeDemoWorld } from './store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

initializeDemoWorld();

const app = Fastify({
  logger: true
});

await app.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true
});

await app.register(staticPlugin, {
  root: join(__dirname, '../frontend')
});

await app.register(staticPlugin, {
  root: join(__dirname, '../Sprite'),
  prefix: '/Sprite/',
  decorateReply: false
});

app.get('/health', async () => ({ ok: true }));

app.post('/api/dev/save-sprite-masks', async (request, reply) => {
  const body = request.body as Record<string, [number, number][]>;
  if (!body || typeof body !== 'object') {
    return reply.status(400).send({ ok: false, error: 'Invalid body' });
  }
  const jsContent = `// Automatically saved custom frame masks from the Trail Scene Editor\nexport const CUSTOM_SPRITE_MASKS = ${JSON.stringify(body, null, 2)};\n`;
  const jsonContent = JSON.stringify(body, null, 2);
  const targetJs = join(__dirname, '../frontend/src/custom-sprite-masks.js');
  const targetJson = join(__dirname, '../frontend/src/custom-sprite-masks.json');
  await writeFile(targetJs, jsContent, 'utf-8');
  await writeFile(targetJson, jsonContent, 'utf-8');
  return { ok: true, count: Object.keys(body).length };
});

await registerWorldRoutes(app);
await registerEventRoutes(app);
await registerNarrationRoutes(app);
await registerActionRoutes(app);
await registerTradeRoutes(app);

const start = async () => {
  try {
    await app.listen({
      host: '0.0.0.0',
      port: config.port
    });
    app.log.info(`immutable-trail-server listening on ${config.port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

const shutdown = async () => {
  await app.close();
};

process.on('SIGINT', () => {
  void shutdown().finally(() => process.exit(0));
});
process.on('SIGTERM', () => {
  void shutdown().finally(() => process.exit(0));
});

void start();
