import { getAddress } from 'ethers';

export const FIXTURE_LOGIN = getAddress('0x000000000000000000000000000000000000a11c');
export const FIXTURE_MOTHER = getAddress('0x000000000000000000000000000000000000beef');
export const FIXTURE_ACTION = getAddress('0x000000000000000000000000000000000000ac71');
export const FIXTURE_MASTER = getAddress('0x000000000000000000000000000000000000aaa5');

export type FixtureName = 'gate' | 'trading' | 'config' | 'wallet' | 'editor';

export interface DashboardQuery {
  fixture: FixtureName;
  scroll: 'top' | 'advanced';
  capture: boolean;
  fixtureSession: boolean;
}

const FIXTURES: readonly FixtureName[] = ['gate', 'trading', 'config', 'wallet', 'editor'];

export function parseDashboardQuery(search: string): DashboardQuery {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const raw = params.get('fixture');
  const fixture = FIXTURES.includes(raw as FixtureName) ? (raw as FixtureName) : 'gate';
  return {
    fixture,
    scroll: params.get('scroll') === 'advanced' ? 'advanced' : 'top',
    capture: params.get('capture') === '1',
    fixtureSession: fixture !== 'gate',
  };
}

export function shortenAddress(address: string): string {
  const checksummed = getAddress(address);
  return `${checksummed.slice(0, 6)}...${checksummed.slice(-4)}`;
}

export const screenshotFixture = {
  evidence: 'screenshot-display-only',
  launch: {
    holdMin: '1.5',
    holdMax: '1.7',
    accountCount: '10',
    name: 'My Token',
    symbol: 'MTK',
    poolEth: '0.5',
    poolTokenPercent: '99',
    launchFunction: 'OpenTrade',
    bundleTip: '0',
    buyRoute: 'v2',
    removeLimits: true,
    renounce: true,
    verify: true,
  },
  config: {
    poolMin: '2',
    poolMax: '8',
    buyMin: '0.01',
    buyMax: '0.11',
    buyCountMin: '1',
    buyCountMax: '1',
    sellCountMin: '1',
    sellCountMax: '1',
    disperseMin: '0.02',
    disperseMax: '0.12',
    buyIntervalMin: '12',
    buyIntervalMax: '14',
    sellIntervalMin: '10',
    sellIntervalMax: '12',
    buySlippage: '0.05',
    engineTip: '0.5',
    maxHold: '2',
    pattern: 'Mix' as const,
    buyBundle: true,
    sellBundle: false,
    autoStart: false,
    devSellPercent: '100',
  },
  wallet: {
    motherBalance: '0.000',
    totalBalance: '—',
    count: '10',
    active: '200',
    removed: '200',
    includeRemoved: false,
  },
  trading: {
    actionStatus: '11.2847 ETH / Good',
    countBox: '1',
    buyRange: '85-90%',
    bundle: true,
    sellPercent: '100',
    minBuy: '0.05',
    minSell: '0',
    buySlippage: '0.05',
    sellSlippage: '100',
    tip: '0',
    autoSell: '10',
    autoBuy: '5',
    stopLoss: '2',
    profitTarget: '1',
    price: '$2571.67',
    gasGwei: '3.51',
    block: '26,141,713',
    balancePill: '0.0000',
  },
} as const;
