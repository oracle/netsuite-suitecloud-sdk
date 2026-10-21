import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const scriptSource = fileURLToPath(new URL('../scripts', import.meta.url));
const tools = ['release-integrity', 'release-security-gates', 'verify-release'];
const variants = ['absolute', 'relative', 'spaces', 'literal #% characters', 'symlink script', 'symlink parent'];
const workflow = `name: fixture
permissions:
  contents: read
jobs:
  test:
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683
        with:
          persist-credentials: false
`;

function run(cwd, args, { status = 0, stdout = '', stderr = '' } = {}) {
 const result = spawnSync(process.execPath, args, { cwd, encoding: 'utf8', timeout: 15000 });
 const diagnostic = JSON.stringify({ args, ...result });
 assert.equal(result.error, undefined, diagnostic);
 assert.equal(result.signal, null, diagnostic);
 assert.equal(result.status, status, diagnostic);
 for (const [actual, expected] of [[result.stdout, stdout], [result.stderr, stderr]]) {
  if (expected instanceof RegExp) assert.match(actual, expected, diagnostic);
  else assert.equal(actual, expected, diagnostic);
 }
 return result;
}

async function write(root, relative, contents) {
 const destination = path.join(root, relative);
 await fs.mkdir(path.dirname(destination), { recursive: true });
 await fs.writeFile(destination, contents);
}

async function fixture(t, variant) {
 const root = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'release-cli-')));
 t.after(() => fs.rm(root, { recursive: true, force: true }));
 const directory = variant === 'spaces' ? 'workspace with spaces' : variant === 'literal #% characters' ? 'workspace#percent%' : 'workspace';
 const workspace = path.join(root, directory);
 await fs.cp(scriptSource, path.join(workspace, 'scripts'), { recursive: true });
 await fs.symlink(workspace, path.join(root, 'parent-alias'), 'dir');
 const entries = {};
 for (const name of tools) {
  const script = path.join(workspace, 'scripts', `${name}.mjs`);
  const alias = path.join(root, `${name}-alias.mjs`);
  await fs.symlink(script, alias);
  entries[name] = variant === 'relative' ? `./scripts/${name}.mjs`
   : variant === 'symlink script' ? alias
   : variant === 'symlink parent' ? path.join(root, 'parent-alias', 'scripts', `${name}.mjs`) : script;
 }
 return { root, workspace, entries };
}

async function buildFixture(workspace) {
 await write(workspace, 'config/build.json', JSON.stringify({
  skillsRoot: 'skills', commonLayersRoot: 'common/layers', pluginDistRoot: 'dist',
  licenseFile: 'LICENSE.txt', globalExcludes: [],
 }));
 await write(workspace, 'README.md', 'Fixture release documentation\n');
 await write(workspace, 'LICENSE.txt', 'Fixture license\n');
 await write(workspace, 'skills/netsuite-fixture/SKILL.md', '---\nname: netsuite-fixture\ndescription: Fixture skill\nlicense: UPL-1.0\n---\nFixture instructions\n');
 await write(workspace, 'openai/fixture/src/README.md', 'Fixture plugin\n');
 await write(workspace, 'openai/fixture/plugin.build.json', JSON.stringify({
  id: 'fixture', version: '1.0.0', platform: 'openai', skills: ['netsuite-fixture'], commonLayers: [],
  inputs: [{ root: 'src', destination: '', include: ['**/*'], exclude: [] }],
  metadata: {
   name: 'fixture', description: 'Fixture plugin', license: 'UPL-1.0', author: { name: 'Fixture' }, keywords: ['fixture'],
   interface: {
    displayName: 'Fixture', shortDescription: 'Fixture', longDescription: 'Fixture plugin', developerName: 'Fixture',
    category: 'Productivity', websiteURL: 'https://example.com', privacyPolicyURL: 'https://example.com/privacy',
    logo: 'logo.svg', composerIcon: 'logo.svg', brandColor: '#000000',
   },
  },
 }));
 run(workspace, [path.join(workspace, 'scripts/build.mjs')], { stdout: /Built openai\/fixture ->/ });
 assert.equal(JSON.parse(await fs.readFile(path.join(workspace, 'dist/openai/fixture/.codex-plugin/plugin.json'))).version, '1.0.0');
}

// Snapshot bytes as well as inventory so imports cannot silently write artifacts.
async function snapshot(directory) {
 const files = {};
 async function visit(current) {
  for (const entry of await fs.readdir(current, { withFileTypes: true })) {
   const absolute = path.join(current, entry.name);
   if (entry.isDirectory()) await visit(absolute);
   else if (entry.isFile()) files[path.relative(directory, absolute)] = createHash('sha256').update(await fs.readFile(absolute)).digest('hex');
  }
 }
 await visit(directory);
 return files;
}

