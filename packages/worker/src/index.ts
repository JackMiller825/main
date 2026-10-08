import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { JsonRpcProvider, getAddress, type Log } from 'ethers';
import { findRepoRoot } from '@launchpad/shared/node';
import {
  WatchIndex,
  assertIndexerChain,
  executionChain,
  resolveAppMode,
} from '@launchpad/shared';

const mode = resolveAppMode(process.env.APP_MODE);
const chainId = Number(process.env.CHAIN_ID || (mode === 'demo' ? '11155111' : ''));
executionChain(chainId);

const dataDir = join(findRepoRoot(), 'data');
mkdirSync(dataDir, { recursive: true });
const heartbeatPath = join(dataDir, 'worker-heartbeat.json');
const cursorPath = join(dataDir, 'watch-cursor.json');
const logPath = join(dataDir, 'watch-logs.json');
const index = new WatchIndex();
let cursor = 0;
if (existsSync(cursorPath)) {
  const saved = JSON.parse(readFileSync(cursorPath, 'utf8')) as { block?: number };
  cursor = saved.block ?? 0;
}

function writeHeartbeat(body: Record<string, unknown>) {
  writeFileSync(heartbeatPath, JSON.stringify({ at: new Date().toISOString(), mode, ...body }));
}

function persist(logs: Log[]) {
  const existing = existsSync(logPath) ? (JSON.parse(readFileSync(logPath, 'utf8')) as unknown[]) : [];
  const next = [...existing, ...logs.map((log) => ({
    blockNumber: log.blockNumber,
    txHash: log.transactionHash,
    logIndex: log.index,
    address: log.address,
  }))].slice(-200);
  writeFileSync(logPath, JSON.stringify(next));
}

async function poll() {
  if (mode === 'demo') {
    writeHeartbeat({ status: 'idle', indexing: 'disabled-in-demo', latestIndexedBlock: null });
    return;
  }
  const rpc = process.env.RPC_HTTP_URL;
  const pair = process.env.WATCH_PAIR_ADDRESS;
  if (!rpc || !pair) {
    writeHeartbeat({ status: 'idle', indexing: 'not-configured', latestIndexedBlock: cursor || null });
    return;
  }
  const provider = new JsonRpcProvider(rpc);
  try {
    const network = await provider.getNetwork();
    assertIndexerChain(network.chainId, chainId);
    const pairAddress = getAddress(pair);
    const latest = await provider.getBlockNumber();
    if (cursor === 0) cursor = Math.max(0, latest - 20);
    const from = cursor + 1;
    const to = Math.min(latest, from + 999);
    if (from <= to) {
      const logs = await provider.getLogs({ address: pairAddress, fromBlock: from, toBlock: to });
      const hashes = new Map<number, string>();
      for (const log of logs) {
        if (!hashes.has(log.blockNumber)) {
          const block = await provider.getBlock(log.blockNumber);
          hashes.set(log.blockNumber, block?.hash ?? '');
        }
      }
      index.ingest(logs.map((log) => ({
        blockNumber: log.blockNumber,
        blockHash: hashes.get(log.blockNumber) ?? log.blockHash,
        logIndex: log.index,
        txHash: log.transactionHash,
        address: log.address,
        topics: [...log.topics],
        data: log.data,
      })));
      persist(logs);
      cursor = to;
      writeFileSync(cursorPath, JSON.stringify({ block: cursor }));
    }
    writeHeartbeat({ status: 'ok', indexing: 'partial-history', latestIndexedBlock: cursor });
  } catch (error) {
    writeHeartbeat({
      status: 'error',
      indexing: 'stopped',
      message: error instanceof Error ? error.message : 'Indexer error',
      latestIndexedBlock: cursor || null,
    });
  } finally {
    provider.destroy();
  }
}

await poll();
const timer = setInterval(() => {
  void poll();
}, 15_000);

function shutdown() {
  clearInterval(timer);
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
