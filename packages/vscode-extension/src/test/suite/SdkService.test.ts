/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as assert from 'assert';
import SdkService from '../../controlPanel/developerAssistant/sdk/SdkService';
import { AuthenticationUtils } from '../../util/ExtensionUtil';

const originalCheckIfReauthorizationIsNeeded =
	AuthenticationUtils.checkIfReauthorizationIsNeeded;
const originalRefreshAuthorization = AuthenticationUtils.refreshAuthorization;

suite('Control Panel SDK Service', () => {
	teardown(() => {
		AuthenticationUtils.checkIfReauthorizationIsNeeded =
			originalCheckIfReauthorizationIsNeeded;
		AuthenticationUtils.refreshAuthorization = originalRefreshAuthorization;
	});

	test('continues without browser reauthorization when credentials are valid', async () => {
		let refreshCount = 0;
		let reauthorizationRequiredCount = 0;
		AuthenticationUtils.checkIfReauthorizationIsNeeded = async () => ({
			status: 'SUCCESS',
			resultMessage: '',
			errorMessages: [],
			data: { needsReauthorization: false },
			isSuccess: () => true,
		});
		AuthenticationUtils.refreshAuthorization = async () => {
			refreshCount += 1;
			return {
				status: 'SUCCESS',
				data: null,
				errorCode: undefined,
				errorMessages: [],
				isSuccess: () => true,
			};
		};

		await new SdkService().ensureAuthorizationReady('account', () => {
			reauthorizationRequiredCount += 1;
		});

		assert.strictEqual(reauthorizationRequiredCount, 0);
		assert.strictEqual(refreshCount, 0);
	});

	test('waits for browser reauthorization when credentials have expired', async () => {
		const calls: string[] = [];
		AuthenticationUtils.checkIfReauthorizationIsNeeded = async () => ({
			status: 'SUCCESS',
			resultMessage: '',
			errorMessages: [],
			data: { needsReauthorization: true },
			isSuccess: () => true,
		});
		AuthenticationUtils.refreshAuthorization = async () => {
			calls.push('refreshAuthorization');
			return {
				status: 'SUCCESS',
				data: null,
				errorCode: undefined,
				errorMessages: [],
				isSuccess: () => true,
			};
		};

		await new SdkService().ensureAuthorizationReady('account', () => {
			calls.push('reauthorizationRequired');
		});

		assert.deepStrictEqual(calls, [
			'reauthorizationRequired',
			'refreshAuthorization',
		]);
	});

	test('does not continue when authorization inspection fails', async () => {
		AuthenticationUtils.checkIfReauthorizationIsNeeded = async () => ({
			status: 'ERROR',
			resultMessage: '',
			errorMessages: ['Authorization inspection failed.'],
			data: {},
			isSuccess: () => false,
		});

		await assert.rejects(
			new SdkService().ensureAuthorizationReady('account', () => undefined),
			/Authorization inspection failed/
		);
	});
});
