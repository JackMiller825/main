import { createSiweMessage } from '@launchpad/shared';
import { getAddress, hexlify, toUtf8Bytes } from 'ethers';
import { apiBase, appMode, configuredChainId } from '../config';
import { useDashboard } from '../store';

let activeProvider: EthereumProvider | null = null;
let activeAddress: string | null = null;

function discoverProviders(): EthereumProvider[] {
  const ethereum = window.ethereum;
  if (!ethereum) return [];
  if (Array.isArray(ethereum.providers) && ethereum.providers.length > 0) return ethereum.providers;
  return [ethereum];
}

function walletError(error: unknown): string {
  const code = typeof error === 'object' && error && 'code' in error ? Number(error.code) : 0;
  if (code === 4001) return 'The wallet request was rejected.';
  if (code === -32002) return 'A wallet request is already pending.';
  return 'The wallet request failed.';
}

const fixtureLinks = [
  { href: '/?fixture=trading', label: 'Launch, trading, and manual view' },
  { href: '/?fixture=config', label: 'Config, top' },
  { href: '/?fixture=config&scroll=advanced', label: 'Config, lower settings' },
  { href: '/?fixture=wallet', label: 'Engine wallet registry' },
  { href: '/?fixture=editor', label: 'Contract editor' },
];

export function connectWallet(): void {
  const providers = discoverProviders();
  if (providers.length === 0) {
    useDashboard.getState().showDialog(
      'No wallet detected',
      appMode === 'demo'
        ? 'No browser wallet is installed, and no signature was requested. Demo fixtures are display data only.'
        : 'Install a browser wallet to continue.',
      appMode === 'demo' ? fixtureLinks : undefined,
    );
    return;
  }
  activeProvider = providers[0] ?? null;
  void continueConnect();
}

async function continueConnect(): Promise<void> {
  const provider = activeProvider;
  const store = useDashboard.getState();
  if (!provider) return;
  store.patch({ auth: 'connecting', gateDetail: '' });
  try {
    const accounts = (await provider.request({ method: 'eth_requestAccounts' })) as string[];
    const account = accounts[0];
    if (!account) throw new Error('No account');
    const chainHex = (await provider.request({ method: 'eth_chainId' })) as string;
    const chainId = Number.parseInt(chainHex, 16);
    if (chainId !== configuredChainId) {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${configuredChainId.toString(16)}` }],
      });
    }
    activeAddress = account;
    provider.on?.('accountsChanged', (next) => {
      const changed = Array.isArray(next) ? String(next[0] ?? '') : '';
      if (changed.toLowerCase() !== activeAddress?.toLowerCase()) {
        useDashboard.getState().patch({
          auth: 'disconnected',
          address: null,
          fixtureSession: false,
          gateDetail: 'The wallet account changed. Connect again to continue.',
        });
      }
    });
    provider.on?.('chainChanged', () => {
      useDashboard.getState().patch({
        auth: 'disconnected',
        address: null,
        fixtureSession: false,
        gateDetail: 'The wallet network changed. Connect again on the configured Ethereum chain.',
      });
    });
    store.patch({ address: account, auth: 'signing', gateDetail: 'Verifying wallet… approve the signature request in your wallet.' });
    await signIn();
  } catch (error) {
    useDashboard.getState().patch({ auth: 'disconnected', gateDetail: walletError(error) });
  }
}

export async function signIn(): Promise<void> {
  const provider = activeProvider;
  const address = activeAddress;
  if (!provider || !address) return;
  const store = useDashboard.getState();
  store.patch({ auth: 'signing', gateDetail: 'Verifying wallet… approve the signature request in your wallet.' });
  try {
    const nonceResponse = await fetch(`${apiBase}/v1/auth/nonce`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json', 'x-launchpad-request': '1' },
      body: JSON.stringify({ address }),
    });
    if (!nonceResponse.ok) throw new Error('nonce');
    const { nonce } = (await nonceResponse.json()) as { nonce: string };
    const message = createSiweMessage({
      domain: window.location.host,
      address: getAddress(address),
      statement: 'Sign in to ETH LaunchPad.',
      uri: window.location.origin,
      chainId: configuredChainId,
      nonce,
      issuedAt: new Date().toISOString(),
      expirationTime: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    });
    const signature = (await provider.request({
      method: 'personal_sign',
      params: [hexlify(toUtf8Bytes(message)), address],
    })) as string;
    const verify = await fetch(`${apiBase}/v1/auth/verify`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json', 'x-launchpad-request': '1' },
      body: JSON.stringify({ message, signature }),
    });
    const body = (await verify.json()) as { role?: 'owner' | 'operator'; error?: { message?: string } };
    if (verify.status === 403) {
      store.patch({ auth: 'denied', gateDetail: 'Wallet not whitelisted. Access is restricted.' });
      return;
    }
    if (!verify.ok || !body.role) {
      store.patch({ auth: 'retry', gateDetail: 'Sign the login request to verify your wallet and open the dashboard.' });
      return;
    }
    store.patch({
      auth: 'ready',
      role: body.role,
      fixtureSession: false,
      address,
      gateDetail: '',
    });
  } catch {
    store.patch({ auth: 'retry', gateDetail: 'Sign the login request to verify your wallet and open the dashboard.' });
  }
}
