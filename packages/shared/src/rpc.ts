function isPrivateIp(host: string): boolean {
  const match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (!match) return false;
  const parts = match.slice(1).map(Number);
  if (parts.some((part) => part > 255)) return false;
  const [a, b] = parts;
  if (a === 10 || a === 127 || a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b !== undefined && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

export function validateRpcUrl(raw: string, mode: 'demo' | 'fork' | 'live'): { ok: true; href: string } | { ok: false; error: string } {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { ok: false, error: 'Enter a valid RPC URL.' };
  }
  if (!['https:', 'http:', 'wss:', 'ws:'].includes(url.protocol)) {
    return { ok: false, error: 'RPC URLs must use http, https, ws, or wss.' };
  }
  const host = url.hostname.toLowerCase();
  if (host === '169.254.169.254' || host === 'metadata.google.internal') {
    return { ok: false, error: 'That endpoint is not allowed.' };
  }
  const local = host === 'localhost' || host === '::1' || host.endsWith('.local') || isPrivateIp(host);
  if (local && mode === 'live') {
    return { ok: false, error: 'Local and private RPC endpoints are not allowed in live mode.' };
  }
  if ((url.protocol === 'http:' || url.protocol === 'ws:') && mode === 'live' && !local) {
    return { ok: false, error: 'Live RPC endpoints must use https or wss.' };
  }
  return { ok: true, href: url.href };
}

export function redactRpcUrl(raw: string): string {
  try {
    const url = new URL(raw);
    if (url.username || url.password) {
      url.username = 'redacted';
      url.password = '';
    }
    url.pathname = url.pathname.replace(/\/[A-Za-z0-9_-]{16,}/g, '/redacted');
    url.search = '';
    url.hash = '';
    return url.toString();
  } catch {
    return 'invalid-url';
  }
}
