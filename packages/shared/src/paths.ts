import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

export function findRepoRoot(start = process.cwd()): string {
  let dir = start;
  for (let i = 0; i < 8; i += 1) {
    const pkgPath = join(dir, 'package.json');
    if (existsSync(pkgPath)) {
      try {
        const json = JSON.parse(readFileSync(pkgPath, 'utf8')) as { workspaces?: unknown };
        if (json.workspaces) return dir;
      } catch {
        // Keep walking if a package file is unreadable.
      }
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return start;
}
