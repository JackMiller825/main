import { getAddress } from 'ethers';
import type { AppMode } from './mode.js';

export const ETHEREUM_MAINNET = 1;
export const SEPOLIA = 11155111;

const UNISWAP_V2_ROUTER_MAINNET = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
const UNISWAP_V2_FACTORY_MAINNET = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';
const WETH_MAINNET = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';

export interface ExecutionChain {
  chainId: number;
  name: string;
  nativeSymbol: 'ETH';
}

export function executionChain(chainId: number): ExecutionChain {
  if (chainId === ETHEREUM_MAINNET) {
    return { chainId, name: 'Ethereum mainnet', nativeSymbol: 'ETH' };
  }
  if (chainId === SEPOLIA) {
    return { chainId, name: 'Sepolia', nativeSymbol: 'ETH' };
  }
  throw new Error(`Chain ${chainId} is not enabled. This build only uses Ethereum.`);
}

export function displayNativeUnit(legacyFixtureLabels: boolean): 'ETH' | 'BNB' {
  return legacyFixtureLabels ? 'BNB' : 'ETH';
}

export function usesLegacyBnbLabels(
  mode: AppMode,
  fixtureSession: boolean,
  tab: 'launch' | 'config' | 'wallet',
): boolean {
  return mode === 'demo' && fixtureSession && (tab === 'config' || tab === 'wallet');
}

export function uniswapV2Router(chainId: number, configured?: string): string {
  executionChain(chainId);
  if (chainId === ETHEREUM_MAINNET) return UNISWAP_V2_ROUTER_MAINNET;
  if (!configured) {
    throw new Error('Set UNISWAP_V2_ROUTER for this Ethereum network. No router address was assumed.');
  }
  return getAddress(configured);
}

export function uniswapV2Factory(chainId: number): string | null {
  executionChain(chainId);
  if (chainId === ETHEREUM_MAINNET) return UNISWAP_V2_FACTORY_MAINNET;
  return null;
}

export function wethAddress(chainId: number, configured?: string): string {
  executionChain(chainId);
  if (chainId === ETHEREUM_MAINNET) return WETH_MAINNET;
  if (!configured) {
    throw new Error('Set WETH_ADDRESS for this Ethereum network. No wrapped-native address was assumed.');
  }
  return getAddress(configured);
}

export function assertIndexerChain(actualChainId: bigint, expectedChainId: number): void {
  executionChain(expectedChainId);
  if (actualChainId !== BigInt(expectedChainId)) {
    throw new Error(
      `RPC chain ${actualChainId.toString()} does not match configured chain ${expectedChainId}. Indexing stopped.`,
    );
  }
}

export function explorerApiUrl(chainId: number): string {
  executionChain(chainId);
  return `https://api.etherscan.io/v2/api?chainid=${chainId}`;
}
