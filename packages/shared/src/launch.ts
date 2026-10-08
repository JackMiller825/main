import { executionChain } from './chain.js';
import { compareDecimals, parseDecimalToScale } from './money.js';
import { sanitizeIdentity } from './templates.js';

export interface LaunchInput {
  holdMin: string;
  holdMax: string;
  accountCount: string;
  name: string;
  symbol: string;
  poolEth: string;
  poolTokenPercent: string;
  bundleTipGwei: string;
  chainId: number;
}

export function validateLaunchInput(input: LaunchInput): { ok: true } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  try {
    executionChain(input.chainId);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unsupported chain.');
  }
  try {
    sanitizeIdentity(input.name, input.symbol);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Invalid token identity.');
  }
  const hold = compareDecimals(input.holdMin, input.holdMax, 4);
  if (hold === null) errors.push('Hold range must be a decimal pair.');
  else if (hold > 0) errors.push('Hold minimum must be less than or equal to the maximum.');
  if (!/^\d+$/.test(input.accountCount.trim()) || Number(input.accountCount) < 1 || Number(input.accountCount) > 100) {
    errors.push('Account count must be a whole number from 1 to 100.');
  }
  const pool = parseDecimalToScale(input.poolEth, 18);
  if (pool === null || pool <= 0n) errors.push('Pool ETH must be a positive amount.');
  if (!/^\d+$/.test(input.poolTokenPercent.trim())) {
    errors.push('Pool token percent must be a whole number.');
  } else {
    const percent = Number(input.poolTokenPercent);
    if (percent < 1 || percent > 100) errors.push('Pool token percent must be from 1 to 100.');
  }
  const tip = parseDecimalToScale(input.bundleTipGwei, 9);
  if (tip === null) errors.push('Bundle tip must be a non-negative gwei amount.');
  return errors.length ? { ok: false, errors } : { ok: true };
}

export interface LaunchStep {
  id: 'compile' | 'deploy' | 'verify' | 'activate' | 'buys';
  state: 'ready' | 'blocked' | 'unavailable';
  detail: string;
}

export function buildLaunchPlan(input: { hasArtifact: boolean; hasOpenTrade: boolean }): {
  submitted: false;
  steps: LaunchStep[];
} {
  return {
    submitted: false,
    steps: [
      {
        id: 'compile',
        state: input.hasArtifact ? 'ready' : 'blocked',
        detail: input.hasArtifact
          ? 'A compilation artifact is present. Deployment still requires a separate confirmation.'
          : 'Compile a reviewed template before deployment.',
      },
      {
        id: 'deploy',
        state: 'blocked',
        detail: 'Demo mode does not broadcast. A live deployment requires a browser-wallet approval on the configured Ethereum chain.',
      },
      {
        id: 'verify',
        state: 'blocked',
        detail: 'Source verification runs only after a confirmed deployment. A failed verification is retried without redeploying.',
      },
      {
        id: 'activate',
        state: 'unavailable',
        detail: input.hasOpenTrade
          ? 'An OpenTrade function is not called automatically.'
          : 'OpenTrade is a fixture label. It is not in the reviewed template ABI and will not be called.',
      },
      {
        id: 'buys',
        state: 'unavailable',
        detail: 'Multi-account launch buys are not implemented. No buy transactions were created.',
      },
    ],
  };
}
