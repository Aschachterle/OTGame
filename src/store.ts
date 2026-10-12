import { config } from './config.js';
import { weatherAt, riverAt, resourcePotential } from './lib/world.js';
import type { Tile, ResourceNode, EventLogEntry, ActionClaim } from './types.js';

export type ResourceNodeRecord = ResourceNode & {
  id: string;
};

export type EventLike = EventLogEntry & {
  event_id?: string;
  event_hash?: string;
  prev_hash?: string | null;
  world_time?: string;
  tile_id?: string;
  event_type?: string;
  actor_pubkey?: string;
  signature?: string;
  created_at?: string;
};

export type ClaimLike = ActionClaim & {
  claim_id?: string;
  action_type?: string;
  actor_pubkey?: string;
  nonce?: string;
  world_time?: string;
  tile_id?: string;
  signature?: string;
  created_at?: string;
  updated_at?: string;
  attestations?: Array<any>;
};

export const store = {
  worldConfig: {
    id: 'world-1',
    worldSeed: config.worldSeed,
    epochStart: config.epochStart,
    rulesVersion: config.rulesVersion,
    createdAt: new Date().toISOString()
  },
  tiles: new Map<string, Tile>(),
  resourceNodes: new Map<string, ResourceNodeRecord>(),
  events: [] as EventLike[],
  claims: [] as ClaimLike[],
  trades: [] as any[]
};

function tileId(x: number, y: number): string {
  return `${x}:${y}`;
}

function biomeFor(x: number, y: number): string {
  if (x === 1 && y === 0) return 'river';
  if (x === 3 && y === 1) return 'forest';
  if (x === 5 && y === 2) return 'mountain';
  if (x % 2 === 0) return 'grassland';
  if (x % 3 === 0) return 'badlands';
  return y % 2 === 0 ? 'prairie' : 'plains';
}

function elevationFor(x: number, y: number): number {
  return 320 + x * 35 + y * 22 + ((x + y) % 4) * 18;
}

export function initializeDemoWorld(): void {
  store.tiles.clear();
  store.resourceNodes.clear();
  store.events = [];
  store.claims = [];
  store.trades = [];

  for (let x = 0; x <= 8; x += 1) {
    for (let y = 0; y <= 3; y += 1) {
      const id = tileId(x, y);
      store.tiles.set(id, {
        tileId: id,
        x,
        y,
        biome: biomeFor(x, y),
        elevation: elevationFor(x, y)
      });
    }
  }

  for (const tile of store.tiles.values()) {
    const resourceTypes = ['water', 'wood', 'forage', 'herd'] as const;
    for (const resourceType of resourceTypes) {
      const nodeId = `${tile.tileId}:${resourceType}`;
      const worldTime = '1848-06-01T00:00:00Z';
      const biomeBias =
        tile.biome === 'river' && resourceType === 'water' ? 1.5 :
        tile.biome === 'forest' && resourceType === 'wood' ? 1.45 :
        tile.biome === 'mountain' && resourceType === 'forage' ? 0.7 :
        1;
      const baseCapacity = Math.max(
        12,
        Math.round(resourcePotential(nodeId, worldTime, config.worldSeed, resourceType) * biomeBias)
      );

      store.resourceNodes.set(nodeId, {
        id: nodeId,
        nodeId,
        tileId: tile.tileId,
        resourceType,
        baseCapacity,
        regenModel: { tileId: tile.tileId, resourceType, tickRate: 1, resilience: 0.6 }
      });
    }
  }
}

export function getWorldConfig() {
  return store.worldConfig;
}

export function getTile(tileId: string): Tile | undefined {
  return store.tiles.get(tileId);
}

export function getResourceNodes(tileId: string): ResourceNodeRecord[] {
  return Array.from(store.resourceNodes.values()).filter((node) => node.tileId === tileId);
}

export function getResourceNodeRemaining(nodeId: string): number {
  let node = store.resourceNodes.get(nodeId);
  if (!node) {
    const parts = nodeId.split(':');
    const resourceType = (parts[parts.length - 1] as 'water' | 'wood' | 'forage' | 'herd') || 'forage';
    const tileId = parts.slice(0, -1).join(':') || 'trail';
    const baseCapacity = resourceType === 'water' ? 90 : resourceType === 'wood' ? 65 : resourceType === 'forage' ? 120 : 25;
    node = {
      id: nodeId,
      nodeId,
      tileId,
      resourceType,
      baseCapacity,
      regenModel: { tileId, resourceType, tickRate: 1, resilience: 0.6 }
    };
    store.resourceNodes.set(nodeId, node);
  }
  const consumed = store.events
    .filter((event) => (event.eventType ?? event.event_type) === 'resource_consumed')
    .reduce((sum, event) => {
      const nodeMatch = event.payload?.nodeId;
      const amount = Number(event.payload?.amount ?? 0);
      return nodeMatch === nodeId ? sum + amount : sum;
    }, 0);
  return Math.max(0, node.baseCapacity - consumed);
}

export function getTileSnapshot(tileId: string, worldTime: string) {
  const tile = getTile(tileId);
  if (!tile) return undefined;
  return {
    tile,
    time: worldTime,
    weather: weatherAt(tileId, worldTime, config.worldSeed),
    resources: getResourceNodes(tileId).map((node) => ({
      nodeId: node.nodeId,
      resourceType: node.resourceType,
      remaining: getResourceNodeRemaining(node.id)
    })),
    river: riverAt(`${tileId}-river`, worldTime, config.worldSeed)
  };
}

export function listEvents(sinceHash?: string, limit = 50) {
  let events = [...store.events];
  if (sinceHash) {
    const index = events.findIndex((event) => event.eventHash === sinceHash);
    if (index >= 0) {
      events = events.slice(index + 1);
    }
  }
  return events.slice(-limit).reverse();
}

export function addEvent(event: EventLike) {
  store.events.push(event);
  return event;
}

export function getClaim(claimId: string) {
  return store.claims.find((claim) => claim.claimId === claimId || claim.claim_id === claimId);
}

export function addClaim(claim: ClaimLike) {
  store.claims.push(claim);
  return claim;
}

export function updateClaim(claimId: string, patch: Partial<ClaimLike>) {
  const claim = getClaim(claimId);
  if (!claim) return undefined;
  Object.assign(claim, patch);
  return claim;
}

export function addTrade(trade: any) {
  store.trades.push(trade);
  return trade;
}

export function getTrade(tradeId: string) {
  return store.trades.find((trade) => trade.trade_id === tradeId || trade.tradeId === tradeId);
}

export function updateTrade(tradeId: string, patch: Record<string, any>) {
  const trade = getTrade(tradeId);
  if (!trade) return undefined;
  Object.assign(trade, patch);
  return trade;
}

export function resourceTotalForNode(nodeId: string): number {
  const node = store.resourceNodes.get(nodeId);
  if (!node) return 0;
  const nearest = getResourceNodeRemaining(nodeId);
  return nearest + store.events
    .filter((event) => (event.eventType ?? event.event_type) === 'resource_consumed')
    .reduce((sum, event) => (event.payload?.nodeId === nodeId ? sum + Number(event.payload?.amount ?? 0) : sum), 0);
}

export function getResourcePotential(nodeId: string, worldTime: string): number {
  const node = store.resourceNodes.get(nodeId);
  if (!node) return 0;
  const base = resourcePotential(node.nodeId, worldTime, config.worldSeed, node.resourceType);
  return Math.max(0, Math.round(base));
}
