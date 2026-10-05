'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { signingPlan, signExecutables } = require('./sign-sea');
const env = {
 SUITECLOUD_JSIGN_JAR: 'jsign.jar', SUITECLOUD_SIGN_KEYSTORE: 'test.p12',
 SUITECLOUD_SIGN_ALIAS: 'test', SUITECLOUD_SIGN_TSA_URL: 'https://timestamp.example.test',
 SUITECLOUD_SIGN_STOREPASS: 'must-not-appear', SUITECLOUD_GPG_KEY: 'A'.repeat(40),
};
test('Windows signing replaces signatures and timestamps with no password in arguments', () => {
 const [step] = signingPlan('win32-x64', '/tmp/my app.exe', env);
 assert.equal(step.command, 'java');
 assert.ok(step.args.includes('--replace'));
 assert.ok(step.args.includes('RFC3161'));
 assert.ok(step.args.includes('env:SUITECLOUD_SIGN_STOREPASS'));
 assert.ok(!step.args.includes(env.SUITECLOUD_SIGN_STOREPASS));
 assert.equal(step.args.at(-1), '/tmp/my app.exe');
});
test('Linux signs with an explicit key and verifies detached output', () => {
 const steps = signingPlan('linux-arm64', '/tmp/suitecloud', env);
 assert.ok(steps[0].args.includes('--detach-sign'));
 assert.ok(steps[0].args.includes(env.SUITECLOUD_GPG_KEY));
 assert.deepEqual(steps[1].args, ['--batch', '--verify', '/tmp/suitecloud.asc', '/tmp/suitecloud']);
});
test('missing credentials, ambiguous keys and macOS fail explicitly', () => {
 assert.throws(() => signingPlan('win32-x64', 'app.exe', {}), /SUITECLOUD_JSIGN_JAR/);
 assert.throws(() => signingPlan('linux-x64', 'app', {}), /SUITECLOUD_GPG_KEY/);
 assert.throws(() => signingPlan('linux-x64', 'app', {...env, SUITECLOUD_GPG_KEY: 'user@example.test'}), /fingerprint/);
 assert.throws(() => signingPlan('darwin-arm64', 'app', env), /codesign/);
});
function fixture(t) {
 const parent = path.resolve(__dirname, '../dist');
 fs.mkdirSync(parent, {recursive:true});
 const folder = fs.mkdtempSync(path.join(parent, '.sign-test-'));
 t.after(() => {
  assert.ok(path.resolve(folder).startsWith(parent + path.sep + '.sign-test-'));
  fs.rmSync(folder, {recursive:true, force:true});
 });
 fs.mkdirSync(path.join(folder, 'linux-x64'));
 const file = path.join(folder, 'linux-x64/suitecloud');
 fs.writeFileSync(file, 'original binary');
 return {folder, file};
}
test('verification failure preserves both binary and previous signature', t => {
 const {folder, file} = fixture(t);
 fs.writeFileSync(file + '.asc', 'previous signature');
 assert.throws(() => signExecutables(['linux-x64'], env, step => {
  if (step.args.includes('--verify')) throw new Error('bad signature');
  fs.writeFileSync(step.args[step.args.indexOf('--output') + 1], 'bad signature');
 }, folder), /bad signature/);
 assert.equal(fs.readFileSync(file, 'utf8'), 'original binary');
 assert.equal(fs.readFileSync(file + '.asc', 'utf8'), 'previous signature');
 assert.equal(fs.readdirSync(path.dirname(file)).length, 2);
});
test('successful Linux signing publishes only verified detached signature', t => {
 const {folder, file} = fixture(t);
 let verified = false;
 signExecutables(['linux-x64'], env, step => {
  if (step.args.includes('--verify')) { verified = true; return; }
  fs.writeFileSync(step.args[step.args.indexOf('--output') + 1], 'signature fixture');
 }, folder);
 assert.ok(verified);
 assert.equal(fs.readFileSync(file, 'utf8'), 'original binary');
 assert.equal(fs.readFileSync(file + '.asc', 'utf8'), 'signature fixture');
});
test('Windows signer failure cannot replace the existing executable', t => {
 const {folder} = fixture(t);
 fs.mkdirSync(path.join(folder, 'win32-x64'));
 const file = path.join(folder, 'win32-x64/suitecloud.exe');
 const jar = path.join(folder, 'jsign.jar');
 fs.writeFileSync(file, 'unsigned original');
 fs.writeFileSync(jar, 'tool fixture');
 assert.throws(() => signExecutables(['win32-x64'], {...env, SUITECLOUD_JSIGN_JAR: jar}, step => {
  fs.writeFileSync(step.args.at(-1), 'partial mutation');
  throw new Error('signer failed');
 }, folder), /signer failed/);
 assert.equal(fs.readFileSync(file, 'utf8'), 'unsigned original');
 assert.deepEqual(fs.readdirSync(path.dirname(file)), ['suitecloud.exe']);
});
