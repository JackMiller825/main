export interface CompiledContract {
  file: string;
  name: string;
  abi: readonly unknown[];
  bytecode: string;
  deployable: boolean;
  reason?: string;
}

export interface CompilationArtifact {
  sourceHash: string;
  compilerVersion: '0.8.24';
  optimizer: { enabled: true; runs: 200 };
  evmVersion: 'cancun';
  contracts: CompiledContract[];
  warnings: string[];
}

export function deployability(
  artifact: CompilationArtifact | null,
  sourceHash: string,
  contractName: string,
): { ok: true } | { ok: false; reason: string } {
  if (!artifact) return { ok: false, reason: 'Compile the contract before deploying.' };
  if (artifact.sourceHash !== sourceHash) {
    return { ok: false, reason: 'Source changed after compilation. Compile again before deploying.' };
  }
  const contract = artifact.contracts.find((item) => item.name === contractName);
  if (!contract) return { ok: false, reason: 'Select a compiled contract.' };
  if (!contract.deployable || contract.bytecode === '' || contract.bytecode === '0x') {
    return { ok: false, reason: contract.reason ?? 'This contract has no deployable bytecode.' };
  }
  return { ok: true };
}
