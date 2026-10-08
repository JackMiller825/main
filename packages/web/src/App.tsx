import { liveFixtureBlocked } from '@launchpad/shared';
import { useEffect, useState } from 'react';
import { appMode, chainReady } from './config';
import { Dashboard } from './components/Dashboard';
import { RpcModal } from './components/RpcModal';
import { Dialogs, Gate, Header } from './components/Shell';
import { useDashboard } from './store';

export function App() {
  const auth = useDashboard((state) => state.auth);
  const capture = useDashboard((state) => state.capture);
  const toast = useDashboard((state) => state.toast);
  const patch = useDashboard((state) => state.patch);
  const [rpcOpen, setRpcOpen] = useState(false);
  const chain = chainReady();
  useEffect(() => {
    document.body.classList.toggle('capture', capture);
  }, [capture]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => patch({ toast: '' }), 2500);
    return () => window.clearTimeout(timer);
  }, [toast, patch]);
  if (!chain.ok) {
    return <main className="block-page"><p>{chain.message}</p></main>;
  }
  if (typeof window !== 'undefined' && liveFixtureBlocked(appMode, window.location.search)) {
    return <main className="block-page"><p>Demo fixtures are disabled outside demo mode. No simulated balances were loaded.</p></main>;
  }
  return (
    <div className="app">
      <Header onRpc={() => setRpcOpen(true)} />
      {auth === 'ready' ? <Dashboard /> : <Gate />}
      {rpcOpen ? <RpcModal onClose={() => setRpcOpen(false)} /> : null}
      <Dialogs />
    </div>
  );
}
