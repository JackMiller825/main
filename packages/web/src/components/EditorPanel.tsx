import { deployability, templateContractName, type TemplateKind } from '@launchpad/shared';
import { apiBase, appMode } from '../config';
import { useDashboard } from '../store';

const templates: Array<{ id: TemplateKind; label: string }> = [
  { id: 'tax', label: 'TaxToken' },
  { id: 'website', label: 'Website' },
  { id: 'trending', label: 'Trending' },
];

export function EditorPanel() {
  const state = useDashboard();
  return (
    <div className="code-wrap" style={{ paddingTop: 10 }}>
      <div className="row">
        {templates.map((template) => (
          <button type="button" key={template.id} className={state.template === template.id ? 'btn-violet' : 'btn-ghost'} onClick={() => state.setTemplate(template.id)}>
            {template.label}
          </button>
        ))}
      </div>
      <div className="editor-toolbar">
        <h2>Contract Editor</h2>
        <span className="label" style={{ marginLeft: 'auto' }}>Solidity</span>
        <select aria-label="Compiler version" value="0.8.24" onChange={() => undefined} style={{ width: 96 }}>
          <option value="0.8.24">0.8.24</option>
        </select>
        <button type="button" className="btn" onClick={() => state.patch({ saved: true, toast: 'Saved in this browser. This was not a deployment.' })}>Save</button>
        <button type="button" className="btn-blue" data-testid="compile-button" disabled={state.compiling} onClick={() => void compile()}>Compile</button>
      </div>
      <div className="divider" />
      <textarea
        className="code scroll"
        data-testid="editor-source"
        spellCheck={false}
        aria-label="Solidity source"
        value={state.source}
        onChange={(event) => state.setSource(event.target.value)}
        onKeyDown={(event) => {
          if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
            event.preventDefault();
            state.patch({ saved: true, toast: 'Saved in this browser. This was not a deployment.' });
          }
        }}
      />
      {state.diagnostics.length > 0 ? <pre className="help">{state.diagnostics.join('\n')}</pre> : null}
      {state.artifact ? (
        <div className="compile-strip">
          <label className="field">
            <span>Compiled contract</span>
            <select aria-label="Compiled contract" value={state.selectedContract} onChange={(event) => state.patch({ selectedContract: event.target.value })}>
              {state.artifact.contracts.map((contract) => <option key={contract.name} value={contract.name}>{contract.name}</option>)}
            </select>
          </label>
          <div className="row">
            <button type="button" data-testid="deploy-button" className="btn-violet" onClick={() => reviewDeploy()}>Deploy</button>
            <button type="button" className="btn" onClick={() => state.showDialog('Verify', 'Verification runs after a confirmed deployment and does not redeploy the contract. No explorer key is configured.')}>Verify</button>
            <button type="button" className="btn" onClick={() => state.showDialog('Deploy and verify', 'Nothing was broadcast. Verification is a separate step after a confirmed deployment.')}>Deploy & Verify</button>
          </div>
          <input aria-label="Deployed contract address" placeholder="Deployed contract address" />
          <p className="help">{functionNames(state.artifact.contracts.find((contract) => contract.name === state.selectedContract)?.abi)}</p>
        </div>
      ) : null}
    </div>
  );
}

function functionNames(abi: readonly unknown[] | undefined): string {
  if (!abi) return 'Compile to see contract functions.';
  const names = abi.flatMap((item) => {
    if (!item || typeof item !== 'object' || !('type' in item) || !('name' in item)) return [];
    return item.type === 'function' && typeof item.name === 'string' ? [item.name] : [];
  });
  return names.length ? `Functions: ${names.join(', ')}` : 'No functions in this selection.';
}

async function compile() {
  const state = useDashboard.getState();
  state.patch({ compiling: true, diagnostics: [] });
  try {
    const response = await fetch(`${apiBase}/v1/compile`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json', 'x-launchpad-request': '1' },
      body: JSON.stringify({ source: state.source }),
    });
    const body = (await response.json()) as { ok?: boolean; errors?: string[]; artifact?: DashboardArtifact; error?: { message?: string } };
    if (!response.ok || !body.ok || !body.artifact) {
      state.patch({ compiling: false, artifact: null, diagnostics: body.errors ?? [body.error?.message ?? 'Compile failed.'] });
      return;
    }
    const preferred = body.artifact.contracts.find((contract) => contract.name === templateContractName(state.template) && contract.deployable)?.name
      ?? body.artifact.contracts.find((contract) => contract.deployable)?.name
      ?? '';
    state.patch({ compiling: false, artifact: body.artifact, selectedContract: preferred, diagnostics: body.artifact.warnings });
  } catch {
    state.patch({ compiling: false });
    state.showDialog('Compile', 'The compiler service is not running. Start the demo with npm run dev from the repository root.');
  }
}

function reviewDeploy() {
  const state = useDashboard.getState();
  const decision = deployability(state.artifact, state.artifact?.sourceHash ?? '', state.selectedContract);
  if (!decision.ok) {
    state.showDialog('Deploy', decision.reason);
    return;
  }
  state.showDialog('Deploy', appMode === 'demo'
    ? `Demo mode does not broadcast. Artifact ${state.artifact?.sourceHash.slice(0, 12) ?? ''} was not sent.`
    : 'Deployment needs a browser-wallet confirmation on the configured Ethereum chain. Nothing was broadcast from this button.');
}

type DashboardArtifact = NonNullable<ReturnType<typeof useDashboard.getState>['artifact']>;
