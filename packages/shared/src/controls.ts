export const BLOCKED_CONTROLS = {
  ss: 'SS is a compatibility control. It is unavailable and cannot send a transaction.',
  us: 'US is a compatibility control. It is unavailable and cannot send a transaction.',
  'add-wl': 'Add WL is unavailable until a reviewed contract specification is supplied. Nothing was sent.',
  'd-f': 'D-F is unavailable and cannot move another holder\'s assets.',
  sb: 'SB is unavailable and cannot seize or burn holder balances.',
  'auto-sb': 'Auto-SB is unavailable and cannot seize or burn holder balances.',
  'download-pks':
    'Plaintext private key download is disabled. No encrypted backup is configured, and no file was created.',
  'engine-run': 'Chart-pattern automation is not implemented. No jobs were queued and no orders were signed.',
  'launch-buys': 'Multi-account launch buys are not implemented. No buy transactions were created.',
  'lp-burn': 'LP burn needs a deployed pair, an LP token balance, and a browser-wallet approval. No transaction was created.',
  'remove-limits': 'removeLimits needs a verified token and an authorized signer. No transaction was created.',
  renounce: 'Renouncing ownership needs a verified ownable token and an authorized signer. No transaction was created.',
  dump: 'Dump was not submitted. Watch-only addresses have no signer, and no sale was created.',
  collect: 'Collect was not submitted. No signer is configured for the selected accounts.',
  disperse: 'Disperse was not submitted. No transfer signer is configured.',
  withdraw: 'Withdrawal was not submitted. No master-wallet signer is configured.',
  'auto-trade': 'Interval trading is not implemented. No orders were scheduled.',
} as const;

export type BlockedControl = keyof typeof BLOCKED_CONTROLS;

export function blockedControlMessage(control: string): string | null {
  if (Object.prototype.hasOwnProperty.call(BLOCKED_CONTROLS, control)) {
    return BLOCKED_CONTROLS[control as BlockedControl];
  }
  return null;
}
