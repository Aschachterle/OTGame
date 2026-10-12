import pg from 'pg';
import { config } from './config.js';

const { Pool } = pg;

const pool = new Pool({
  connectionString: config.databaseUrl
});

const BIOMES = ['prairie', 'river', 'forest', 'grassland', 'mountain', 'badlands'];

function tileId(x: number, y: number): string {
  return `${x}:${y}`;
}

function biomeFor(x: number, y: number): string {
  if (x < 0 || y < 0) return 'prairie';
  if (x === 1 && y === 0) return 'river';
  if (x === 3 && y === 1) return 'forest';
  if (x === 5 && y === 2) return 'mountain';
  if (x % 2 === 0) return 'grassland';
  if (x % 3 === 0) return 'badlands';
  return BIOMES[(x + y) % BIOMES.length];
}

function elevationFor(x: number, y: number): number {
  return 320 + (x * 40) + (y * 18) + ((x + y) % 5) * 15;
}

async function ensureWorldConfig(): Promise<void> {
  await pool.query(
    `INSERT INTO world_config (world_seed, epoch_start, rules_version)
     VALUES ($1, $2, $3)
     ON CONFLICT DO NOTHING`,
    [config.worldSeed, config.epochStart, config.rulesVersion]
  );
}

async function ensureTiles(): Promise<void> {
  const rows: Array<[number, number]> = [];
  for (let x = 0; x <= 8; x += 1) {
    for (let y = 0; y <= 3; y += 1) {
      rows.push([x, y]);
    }
  }

  for (const [x, y] of rows) {
    await pool.query(
      `INSERT INTO tiles (tile_id, x, y, biome, elevation)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (tile_id) DO UPDATE SET biome = EXCLUDED.biome, elevation = EXCLUDED.elevation`,
      [tileId(x, y), x, y, biomeFor(x, y), elevationFor(x, y)]
    );
  }
}

async function ensureResourceNodes(): Promise<void> {
  const tiles = await pool.query<{ tile_id: string }>(`SELECT tile_id FROM tiles`);

  for (const tile of tiles.rows) {
    const resourceTypes = ['water', 'wood', 'forage', 'herd'] as const;
    for (const resourceType of resourceTypes) {
      const baseCapacity =
        resourceType === 'water' ? 90 :
        resourceType === 'wood' ? 65 :
        resourceType === 'forage' ? 120 :
        18;

      await pool.query(
        `INSERT INTO resource_nodes (tile_id, resource_type, base_capacity, regen_model)
         VALUES ($1, $2, $3, $4::jsonb)
         ON CONFLICT DO NOTHING`,
        [
          tile.tile_id,
          resourceType,
          baseCapacity,
          JSON.stringify({
            resourceType,
            tileId: tile.tile_id,
            tickRate: 1,
            resilience: 0.6
          })
        ]
      );
    }
  }
}

async function main(): Promise<void> {
  try {
    await ensureWorldConfig();
    await ensureTiles();
    await ensureResourceNodes();
    console.log('Seed complete');
    console.log({ worldSeed: config.worldSeed, rulesVersion: config.rulesVersion, tileCount: 32 });
  } catch (error) {
    console.error('Seed failed');
    console.error(error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

void main();
