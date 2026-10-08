import { assertOrderSlippage, parseAddressBook, parseOrderAmount, screenshotFixture } from '@launchpad/shared';
import { getAddress } from 'ethers';
import { useState, type ChangeEvent } from 'react';
import {
  FaArrowDown,
  FaArrowUp,
  FaArrowsRotate,
  FaBroom,
  FaClipboard,
  FaClock,
  FaCopy,
  FaDownload,
  FaTrash,
  FaUpload,
  FaUserGroup,
  FaUsers,
} from 'react-icons/fa6';
import { appMode } from '../config';
import { useDashboard, type WatchAccount } from '../store';

export function TradingPanel() {
  const state = useDashboard();
  const [addOpen, setAddOpen] = useState(false);
  const [multiOpen, setMultiOpen] = useState(false);
  const fixture = state.fixtureSession;
  const market = screenshotFixture.trading;
  if (state.tradingTab === 'engine') {
    return (
      <div className="stack" data-evidence="source-derived">
        <TradeSwitch />
        <h3>Engine wallets</h3>
        <p className="help">This engine view is source-derived and was not in the supplied screenshots. Chart automation is unavailable, so this table stays empty.</p>
        <table className="accounts">
          <thead><tr><th>Address</th><th>ETH</th><th>Token</th><th>Status</th></tr></thead>
          <tbody><tr><td colSpan={4}>No engine wallets loaded.</td></tr></tbody>
        </table>
      </div>
    );
  }
  return (
    <div className="stack">
      <TradeSwitch />
      <section className="action-card card">
        <div className="action-head">
          <h3>Action</h3>
          <span>Action Wallet:</span>
          <span className="green">{fixture ? market.actionStatus : '—'}</span>
          <button type="button" className="icon-btn" aria-label="Copy action wallet" onClick={() => state.patch({ toast: 'No live action wallet is connected.' })}><FaCopy /></button>
        </div>
        <div className="row">
          <input className="grow" aria-label="Search token" placeholder="Token address" value={state.tokenSearch} onChange={(event) => state.patch({ tokenSearch: event.target.value })} />
          <div className="count-box" aria-label="Account filter count">{state.countBox}</div>
        </div>
        <div className="toolbar">
          <input aria-label="Buy amount" value={state.buyRange} onChange={(event) => state.patch({ buyRange: event.target.value })} style={{ width: 88 }} />
          <button type="button" className="btn-violet" aria-label="Reset amount" onClick={() => state.patch({ buyRange: fixture ? market.buyRange : '' })}>R</button>
          <label className="checks"><input type="checkbox" checked={state.bundle} onChange={(event) => state.patch({ bundle: event.target.checked })} /> Bundle</label>
          <button type="button" className="btn-violet" onClick={() => buyOrSell('buy', state)}>Buy</button>
          <input aria-label="Sell percent" value={state.sellPercent} onChange={(event) => state.patch({ sellPercent: event.target.value })} style={{ width: 64 }} />
          <button type="button" className="btn" onClick={() => buyOrSell('sell', state)}>Sell</button>
          <button type="button" className="btn" onClick={() => state.explain('dump')}>Dump</button>
          <button type="button" className="btn-ghost" disabled title="Unavailable. This control cannot send a transaction.">D-F</button>
          <div className="market-chip" data-testid="market-chip">
            <span>{fixture ? market.price : '—'}</span>
            <span>{fixture ? `${market.gasGwei} gwei` : '—'}</span>
            <span className="dot" />
            <span>{fixture ? `#${market.block}` : '—'}</span>
          </div>
          <button type="button" className="icon-btn" aria-label="Refresh positions" onClick={() => state.patch({ toast: 'Positions were not refreshed from a network.' })}><FaArrowsRotate /></button>
          <button type="button" className="btn-blue" onClick={() => state.explain('collect')}>Collect</button>
        </div>
        <div className="mini-row">
          <span className="label">Min ETH</span>
          <label className="label">Buy <input aria-label="Minimum buy ETH" value={state.minBuy} onChange={(event) => state.patch({ minBuy: event.target.value })} style={{ width: 72 }} /></label>
          <label className="label">Sell <input aria-label="Minimum sell ETH" value={state.minSell} onChange={(event) => state.patch({ minSell: event.target.value })} style={{ width: 72 }} /></label>
        </div>
        <div className="mini-row">
          <span className="label">Slippage</span>
          <label className="label">Buy <input aria-label="Manual buy slippage" value={state.slipBuy} onChange={(event) => state.patch({ slipBuy: event.target.value })} style={{ width: 72 }} /> %</label>
          <label className="label">Sell <input aria-label="Manual sell slippage" value={state.slipSell} disabled={state.slipSell.trim() === '100'} onChange={(event) => state.patch({ slipSell: event.target.value })} style={{ width: 72 }} /> %</label>
          <label className="label">Tip <input aria-label="Manual tip" value={state.tip} onChange={(event) => state.patch({ tip: event.target.value })} style={{ width: 64 }} /> gwei</label>
        </div>
        <div className="mini-row">
          <FaClock aria-hidden="true" />
          <input aria-label="Auto sell interval" value={state.autoSell} onChange={(event) => state.patch({ autoSell: event.target.value })} style={{ width: 48 }} />
          <span>Auto Sell</span>
          <FaClock aria-hidden="true" />
          <input aria-label="Auto buy interval" value={state.autoBuy} onChange={(event) => state.patch({ autoBuy: event.target.value })} style={{ width: 48 }} />
          <span>Auto Buy</span>
          <span className="red inline"><FaArrowDown aria-hidden="true" /><input aria-label="Stop loss" value={state.stopLoss} onChange={(event) => state.patch({ stopLoss: event.target.value })} style={{ width: 48 }} /></span>
          <span className="green inline"><FaArrowUp aria-hidden="true" /><input aria-label="Profit target" value={state.profitTarget} onChange={(event) => state.patch({ profitTarget: event.target.value })} style={{ width: 48 }} /></span>
        </div>
      </section>
      <div className="table-tools">
        <span className="pill">Balance: {fixture ? market.balancePill : '0.0000'}</span>
        <div className="icon-tools">
          <button type="button" className="round" title="Withdraw" aria-label="Withdraw" onClick={() => state.explain('withdraw')}><FaArrowUp /></button>
          <button type="button" className="round" title="Disperse" aria-label="Disperse" onClick={() => state.explain('disperse')}><FaArrowDown /></button>
          <button type="button" className="round" title="Clean selection" aria-label="Clean selection" onClick={() => state.patch({ toast: 'Selection cleared.' })}><FaBroom /></button>
          <button type="button" className="round" title="Remove accounts" aria-label="Remove accounts" onClick={() => state.patch({ accounts: [], toast: 'Application records removed. On-chain wallets were not deleted.' })}><FaTrash /></button>
          <button type="button" className="round" title="Copy addresses" aria-label="Copy addresses" onClick={() => void navigator.clipboard.writeText(state.accounts.map((account) => account.address).join('\n') || 'No addresses loaded.')}><FaClipboard /></button>
          <button type="button" className="round" title="Create multiple accounts" aria-label="Create multiple accounts" onClick={() => setMultiOpen(true)}><FaUserGroup /></button>
          <button type="button" className="round" title="Import" aria-label="Import accounts" onClick={() => document.getElementById('account-import')?.click()}><FaUpload /></button>
          <button type="button" className="round" title="Export" aria-label="Export accounts" onClick={() => exportAccounts(state.accounts)}><FaDownload /></button>
        </div>
      </div>
      <input id="account-import" hidden type="file" accept="application/json" onChange={(event) => void importAccounts(event, state.addAccounts, state.showDialog)} />
      <div className="divider" />
      {state.accounts.length === 0 ? (
        <div className="empty">
          <FaUsers size={28} />
          <p>No accounts added yet</p>
          <p>Click "Add Account" to get started</p>
        </div>
      ) : (
        <div className="panel-scroll">
          <table className="accounts">
            <thead>
              <tr>
                <th></th><th>Name</th><th>Address</th><th>Balance</th><th>Token</th><th>Value (ETH)</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {state.accounts.map((account) => (
                <tr key={account.id}>
                  <td><input type="checkbox" aria-label={`Select ${account.name}`} /></td>
                  <td>{account.name}</td>
                  <td>{account.address}</td>
                  <td>—</td>
                  <td>—</td>
                  <td>—</td>
                  <td>Watch-only</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <button type="button" className="btn-ghost" onClick={() => setAddOpen(true)}>Add Account</button>
      {addOpen ? <AddAccount onClose={() => setAddOpen(false)} /> : null}
      {multiOpen ? <AddMany onClose={() => setMultiOpen(false)} /> : null}
    </div>
  );
}

function TradeSwitch() {
  const tradingTab = useDashboard((state) => state.tradingTab);
  const patch = useDashboard((state) => state.patch);
  return (
    <div className="trade-switch">
      <button type="button" className={tradingTab === 'manual' ? 'active' : ''} onClick={() => patch({ tradingTab: 'manual' })}>Manual</button>
      <button type="button" className={tradingTab === 'engine' ? 'active' : ''} onClick={() => patch({ tradingTab: 'engine' })}>Engine</button>
    </div>
  );
}

function buyOrSell(side: 'buy' | 'sell', state: ReturnType<typeof useDashboard.getState>) {
  if (side === 'buy') {
    const parsed = parseOrderAmount(state.buyRange);
    if (!parsed.ok) {
      state.showDialog('Buy', parsed.message);
      return;
    }
  }
  try {
    assertOrderSlippage(side === 'buy' ? state.slipBuy : state.slipSell);
  } catch (error) {
    state.showDialog(side === 'buy' ? 'Buy' : 'Sell', error instanceof Error ? error.message : 'Slippage was rejected. Nothing was submitted.');
    return;
  }
  if (state.bundle) {
    state.showDialog(side === 'buy' ? 'Buy' : 'Sell', 'Bundle submission is unavailable. Nothing was submitted.');
    return;
  }
  state.showDialog(side === 'buy' ? 'Buy' : 'Sell', appMode === 'demo'
    ? 'Demo mode does not broadcast. No swap was submitted.'
    : 'A reviewed pool quote and a browser-wallet confirmation are required. Nothing was submitted.');
}

function AddAccount({ onClose }: { onClose: () => void }) {
  const addAccounts = useDashboard((state) => state.addAccounts);
  const showDialog = useDashboard((state) => state.showDialog);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  return (
    <div className="modal-back" onClick={onClose}>
      <form className="modal" onClick={(event) => event.stopPropagation()} onSubmit={(event) => {
        event.preventDefault();
        try {
          if (!name.trim() || name.trim().length > 32) throw new Error('name');
          addAccounts([{ name: name.trim(), address: getAddress(address.trim()) }]);
          onClose();
        } catch {
          showDialog('Add Account', 'Enter a name and a valid Ethereum address. This saves a watch-only record.');
        }
      }}>
        <h2>Add Account</h2>
        <p>Watch-only address. This does not create or import a private key.</p>
        <input aria-label="Account name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" />
        <input aria-label="Account address" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="0x" />
        <button type="submit" className="btn-violet">Save address</button>
      </form>
    </div>
  );
}

function AddMany({ onClose }: { onClose: () => void }) {
  const addAccounts = useDashboard((state) => state.addAccounts);
  const showDialog = useDashboard((state) => state.showDialog);
  const [text, setText] = useState('');
  return (
    <div className="modal-back" onClick={onClose}>
      <form className="modal" onClick={(event) => event.stopPropagation()} onSubmit={(event) => {
        event.preventDefault();
        const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).slice(0, 20);
        try {
          addAccounts(lines.map((line, index) => ({ name: `Watch ${index + 1}`, address: getAddress(line) })));
          onClose();
        } catch {
          showDialog('Create Multiple Accounts', 'Paste one Ethereum address per line. Private keys are not accepted, and none were generated.');
        }
      }}>
        <h2>Create Multiple Accounts</h2>
        <p>Paste watch-only addresses, one per line. No keys are generated.</p>
        <textarea className="code" style={{ minHeight: 120 }} aria-label="Address list" value={text} onChange={(event) => setText(event.target.value)} />
        <button type="submit" className="btn-violet">Add watch addresses</button>
      </form>
    </div>
  );
}

async function importAccounts(event: ChangeEvent<HTMLInputElement>, addAccounts: (records: Array<{ name: string; address: string }>) => void, showDialog: (title: string, body: string) => void) {
  const file = event.target.files?.[0];
  event.target.value = '';
  if (!file) return;
  try {
    addAccounts(parseAddressBook(JSON.parse(await file.text())));
  } catch (error) {
    showDialog('Import', error instanceof Error ? error.message : 'Import failed.');
  }
}

function exportAccounts(accounts: WatchAccount[]) {
  const payload = { version: 1, accounts: accounts.map((account) => ({ name: account.name, address: account.address })) };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'addresses.json';
  link.click();
  URL.revokeObjectURL(url);
}
