export interface IndexedLog {
  blockNumber: number;
  blockHash: string;
  logIndex: number;
  txHash: string;
  address: string;
  topics: string[];
  data: string;
}

export interface IngestResult {
  added: number;
  duplicates: number;
  rolledBack: number;
}

export class WatchIndex {
  private logs: IndexedLog[] = [];
  private readonly keys = new Set<string>();

  ingest(batch: IndexedLog[]): IngestResult {
    let rolledBack = 0;
    for (const log of batch) {
      const conflict = this.logs.find(
        (existing) => existing.blockNumber === log.blockNumber && existing.blockHash !== log.blockHash,
      );
      if (conflict) {
        rolledBack = this.rollback(conflict.blockNumber);
        break;
      }
    }
    let added = 0;
    let duplicates = 0;
    for (const log of batch) {
      const key = `${log.txHash}:${log.logIndex}`;
      if (this.keys.has(key)) {
        duplicates += 1;
        continue;
      }
      this.keys.add(key);
      this.logs.push(log);
      added += 1;
    }
    return { added, duplicates, rolledBack };
  }

  rollback(blockNumber: number): number {
    const kept: IndexedLog[] = [];
    let removed = 0;
    for (const log of this.logs) {
      if (log.blockNumber >= blockNumber) {
        this.keys.delete(`${log.txHash}:${log.logIndex}`);
        removed += 1;
      } else {
        kept.push(log);
      }
    }
    this.logs = kept;
    return removed;
  }

  snapshot(): IndexedLog[] {
    return [...this.logs];
  }
}

export function wholeTokenRaw(wholeTokens: number, decimals: number): bigint {
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 36) throw new Error('Invalid token decimals.');
  if (!Number.isInteger(wholeTokens) || wholeTokens < 0) throw new Error('Invalid token threshold.');
  return BigInt(wholeTokens) * 10n ** BigInt(decimals);
}

export function meetsFeedThreshold(rawAmount: bigint, decimals: number): boolean {
  return rawAmount >= wholeTokenRaw(100, decimals);
}

export function meetsHolderThreshold(rawAmount: bigint, decimals: number): boolean {
  return rawAmount > wholeTokenRaw(1000, decimals);
}
