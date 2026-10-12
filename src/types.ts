export type ResourceType = 'water' | 'wood' | 'forage' | 'herd';
export type ClaimStatus = 'pending' | 'accepted' | 'rejected' | 'forked';

export interface WorldConfig {
  id: string;
  worldSeed: string;
  epochStart: string;
  rulesVersion: string;
  createdAt: string;
}

export interface Tile {
  tileId: string;
  x: number;
  y: number;
  biome: string;
  elevation: number;
}

export interface ResourceNode {
  nodeId: string;
  tileId: string;
  resourceType: ResourceType;
  baseCapacity: number;
  regenModel: Record<string, unknown>;
}

export interface EventLogEntry<TPayload = Record<string, unknown>> {
  eventId: string;
  prevHash: string | null;
  eventHash: string;
  worldTime: string;
  tileId: string;
  eventType: string;
  payload: TPayload;
  actorPubkey: string;
  signature: string;
  createdAt: string;
}

export interface ActionClaim<TInputs = Record<string, unknown>> {
  claimId: string;
  actionType: string;
  actorPubkey: string;
  nonce: string;
  worldTime: string;
  tileId: string;
  inputs: TInputs;
  signature: string;
  status: ClaimStatus;
  rejectionReason?: string | null;
  acceptedEventId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MultiSigAttestation {
  id: string;
  claimId: string;
  witnessPubkey: string;
  signature: string;
  createdAt: string;
}

