/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const DeployOutputHandler = require('../../../../src/commands/project/deploy/DeployOutputHandler');

function createLogMock() {
	return {
		error: jest.fn(),
		info: jest.fn(),
		plain: jest.fn(),
		result: jest.fn(),
		warning: jest.fn(),
	};
}

describe('DeployOutputHandler', () => {
	it.each([
		{ outputMethod: 'parse', appliedInstallationPreferences: true, expectedState: 'selected' },
		{ outputMethod: 'parseError', appliedInstallationPreferences: true, expectedState: 'selected' },
		{ outputMethod: 'parse', appliedInstallationPreferences: false, expectedState: 'not selected' },
		{ outputMethod: 'parseError', appliedInstallationPreferences: false, expectedState: 'not selected' },
	])('reports installation preferences through $outputMethod when they are $expectedState', ({
		outputMethod,
		appliedInstallationPreferences,
		expectedState,
	}) => {
		const log = createLogMock();
		const outputHandler = new DeployOutputHandler({ executionPath: '/tmp/project', log });

		outputHandler[outputMethod]({
			appliedInstallationPreferences,
			data: ['DEPLOY SUMMARY'],
			errorMessages: ['Validation failed'],
			projectFolder: '/tmp/project/src',
			projectType: 'SUITEAPP',
		});

		expect(log.info).toHaveBeenCalledWith(
			`The "Apply Installation Preferences" option was ${expectedState} for the "/tmp/project" project.`
		);
	});

	it('does not report installation preferences for an ACP', () => {
		const log = createLogMock();
		const outputHandler = new DeployOutputHandler({ executionPath: '/tmp/project', log });

		outputHandler.parse({
			appliedInstallationPreferences: false,
			data: ['DEPLOY SUMMARY'],
			projectFolder: '/tmp/project',
			projectType: 'ACCOUNTCUSTOMIZATION',
		});

		expect(log.info).not.toHaveBeenCalledWith(expect.stringContaining('Apply Installation Preferences'));
	});

	it.each(['parse', 'parseError'])('does not add installation preferences to raw output through %s', (outputMethod) => {
		const log = createLogMock();
		const outputHandler = new DeployOutputHandler({ executionPath: '/tmp/project', log });

		outputHandler[outputMethod]({
			appliedInstallationPreferences: true,
			commandParameters: { json: true },
			data: { status: 'SUCCESS' },
			errorMessages: ['Validation failed'],
			projectFolder: '/tmp/project',
			projectType: 'SUITEAPP',
		});

		expect(log.info).not.toHaveBeenCalledWith(expect.stringContaining('Installation Preferences'));
		expect(log.plain).toHaveBeenCalledTimes(1);
	});
});
