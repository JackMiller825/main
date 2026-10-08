import { describe, expect, it } from 'vitest';
import { parseAddressBook, exportAddressBook } from './accounts.js';
import { deployability } from './artifact.js';
import { executionChain, explorerApiUrl, uniswapV2Router, usesLegacyBnbLabels } from './chain.js';
import { blockedControlMessage } from './controls.js';
import { sha256Hex } from './hash.js';
import { buildLaunchPlan, validateLaunchInput } from './launch.js';
import { assertOrderSlippage, minimumOut, parseOrderAmount } from './money.js';
import { liveFixtureBlocked, resolveAppMode } from './mode.js';
import { NonceStore } from './nonce.js';
import { parseDashboardQuery, screenshotFixture } from './fixtures.js';
import { redactRpcUrl, validateRpcUrl } from './rpc.js';
import { assertRuntimeConfig } from './runtime.js';
import { spotEthValue, v2AmountOut } from './quote.js';
import { renderTemplate } from './templates.js';
import { WatchIndex, meetsFeedThreshold, meetsHolderThreshold } from './watch.js';

describe('mode and chain boundaries', () => {
  it('defaults missing mode to demo and rejects other chains', () => {
    expect(resolveAppMode(undefined)).toBe('demo');
    expect(() => executionChain(56)).toThrow(/Ethereum/);
    expect(executionChain(1).nativeSymbol).toBe('ETH');
    expect(explorerApiUrl(11155111)).toContain('chainid=11155111');
    expect(explorerApiUrl(11155111)).not.toContain('bsc');
  });

  it('does not let a legacy label choose the chain', () => {
    expect(usesLegacyBnbLabels('demo', true, 'config')).toBe(true);
    expect(usesLegacyBnbLabels('live', true, 'wallet')).toBe(false);
    expect(uniswapV2Router(1).toLowerCase()).toBe('0x7a250d5630b4cf539739df2c5dacb4c659f2488d');
  });

  it('blocks fixtures outside demo mode', () => {
    expect(liveFixtureBlocked('live', '?fixture=trading')).toBe(true);
    expect(liveFixtureBlocked('demo', '?fixture=trading')).toBe(false);
  });

  it('refuses live startup without services', () => {
    expect(() => assertRuntimeConfig({ mode: 'live', chainId: 1 })).toThrow(/DATABASE_URL/);
    expect(() => assertRuntimeConfig({ mode: 'demo', chainId: 11155111 })).not.toThrow();
  });
});

describe('orders and secrets', () => {
  it('does not treat a percentage range as an ETH amount', () => {
    expect(parseOrderAmount('85-90%')).toMatchObject({ ok: false, code: 'range' });
    expect(parseOrderAmount('0.05').ok).toBe(true);
  });

  it('rejects unprotected slippage', () => {
    expect(() => assertOrderSlippage('100')).toThrow(/display-only/);
    expect(minimumOut(10_000n, '0.05')).toBe(9995n);
  });

  it('rejects private key fields in address imports and exports addresses only', () => {
    expect(() => parseAddressBook({ accounts: [{ name: 'A', address: '0x0000000000000000000000000000000000000001', privateKey: 'nope' }] })).toThrow(/private keys/);
    const book = exportAddressBook([{ name: 'A', address: '0x0000000000000000000000000000000000000001' }]);
    expect(JSON.stringify(book)).not.toMatch(/private/i);
  });

  it('keeps blocked controls from describing a successful send', () => {
    for (const control of ['sb', 'auto-sb', 'd-f', 'download-pks', 'engine-run', 'ss', 'us'] as const) {
      const message = blockedControlMessage(control);
      expect(message).toBeTruthy();
      expect(message).not.toMatch(/0x[a-fA-F0-9]{8}/);
    }
  });

  it('consumes a login nonce once', () => {
    const store = new NonceStore();
    const nonce = store.issue('0x0000000000000000000000000000000000000001', 1_000);
    expect(store.consume('0x0000000000000000000000000000000000000001', nonce, 1_500)).toBe(true);
    expect(store.consume('0x0000000000000000000000000000000000000001', nonce, 1_500)).toBe(false);
  });
});

describe('launch, quotes, and watch data', () => {
  it('builds a launch plan that does not submit buys', () => {
    const plan = buildLaunchPlan({ hasArtifact: false, hasOpenTrade: false });
    expect(plan.submitted).toBe(false);
    expect(plan.steps.find((step) => step.id === 'buys')?.state).toBe('unavailable');
    expect(validateLaunchInput({
      holdMin: '1.5',
      holdMax: '1.7',
      accountCount: '10',
      name: 'My Token',
      symbol: 'MTK',
      poolEth: '0.5',
      poolTokenPercent: '99',
      bundleTipGwei: '0',
      chainId: 56,
    }).ok).toBe(false);
  });

  it('quotes a V2 spot amount and labels the reserve ratio as an estimate input', () => {
    expect(v2AmountOut(1_000n, 10_000n, 50_000n)).toBeGreaterThan(0n);
    expect(spotEthValue(100n, 1_000n, 5_000n)).toBe(500n);
  });

  it('dedupes logs, rolls back reorgs, and applies decimal thresholds', () => {
    const index = new WatchIndex();
    const log = { blockNumber: 2, blockHash: '0xa', logIndex: 0, txHash: '0x1', address: '0x2', topics: [], data: '0x' };
    expect(index.ingest([log]).added).toBe(1);
    expect(index.ingest([log]).duplicates).toBe(1);
    expect(index.ingest([{ ...log, blockHash: '0xb' }]).rolledBack).toBe(1);
    expect(meetsFeedThreshold(100n * 10n ** 18n, 18)).toBe(true);
    expect(meetsFeedThreshold(99n * 10n ** 18n, 18)).toBe(false);
    expect(meetsHolderThreshold(1000n * 10n ** 18n, 18)).toBe(false);
    expect(meetsHolderThreshold(1001n * 10n ** 18n, 18)).toBe(true);
  });

  it('generates identity into source instead of replacing arbitrary text', () => {
    const source = renderTemplate('trending', { name: 'My Token', symbol: 'MTK' });
    expect(source).toContain('library SafeMath');
    expect(source).toContain('string public constant name = "My Token"');
    expect(source).not.toContain('blacklist');
  });

  it('rejects stale and nondeployable artifacts', () => {
    expect(deployability(null, 'abc', 'TrendingToken').ok).toBe(false);
    expect(deployability({
      sourceHash: 'old',
      compilerVersion: '0.8.24',
      optimizer: { enabled: true, runs: 200 },
      evmVersion: 'cancun',
      warnings: [],
      contracts: [{ file: 'Token.sol', name: 'TrendingToken', abi: [], bytecode: '0x1234', deployable: true }],
    }, 'new', 'TrendingToken').ok).toBe(false);
  });

  it('redacts credentials in RPC URLs and blocks live localhost', () => {
    expect(redactRpcUrl('https://user:secret@example.com/abc123456789012345/path')).not.toContain('secret');
    expect(validateRpcUrl('http://127.0.0.1:8545', 'live').ok).toBe(false);
    expect(validateRpcUrl('http://127.0.0.1:8545', 'fork').ok).toBe(true);
  });

  it('hashes with the standard SHA-256 test vector', async () => {
    expect(await sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });

  it('keeps screenshot numbers in the display fixture', () => {
    expect(screenshotFixture.config.poolMin).toBe('2');
    expect(screenshotFixture.config.poolMax).toBe('8');
    expect(parseDashboardQuery('?fixture=editor&capture=1').fixture).toBe('editor');
  });
});
