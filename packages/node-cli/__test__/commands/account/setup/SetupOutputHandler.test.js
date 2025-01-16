/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

'use strict';

const AuthenticateActionResult = require('../../../../src/services/actionresult/AuthenticateActionResult');
const SetupOutputHandler = require('../../../../src/commands/account/setup/SetupOutputHandler');

const AUTH_MODE = {
	OAUTH: 'OAUTH',
	REUSE: 'REUSE',
};

const accountInfoMock = {
	companyName: 'companyName',
	roleName: 'roleName',
	authId: 'authId',
};

describe('parse()', () => {
	const originalProcessEnv = process.env;

	let setupOutputHandler;
	let consoleLoggerResultMock = jest.fn();
	let consoleoggerWarningMock = jest.fn();

	beforeEach(() => {
		consoleLoggerResultMock = jest.fn();
		consoleoggerWarningMock = jest.fn();
		const ConsoleLogger = jest.fn(() => ({
			result: consoleLoggerResultMock,
			warning: consoleoggerWarningMock,
		}));
		setupOutputHandler = new SetupOutputHandler({ log: new ConsoleLogger() });
	});

	describe('log result with password rotation warning', () => {
		beforeEach(() => {
			process.env = {
				...originalProcessEnv,
				SUITECLOUD_FALLBACK_PASSKEY: 'SUITECLOUD_FALLBACK_PASSKEY',
			}
		});

		afterEach(() => {
			process.env = originalProcessEnv;
		});

		it.each([['new', AUTH_MODE.OAUTH], ['reuse', AUTH_MODE.OAUTH]])('should show %s authorization result and password rotation warning', (modeString, mode) => {
			const authenticateActionResult = AuthenticateActionResult.Builder.success()
				.withMode(mode)
				.withAuthId('authId')
				.withAccountInfo(accountInfoMock)
				.build();

			setupOutputHandler.parse(authenticateActionResult);

			expect(consoleLoggerResultMock).toHaveBeenNthCalledWith(1, 'The account has been authenticated for the following company and role: companyName [roleName]. This project will use the authentication ID "authId" as default. If you want to change your default credentials, run "suitecloud account:setup" again.',);
			expect(consoleLoggerResultMock).toHaveBeenNthCalledWith(2, 'The account has been successfully set up.')
			expect(consoleoggerWarningMock).toHaveBeenNthCalledWith(1, 'Authentication is currently using the credentials passkey in fallback mode. If you choose to continue using fallback mode, you should update the passkey regularly.\n' +
				'For enhanced security, consider setting up secure storage in your system.\n' +
				'For more information, see https://system.netsuite.com/app/help/helpcenter.nl?fid=article_1024042128.html#subsect_83104357122.');
		});
	});

	it.each([['new', AUTH_MODE.OAUTH], ['reuse', AUTH_MODE.OAUTH]])('should show %s authorization result without password rotation warning', (modeString, mode) => {
		const authenticateActionResult = AuthenticateActionResult.Builder.success()
			.withMode(mode)
			.withAuthId('authId')
			.withAccountInfo(accountInfoMock)
			.build();

		setupOutputHandler.parse(authenticateActionResult);

		expect(consoleLoggerResultMock).toHaveBeenNthCalledWith(1, 'The account has been authenticated for the following company and role: companyName [roleName]. This project will use the authentication ID "authId" as default. If you want to change your default credentials, run "suitecloud account:setup" again.',);
		expect(consoleLoggerResultMock).toHaveBeenNthCalledWith(2, 'The account has been successfully set up.')
		expect(consoleoggerWarningMock).toHaveBeenCalledTimes(0);
	});
});
