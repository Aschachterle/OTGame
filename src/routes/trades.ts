import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { canonicalJson } from '../lib/canonical-json.js';
import { hashEvent, verifySignatureHex } from '../lib/crypto.js';
import { addEvent, getTrade, store, updateTrade } from '../store.js';

const proposeTradeSchema = z.object({
  proposerPubkey: z.string(),
  counterpartyPubkey: z.string(),
  tileId: z.string(),
  worldTime: z.string(),
  offer: z.record(z.unknown()),
  request: z.record(z.unknown()),
  proposerSignature: z.string()
});

const signTradeSchema = z.object({
  signerPubkey: z.string(),
  signature: z.string()
});

function summarizeTradeItems(items: Record<string, unknown>): string {
  const entries = Object.entries(items ?? {})
    .filter(([, amount]) => Number(amount ?? 0) > 0)
    .map(([resource, amount]) => `${amount} ${resource}`);
  return entries.length ? entries.join(', ') : 'nothing';
}

export async function registerTradeRoutes(app: FastifyInstance): Promise<void> {
  app.post('/trades/propose', async (request, reply) => {
    const parsed = proposeTradeSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid trade proposal', details: parsed.error.flatten() });
    }
    const trade = parsed.data;
    const counterpartyPubkey = trade.counterpartyPubkey === 'self'
      ? trade.proposerPubkey
      : trade.counterpartyPubkey;
    const message = canonicalJson({
      proposerPubkey: trade.proposerPubkey,
      counterpartyPubkey,
      tileId: trade.tileId,
      worldTime: trade.worldTime,
      offer: trade.offer,
      request: trade.request
    });
    const validSig = await verifySignatureHex({
      pubkeyHex: trade.proposerPubkey,
      signatureHex: trade.proposerSignature,
      message
    });
    if (!validSig) {
      return reply.code(400).send({ error: 'Invalid proposer signature' });
    }
    const inserted = {
      trade_id: crypto.randomUUID(),
      proposer_pub_key: trade.proposerPubkey,
      proposer_pubkey: trade.proposerPubkey,
      counterparty_pubkey: counterpartyPubkey,
      tile_id: trade.tileId,
      world_time: trade.worldTime,
      offer: trade.offer,
      request: trade.request,
      proposer_signature: trade.proposerSignature,
      counterparty_signature: null,
      committed_event_hash: null,
      created_at: new Date().toISOString()
    };
    store.trades.push(inserted);
    return reply.code(201).send(inserted);
  });

  app.post('/trades/:id/sign', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = signTradeSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid signer payload', details: parsed.error.flatten() });
    }
    const signer = parsed.data;
    const trade = getTrade(id);
    if (!trade) {
      return reply.code(404).send({ error: 'Trade not found' });
    }
    if (trade.counterparty_pubkey !== signer.signerPubkey) {
      return reply.code(403).send({ error: 'Only counterparty can sign this trade' });
    }
    const message = canonicalJson({
      tradeId: trade.trade_id,
      proposerPubkey: trade.proposer_pub_key || trade.proposer_pubkey,
      counterpartyPubkey: trade.counterparty_pubkey,
      offer: trade.offer,
      request: trade.request
    });
    const validSig = await verifySignatureHex({
      pubkeyHex: signer.signerPubkey,
      signatureHex: signer.signature,
      message
    });
    if (!validSig) {
      return reply.code(400).send({ error: 'Invalid counterparty signature' });
    }
    updateTrade(id, { counterparty_signature: signer.signature });
    return getTrade(id);
  });

  app.post('/trades/:id/commit', async (request, reply) => {
    const { id } = request.params as { id: string };
    const trade = getTrade(id);
    if (!trade) {
      return reply.code(404).send({ error: 'Trade not found' });
    }
    if (!trade.counterparty_signature) {
      return reply.code(409).send({ error: 'Trade not fully signed yet' });
    }
    if (trade.committed_event_hash) {
      return reply.code(409).send({ error: 'Trade already committed', eventHash: trade.committed_event_hash });
    }
    const latest = store.events.at(-1);
    const prevHash = latest ? latest.eventHash : null;
    const payload = {
      tradeId: trade.trade_id,
      proposerPubkey: trade.proposer_pub_key || trade.proposer_pubkey,
      counterpartyPubkey: trade.counterparty_pubkey,
      offer: trade.offer,
      request: trade.request,
      note: `Committed trade: gave ${summarizeTradeItems(trade.offer)} for ${summarizeTradeItems(trade.request)}.`,
      signatures: {
        proposer: trade.proposer_signature,
        counterparty: trade.counterparty_signature
      }
    };
    const eventHash = hashEvent({
      prevHash,
      worldTime: trade.world_time,
      tileId: trade.tile_id,
      eventType: 'trade_committed',
      payload,
      actorPubkey: trade.proposer_pub_key || trade.proposer_pubkey
    });
    const event = {
      eventId: crypto.randomUUID(),
      prevHash,
      eventHash,
      worldTime: trade.world_time,
      tileId: trade.tile_id,
      eventType: 'trade_committed',
      payload,
      actorPubkey: trade.proposer_pub_key || trade.proposer_pubkey,
      signature: trade.proposer_signature,
      createdAt: new Date().toISOString()
    };
    addEvent(event);
    updateTrade(id, { committed_event_hash: eventHash });
    return getTrade(id);
  });
}
