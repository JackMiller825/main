import { createRequire } from 'node:module';
import { sha256Hex, type CompilationArtifact, type CompiledContract } from '@launchpad/shared';

const require = createRequire(import.meta.url);
const solc = require('solc') as {
  compile: (input: string) => string;
  version: () => string;
};

interface SolcNode {
  nodeType?: string;
  name?: string;
  contractKind?: string;
  abstract?: boolean;
  nodes?: SolcNode[];
}

interface SolcOutput {
  errors?: Array<{ severity: string; formattedMessage?: string; message?: string }>;
  sources?: Record<string, { ast?: SolcNode }>;
  contracts?: Record<string, Record<string, { abi: unknown[]; evm?: { bytecode?: { object?: string } } }>>;
}

function collectKinds(node: SolcNode | undefined, kinds: Map<string, { kind: string; abstract: boolean }>): void {
  if (!node) return;
  if (node.nodeType === 'ContractDefinition' && node.name) {
    kinds.set(node.name, { kind: node.contractKind ?? 'contract', abstract: Boolean(node.abstract) });
  }
  for (const child of node.nodes ?? []) collectKinds(child, kinds);
}

export async function compileSource(source: string, fileName = 'Token.sol'): Promise<
  | { ok: true; artifact: CompilationArtifact }
  | { ok: false; sourceHash: string; errors: string[]; warnings: string[] }
> {
  const version = solc.version();
  if (!version.includes('0.8.24')) {
    throw new Error(`Expected solc 0.8.24 and found ${version}.`);
  }
  const sourceHash = await sha256Hex(source);
  const input = {
    language: 'Solidity',
    sources: { [fileName]: { content: source } },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: 'cancun',
      outputSelection: {
        '*': {
          '': ['ast'],
          '*': ['abi', 'evm.bytecode.object', 'metadata'],
        },
      },
    },
  };
  const output = JSON.parse(solc.compile(JSON.stringify(input))) as SolcOutput;
  const errors = (output.errors ?? []).filter((item) => item.severity === 'error').map((item) => item.formattedMessage || item.message || 'Compile error');
  const warnings = (output.errors ?? []).filter((item) => item.severity === 'warning').map((item) => item.formattedMessage || item.message || 'Compile warning');
  if (errors.length > 0 || !output.contracts) {
    return { ok: false, sourceHash, errors, warnings };
  }
  const kinds = new Map<string, { kind: string; abstract: boolean }>();
  for (const sourceOutput of Object.values(output.sources ?? {})) collectKinds(sourceOutput.ast, kinds);
  const contracts: CompiledContract[] = [];
  for (const [file, group] of Object.entries(output.contracts)) {
    for (const [name, compiled] of Object.entries(group)) {
      const bytecode = compiled.evm?.bytecode?.object ? `0x${compiled.evm.bytecode.object}` : '0x';
      const meta = kinds.get(name);
      let deployable = true;
      let reason: string | undefined;
      if (meta?.kind === 'library') {
        deployable = false;
        reason = 'Libraries are not deployable tokens.';
      } else if (meta?.kind === 'interface' || meta?.abstract) {
        deployable = false;
        reason = 'Abstract contracts and interfaces cannot be deployed.';
      } else if (bytecode === '0x') {
        deployable = false;
        reason = 'This contract has no deployable bytecode.';
      } else if (bytecode.includes('__$')) {
        deployable = false;
        reason = 'Unlinked libraries must be resolved before deployment.';
      }
      contracts.push({ file, name, abi: compiled.abi, bytecode: deployable ? bytecode : '0x', deployable, reason });
    }
  }
  return {
    ok: true,
    artifact: {
      sourceHash,
      compilerVersion: '0.8.24',
      optimizer: { enabled: true, runs: 200 },
      evmVersion: 'cancun',
      contracts,
      warnings,
    },
  };
}
