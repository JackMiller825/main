import { displayNativeUnit, FIXTURE_MASTER, FIXTURE_MOTHER, parseAddressBook, screenshotFixture, shortenAddress, usesLegacyBnbLabels } from '@launchpad/shared';
import type { ChangeEvent } from 'react';
import { FaCopy, FaWallet } from 'react-icons/fa6';
import { appMode } from '../config';
import { useDashboard } from '../store';

export function WalletPanel() {
  const state = useDashboard();
  const legacy = usesLegacyBnbLabels(appMode, state.fixtureSession, 'wallet');
  const unit = displayNativeUnit(legacy);
  const mother = state.fixtureSession ? FIXTURE_MOTHER : null;
  const visible = state.accounts;
  return (
    <div className="stack">
      <section className="card stack">
        <div className="inline">
          <FaWallet color="#8b5cf6" />
          <strong>Engine Wallets Summary</strong>
        </div>
        <div className="inline">
          <span className="addr-chip">{mother ? shortenAddress(mother) : '—'}</span>
          <button type="button" className="icon-btn" aria-label="Copy mother wallet" onClick={() => void navigator.clipboard.writeText(mother ?? '').then(() => state.patch({ toast: mother ? 'Copied mother address.' : 'No mother wallet is loaded.' }))}><FaCopy /></button>
        </div>
        <p className="help">Mother balance {state.fixtureSession ? `${screenshotFixture.wallet.motherBalance} ${unit}` : '—'}</p>
        <p className="help">Total balance {state.fixtureSession ? screenshotFixture.wallet.totalBalance : '—'}</p>
      </section>
      <section className="card stack">
        <strong>Fund Mother (from Master Wallet)</strong>
        <p className="help">{state.fixtureSession ? `Master ${shortenAddress(FIXTURE_MASTER)}` : 'Master wallet is not configured.'}</p>
        <div className="row">
          <label className="field grow">
            <span>Amount ({unit})</span>
            <input aria-label="Fund amount" value={state.fundAmount} onChange={(event) => state.patch({ fundAmount: event.target.value })} />
          </label>
          <button type="button" className="btn-muted" onClick={() => state.explain('withdraw')}>Send</button>
        </div>
      </section>
      <div className="row">
        <label className="field grow">
          <span>Wallets Count</span>
          <input aria-label="Wallets count" value={state.walletsCount} onChange={(event) => state.patch({ walletsCount: event.target.value })} />
        </label>
        <button type="button" className="btn-violet" onClick={() => state.showDialog('Create wallets', 'This build does not generate private keys. No wallets were created.')}>+ Create</button>
      </div>
      <div className="status-row">
        <span className="green">Active {state.fixtureSession ? screenshotFixture.wallet.active : state.accounts.length}</span>
        <span className="red">Removed {state.fixtureSession ? screenshotFixture.wallet.removed : 0}</span>
        <span className="dot" aria-hidden="true" />
        <button type="button" className="btn-ghost" style={{ marginLeft: 'auto' }} onClick={() => state.patch({ showAddresses: !state.showAddresses })}>Show Addresses</button>
      </div>
      <div className="row">
        <button type="button" className="btn" onClick={() => void navigator.clipboard.writeText(visible.map((account) => account.address).join('\n') || 'No addresses loaded.')}>Copy Addresses</button>
        <button type="button" className="btn" data-testid="download-pks" onClick={() => state.explain('download-pks')}>Download PKs</button>
        <button type="button" className="btn" onClick={() => document.getElementById('wallet-import')?.click()}>Import</button>
        <input id="wallet-import" hidden type="file" accept="application/json" onChange={(event) => void readImport(event, state.addAccounts, state.showDialog)} />
      </div>
      <label className="checks"><input type="checkbox" checked={state.includeRemoved} onChange={(event) => state.patch({ includeRemoved: event.target.checked })} /> Include removed</label>
      {state.showAddresses ? <p className="help">No address rows are stored in this fixture. Removed rows stay in the registry and are not deleted on-chain.</p> : null}
      <button type="button" className="btn-violet-muted wide" onClick={() => state.explain('withdraw')}>Withdraw to Master Wallet</button>
      <button type="button" className="btn-danger wide" onClick={() => state.showDialog('Remove All Active Wallets', 'This changes registry status only. It does not erase on-chain accounts or move their assets. The demo fixture has no registry rows to update.')}>Remove All Active Wallets</button>
    </div>
  );
}

async function readImport(
  event: ChangeEvent<HTMLInputElement>,
  addAccounts: (records: Array<{ name: string; address: string }>) => void,
  showDialog: (title: string, body: string) => void,
) {
  const file = event.target.files?.[0];
  event.target.value = '';
  if (!file) return;
  try {
    const records = parseAddressBook(JSON.parse(await file.text()));
    addAccounts(records);
    showDialog('Import', 'Addresses were saved as watch-only records. No keys were stored.');
  } catch (error) {
    showDialog('Import', error instanceof Error ? error.message : 'Import failed.');
  }
}
