import { createHash } from 'node:crypto';
import * as ed from '@noble/ed25519';
import { canonicalJson } from './canonical-json.js';

function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new Error('Hex string must have even length');
  }
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    out[i / 2] = Number.parseInt(hex.slice(i, i + 2), 16);
  }
  return out;
}

export function sha256Hex(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

export function hashEvent(input: {
  prevHash: string | null;
  worldTime: string;
  tileId: string;
  eventType: string;
  payload: Record<string, unknown>;
  actorPubkey: string;
}): string {
  return sha256Hex(canonicalJson(input));
}

export function buildActionSigningPayload(input: {
  actionType: string;
  actorPubkey: string;
  nonce: string;
  worldTime: string;
  tileId: string;
  inputs: Record<string, unknown>;
}): string {
  return canonicalJson({
    actionType: input.actionType,
    actorPubkey: input.actorPubkey,
    nonce: input.nonce,
    worldTime: input.worldTime,
    tileId: input.tileId,
    inputs: input.inputs
  });
}

export async function verifySignatureHex(params: {
  pubkeyHex: string;
  signatureHex: string;
  message: string;
}): Promise<boolean> {
  return ed.verifyAsync(
    hexToBytes(params.signatureHex),
    new TextEncoder().encode(params.message),
    hexToBytes(params.pubkeyHex)
  );
}
