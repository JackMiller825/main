import { assertRuntimeConfig, executionChain, resolveAppMode } from '@launchpad/shared';
import { buildServer } from './buildServer.js';

if (process.env.SIGNER_PRIVATE_KEY || process.env.PRIVATE_KEY) {
  console.warn('Server private key variables are ignored and are not loaded.');
}

const mode = resolveAppMode(process.env.APP_MODE);
const chainId = Number(process.env.CHAIN_ID || (mode === 'demo' ? '11155111' : ''));
if (!Number.isInteger(chainId)) {
  throw new Error('CHAIN_ID is required outside demo mode.');
}
executionChain(chainId);

const sessionSecret = process.env.SESSION_SECRET || (mode === 'demo' ? 'demo-session-secret-not-for-production' : '');
assertRuntimeConfig({
  mode,
  chainId,
  databaseUrl: process.env.DATABASE_URL,
  sessionSecret,
  rpcHttpUrl: process.env.RPC_HTTP_URL,
});

const allowed = (process.env.ALLOWED_WALLET_ADDRESSES ?? '')
  .split(',')
  .map((item) => item.trim())
  .filter((item) => item.length > 0 && item !== '0x0000000000000000000000000000000000000000');

const app = await buildServer({
  mode,
  chainId,
  sessionSecret,
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173').split(',').map((item) => item.trim()),
  authDomain: process.env.AUTH_DOMAIN ?? 'localhost:5173',
  authUri: process.env.AUTH_URI ?? 'http://localhost:5173',
  owner: process.env.OWNER_WALLET_ADDRESS && process.env.OWNER_WALLET_ADDRESS !== '0x0000000000000000000000000000000000000000'
    ? process.env.OWNER_WALLET_ADDRESS
    : undefined,
  allowed,
  rpcHttpUrl: process.env.RPC_HTTP_URL,
  rpcWsUrl: process.env.RPC_WS_URL,
  explorerApiKey: process.env.EXPLORER_API_KEY,
  logger: true,
});

const port = Number(process.env.PORT || 3001);
await app.listen({ port, host: '127.0.0.1' });
