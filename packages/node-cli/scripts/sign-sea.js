/*
 ** Copyright (c) 2026 Oracle and/or its affiliates. All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { parseTargets } = require('./build-sea');
const dist = path.resolve(__dirname, '../dist');

function required(env, name) {
	if (!env[name]) throw new Error(`Set ${name} before signing. See the CLI README signing instructions.`);
	return env[name];
}

function signingPlan(target, file, env) {
	if (target.startsWith('win32-')) {
		const jar = path.resolve(required(env, 'SUITECLOUD_JSIGN_JAR'));
		const args = ['-jar', jar, '--keystore', required(env, 'SUITECLOUD_SIGN_KEYSTORE'),
			'--alias', required(env, 'SUITECLOUD_SIGN_ALIAS'), '--alg', 'SHA-256', '--replace',
			'--tsaurl', required(env, 'SUITECLOUD_SIGN_TSA_URL'), '--tsmode', 'RFC3161'];
		for (const [option, variable] of [['--storetype', 'SUITECLOUD_SIGN_STORETYPE'], ['--certfile', 'SUITECLOUD_SIGN_CERTFILE']]) {
			if (env[variable]) args.push(option, env[variable]);
		}
		// Jsign resolves these references itself; secrets never appear in command arguments.
		if (env.SUITECLOUD_SIGN_STOREPASS) args.push('--storepass', 'env:SUITECLOUD_SIGN_STOREPASS');
		if (env.SUITECLOUD_SIGN_KEYPASS) args.push('--keypass', 'env:SUITECLOUD_SIGN_KEYPASS');
		args.push(file);
		return [{ command: env.SUITECLOUD_JAVA || 'java', args }];
	}
	if (target.startsWith('linux-')) {
		const key = required(env, 'SUITECLOUD_GPG_KEY');
		if (!/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i.test(key)) throw new Error('SUITECLOUD_GPG_KEY must be a full key fingerprint.');
		const command = env.SUITECLOUD_GPG || 'gpg';
		return [
			{ command, args: ['--batch', '--yes', '--armor', '--digest-algo', 'SHA256', '--local-user', key,
				'--output', `${file}.asc`, '--detach-sign', file] },
			{ command, args: ['--batch', '--verify', `${file}.asc`, file] },
		];
	}
	throw new Error(`Signing ${target} is not supported here; macOS uses codesign.`);
}

function run(step, env) {
	const result = spawnSync(step.command, step.args, { env, stdio: 'inherit', shell: false });
	if (result.error) throw new Error(`Cannot start signing tool ${step.command}: ${result.error.code}`);
	if (result.status !== 0) throw new Error(`Signing tool failed (exit ${result.status ?? 'signal'}). Output was not published.`);
}

function signExecutables(args, env = process.env, execute = run, outputRoot = dist) {
	const targets = parseTargets(args.length ? args : ['win32-x64,linux-x64']);
	// Validate every target and credential setting before modifying any output.
	const jobs = targets.map((target) => {
		const file = path.join(outputRoot, target, target.startsWith('win32-') ? 'suitecloud.exe' : 'suitecloud');
		signingPlan(target, file, env);
		fs.accessSync(file, fs.constants.R_OK);
		if (target.startsWith('win32-')) fs.accessSync(path.resolve(env.SUITECLOUD_JSIGN_JAR), fs.constants.R_OK);
		return { target, file };
	});
	for (const { target, file } of jobs) {
		const temporary = fs.mkdtempSync(path.join(path.dirname(file), '.sign-'));
		try {
			const staged = path.join(temporary, path.basename(file));
			fs.copyFileSync(file, staged);
			for (const step of signingPlan(target, staged, env)) execute(step, env);
			if (target.startsWith('win32-')) {
				fs.renameSync(staged, file);
			} else {
				fs.renameSync(`${staged}.asc`, `${file}.asc`);
			}
			console.log(`Signed ${file}${target.startsWith('linux-') ? ' (detached .asc signature verified)' : ''}`);
		} finally {
			const resolved = path.resolve(temporary);
			if (!resolved.startsWith(`${path.dirname(file)}${path.sep}.sign-`)) throw new Error('Unexpected signing temporary directory.');
			fs.rmSync(resolved, { recursive: true, force: true });
		}
	}
}

if (require.main === module) {
	try { signExecutables(process.argv.slice(2)); }
	catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { signingPlan, signExecutables };
