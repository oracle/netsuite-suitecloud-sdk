/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const {
	DEPLOY_MODE,
	DEPLOY_COMMAND,
	getPreviewCommandName,
	prepareDeployExecution,
	isApplyInstallationPreferencesForDeploy,
} = require('@oracle/suitecloud-sdk-core').commands;

describe('DeployHandler', () => {
	it('should prepare default deploy execution', () => {
		const execution = prepareDeployExecution({ project: '"/tmp/project"' });

		expect(execution.mode).toBe(DEPLOY_MODE.DEPLOY);
		expect(execution.flags).toEqual([DEPLOY_COMMAND.FLAGS.NO_PREVIEW, DEPLOY_COMMAND.FLAGS.SKIP_WARNING]);
		expect(execution.params).toEqual({ project: '"/tmp/project"' });
	});

	it('should prepare preview execution', () => {
		const execution = prepareDeployExecution({ dryrun: true, project: '"/tmp/project"' });

		expect(execution.mode).toBe(DEPLOY_MODE.PREVIEW);
		expect(execution.flags).toEqual([]);
		expect(execution.params).toEqual({ project: '"/tmp/project"' });
	});

	it('should ignore the validate option', () => {
		const execution = prepareDeployExecution({ validate: true, project: '"/tmp/project"' });

		expect(execution.mode).toBe(DEPLOY_MODE.DEPLOY);
		expect(execution.flags).toEqual([DEPLOY_COMMAND.FLAGS.NO_PREVIEW, DEPLOY_COMMAND.FLAGS.SKIP_WARNING]);
		expect(execution.params).toEqual({ project: '"/tmp/project"' });
	});

	it('should expose preview command name', () => {
		expect(getPreviewCommandName()).toBe('preview');
	});

	it('should detect apply installation preferences only for suiteapp', () => {
		const result = isApplyInstallationPreferencesForDeploy(
			'SUITEAPP',
			[DEPLOY_COMMAND.FLAGS.APPLY_INSTALLATION_PREFERENCES],
			'SUITEAPP'
		);
		expect(result).toBe(true);
	});
});
