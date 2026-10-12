import { sha256Hex } from './crypto.js';
import type { ResourceType } from '../types.js';

const DAY_MS = 24 * 60 * 60 * 1000;

function seededUnit(seed: string, key: string): number {
  const hash = sha256Hex(`${seed}|${key}`);
  const prefix = hash.slice(0, 13);
  const n = Number.parseInt(prefix, 16);
  return n / Number.parseInt('fffffffffffff', 16);
}

function dayBucket(worldTime: string): number {
  return Math.floor(new Date(worldTime).getTime() / DAY_MS);
}

export function weatherAt(tileId: string, worldTime: string, worldSeed: string): {
  rain: number;
  tempC: number;
  windKph: number;
} {
  const day = dayBucket(worldTime);
  const rain = seededUnit(worldSeed, `rain|${tileId}|${day}`);
  const temp = seededUnit(worldSeed, `temp|${tileId}|${day}`);
  const wind = seededUnit(worldSeed, `wind|${tileId}|${day}`);
  return {
    rain: Number((rain * 100).toFixed(2)),
    tempC: Number((-10 + temp * 45).toFixed(2)),
    windKph: Number((5 + wind * 50).toFixed(2))
  };
}

export function riverAt(segmentId: string, worldTime: string, worldSeed: string): {
  depthFt: number;
  flowRate: number;
} {
  const day = dayBucket(worldTime);
  const seasonal = seededUnit(worldSeed, `seasonal|${segmentId}|${Math.floor(day / 7)}`);
  const shortCycle = seededUnit(worldSeed, `daily|${segmentId}|${day}`);
  const depth = 1.5 + seasonal * 5 + shortCycle * 1.3;
  const flow = 120 + seasonal * 300 + shortCycle * 100;
  return {
    depthFt: Number(depth.toFixed(2)),
    flowRate: Number(flow.toFixed(2))
  };
}

export function resourcePotential(
  nodeId: string,
  worldTime: string,
  worldSeed: string,
  resourceType: ResourceType
): number {
  const day = dayBucket(worldTime);
  const base = seededUnit(worldSeed, `resource|${resourceType}|${nodeId}`);
  const seasonal = seededUnit(worldSeed, `resource|seasonal|${resourceType}|${Math.floor(day / 10)}`);
  return Math.floor((0.6 * base + 0.4 * seasonal) * 100);
}

