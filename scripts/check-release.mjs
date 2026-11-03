import { execFileSync } from 'node:child_process';
import { readFileSync, statSync, existsSync } from 'node:fs';

const candidates = [...new Set(execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { encoding: 'utf8' }).split('\0').filter(Boolean))];
const failures = [];
const forbiddenPaths = /(^|\/)(db|infra|rules|backups|logs|node_modules|\.next|dist|coverage)(\/|$)|(^|\/)Server\.zip$|(^|\/)\.env(?:\..+)?$|\.(pem|key|pfx|p12|bak|dump|log)$/i;
const forbiddenBrand = /rapp[e]lz|real[\s-]*edition|RE8[1]/i;
const secretPattern = /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\b(?:gh[pousr]_[a-zA-Z0-9]{30,}|github_pat_[a-zA-Z0-9_]{30,}|AKIA[A-Z0-9]{16})\b/;
const secrets = [];
for (const path of ['apps/api/.env', 'apps/api/.env.dev', 'apps/web/.env', 'apps/web/.env.dev']) {
  if (!existsSync(path)) continue;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    if (!/^(?:JWT_SECRET_(?:ACCESS|REFRESH|VERIFY)|SMTP_PASS|.*SECRET.*|.*API_KEY)=/.test(line)) continue;
    const value = line.slice(line.indexOf('=') + 1).trim().replace(/^['"]|['"]$/g, '');
    if (value.length >= 12) secrets.push(value);
  }
}
let total = 0;
for (const path of candidates) {
  if (!existsSync(path)) continue;
  if (forbiddenPaths.test(path) && !path.endsWith('/.env.example') && path !== '.env.example') failures.push(`${path}: excluded or sensitive path`);
  const size = statSync(path).size;
  total += size;
  if (size >= 50 * 1024 * 1024) failures.push(`${path}: file is at least 50 MiB`);
  if (/\.(png|jpg|jpeg|webp|gif|ico)$/i.test(path)) continue;
  const text = readFileSync(path, 'utf8');
  if (secretPattern.test(text)) failures.push(`${path}: credential or private key pattern`);
  if (forbiddenBrand.test(text)) failures.push(`${path}: obsolete branding`);
  if (secrets.some((value) => text.includes(value))) failures.push(`${path}: contains a value from private local configuration`);
}
if (failures.length) {
  process.stderr.write(`${failures.join('\n')}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`Release check passed: ${candidates.length} files, ${(total / 1024 / 1024).toFixed(2)} MiB. No excluded paths, obsolete branding, or detected secrets.\n`);
}
