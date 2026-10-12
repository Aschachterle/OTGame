CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
  CREATE TYPE resource_type AS ENUM ('water', 'wood', 'forage', 'herd');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE claim_status AS ENUM ('pending', 'accepted', 'rejected', 'forked');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS world_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_seed TEXT NOT NULL,
  epoch_start TIMESTAMPTZ NOT NULL,
  rules_version TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tiles (
  tile_id TEXT PRIMARY KEY,
  x INT NOT NULL,
  y INT NOT NULL,
  biome TEXT NOT NULL,
  elevation INT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_tiles_xy ON tiles (x, y);

CREATE TABLE IF NOT EXISTS resource_nodes (
  node_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tile_id TEXT NOT NULL REFERENCES tiles(tile_id) ON DELETE RESTRICT,
  resource_type resource_type NOT NULL,
  base_capacity INT NOT NULL CHECK (base_capacity >= 0),
  regen_model JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_resource_nodes_tile ON resource_nodes (tile_id);
CREATE INDEX IF NOT EXISTS idx_resource_nodes_type ON resource_nodes (resource_type);

CREATE TABLE IF NOT EXISTS event_log (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prev_hash TEXT,
  event_hash TEXT NOT NULL UNIQUE,
  world_time TIMESTAMPTZ NOT NULL,
  tile_id TEXT NOT NULL REFERENCES tiles(tile_id) ON DELETE RESTRICT,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  actor_pubkey TEXT NOT NULL,
  signature TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_event_log_world_time ON event_log (world_time);
CREATE INDEX IF NOT EXISTS idx_event_log_tile_time ON event_log (tile_id, world_time);
CREATE INDEX IF NOT EXISTS idx_event_log_prev_hash ON event_log (prev_hash);

CREATE TABLE IF NOT EXISTS action_claims (
  claim_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL,
  actor_pubkey TEXT NOT NULL,
  nonce TEXT NOT NULL,
  world_time TIMESTAMPTZ NOT NULL,
  tile_id TEXT NOT NULL REFERENCES tiles(tile_id) ON DELETE RESTRICT,
  inputs JSONB NOT NULL,
  signature TEXT NOT NULL,
  status claim_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  accepted_event_id UUID REFERENCES event_log(event_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (actor_pubkey, nonce)
);

CREATE INDEX IF NOT EXISTS idx_action_claims_status ON action_claims (status);
CREATE INDEX IF NOT EXISTS idx_action_claims_tile_time ON action_claims (tile_id, world_time);

CREATE TABLE IF NOT EXISTS multi_sig_attestations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES action_claims(claim_id) ON DELETE CASCADE,
  witness_pubkey TEXT NOT NULL,
  signature TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (claim_id, witness_pubkey)
);

CREATE INDEX IF NOT EXISTS idx_attestations_claim ON multi_sig_attestations (claim_id);

CREATE TABLE IF NOT EXISTS identity_profiles (
  pubkey TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trade_proposals (
  trade_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposer_pubkey TEXT NOT NULL,
  counterparty_pubkey TEXT NOT NULL,
  tile_id TEXT NOT NULL REFERENCES tiles(tile_id) ON DELETE RESTRICT,
  world_time TIMESTAMPTZ NOT NULL,
  offer JSONB NOT NULL,
  request JSONB NOT NULL,
  proposer_signature TEXT NOT NULL,
  counterparty_signature TEXT,
  committed_event_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_action_claims_updated_at ON action_claims;
CREATE TRIGGER trg_action_claims_updated_at
BEFORE UPDATE ON action_claims
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE FUNCTION prevent_event_log_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'event_log is append-only';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_event_log_no_update ON event_log;
CREATE TRIGGER trg_event_log_no_update
BEFORE UPDATE ON event_log
FOR EACH ROW
EXECUTE FUNCTION prevent_event_log_mutation();

DROP TRIGGER IF EXISTS trg_event_log_no_delete ON event_log;
CREATE TRIGGER trg_event_log_no_delete
BEFORE DELETE ON event_log
FOR EACH ROW
EXECUTE FUNCTION prevent_event_log_mutation();
