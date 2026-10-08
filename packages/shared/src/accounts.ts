import { getAddress } from 'ethers';

const SECRET_KEY = /privatekey|private_key|mnemonic|keystore|secretkey/i;

export interface AddressRecord {
  name: string;
  address: string;
}

function assertNoSecrets(value: unknown): void {
  if (Array.isArray(value)) {
    for (const entry of value) assertNoSecrets(entry);
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    if (SECRET_KEY.test(key)) {
      throw new Error('Address import cannot include private keys, seeds, or keystores.');
    }
    assertNoSecrets(child);
  }
}

export function parseAddressBook(payload: unknown): AddressRecord[] {
  assertNoSecrets(payload);
  if (!payload || typeof payload !== 'object' || !('accounts' in payload) || !Array.isArray(payload.accounts)) {
    throw new Error('Address import must be an object with an accounts array.');
  }
  if (payload.accounts.length > 100) {
    throw new Error('Address import is limited to 100 accounts.');
  }
  const seen = new Set<string>();
  const records: AddressRecord[] = [];
  for (const entry of payload.accounts) {
    if (!entry || typeof entry !== 'object') throw new Error('Each account needs a name and an address.');
    const name = 'name' in entry && typeof entry.name === 'string' ? entry.name.trim() : '';
    const address = 'address' in entry && typeof entry.address === 'string' ? entry.address.trim() : '';
    if (!name || name.length > 32) throw new Error('Each account name must be 1 to 32 characters.');
    let checksum: string;
    try {
      checksum = getAddress(address);
    } catch {
      throw new Error(`Invalid address for ${name}.`);
    }
    const key = checksum.toLowerCase();
    if (seen.has(key)) throw new Error(`Duplicate address ${checksum}.`);
    seen.add(key);
    records.push({ name, address: checksum });
  }
  return records;
}

export function exportAddressBook(records: AddressRecord[]): { version: 1; accounts: AddressRecord[] } {
  return {
    version: 1,
    accounts: records.map((record) => ({ name: record.name, address: record.address })),
  };
}
