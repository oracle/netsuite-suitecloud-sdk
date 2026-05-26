/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const {
	VALIDATE_COMMAND,
	prepareValidateExecution,
} = require('@oracle/suitecloud-sdk-core/commands/project/validate/ValidateHandler');

describe('ValidateHandler', () => {
	it('should prepare server validation execution', () => {
		const execution = prepareValidateExecution({
			server: true,
			applyinstallprefs: true,
			project: '"/tmp/project"',
		});

		expect(execution.flags).toEqual([
			VALIDATE_COMMAND.OPTIONS.SERVER,
			VALIDATE_COMMAND.OPTIONS.APPLY_INSTALLATION_PREFERENCES,
		]);
		expect(execution.isServerValidation).toBe(true);
		expect(execution.installationPreferencesApplied).toBe(true);
		expect(execution.params).toEqual({ project: '"/tmp/project"' });
	});

	it('should prepare local validation execution', () => {
		const execution = prepareValidateExecution({
			project: '"/tmp/project"',
		});

		expect(execution.flags).toEqual([]);
		expect(execution.isServerValidation).toBe(false);
		expect(execution.installationPreferencesApplied).toBe(false);
		expect(execution.params).toEqual({ project: '"/tmp/project"' });
	});
});
