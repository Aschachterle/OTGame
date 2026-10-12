import Fastify from 'fastify';
import cors from '@fastify/cors';
import staticPlugin from '@fastify/static';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
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

app.get('/health', async () => ({ ok: true }));

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
