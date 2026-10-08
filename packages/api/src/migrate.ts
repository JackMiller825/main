import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is required. Demo mode does not need migrations.');
  process.exit(1);
}

const sqlPath = join(dirname(fileURLToPath(import.meta.url)), '../migrations/001_init.sql');
const sql = readFileSync(sqlPath, 'utf8');
const client = new pg.Client({ connectionString: databaseUrl });
await client.connect();
try {
  await client.query(sql);
  console.log('Applied 001_init.');
} finally {
  await client.end();
}
