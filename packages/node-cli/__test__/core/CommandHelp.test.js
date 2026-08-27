/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

const { spawnSync } = require('node:child_process');
const { join } = require('node:path');

const CommandsMetadataService = require('../../src/core/CommandsMetadataService');

const CLI_PATH = join(__dirname, '..', '..', 'src', 'suitecloud.js');

describe('project command help', () => {
	it('exposes config:import with only its supported options', () => {
		const commandMetadata = new CommandsMetadataService().getCommandMetadataByName('config:import');
		const help = runCli('config:import', '--help');
		const removedAuthIdOption = runCli('config:import', '--authid', 'test-auth');
		const removedConfigurationIdOption = runCli('config:import', '--configurationid');
		expect(commandMetadata.isSetupRequired).toBe(true);
		expect(commandMetadata.options).toEqual({});
		expect(help.status).toBe(0);
		expect(help.stdout).not.toContain('--authid');
		expect(help.stdout).not.toContain('--configurationid');
		expect(help.stdout).not.toContain('--project');
		expect(help.stdout).not.toContain('--interactive');
		expect(removedAuthIdOption.status).toBe(1);
		expect(removedAuthIdOption.stderr).toContain("unknown option '--authid'");
		expect(removedConfigurationIdOption.status).toBe(1);
		expect(removedConfigurationIdOption.stderr).toContain("unknown option '--configurationid'");
	});

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

	it('registers the proxy command with the supported Commander API', () => {
		const proxyHelp = runCli('proxy:start', '--help');

		expect(proxyHelp.status).toBe(0);
		expect(proxyHelp.stdout).toContain('--authid');
		expect(proxyHelp.stdout).toContain('--port');
		expect(proxyHelp.stdout).not.toContain('program.command is not a function');
	});
});

function runCli(...args) {
	return spawnSync(process.execPath, [CLI_PATH, ...args], {
		encoding: 'utf8',
	});
}
