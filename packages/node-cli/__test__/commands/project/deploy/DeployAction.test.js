/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

jest.mock('../../../../src/services/ProjectInfoService', () => {
	return jest.fn().mockImplementation(() => ({
		getProjectType: () => 'ACCOUNTCUSTOMIZATION',
		getProjectName: () => 'My Project',
	}));
});

jest.mock('../../../../src/services/NodeTranslationService', () => ({
	getMessage: jest.fn((key) => key),
}));

jest.mock('../../../../src/utils/AuthenticationUtils', () => ({
	getProjectDefaultAuthId: jest.fn(() => 'myAuth'),
}));

const DeployAction = require('../../../../src/commands/project/deploy/DeployAction');
const NodeTranslationService = require('../../../../src/services/NodeTranslationService');

describe('DeployAction ignored options', () => {
	beforeEach(() => {
		NodeTranslationService.getMessage.mockClear();
	});

	it('warns and ignores --validate without disrupting deployment', async () => {
		const warning = jest.fn();
		const deployAction = new DeployAction({
			projectFolder: '/tmp/project',
			commandMetadata: { name: 'project:deploy', options: {} },
			executionPath: '/tmp/project',
			log: { warning, info: jest.fn() },
		});
		deployAction._deploy = jest.fn().mockResolvedValue({ status: 'SUCCESS' });

		const result = await deployAction.execute({ validate: true, project: '"/tmp/project"' });

		expect(warning).toHaveBeenCalledWith('COMMAND_DEPLOY_WARNINGS_VALIDATE_OPTION_IGNORED');
		expect(deployAction._deploy).toHaveBeenCalledWith(
			{ project: '"/tmp/project"' },
			['no_preview', 'skip_warning']
		);
		expect(result).toEqual({ status: 'SUCCESS' });
	});

	it('warns and preserves --dryrun preview when --validate is also provided', async () => {
		const warning = jest.fn();
		const deployAction = new DeployAction({
			projectFolder: '/tmp/project',
			commandMetadata: { name: 'project:deploy', options: {} },
			executionPath: '/tmp/project',
			log: { warning, info: jest.fn() },
		});
		deployAction._preview = jest.fn().mockResolvedValue({ status: 'SUCCESS' });

		const result = await deployAction.execute({ dryrun: true, validate: true, project: '"/tmp/project"' });

		expect(warning).toHaveBeenCalledWith('COMMAND_DEPLOY_WARNINGS_VALIDATE_OPTION_IGNORED');
		expect(deployAction._preview).toHaveBeenCalledWith({ project: '"/tmp/project"' }, []);
		expect(result).toEqual({ status: 'SUCCESS' });
	});

	it('uses the project name in the ACP deployment spinner', async () => {
		const deployAction = new DeployAction({
			projectFolder: '/tmp/project',
			commandMetadata: { name: 'project:deploy', options: { project: {}, authid: {} } },
			executionPath: '/tmp/project',
			log: { warning: jest.fn(), info: jest.fn() },
		});
		deployAction._executeProjectCommandWithAuthRetry = jest.fn().mockResolvedValue({
			status: 'SUCCESS',
			data: [],
		});

		await deployAction._deploy({ project: '"/tmp/project"', authid: 'myAuth' }, []);

		expect(NodeTranslationService.getMessage).toHaveBeenCalledWith(
			'COMMAND_DEPLOY_MESSAGES_DEPLOYING',
			'My Project',
			'myAuth'
		);
	});
});
