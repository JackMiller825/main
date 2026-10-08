import { displayNativeUnit, usesLegacyBnbLabels, validateEngineConfig } from '@launchpad/shared';
import { appMode } from '../config';
import { useDashboard } from '../store';

function RangeField({ label, min, max, minLabel, maxLabel, onMin, onMax }: {
  label: string;
  min: string;
  max: string;
  minLabel: string;
  maxLabel: string;
  onMin: (value: string) => void;
  onMax: (value: string) => void;
}) {
  return (
    <label className="field">
      <span>{label} <span className="req">*</span></span>
      <span className="range">
        <input aria-label={minLabel} value={min} onChange={(event) => onMin(event.target.value)} />
        <span className="dash-mark">—</span>
        <input aria-label={maxLabel} value={max} onChange={(event) => onMax(event.target.value)} />
      </span>
    </label>
  );
}

export function ConfigPanel() {
  const state = useDashboard();
  const legacy = usesLegacyBnbLabels(appMode, state.fixtureSession, 'config');
  const unit = displayNativeUnit(legacy);
  const amountPlaceholder = legacy ? 'BNB amount' : 'ETH amount';
  return (
    <div className="stack">
      <div className="card">
        <strong>Mother Wallet</strong>
        <p className="help">Not loaded. Click Run to start.</p>
      </div>
      <RangeField label={`Pool Size (${unit})`} min={state.poolMin} max={state.poolMax} minLabel="Pool size minimum" maxLabel="Pool size maximum" onMin={(value) => state.patch({ poolMin: value })} onMax={(value) => state.patch({ poolMax: value })} />
      <RangeField label={`Buy Amount (${unit})`} min={state.buyMin} max={state.buyMax} minLabel="Buy amount minimum" maxLabel="Buy amount maximum" onMin={(value) => state.patch({ buyMin: value })} onMax={(value) => state.patch({ buyMax: value })} />
      <RangeField label="Buy Account Count" min={state.buyCountMin} max={state.buyCountMax} minLabel="Buy account minimum" maxLabel="Buy account maximum" onMin={(value) => state.patch({ buyCountMin: value })} onMax={(value) => state.patch({ buyCountMax: value })} />
      <RangeField label="Sell Account Count" min={state.sellCountMin} max={state.sellCountMax} minLabel="Sell account minimum" maxLabel="Sell account maximum" onMin={(value) => state.patch({ sellCountMin: value })} onMax={(value) => state.patch({ sellCountMax: value })} />
      <RangeField label={`Disperse Amount (${unit})`} min={state.disperseMin} max={state.disperseMax} minLabel="Disperse minimum" maxLabel="Disperse maximum" onMin={(value) => state.patch({ disperseMin: value })} onMax={(value) => state.patch({ disperseMax: value })} />
      <RangeField label="Buy Interval (seconds)" min={state.buyIntervalMin} max={state.buyIntervalMax} minLabel="Buy interval minimum" maxLabel="Buy interval maximum" onMin={(value) => state.patch({ buyIntervalMin: value })} onMax={(value) => state.patch({ buyIntervalMax: value })} />
      <RangeField label="Sell Interval (seconds)" min={state.sellIntervalMin} max={state.sellIntervalMax} minLabel="Sell interval minimum" maxLabel="Sell interval maximum" onMin={(value) => state.patch({ sellIntervalMin: value })} onMax={(value) => state.patch({ sellIntervalMax: value })} />
      <label className="field">
        <span>Buy Slippage (%)</span>
        <input aria-label="Buy slippage" value={state.configSlippage} onChange={(event) => state.patch({ configSlippage: event.target.value })} />
        <p className="help">Display value for the fixture. It does not start an order.</p>
      </label>
      <label className="field">
        <span>Engine Bundle Tip (gwei)</span>
        <input aria-label="Engine bundle tip" value={state.engineTip} onChange={(event) => state.patch({ engineTip: event.target.value })} />
        <p className="help">Live bundle submission is unavailable.</p>
      </label>
      <label className="field">
        <span>Max Hold / Account (% of supply)</span>
        <input aria-label="Max hold percent" value={state.maxHold} onChange={(event) => state.patch({ maxHold: event.target.value })} />
        <p className="help">Position label only. It is not an execution strategy.</p>
      </label>
      <div className="field">
        <span>Chart Pattern</span>
        <div className="patterns">
          {(['CAH', 'FW', 'AT', 'Mix'] as const).map((pattern) => (
            <button type="button" key={pattern} className={`btn-ghost ${state.pattern === pattern ? 'active' : ''}`} onClick={() => state.patch({ pattern })}>{pattern}</button>
          ))}
        </div>
        <p className="help">Cycle all patterns</p>
      </div>
      <div className="checks">
        <label><input type="checkbox" checked={state.buyBundle} onChange={(event) => state.patch({ buyBundle: event.target.checked })} /> Buy Bundle</label>
        <label><input type="checkbox" checked={state.sellBundle} onChange={(event) => state.patch({ sellBundle: event.target.checked })} /> Sell Bundle</label>
      </div>
      <label className="checks"><input type="checkbox" checked={state.autoStart} onChange={(event) => state.patch({ autoStart: event.target.checked })} /> Auto-start engine on Launch</label>
      <div className="row">
        <button type="button" className="btn-ghost" aria-label="Scroll up" onClick={() => document.querySelector<HTMLElement>('[data-testid=config-body]')?.scrollBy({ top: -240 })}>↑</button>
        <button type="button" className="btn-ghost" aria-label="Scroll down" onClick={() => document.querySelector<HTMLElement>('[data-testid=config-body]')?.scrollBy({ top: 240 })}>↓</button>
        <button
          type="button"
          className="btn-ghost grow"
          onClick={() => {
            const result = validateEngineConfig({
              poolMin: state.poolMin,
              poolMax: state.poolMax,
              buyMin: state.buyMin,
              buyMax: state.buyMax,
              buyCountMin: state.buyCountMin,
              buyCountMax: state.buyCountMax,
              sellCountMin: state.sellCountMin,
              sellCountMax: state.sellCountMax,
              disperseMin: state.disperseMin,
              disperseMax: state.disperseMax,
              buyIntervalMin: state.buyIntervalMin,
              buyIntervalMax: state.buyIntervalMax,
              sellIntervalMin: state.sellIntervalMin,
              sellIntervalMax: state.sellIntervalMax,
              buySlippage: state.configSlippage,
              engineTip: state.engineTip,
              maxHold: state.maxHold,
            });
            if (!result.ok) {
              state.showDialog('Apply', result.errors.join('\n'));
              return;
            }
            state.patch({ configRevision: state.configRevision + 1, toast: 'Configuration draft saved locally. It was not sent to an executor.' });
          }}
        >Apply</button>
        <button type="button" className="btn-green grow" data-testid="engine-run" onClick={() => state.explain('engine-run')}>Run</button>
      </div>
      <section className="card advanced" id="advanced-mode">
        <strong>Advanced Mode</strong>
        <div className="row">
          <span className="label">Dev Sell</span>
          <label className="field grow">
            <span>Sell %</span>
            <input aria-label="Dev sell percent" value={state.devSellPercent} onChange={(event) => state.patch({ devSellPercent: event.target.value })} />
          </label>
          <span className="label">%</span>
        </div>
        <div className="sell-grid">
          <div className="stack">
            <label className="field"><span>1st Sell</span><input aria-label="First sell" placeholder={amountPlaceholder} value={state.sell1} onChange={(event) => state.patch({ sell1: event.target.value })} /></label>
            <label className="field"><span>2nd Sell</span><input aria-label="Second sell" placeholder={amountPlaceholder} value={state.sell2} onChange={(event) => state.patch({ sell2: event.target.value })} /></label>
            <label className="field"><span>3rd Sell</span><input aria-label="Third sell" placeholder={amountPlaceholder} value={state.sell3} onChange={(event) => state.patch({ sell3: event.target.value })} /></label>
          </div>
          <button type="button" className="btn" onClick={() => state.explain('auto-trade')}>Multi Sell</button>
        </div>
      </section>
    </div>
  );
}
