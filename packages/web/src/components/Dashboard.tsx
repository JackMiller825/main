import { FaGear, FaRocket, FaWallet } from 'react-icons/fa6';
import { useEffect, useRef } from 'react';
import { useDashboard } from '../store';
import { ConfigPanel } from './ConfigPanel';
import { EditorPanel } from './EditorPanel';
import { LaunchPanel } from './LaunchPanel';
import { TradingPanel } from './TradingPanel';
import { WalletPanel } from './WalletPanel';
import { WatchPanel } from './WatchPanel';

export function Dashboard() {
  const leftTab = useDashboard((state) => state.leftTab);
  const launchView = useDashboard((state) => state.launchView);
  const patch = useDashboard((state) => state.patch);
  const scroll = useDashboard((state) => state.scroll);
  const fixtureSession = useDashboard((state) => state.fixtureSession);
  const capture = useDashboard((state) => state.capture);
  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = bodyRef.current;
    if (!el || leftTab !== 'config') return;
    el.scrollTop = scroll === 'advanced' ? el.scrollHeight : 0;
  }, [leftTab, scroll]);
  const editor = leftTab === 'launch' && launchView === 'editor';
  return (
    <>
      {fixtureSession && !capture ? (
        <div className="demo-banner" role="status">
          Demo fixture. Balances, prices, wallet counts, gas, and BNB labels are captured display data, not live configuration. No transactions are sent.
        </div>
      ) : null}
      <div className={`dash ${editor ? 'layout-editor' : 'layout-trading'}`}>
        <section className="panel left-panel" data-testid="left-panel">
          <div className="tabs" role="tablist">
            <button type="button" data-testid="tab-launch" className={leftTab === 'launch' ? 'active' : ''} onClick={() => patch({ leftTab: 'launch' })}><FaRocket /> Launch</button>
            <button type="button" data-testid="tab-config" className={leftTab === 'config' ? 'active' : ''} onClick={() => patch({ leftTab: 'config' })}><FaGear /> Config</button>
            <button type="button" data-testid="tab-wallet" className={leftTab === 'wallet' ? 'active' : ''} onClick={() => patch({ leftTab: 'wallet' })}><FaWallet /> Wallet</button>
          </div>
          <div className="left-body scroll" ref={bodyRef} data-testid={leftTab === 'config' ? 'config-body' : 'left-body'}>
            {leftTab === 'launch' ? <LaunchPanel /> : null}
            {leftTab === 'config' ? <ConfigPanel /> : null}
            {leftTab === 'wallet' ? <WalletPanel /> : null}
          </div>
        </section>
        <section className={`panel ${editor ? 'editor-panel' : 'trading-panel'}`} data-testid="middle-panel">
          {editor ? <EditorPanel /> : <div className="left-body scroll"><TradingPanel /></div>}
        </section>
        <section className="panel watch-panel" data-testid="watch-panel">
          <WatchPanel />
        </section>
      </div>
    </>
  );
}
