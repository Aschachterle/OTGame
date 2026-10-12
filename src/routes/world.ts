import type { FastifyInstance } from 'fastify';
import { config } from '../config.js';
import { getTileSnapshot, getWorldConfig, getResourceNodes, getTile, getResourceNodeRemaining } from '../store.js';
import { riverAt } from '../lib/world.js';

export async function registerWorldRoutes(app: FastifyInstance): Promise<void> {
  app.get('/world/config', async () => {
    return getWorldConfig();
  });

  app.get('/world/tile/:tileId', async (request, reply) => {
    const { tileId } = request.params as { tileId: string };
    const time = (request.query as { time?: string }).time ?? new Date().toISOString();
    const snapshot = getTileSnapshot(tileId, time);
    if (!snapshot) {
      return reply.code(404).send({ error: 'Tile not found' });
    }
    return snapshot;
  });

  app.get('/world/river/:segmentId', async (request) => {
    const { segmentId } = request.params as { segmentId: string };
    const time = (request.query as { time?: string }).time ?? new Date().toISOString();
    return {
      segmentId,
      time,
      ...riverAt(segmentId, time, config.worldSeed)
    };
  });

  app.get('/world/resources/:tileId', async (request, reply) => {
    const { tileId } = request.params as { tileId: string };
    const tile = getTile(tileId);
    if (!tile) {
      return reply.code(404).send({ error: 'No resource nodes found for tile' });
    }
    return {
      tileId,
      resources: getResourceNodes(tileId).map((node) => ({
        nodeId: node.nodeId,
        resourceType: node.resourceType,
        remaining: getResourceNodeRemaining(node.id)
      }))
    };
  });
}

