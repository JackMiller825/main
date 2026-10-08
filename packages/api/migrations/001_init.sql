-- Address metadata, jobs, and artifacts. Do not add private-key columns.
CREATE TABLE IF NOT EXISTS schema_migrations (
  id text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY,
  chain_id integer NOT NULL,
  address text NOT NULL,
  name text NOT NULL,
  kind text NOT NULL DEFAULT 'watch',
  removed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (chain_id, address)
);

CREATE TABLE IF NOT EXISTS compilation_artifacts (
  source_hash text PRIMARY KEY,
  chain_id integer NOT NULL,
  compiler_version text NOT NULL,
  settings jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY,
  chain_id integer NOT NULL,
  kind text NOT NULL,
  status text NOT NULL,
  detail text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS indexed_logs (
  chain_id integer NOT NULL,
  tx_hash text NOT NULL,
  log_index integer NOT NULL,
  block_number bigint NOT NULL,
  block_hash text NOT NULL,
  address text NOT NULL,
  topics jsonb NOT NULL,
  data text NOT NULL,
  PRIMARY KEY (chain_id, tx_hash, log_index)
);

INSERT INTO schema_migrations (id) VALUES ('001_init')
ON CONFLICT (id) DO NOTHING;
