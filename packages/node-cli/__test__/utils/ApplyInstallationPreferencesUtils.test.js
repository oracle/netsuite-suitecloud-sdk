/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

const mockProjectInfo = {
	projectType: 'SUITEAPP',
	hasInstallationPreferences: true,
};

jest.mock('../../src/services/ProjectInfoService', () => {
	return jest.fn().mockImplementation(() => ({
		getProjectType: () => mockProjectInfo.projectType,
		hasLockAndHideFiles: () => mockProjectInfo.hasInstallationPreferences,
	}));
});

jest.mock('../../src/services/NodeTranslationService', () => ({
	getMessage: jest.fn((key) => key),
}));

const ApplyInstallationPreferencesUtils = require('../../src/utils/ApplyInstallationPreferencesUtils');
const { PROJECT_ACP, PROJECT_SUITEAPP } = require('../../src/ApplicationConstants');
const {
	UTILS: {
		APPLY_INSTALLATION_PREFERENCES_ARGUMENT_HANDLER: { INSTALLATION_PREFERENCES_ERRORS },
		ERRORS,
	},
} = require('../../src/services/TranslationKeys');

describe('ApplyInstallationPreferencesUtils', () => {
	beforeEach(() => {
		mockProjectInfo.projectType = PROJECT_SUITEAPP;
		mockProjectInfo.hasInstallationPreferences = true;
	});

	it('accepts applying installation preferences to a SuiteApp that defines them', () => {
		expect(() => ApplyInstallationPreferencesUtils.validate(
			{ applyinstallprefs: true },
			'/tmp/project',
			'project:deploy'
		)).not.toThrow();
	});

	it('rejects applying installation preferences to an account customization project', () => {
		mockProjectInfo.projectType = PROJECT_ACP;

		expect(() => ApplyInstallationPreferencesUtils.validate(
			{ applyinstallprefs: true },
			'/tmp/project',
			'project:deploy'
		)).toThrow(INSTALLATION_PREFERENCES_ERRORS.APPLY_INSTALLATION_PREFERENCES_IN_ACP);
	});

	it('rejects applying installation preferences when the SuiteApp does not define them', () => {
		mockProjectInfo.hasInstallationPreferences = false;

		expect(() => ApplyInstallationPreferencesUtils.validate(
			{ applyinstallprefs: true },
			'/tmp/project',
			'project:deploy'
		)).toThrow(ERRORS.COMMAND);
	});
});
