export class NonceStore {
  private readonly values = new Map<string, { nonce: string; expiresAt: number }>();

  issue(address: string, now = Date.now(), ttlMs = 10 * 60 * 1000): string {
    const nonce = crypto.randomUUID().replaceAll('-', '');
    this.values.set(address.toLowerCase(), { nonce, expiresAt: now + ttlMs });
    return nonce;
  }

  consume(address: string, nonce: string, now = Date.now()): boolean {
    const key = address.toLowerCase();
    const row = this.values.get(key);
    if (!row || row.nonce !== nonce || row.expiresAt <= now) return false;
    this.values.delete(key);
    return true;
  }
}
