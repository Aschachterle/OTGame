import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { canonicalJson } from '../lib/canonical-json.js';
import { hashEvent, verifySignatureHex } from '../lib/crypto.js';
import { addEvent, listEvents, store } from '../store.js';

const postEventSchema = z.object({
  prevHash: z.string().nullable(),
  worldTime: z.string(),
  tileId: z.string(),
  eventType: z.string(),
  payload: z.record(z.unknown()),
  actorPubkey: z.string().default('demo-player'),
  signature: z.string().optional().default('')
});

export async function registerEventRoutes(app: FastifyInstance): Promise<void> {
  app.get('/events', async (request) => {
    const { sinceHash, limit = '50' } = request.query as { sinceHash?: string; limit?: string };
    const maxLimit = Math.min(Number.parseInt(limit, 10) || 50, 200);
    return { events: listEvents(sinceHash, maxLimit) };
  });

  app.get('/events/:eventHash', async (request, reply) => {
    const { eventHash } = request.params as { eventHash: string };
    const event = store.events.find((entry) => entry.eventHash === eventHash);
    if (!event) {
      return reply.code(404).send({ error: 'Event not found' });
    }
    return event;
  });

  app.post('/events', async (request, reply) => {
    const parsed = postEventSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid event', details: parsed.error.flatten() });
    }
    const event = parsed.data;
    if (event.signature) {
      const signingPayload = canonicalJson({
        prevHash: event.prevHash,
        worldTime: event.worldTime,
        tileId: event.tileId,
        eventType: event.eventType,
        payload: event.payload,
        actorPubkey: event.actorPubkey
      });
      const validSig = await verifySignatureHex({
        pubkeyHex: event.actorPubkey,
        signatureHex: event.signature,
        message: signingPayload
      });
      if (!validSig) {
        return reply.code(400).send({ error: 'Invalid signature' });
      }
    }

    const computedHash = hashEvent({
      prevHash: event.prevHash,
      worldTime: event.worldTime,
      tileId: event.tileId,
      eventType: event.eventType,
      payload: event.payload,
      actorPubkey: event.actorPubkey
    });

    const latest = store.events.at(-1);
    if (latest && latest.eventHash !== event.prevHash) {
      return reply.code(409).send({
        error: 'prevHash does not match latest known event',
        latestHash: latest.eventHash
      });
    }
    if (!latest && event.prevHash !== null) {
      return reply.code(400).send({ error: 'Genesis event must have prevHash = null' });
    }

    const inserted = {
      eventId: crypto.randomUUID(),
      prevHash: event.prevHash,
      eventHash: computedHash,
      worldTime: event.worldTime,
      tileId: event.tileId,
      eventType: event.eventType,
      payload: event.payload,
      actorPubkey: event.actorPubkey,
      signature: event.signature,
      createdAt: new Date().toISOString()
    };
    addEvent(inserted);
    return reply.code(201).send(inserted);
  });
}

