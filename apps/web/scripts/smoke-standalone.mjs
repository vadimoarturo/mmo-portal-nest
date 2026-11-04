import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const probe = createServer();
await new Promise((resolve, reject) => {
  probe.once('error', reject);
  probe.listen(0, '127.0.0.1', resolve);
});
const port = probe.address().port;
await new Promise((resolve, reject) => probe.close((error) => error ? reject(error) : resolve()));
const entrypoint = fileURLToPath(new URL('../.next/standalone/server.js', import.meta.url));
const child = spawn(process.execPath, [entrypoint], {
  cwd: dirname(entrypoint),
  env: { ...process.env, HOSTNAME: '127.0.0.1', PORT: String(port), NEXT_TELEMETRY_DISABLED: '1' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let output = '';
for (const stream of [child.stdout, child.stderr]) {
  stream.on('data', (data) => { output = (output + data).slice(-4000); });
}
const origin = `http://127.0.0.1:${port}`;
const get = (path) => fetch(origin + path, { redirect: 'manual', signal: AbortSignal.timeout(3000) });
try {
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (child.exitCode !== null) throw new Error(`Standalone server exited: ${output}`);
    try { if ((await get('/en')).status === 200) { ready = true; break; } } catch { /* Wait for the listener. */ }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.ok(ready, `Standalone server did not become ready: ${output}`);
  // Native fetch has no cookie jar: every request exercises a fresh visitor.
  for (const path of ['/ru', '/en', '/ru/shop', '/en/auction', '/images/fantasy-hero.webp']) {
    assert.equal((await get(path)).status, 200, `${path} must render directly`);
  }
  const root = await get('/');
  assert.equal(root.status, 307);
  assert.ok(['/ru', '/en'].includes(new URL(root.headers.get('location'), origin).pathname));
  console.log('Standalone smoke passed: cookie-free locale routes, feature pages, artwork, and root redirect.');
} finally {
  if (child.exitCode === null) {
    const stopped = new Promise((resolve) => child.once('exit', resolve));
    child.kill('SIGTERM');
    const force = setTimeout(() => child.kill('SIGKILL'), 3000);
    await stopped;
    clearTimeout(force);
  }
}
