import { spawn } from 'node:child_process';
import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
const mode = process.argv[2];
if (!['install', 'build'].includes(mode)) throw new Error('Expected install or build.');
function run(command, args, timeout) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', env: { ...process.env, WRANGLER_WRITE_LOGS: 'false' }, timeout });
    child.on('error', reject); child.on('exit', code => code === 0 ? resolve() : reject(new Error(`${mode} exited ${code}`)));
  });
}
// Retain the existing verified Linux workflow. Windows uses the same lockfile and Vinext builder.
if (process.platform !== 'win32') {
  await run('bash', [mode === 'install' ? 'scripts/install-ci.sh' : 'scripts/build-verified.sh'], mode === 'install' ? 900000 : 240000);
} else if (mode === 'install') {
  const npmCli = process.env.npm_execpath;
  if (!npmCli || !existsSync(npmCli)) throw new Error('Run through the Sites dependency installer with npm on PATH.');
  const lock = readFileSync('package-lock.json');
  await run(process.execPath, [npmCli, '--prefix', '.', '--workspaces=false', 'ci', '--no-audit', '--no-fund', '--prefer-offline'], 900000);
  if (!existsSync('node_modules/vinext/package.json')) throw new Error('Vinext missing after install.');
  writeFileSync('node_modules/.sites-install.json', JSON.stringify({ lockfile_sha256: createHash('sha256').update(lock).digest('hex'), node: process.version, platform: `${process.platform}-${process.arch}` }) + '\n');
} else {
  mkdirSync('.sites-runtime', { recursive: true });
  const meta = JSON.parse(readFileSync('node_modules/vinext/package.json', 'utf8'));
  const bin = typeof meta.bin === 'string' ? meta.bin : meta.bin.vinext;
  await run(process.execPath, [path.resolve('node_modules/vinext', bin), 'build'], 240000);
  const source = JSON.parse(readFileSync('.openai/hosting.json', 'utf8'));
  const built = JSON.parse(readFileSync('dist/.openai/hosting.json', 'utf8'));
  if (source.project_id !== built.project_id || !existsSync('dist/server/index.js')) throw new Error('Worker output or Site identity validation failed.');
  console.log('Validated Worker output and preserved Site identity.');
}
