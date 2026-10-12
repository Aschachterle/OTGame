import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { buildActionSigningPayload, hashEvent, verifySignatureHex } from '../lib/crypto.js';
import { addEvent, addClaim, getClaim, getResourceNodeRemaining, store, updateClaim } from '../store.js';

const claimSchema = z.object({
  actionType: z.string(),
  actorPubkey: z.string().default('demo-player'),
  nonce: z.string(),
  worldTime: z.string(),
  tileId: z.string(),
  inputs: z.record(z.unknown()),
  signature: z.string().optional().default('')
});

const attestSchema = z.object({
  witnessPubkey: z.string(),
  signature: z.string()
});

export async function registerActionRoutes(app: FastifyInstance): Promise<void> {
  app.post('/actions/claim', async (request, reply) => {
    const parsed = claimSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid claim', details: parsed.error.flatten() });
    }
    const claim = parsed.data;
    if (claim.signature) {
      const signingPayload = buildActionSigningPayload(claim);
      const validSig = await verifySignatureHex({
        pubkeyHex: claim.actorPubkey,
        signatureHex: claim.signature,
        message: signingPayload
      });
      if (!validSig) {
        return reply.code(400).send({ error: 'Invalid signature' });
      }
    }
    const duplicate = store.claims.find((entry) => entry.actorPubkey === claim.actorPubkey && entry.nonce === claim.nonce);
    if (duplicate) {
      return reply.code(409).send({ error: 'Claim conflict (likely nonce replay)' });
    }
    const created = {
      claimId: crypto.randomUUID(),
      actionType: claim.actionType,
      actorPubkey: claim.actorPubkey,
      nonce: claim.nonce,
      worldTime: claim.worldTime,
      tileId: claim.tileId,
      inputs: claim.inputs,
      signature: claim.signature,
      status: 'pending' as const,
      rejectionReason: null,
      acceptedEventId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    addClaim(created);
    return reply.code(201).send({ claim: created });
  });

  app.post('/actions/:claimId/attest', async (request, reply) => {
    const { claimId } = request.params as { claimId: string };
    const parsed = attestSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid attestation', details: parsed.error.flatten() });
    }
    const att = parsed.data;
    const claim = getClaim(claimId);
    if (!claim) {
      return reply.code(404).send({ error: 'Claim not found' });
    }
    const msg = JSON.stringify({ claimId, witnessPubkey: att.witnessPubkey });
    const validSig = await verifySignatureHex({
      pubkeyHex: att.witnessPubkey,
      signatureHex: att.signature,
      message: msg
    });
    if (!validSig) {
      return reply.code(400).send({ error: 'Invalid signature' });
    }
    const attestation = {
      id: crypto.randomUUID(),
      claimId,
      witnessPubkey: att.witnessPubkey,
      signature: att.signature,
      createdAt: new Date().toISOString()
    };
    claim.attestations = claim.attestations ?? [];
    claim.attestations.push(attestation);
    return reply.code(201).send({ attestation });
  });

  app.get('/actions/:claimId', async (request, reply) => {
    const { claimId } = request.params as { claimId: string };
    const claim = getClaim(claimId);
    if (!claim) {
      return reply.code(404).send({ error: 'Claim not found' });
    }
    return { claim };
  });

  app.post('/actions/:claimId/finalize', async (request, reply) => {
    const { claimId } = request.params as { claimId: string };
    const claim = getClaim(claimId);
    if (!claim) {
      return reply.code(404).send({ error: 'Claim not found' });
    }
    if (claim.status !== 'pending') {
      return reply.code(409).send({ error: `Claim cannot be finalized from status ${claim.status}` });
    }

    const isResourceConsumption = claim.actionType === 'consume_resource';

    if (isResourceConsumption) {
      const nodeId = String((claim.inputs as Record<string, unknown>).nodeId ?? '');
      const amount = Number((claim.inputs as Record<string, unknown>).amount ?? NaN);
      if (!nodeId || !Number.isFinite(amount) || amount <= 0) {
       return reply.code(400).send({ error: 'consume_resource requires inputs.nodeId and positive inputs.amount' });
      }
      const remaining = getResourceNodeRemaining(nodeId);
      if (remaining < amount) {
       updateClaim(claimId, {
         status: 'rejected',
         rejectionReason: 'resource-already-consumed',
         updatedAt: new Date().toISOString()
       });
       return reply.code(409).send({ claim: getClaim(claimId) });
      }
    }

    const latest = store.events.at(-1);
    const prevHash = latest ? latest.eventHash : null;
    const eventPayload = isResourceConsumption
      ? {
         claimId: claim.claimId,
         nodeId: String((claim.inputs as Record<string, unknown>).nodeId),
         amount: Number((claim.inputs as Record<string, unknown>).amount),
         actionType: claim.actionType
       }
      : {
         claimId: claim.claimId,
         actionType: claim.actionType,
         inputs: claim.inputs
       };
    const eventHash = hashEvent({
      prevHash,
      worldTime: claim.worldTime,
      tileId: claim.tileId,
      eventType: isResourceConsumption ? 'resource_consumed' : 'claim_finalized',
      payload: eventPayload,
      actorPubkey: claim.actorPubkey
    });
    const event = {
      eventId: crypto.randomUUID(),
      prevHash,
      eventHash,
      worldTime: claim.worldTime,
      tileId: claim.tileId,
      eventType: isResourceConsumption ? 'resource_consumed' : 'claim_finalized',
      payload: eventPayload,
      actorPubkey: claim.actorPubkey,
      signature: claim.signature,
      createdAt: new Date().toISOString()
    };
    addEvent(event);
    updateClaim(claimId, {
      status: 'accepted',
      acceptedEventId: event.eventId,
      updatedAt: new Date().toISOString()
    });
    return { claim: getClaim(claimId), eventHash };
  });
}
