import { describe, expect, it } from 'vitest';
import { renderTemplate } from '@launchpad/shared';
import { compileSource } from './compile.js';

describe('solc 0.8.24', () => {
  it('compiles the trending template and refuses the library', async () => {
    const source = renderTemplate('trending', { name: 'My Token', symbol: 'MTK' });
    const result = await compileSource(source);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const library = result.artifact.contracts.find((contract) => contract.name === 'SafeMath');
    const token = result.artifact.contracts.find((contract) => contract.name === 'TrendingToken');
    expect(library?.deployable).toBe(false);
    expect(token?.deployable).toBe(true);
    expect(token?.bytecode.startsWith('0x')).toBe(true);
    expect(result.artifact.compilerVersion).toBe('0.8.24');
  }, 60_000);

  it('returns errors for invalid source', async () => {
    const result = await compileSource('contract Broken {');
    expect(result.ok).toBe(false);
  }, 60_000);
});
