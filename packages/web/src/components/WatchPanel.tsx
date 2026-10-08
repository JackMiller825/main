import { getAddress } from 'ethers';
import { useState } from 'react';
import { FaEye, FaShieldHalved } from 'react-icons/fa6';
import { useDashboard } from '../store';

export function WatchPanel() {
  const state = useDashboard();
  const [open, setOpen] = useState(false);
  const [entry, setEntry] = useState('');
  return (
    <div className="watch-split">
      <div className="watch-head" style={{ padding: '8px 10px 0' }}>
        <div className="watch-title">
          <h2 className="yellow"><FaEye /> Watch</h2>
          <button type="button" className="btn-ghost" style={{ marginLeft: 'auto' }} onClick={() => state.patch({ watchRunning: !state.watchRunning, toast: state.watchRunning ? 'Monitor stopped. No network subscription was open.' : 'Demo monitor is not subscribed to a network.' })}>
            {state.watchRunning ? 'Stop' : 'Start'}
          </button>
          <button type="button" className="icon-btn" aria-label="Monitoring selection" onClick={() => setOpen(true)}><FaShieldHalved /></button>
        </div>
        <div className="row">
          <input className="grow" aria-label="Holder address" placeholder="Holder address" value={entry} onChange={(event) => setEntry(event.target.value)} />
          <label className="checks"><input type="checkbox" /> auto</label>
          <input aria-label="Auto threshold" defaultValue="0.1 ETH" style={{ width: 88 }} />
          <button type="button" className="btn-muted" data-testid="sb-button" disabled>SB (0)</button>
        </div>
      </div>
      <div className="watch-half">
        <h3 className="feed-title">Live Feed (0)</h3>
        <p className="help">≥100 tokens</p>
        <div className="empty">Waiting for trades...</div>
      </div>
      <div className="watch-half">
        <h3 className="feed-title">Holders (0)</h3>
        <p className="help">&gt;1000 tokens</p>
        <div className="empty">No traders yet</div>
      </div>
      {open ? (
        <div className="modal-back" onClick={() => setOpen(false)}>
          <form className="modal" onClick={(event) => event.stopPropagation()} onSubmit={(event) => {
            event.preventDefault();
            try {
              const address = getAddress(entry.trim());
              if (!state.watchlist.includes(address)) state.patch({ watchlist: [...state.watchlist, address] });
              setEntry('');
            } catch {
              state.showDialog('Watch', 'Enter a valid address. A monitoring selection is not a contract permission.');
            }
          }}>
            <h2>Monitoring selection</h2>
            <p>This list only marks addresses to watch. It does not whitelist them on a token and cannot move their assets.</p>
            {state.watchlist.length === 0 ? <p>No addresses selected.</p> : <ul>{state.watchlist.map((address) => <li key={address}>{address}</li>)}</ul>}
            <button type="submit" className="btn-violet">Add typed address</button>
            <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>Close</button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
