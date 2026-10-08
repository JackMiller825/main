import pg from 'pg';
import { resolveAppMode } from '@launchpad/shared';

const mode = resolveAppMode(process.env.APP_MODE);
if (mode !== 'demo') {
  console.error('Refusing to seed unless APP_MODE=demo.');
  process.exit(1);
}
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is required to seed.');
  process.exit(1);
}

const client = new pg.Client({ connectionString: databaseUrl });
await client.connect();
try {
  await client.query(
    `INSERT INTO accounts (id, chain_id, address, name, kind, removed)
     VALUES ('00000000-0000-4000-8000-000000000001', $1, $2, $3, 'watch', false)
     ON CONFLICT (chain_id, address) DO NOTHING`,
    [11155111, '0x0000000000000000000000000000000000000001', 'Demo watch account'],
  );
  console.log('Demo seed finished. The row is a watch address, not a signer.');
} finally {
  await client.end();
}
