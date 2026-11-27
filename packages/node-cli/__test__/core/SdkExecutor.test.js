/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const SdkExecutor = require('../../src/SdkExecutor');
const NodeTranslationService = require('../../src/services/NodeTranslationService');
const { SDK_COMPATIBLE_JAVA_VERSIONS } = require('../../src/ApplicationConstants');
const { ERRORS } = require('../../src/services/TranslationKeys');

describe('SdkExecutor', () => {
	describe('_checkIfJavaVersionIssue()', () => {
		let sdkExecutor;
		let getMessage;

		beforeEach(() => {
			sdkExecutor = new SdkExecutor('fake-sdk-path.jar');
			jest.spyOn(sdkExecutor._environmentInformationService, 'getInstalledJavaVersionString');
			jest.spyOn(sdkExecutor._environmentInformationService, 'isJavaVersionSupported');
			jest.spyOn(sdkExecutor._CLISettingsService, 'setJavaVersionValid').mockImplementation(() => {});
			getMessage = jest.spyOn(NodeTranslationService, 'getMessage').mockReturnValue('Java compatibility error');
		});

		afterEach(() => {
			jest.restoreAllMocks();
		});

		it.each(['17.0.12', '21.0.7', '25.0.5.0.3'])(
			'marks Java %s as valid without returning an error', (version) => {
				sdkExecutor._environmentInformationService.getInstalledJavaVersionString.mockReturnValue(version);

				expect(sdkExecutor._checkIfJavaVersionIssue()).toBeUndefined();

				expect(sdkExecutor._environmentInformationService.isJavaVersionSupported).toHaveBeenCalledWith(version);
				expect(sdkExecutor._CLISettingsService.setJavaVersionValid).toHaveBeenCalledTimes(1);
				expect(sdkExecutor._CLISettingsService.setJavaVersionValid).toHaveBeenCalledWith(true);
				expect(getMessage).not.toHaveBeenCalled();
			});

		it.each(['11.0.16', '26', '170', '210.1', '250.0.1', '25-ea'])(
			'marks Java %s as invalid and returns the compatibility error', (version) => {
				sdkExecutor._environmentInformationService.getInstalledJavaVersionString.mockReturnValue(version);

				expect(sdkExecutor._checkIfJavaVersionIssue()).toBe('Java compatibility error');

				expect(sdkExecutor._environmentInformationService.isJavaVersionSupported).toHaveBeenCalledWith(version);
				expect(sdkExecutor._CLISettingsService.setJavaVersionValid).toHaveBeenCalledTimes(1);
				expect(sdkExecutor._CLISettingsService.setJavaVersionValid).toHaveBeenCalledWith(false);
				expect(getMessage).toHaveBeenCalledTimes(1);
				expect(getMessage).toHaveBeenCalledWith(
					ERRORS.CLI_SDK_JAVA_VERSION_NOT_COMPATIBLE, version, SDK_COMPATIBLE_JAVA_VERSIONS.join(', '));
			});

		it('marks missing Java as invalid and returns the installation error', () => {
			sdkExecutor._environmentInformationService.getInstalledJavaVersionString.mockReturnValue('');

			expect(sdkExecutor._checkIfJavaVersionIssue()).toBe('Java compatibility error');

			expect(sdkExecutor._environmentInformationService.isJavaVersionSupported).toHaveBeenCalledWith('');
			expect(sdkExecutor._CLISettingsService.setJavaVersionValid).toHaveBeenCalledTimes(1);
			expect(sdkExecutor._CLISettingsService.setJavaVersionValid).toHaveBeenCalledWith(false);
			expect(getMessage).toHaveBeenCalledTimes(1);
			expect(getMessage).toHaveBeenCalledWith(
				ERRORS.CLI_SDK_JAVA_VERSION_NOT_INSTALLED, SDK_COMPATIBLE_JAVA_VERSIONS.join(', '));
		});
	});

	describe('_splitParameters()', () => {
		let sdkExecutor;

		beforeEach(() => {
			sdkExecutor = new SdkExecutor('fake-sdk-path.jar');
		});

		it.each([
			['undefined value', undefined, []],
			['null value', null, []],
			['empty string', '', []],
			['whitespace only', '   ', []],
			['whitespace-separated values', 'one two three', ['one', 'two', 'three']],
			['double-quoted group preserved as a single value', 'one "two three" four', ['one', '"two three"', 'four']],
			['single double-quoted group', '"one two"', ['"one two"']],
			['outer whitespace trimmed before splitting', '  one  "two three"   four  ', ['one', '"two three"', 'four']],
			['unterminated quoted group returns original value', 'abc "unterminated', ['abc "unterminated']],
			['quotes inside invalid token return original value', 'abc "bad"quote', ['abc "bad"quote']],
		])('should return expected result for %s', (_, value, expected) => {
			expect(sdkExecutor._splitParameters(value)).toStrictEqual(expected);
		});
	});
});