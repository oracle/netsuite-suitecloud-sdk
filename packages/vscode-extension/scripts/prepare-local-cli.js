/*
 ** Copyright (c) 2026 Oracle and/or its affiliates. All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { mkdtempSync, readdirSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { resolve, join } = require('node:path');
const { spawnSync } = require('node:child_process');

const extensionRoot = resolve(__dirname, '..');
const repositoryRoot = resolve(extensionRoot, '../..');
const staging = mkdtempSync(join(tmpdir(), 'suitecloud-vscode-cli-'));

// Use the repository's packaging path so the CLI contains the matching SDK core.
// Avoid postinstall (JAR setup) and preserve the published dependency/lockfile.
try {
	run(['run', 'pack:cli', '--', staging], repositoryRoot);
	const archive = readdirSync(staging).find(name => name.endsWith('.tgz'));
	if (!archive) { throw new Error('Local CLI packaging did not produce an archive.'); }
	run(['install', '--no-save', '--package-lock=false', '--ignore-scripts', '--no-audit', '--no-fund', join(staging, archive)], extensionRoot);
} finally {
	rmSync(staging, { recursive: true, force: true });
}

function run(args, cwd) {
	if (!process.env.npm_execpath) { throw new Error('Run this script through npm run prepare:local-cli.'); }
	const result = spawnSync(process.execPath, [process.env.npm_execpath, ...args], { cwd, stdio: 'inherit' });
	if (result.error) { throw result.error; }
	if (result.status !== 0) { throw new Error(`npm ${args.join(' ')} failed (${result.status}).`); }
}
