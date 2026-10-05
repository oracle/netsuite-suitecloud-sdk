/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

const { spawnSync } = require('node:child_process');
const { join } = require('node:path');

const CLI_PATH = join(__dirname, '..', '..', 'src', 'suitecloud.js');

describe('project command help', () => {
	it('does not expose obsolete local-validation switches', () => {
		const deployHelp = runCli('project:deploy', '--help');
		const validateHelp = runCli('project:validate', '--help');
		const deployLegacyOption = runCli('project:deploy', '--validate', '--help');
		const validateLegacyOption = runCli('project:validate', '--server', '--help');

		expect(deployHelp.status).toBe(0);
		expect(deployHelp.stdout).not.toContain('--validate');
		expect(deployHelp.stdout).toContain('--dryrun');
		expect(validateHelp.status).toBe(0);
		expect(validateHelp.stdout).not.toContain('--server');
		expect(validateHelp.stdout).toContain('--accountspecificvalues');
		expect(deployLegacyOption.status).toBe(0);
		expect(validateLegacyOption.status).toBe(0);
	});
});

function runCli(...args) {
	return spawnSync(process.execPath, [CLI_PATH, ...args], {
		encoding: 'utf8',
	});
}
