import { cp, rm, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const source = join(repoRoot, 'frontend-admindashboard', 'dist');
const target = join(repoRoot, 'dist');

try {
  await access(source);
} catch {
  console.error(`[publish] ${source} not found. Did the dashboard build run?`);
  process.exit(1);
}

await rm(target, { recursive: true, force: true });
await cp(source, target, { recursive: true });

console.log(`[publish] frontend-admindashboard/dist -> dist (static publish path)`);
