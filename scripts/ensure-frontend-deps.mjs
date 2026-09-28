import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const dashboardDir = join(repoRoot, 'frontend-admindashboard');

if (existsSync(join(dashboardDir, 'node_modules'))) {
  process.exit(0);
}

console.log('[setup] frontend-admindashboard/node_modules is missing, installing...');

const result = spawnSync('npm', ['install'], {
  cwd: dashboardDir,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

if (result.status !== 0) {
  console.error('[setup] install failed. Run `npm run setup` from the repository root.');
}

process.exit(result.status ?? 1);
