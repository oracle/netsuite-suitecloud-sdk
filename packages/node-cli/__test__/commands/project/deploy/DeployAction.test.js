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

const DeployAction = require('../../../../src/commands/project/deploy/DeployAction');

describe('DeployAction ignored options', () => {
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
});
