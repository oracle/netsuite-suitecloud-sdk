/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { parseTargets, runtimeDownload, verifyDownload } = require('./build-sea');

test('default builds preserve the host OS and architecture', () => {
	assert.deepEqual(parseTargets([], 'win32', 'x64'), ['win32-x64']);
	assert.deepEqual(parseTargets([], 'linux', 'arm64'), ['linux-arm64']);
});

test('all produces the release matrix independently of the build host', () => {
	assert.deepEqual(parseTargets(['all'], 'linux', 'arm64'), ['win32-x64', 'darwin-arm64', 'linux-x64']);
});

test('explicit target list supports cross-building, aliases and deduplication', () => {
	assert.deepEqual(parseTargets(['windows-x64,mac,linux-arm64,win32-x64'], 'linux', 'x64'),
		['win32-x64', 'darwin-arm64', 'linux-arm64']);
});

test('reject unsupported and malformed targets before touching build outputs', () => {
	for (const value of ['darwin-x64', 'linux-ia32', 'linux-x64-extra', 'linux-', '../linux', '', 'win32-x64,']) {
		assert.throws(() => parseTargets([value]), /Unsupported SEA target/);
	}
	assert.throws(() => parseTargets(['linux-x64', 'win32-x64']), /Usage/);
	assert.throws(() => parseTargets([], 'aix', 'ppc64'), /Unsupported SEA target/);
});

test('runtime URLs use the target OS and architecture and the exact Node patch version', () => {
	assert.deepEqual(runtimeDownload('win32-arm64', 'v22.22.3'), { filename: 'win-arm64/node.exe' });
	assert.deepEqual(runtimeDownload('darwin-arm64', 'v22.22.3'), {
		filename: 'node-v22.22.3-darwin-arm64.tar.gz', member: 'node-v22.22.3-darwin-arm64/bin/node',
	});
	assert.deepEqual(runtimeDownload('linux-x64', 'v22.22.3'), {
		filename: 'node-v22.22.3-linux-x64.tar.gz', member: 'node-v22.22.3-linux-x64/bin/node',
	});
});

test('only an exact filename and matching SHA-256 allow downloaded runtimes', () => {
	const bytes = Buffer.from('runtime fixture');
	const digest = createHash('sha256').update(bytes).digest('hex');
	const sums = `${'0'.repeat(64)}  win-arm64/node.exe\r\n${digest}  win-x64/node.exe\r\n`;
	assert.doesNotThrow(() => verifyDownload(bytes, 'win-x64/node.exe', sums));
	assert.throws(() => verifyDownload(Buffer.from('corrupt runtime'), 'win-x64/node.exe', sums), /SHA-256/);
	assert.throws(() => verifyDownload(bytes, 'node.exe', sums), /SHA-256/);
	assert.throws(() => verifyDownload(bytes, 'win-arm64/node.exe', sums), /SHA-256/);
	assert.throws(() => verifyDownload(bytes, 'win-x64/node.exe', 'invalid  win-x64/node.exe'), /SHA-256/);
});
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Exercise the actual orchestration without downloading or executing foreign binaries.
function buildHarness(platform = 'linux', failDownload = false) {
	const root = path.resolve(__dirname, '..');
	const dist = path.join(root, 'dist');
	const temporary = path.join(dist, '.sea-test');
	const files = new Map([[path.join(dist, 'suitecloud.js'), Buffer.from('bundle')], ['/host/node', Buffer.from('host')]]);
	const commands = [];
	const injections = [];
	const downloads = [];
	const warnings = [];
	const removed = [];
	const runtime = Buffer.from('downloaded runtime');
	const digest = createHash('sha256').update(runtime).digest('hex');
	const sums = ['win-x64/node.exe', 'node-v22.22.3-darwin-arm64.tar.gz', 'node-v22.22.3-linux-x64.tar.gz']
		.map((name) => `${digest}  ${name}`).join('\n');
	const fakeFs = {
		readFileSync: (file) => { assert.ok(files.has(file), `Missing fixture ${file}`); return files.get(file); },
		writeFileSync: (file, bytes) => files.set(file, bytes),
		copyFileSync: (source, destination) => { assert.ok(files.has(source)); files.set(destination, files.get(source)); },
		renameSync: (source, destination) => { assert.ok(files.has(source)); files.set(destination, files.get(source)); files.delete(source); },
		mkdirSync: () => {},
		mkdtempSync: () => temporary,
		chmodSync: () => {},
		rmSync: (file) => removed.push(file),
	};
	const fakeSpawn = (command, args) => {
		commands.push({ command, args });
		if (args[0] === '--experimental-sea-config') {
			const config = JSON.parse(files.get(args[1]));
			assert.equal(config.useSnapshot, false);
			assert.equal(config.useCodeCache, false);
			files.set(config.output, Buffer.from('blob'));
		} else if (command === 'tar') {
			files.set(path.join(args[3], args[4]), runtime);
		}
		return { status: 0 };
	};
	const module = { exports: {} };
	vm.runInNewContext(readFileSync(path.join(__dirname, 'build-sea.js'), 'utf8'), {
		__dirname,
		module,
		Buffer,
		AbortSignal,
		process: { platform, arch: 'x64', execPath: '/host/node', version: 'v22.22.3', versions: { node: '22.22.3' } },
		console: { log: () => {}, warn: (message) => warnings.push(message) },
		fetch: async (url) => {
			downloads.push(url);
			return { ok: !failDownload, status: failDownload ? 404 : 200,
				arrayBuffer: async () => url.endsWith('SHASUMS256.txt') ? Buffer.from(sums) : runtime };
		},
		require: (name) => {
			if (name === 'node:fs') return fakeFs;
			if (name === 'node:child_process') return { spawnSync: fakeSpawn };
			if (name === 'postject') return { inject: async (file, resource, blob, options) => {
				assert.ok(files.has(file));
				assert.equal(resource, 'NODE_SEA_BLOB');
				assert.equal(blob.toString(), 'blob');
				injections.push({ file, options });
			} };
			return require(name);
		},
	});
	return { build: module.exports.buildExecutables, dist, temporary, commands, injections, downloads, warnings, removed };
}

