import { executionChain } from './chain.js';
import type { AppMode } from './mode.js';

export interface RuntimeConfig {
  mode: AppMode;
  chainId: number;
  databaseUrl?: string;
  sessionSecret?: string;
  rpcHttpUrl?: string;
}

export function assertRuntimeConfig(config: RuntimeConfig): void {
  executionChain(config.chainId);
  if (config.mode === 'demo') return;
  if (!config.databaseUrl) throw new Error('DATABASE_URL is required when APP_MODE is not demo.');
  if (!config.sessionSecret || config.sessionSecret.length < 32) {
    throw new Error('SESSION_SECRET must be at least 32 characters outside demo mode.');
  }
  if (!config.rpcHttpUrl) throw new Error('RPC_HTTP_URL is required when APP_MODE is not demo.');
}
