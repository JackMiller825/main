import { buildLaunchPlan, validateLaunchInput } from '@launchpad/shared';
import { configuredChainId } from '../config';
import { useDashboard } from '../store';
import { RocketIcon } from './Shell';

export function LaunchPanel() {
  const state = useDashboard();
  return (
    <div className="stack">
      <div className="segment" role="tablist" aria-label="Launch view">
        <button type="button" className={state.launchView === 'editor' ? 'active' : ''} onClick={() => state.patch({ launchView: 'editor' })}>Editor</button>
        <button type="button" className={state.launchView === 'trading' ? 'active' : ''} onClick={() => state.patch({ launchView: 'trading' })}>Trading</button>
      </div>
      <button type="button" className="btn wide" onClick={() => { state.setTemplate(state.template); state.patch({ toast: 'Template loaded into the editor.' }); }}>Load token template</button>
      <div className="field">
        <span>Hold %</span>
        <div className="range">
          <input aria-label="Hold minimum" value={state.holdMin} onChange={(event) => state.patch({ holdMin: event.target.value })} />
          <span className="dash-mark">-</span>
          <input aria-label="Hold maximum" value={state.holdMax} onChange={(event) => state.patch({ holdMax: event.target.value })} />
        </div>
        <p className="help">random / account</p>
      </div>
      <div className="row">
        <label className="field" style={{ width: 88 }}>
          <span>Accounts</span>
          <input aria-label="Initial account count" value={state.accountCount} onChange={(event) => state.patch({ accountCount: event.target.value })} />
        </label>
        <button type="button" className="btn grow" onClick={() => state.showDialog('Generate Initial Accounts', 'This build does not generate private keys. Add watch-only addresses from the trading table. No accounts were created.')}>Generate Initial Accounts</button>
      </div>
      <div className="field">
        <span>Deployer (first account)</span>
        <div className="summary">— add an account in the list first —</div>
      </div>
      <label className="field">
        <span>Token address — reads Name/Symbol</span>
        <input aria-label="Token address" value={state.tokenAddress} onChange={(event) => state.patch({ tokenAddress: event.target.value })} />
      </label>
      <div className="pair">
        <label className="field">
          <span>Name</span>
          <input aria-label="Token name" value={state.name} onChange={(event) => state.setIdentity(event.target.value, state.symbol)} />
        </label>
        <label className="field">
          <span>Symbol</span>
          <input aria-label="Token symbol" value={state.symbol} onChange={(event) => state.setIdentity(state.name, event.target.value)} />
        </label>
      </div>
      <p className="help">Name and symbol regenerate a pristine editor template. Hand-edited source is left unchanged.</p>
      <div className="pair">
        <label className="field">
          <span>Pool ETH (liquidity)</span>
          <input aria-label="Pool ETH" value={state.poolEth} onChange={(event) => state.patch({ poolEth: event.target.value })} />
        </label>
        <label className="field">
          <span>Pool token %</span>
          <input aria-label="Pool token percent" value={state.poolTokenPercent} onChange={(event) => state.patch({ poolTokenPercent: event.target.value })} />
        </label>
      </div>
      <div className="pair">
        <label className="field">
          <span>Launch function</span>
          <select aria-label="Launch function" value={state.launchFunction} onChange={(event) => state.patch({ launchFunction: event.target.value })}>
            <option value="OpenTrade">OpenTrade</option>
          </select>
        </label>
        <label className="field">
          <span>Bundle tip (gwei)</span>
          <input aria-label="Bundle tip" value={state.bundleTip} onChange={(event) => state.patch({ bundleTip: event.target.value })} />
        </label>
      </div>
      <label className="field">
        <span>Buy route</span>
        <select aria-label="Buy route" value={state.buyRoute} onChange={(event) => state.patch({ buyRoute: event.target.value })}>
          <option value="v2">Router (Uniswap V2)</option>
          <option value="mixed" disabled>Mixed (unavailable)</option>
          <option value="disperse" disabled>Disperse (unavailable)</option>
        </select>
      </label>
      <div className="checks">
        <label><input type="checkbox" checked={state.removeLimits} onChange={(event) => state.patch({ removeLimits: event.target.checked })} /> removeLimits(assist)</label>
        <label><input type="checkbox" checked={state.renounce} onChange={(event) => state.patch({ renounce: event.target.checked })} /> renounceOwnership()</label>
      </div>
      <label className="checks"><input type="checkbox" checked={state.verifyAfter} onChange={(event) => state.patch({ verifyAfter: event.target.checked })} /> Verify on Etherscan after launch</label>
      <button
        type="button"
        className="btn-violet wide"
        onClick={() => {
          const validation = validateLaunchInput({
            holdMin: state.holdMin,
            holdMax: state.holdMax,
            accountCount: state.accountCount,
            name: state.name,
            symbol: state.symbol,
            poolEth: state.poolEth,
            poolTokenPercent: state.poolTokenPercent,
            bundleTipGwei: state.bundleTip,
            chainId: configuredChainId,
          });
          if (!validation.ok) {
            state.showDialog('Launch', validation.errors.join('\n'));
            return;
          }
          const plan = buildLaunchPlan({ hasArtifact: Boolean(state.artifact), hasOpenTrade: false });
          state.showDialog('Launch plan', `Nothing was submitted.\n\n${plan.steps.map((step) => `${step.id}: ${step.detail}`).join('\n\n')}`);
        }}
      >
        <RocketIcon /> Launch (deploy+verify + launch() + buys)
      </button>
      <div className="divider" />
      <div className="stack">
        <span className="label">Owner actions — token: —</span>
        <div className="owner-grid">
          <button type="button" className="btn-muted" onClick={() => state.explain('remove-limits')}>removeLimits</button>
          <button type="button" className="btn-muted" onClick={() => state.explain('renounce')}>renounceOwnership</button>
        </div>
        <button type="button" className="btn-muted wide" onClick={() => state.explain('ss')}>SS</button>
        <button type="button" className="btn-orange wide" onClick={() => state.explain('us')}>US</button>
        <div className="row">
          <input aria-label="Whitelist address" placeholder="Address" />
          <button type="button" className="btn" onClick={() => state.explain('add-wl')}>Add WL</button>
        </div>
        <button type="button" className="btn-burn wide" onClick={() => state.explain('lp-burn')}>LP Burn</button>
      </div>
    </div>
  );
}
