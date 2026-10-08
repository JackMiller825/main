export type AppMode = 'demo' | 'fork' | 'live';

export function resolveAppMode(value: string | undefined): AppMode {
  if (value === undefined || value === '') return 'demo';
  if (value === 'demo' || value === 'fork' || value === 'live') return value;
  throw new Error('APP_MODE must be demo, fork, or live.');
}

export function liveFixtureBlocked(mode: AppMode, search: string): boolean {
  if (mode === 'demo') return false;
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  return params.has('fixture') || params.has('capture');
}
