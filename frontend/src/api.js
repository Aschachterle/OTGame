import { canonicalJson } from './canonical-json.js';

export const API_BASE = 'http://localhost:3000';
const WORLD_TIME = '1848-06-01T00:00:00Z';

/**
 * @typedef {{
 *   actorPubkey: string,
 *   signMessage: (message: string) => Promise<string>
 * } | null} PlayerIdentity
 */

/**
 * @param {{ baseUrl?: string, getPlayerIdentity?: () => Promise<PlayerIdentity> }} options
 */
export function createApiClient({ baseUrl = API_BASE, getPlayerIdentity = async () => null } = {}) {
  function buildEventSigningPayload({ prevHash, worldTime, tileId, eventType, payload, actorPubkey }) {
    return canonicalJson({
      prevHash,
      worldTime,
      tileId,
      eventType,
      payload,
      actorPubkey
    });
  }

  function buildActionSigningPayload({ actionType, actorPubkey, nonce, worldTime, tileId, inputs }) {
    return canonicalJson({
      actionType,
      actorPubkey,
      nonce,
      worldTime,
      tileId,
      inputs
    });
  }

  function buildTradeProposalSigningPayload({ proposerPubkey, counterpartyPubkey, tileId, worldTime, offer, request }) {
    return canonicalJson({
      proposerPubkey,
      counterpartyPubkey,
      tileId,
      worldTime,
      offer,
      request
    });
  }

  function buildTradeCounterpartySigningPayload({ tradeId, proposerPubkey, counterpartyPubkey, offer, request }) {
    return canonicalJson({
      tradeId,
      proposerPubkey,
      counterpartyPubkey,
      offer,
      request
    });
  }

  async function fetchJson(url, init) {
    const response = await fetch(url, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init?.headers ?? {})
      }
    });
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    return response.json();
  }

  async function getSignedEnvelope(buildMessage) {
    const identity = await getPlayerIdentity();
    if (!identity) {
      return {
        actorPubkey: 'demo-player',
        signature: ''
      };
    }

    const actorPubkey = identity.actorPubkey;
    return {
      actorPubkey,
      signature: await identity.signMessage(buildMessage(actorPubkey))
    };
  }

  return {
    fetchJson,

    getNarrationConfig() {
      return fetchJson(`${baseUrl}/story/narration/config`);
    },

    async getNarration(context) {
      const response = await fetch(`${baseUrl}/story/narration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(context)
      });

      if (!response.ok) {
        throw new Error(`Narration failed: ${response.status}`);
      }

      return response.json();
    },

    async getNarrationAudio(text) {
      const response = await fetch(`${baseUrl}/story/narration/audio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        const error = new Error(`Cloud narration failed: ${response.status}`);
        error.status = response.status;
        throw error;
      }

      return response.blob();
    },

    getWorldConfig() {
      return fetchJson(`${baseUrl}/world/config`);
    },

    getTile(tileId) {
      return fetchJson(`${baseUrl}/world/tile/${tileId}?time=${WORLD_TIME}`);
    },

    getEvents(limit = 8) {
      return fetchJson(`${baseUrl}/events?limit=${limit}`);
    },

    async postEvent({ prevHash, tileId, eventType, payload }) {
      const basePayload = {
        prevHash,
        worldTime: WORLD_TIME,
        tileId,
        eventType,
        payload
      };
      const signed = await getSignedEnvelope((actorPubkey) => buildEventSigningPayload({
        ...basePayload,
        actorPubkey
      }));
      const response = await fetch(`${baseUrl}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          ...basePayload,
          actorPubkey: signed.actorPubkey,
          signature: signed.signature
        })
      });
      return response;
    },

    async claimAction({ actionType, tileId, inputs }) {
      const basePayload = {
        actionType,
        nonce: crypto.randomUUID(),
        worldTime: WORLD_TIME,
        tileId,
        inputs
      };
      const signed = await getSignedEnvelope((actorPubkey) => buildActionSigningPayload({
        ...basePayload,
        actorPubkey
      }));
      const claimResponse = await fetch(`${baseUrl}/actions/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          ...basePayload,
          actorPubkey: signed.actorPubkey,
          signature: signed.signature
        })
      });

      if (!claimResponse.ok) {
        const err = await claimResponse.text();
        throw new Error(`Claim failed: ${claimResponse.status} ${err}`);
      }

      const { claim } = await claimResponse.json();
      const finalizeResponse = await fetch(`${baseUrl}/actions/${claim.claimId}/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({})
      });

      if (!finalizeResponse.ok) {
        const err = await finalizeResponse.text();
        throw new Error(`Finalize failed: ${finalizeResponse.status} ${err}`);
      }

      return finalizeResponse.json();
    },

    async proposeTrade({ counterpartyPubkey, tileId, offer, request }) {
      const identity = await getPlayerIdentity();
      if (!identity) {
        throw new Error('Trade proposals require a signed player identity');
      }
      const resolvedCounterpartyPubkey = counterpartyPubkey === 'self'
        ? identity.actorPubkey
        : counterpartyPubkey;

      const proposal = {
        proposerPubkey: identity.actorPubkey,
        counterpartyPubkey: resolvedCounterpartyPubkey,
        tileId,
        worldTime: WORLD_TIME,
        offer,
        request
      };
      const proposerSignature = await identity.signMessage(buildTradeProposalSigningPayload(proposal));
      const response = await fetch(`${baseUrl}/trades/propose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          ...proposal,
          proposerSignature
        })
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Trade proposal failed: ${response.status} ${err}`);
      }

      return response.json();
    },

    async signTrade({ tradeId, proposerPubkey, counterpartyPubkey, offer, request }) {
      const identity = await getPlayerIdentity();
      if (!identity) {
        throw new Error('Trade signatures require a signed player identity');
      }

      const signerPubkey = identity.actorPubkey;
      const signature = await identity.signMessage(buildTradeCounterpartySigningPayload({
        tradeId,
        proposerPubkey,
        counterpartyPubkey,
        offer,
        request
      }));
      const response = await fetch(`${baseUrl}/trades/${tradeId}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          signerPubkey,
          signature
        })
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Trade sign failed: ${response.status} ${err}`);
      }

      return response.json();
    },

    async commitTrade(tradeId) {
      const response = await fetch(`${baseUrl}/trades/${tradeId}/commit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Trade commit failed: ${response.status} ${err}`);
      }

      return response.json();
    }
  };
}