for (const variant of variants) {
 test(`release CLIs: ${variant}`, async t => {
  const { root, workspace, entries } = await fixture(t, variant);
  const cli = (name, args = [], expected = {}) => run(workspace, [entries[name], ...args], expected);
  await t.test('missing arguments/configuration reject', () => {
   for (const name of tools) cli(name, [], { status: 1, stderr: name === 'verify-release' ? /config\/build\.json/ : /Usage:/ });
  });
  await t.test('integrity creates expected hashes and rejects altered records and files', async () => {
   await write(workspace, 'payload/nested/a.txt', 'first');
   await write(workspace, 'payload/z.txt', 'last');
   const manifest = path.join(root, 'manifest.sha256');
   cli('release-integrity', ['create', 'payload', manifest]);
   const expected = ['nested/a.txt', 'z.txt'].map((file, i) => `${createHash('sha256').update(['first', 'last'][i]).digest('hex')}  ${file}\n`).join('');
   assert.equal(await fs.readFile(manifest, 'utf8'), expected);
   cli('release-integrity', ['verify', 'payload', manifest]);
   await fs.writeFile(manifest, expected.replace(/^[a-f0-9]{64}/, '0'.repeat(64)));
   cli('release-integrity', ['verify', 'payload', manifest], { status: 1, stderr: /hash mismatch: nested\/a\.txt/ });
   await fs.writeFile(manifest, expected);
   await write(workspace, 'payload/nested/a.txt', 'tampered');
   cli('release-integrity', ['verify', 'payload', manifest], { status: 1, stderr: /hash mismatch: nested\/a\.txt/ });
  });
  await t.test('security gates pass clean fixtures and reject each violation', async () => {
   await write(workspace, 'secrets/clean.txt', 'ordinary text\n');
   cli('release-security-gates', ['secrets', 'secrets'], { stdout: 'secrets gate passed: secrets\n' });
   await write(workspace, 'secrets/credential.txt', 'ghp_' + 'A'.repeat(40));
   cli('release-security-gates', ['secrets', 'secrets'], { status: 1, stderr: /Secret scan failed:[\s\S]*credential\.txt:1: GitHub token/ });
   await write(workspace, 'workflows/fixture.yml', workflow);
   cli('release-security-gates', ['workflows', 'workflows'], { stdout: 'workflows gate passed: workflows\n' });
   for (const [contents, diagnostic] of [
    [workflow.replace('permissions:\n  contents: read\n', ''), /missing explicit top-level permissions/],
    [workflow.replace('11bd71901bbe5b1630ceea73d27597364c9af683', 'v4'), /unpinned external action/],
    [workflow.replace('persist-credentials: false', 'persist-credentials: true'), /checkout persists credentials/],
   ]) {
    await write(workspace, 'workflows/fixture.yml', contents);
    cli('release-security-gates', ['workflows', 'workflows'], { status: 1, stderr: diagnostic });
   }
  });
  await t.test('verifier compares real builder output and rejects release mismatches', async () => {
   await buildFixture(workspace);
   cli('verify-release', [], { stdout: 'Verified openai/fixture\n' });
   const readme = path.join(workspace, 'dist/openai/fixture/README.md');
   const original = await fs.readFile(readme);
   await fs.rm(readme);
   cli('verify-release', [], { status: 1, stderr: /file inventory differs/ });
   await fs.writeFile(readme, original);
   const extra = path.join(workspace, 'dist/openai/fixture/extra.txt');
   await fs.writeFile(extra, 'extra');
   cli('verify-release', [], { status: 1, stderr: /file inventory differs/ });
   await fs.rm(extra);
   await fs.writeFile(readme, 'changed');
   cli('verify-release', [], { status: 1, stderr: /content differs: README\.md/ });
   await fs.writeFile(readme, original);
   const rootReadme = path.join(workspace, 'dist/README.md');
   await fs.rm(rootReadme);
   cli('verify-release', [], { status: 1, stderr: /missing root README\.md/ });
   await fs.writeFile(rootReadme, 'changed');
   cli('verify-release', [], { status: 1, stderr: /root README\.md differs/ });
  });
  await t.test('imports have no CLI output, artifacts, or exit-status changes', async () => {
   const before = await snapshot(root);
   for (const name of tools) {
    const moduleUrl = pathToFileURL(path.resolve(workspace, entries[name])).href;
    // With -e and no script arguments, argv[1] is absent.
    run(workspace, ['--input-type=module', '-e', `await import(${JSON.stringify(moduleUrl)});`]);
    const harness = path.join(root, 'import-harness.mjs');
    await fs.writeFile(harness, `process.exitCode = 7; await import(${JSON.stringify(moduleUrl)});`);
    const beforeHarness = await snapshot(root);
    const args = name === 'release-integrity' ? ['create', 'payload', path.join(root, 'import-manifest.sha256')]
     : name === 'release-security-gates' ? ['secrets', 'secrets'] : ['--plugin', 'openai/fixture'];
    run(workspace, [harness, ...args], { status: 7 });
    assert.deepEqual(await snapshot(root), beforeHarness);
    await fs.rm(harness);
    // A supplied entry that cannot be resolved must also remain a safe import.
    run(workspace, ['--input-type=module', '-e', `process.argv[1] = ${JSON.stringify(path.join(root, 'nonexistent.mjs'))}; await import(${JSON.stringify(moduleUrl)});`]);
   }
   assert.deepEqual(await snapshot(root), before);
  });
 });
}
