import { FIXTURE_LOGIN, shortenAddress } from '@launchpad/shared';
import { FaRightFromBracket, FaRocket, FaWallet } from 'react-icons/fa6';
import { connectWallet, signIn } from '../lib/wallet';
import { useDashboard } from '../store';

export function Header({ onRpc }: { onRpc: () => void }) {
  const auth = useDashboard((state) => state.auth);
  const fixtureSession = useDashboard((state) => state.fixtureSession);
  const address = useDashboard((state) => state.address);
  const role = useDashboard((state) => state.role);
  const logout = useDashboard((state) => state.logout);
  const shown = fixtureSession ? FIXTURE_LOGIN : address;
  const signedIn = auth === 'ready';
  return (
    <header className="header">
      <div className="header-inner">
        <div className="brand">
          <img src={`${import.meta.env.BASE_URL}assets/eth-launchpad-logo.svg`} alt="" width={40} height={40} />
          <div>
            <strong>ETH LaunchPad</strong>
            <span>Ethereum</span>
          </div>
        </div>
        <div className="header-actions">
          {signedIn && role ? (
            <>
              <button type="button" className="rpc-btn" onClick={onRpc}>RPC</button>
              <span className="addr-chip">{shown ? shortenAddress(shown) : '—'}</span>
              <button type="button" className="icon-btn" aria-label="Log out" onClick={logout}>
                <FaRightFromBracket />
              </button>
            </>
          ) : (
            <button type="button" className="connect" data-testid="connect-wallet" onClick={connectWallet}>
              <FaWallet />
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export function Gate() {
  const auth = useDashboard((state) => state.auth);
  const gateDetail = useDashboard((state) => state.gateDetail);
  let message = 'Connect your wallet to access the dashboard.';
  if (auth === 'signing') message = 'Verifying wallet… approve the signature request in your wallet.';
  if (auth === 'retry') message = gateDetail || 'Sign the login request to verify your wallet and open the dashboard.';
  if (auth === 'denied') message = 'Wallet not whitelisted. Access is restricted.';
  if (auth === 'disconnected' && gateDetail) message = gateDetail;
  return (
    <main className="gate">
      <p className="gate-message" data-testid="gate-message">{message}</p>
      {auth === 'retry' ? (
        <button type="button" className="btn-violet" onClick={() => void signIn()}>Sign to Verify</button>
      ) : null}
    </main>
  );
}

export function Dialogs() {
  const dialog = useDashboard((state) => state.dialog);
  const closeDialog = useDashboard((state) => state.closeDialog);
  const toast = useDashboard((state) => state.toast);
  if (!dialog && !toast) return null;
  return (
    <>
      {dialog ? (
        <div className="modal-back" onClick={closeDialog}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="dialog-title" onClick={(event) => event.stopPropagation()}>
            <h2 id="dialog-title">{dialog.title}</h2>
            <p>{dialog.body}</p>
            {dialog.links ? (
              <div className="modal-links">
                {dialog.links.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}
              </div>
            ) : null}
            <button type="button" className="btn-ghost" onClick={closeDialog}>Close</button>
          </div>
        </div>
      ) : null}
      {toast ? <div className="toast" role="status">{toast}</div> : null}
    </>
  );
}

export function RocketIcon() {
  return <FaRocket aria-hidden="true" />;
}