test('Linux agent packages all targets and leaves an explicit macOS signing requirement', async () => {
	const h = buildHarness();
	const outputs = await h.build(['all']);
	assert.equal(outputs.length, 3);
	assert.equal(outputs[0].executable, path.join(h.dist, 'win32-x64', 'suitecloud.exe'));
	assert.equal(outputs[1].executable, path.join(h.dist, 'darwin-arm64', 'suitecloud'));
	assert.equal(outputs[2].executable, path.join(h.dist, 'linux-x64', 'suitecloud'));
	assert.equal(outputs[1].requiresMacSigning, true);
	assert.equal(h.injections[1].options.machoSegmentName, 'NODE_SEA');
	assert.equal(h.injections[0].options.machoSegmentName, undefined);
	assert.equal(h.commands.filter(({ command }) => command === 'codesign').length, 0);
	assert.equal(h.downloads.filter((url) => url.endsWith('SHASUMS256.txt')).length, 1);
	assert.equal(h.downloads.some((url) => url.includes('linux-x64')), false);
	assert.equal(h.warnings.length, 1);
	assert.deepEqual(h.removed, [h.temporary]);
});

test('Mac agent signs the final macOS artifact after injection', async () => {
	const h = buildHarness('darwin');
	const outputs = await h.build(['darwin-arm64']);
	assert.equal(outputs[0].requiresMacSigning, false);
	assert.deepEqual(h.commands.filter(({ command }) => command === 'codesign').map(({ args }) => args[0]),
		['--remove-signature', '--sign']);
	assert.equal(h.warnings.length, 0);
});

test('failed downloads abort before injection and still clean temporary files', async () => {
	const h = buildHarness('linux', true);
	await assert.rejects(h.build(['win32-x64']), /Download failed \(404\)/);
	assert.equal(h.injections.length, 0);
	assert.deepEqual(h.removed, [h.temporary]);
});

test('native default retains the existing output path without network access', async () => {
	const h = buildHarness();
	const outputs = await h.build([]);
	assert.equal(outputs[0].executable, path.join(h.dist, 'suitecloud'));
	assert.equal(h.downloads.length, 0);
});
