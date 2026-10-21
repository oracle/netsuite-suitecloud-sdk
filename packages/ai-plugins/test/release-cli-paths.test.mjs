import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

// Exercise the actual CLI entrypoints in paths requiring URL encoding.
test('release CLIs execute in a checkout path containing spaces', async t => {
 const root = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'release cli spaces ')));
 t.after(() => fs.rm(root, { recursive: true, force: true }));
 const scripts = path.join(root, 'scripts');
 await fs.cp(fileURLToPath(new URL('../scripts', import.meta.url)), scripts, { recursive: true });
 for (const name of ['release-security-gates', 'release-integrity', 'verify-release']) {
  await t.test(name, () => {
   // No arguments/config: an executing CLI must reject, never silently succeed.
   const result = spawnSync(process.execPath, [path.join(scripts, `${name}.mjs`)], { encoding: 'utf8', cwd: root });
   assert.equal(result.error, undefined);
   assert.notEqual(result.status, 0, `${name} silently skipped its entrypoint`);
   assert.match(result.stderr, name === 'verify-release' ? /build\.json|config/ : /Usage:/);
  });
 }
});
