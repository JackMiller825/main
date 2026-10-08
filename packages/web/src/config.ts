import { executionChain, resolveAppMode, type AppMode } from '@launchpad/shared';

export const appMode: AppMode = resolveAppMode(import.meta.env.VITE_APP_MODE);
export const apiBase = import.meta.env.VITE_API_BASE_URL ?? '';
export const configuredChainId = Number(import.meta.env.VITE_CHAIN_ID || 11155111);

export function chainReady(): { ok: true; chainId: number } | { ok: false; message: string } {
  try {
    const chain = executionChain(configuredChainId);
    return { ok: true, chainId: chain.chainId };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Unsupported chain.' };
  }
}
