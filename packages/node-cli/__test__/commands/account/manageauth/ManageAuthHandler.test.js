/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const {
	MANAGE_AUTH_ACTION,
	MANAGE_AUTH_VALIDATION_ERROR,
	selectManageAuthAction,
	prepareManageAuthInfoData,
	prepareManageAuthActionData,
} = require('@oracle/suitecloud-sdk-core/commands/account/manageauth/ManageAuthHandler');

describe('ManageAuthHandler', () => {
	it('should select list action', () => {
		const selectedAction = selectManageAuthAction({ list: true });
		expect(selectedAction.action).toBe(MANAGE_AUTH_ACTION.LIST);
	});

	it('should fail when more than one option is provided', () => {
		const selectedAction = selectManageAuthAction({ list: true, info: 'myAuth' });
		expect(selectedAction.validationError.errorCode).toBe(MANAGE_AUTH_VALIDATION_ERROR.ONLY_ONE_OPTION_ALLOWED);
	});

	it('should fail when renameto is missing', () => {
		const selectedAction = selectManageAuthAction({ rename: 'oldAuth' });
		expect(selectedAction.validationError.errorCode).toBe(MANAGE_AUTH_VALIDATION_ERROR.MISSING_OPTION);
		expect(selectedAction.validationError.missingOption).toBe('renameto');
	});

	it('should fail when rename is missing', () => {
		const selectedAction = selectManageAuthAction({ renameto: 'newAuth' });
		expect(selectedAction.validationError.errorCode).toBe(MANAGE_AUTH_VALIDATION_ERROR.MISSING_OPTION);
		expect(selectedAction.validationError.missingOption).toBe('rename');
	});

	it('should prepare info data with domain', () => {
		const selectedAction = { action: MANAGE_AUTH_ACTION.INFO, authId: 'myAuth' };
		const data = {
			accountInfo: { companyName: 'My Co', roleName: 'Admin' },
			hostInfo: { hostName: 'system.netsuite.com' },
		};

		const preparedData = prepareManageAuthInfoData(selectedAction, data);

		expect(preparedData).toEqual({
			authId: 'myAuth',
			accountInfo: { companyName: 'My Co', roleName: 'Admin' },
			domain: 'system.netsuite.com',
		});
	});

	it('should sanitize list data by removing token fields', () => {
		const selectedAction = { action: MANAGE_AUTH_ACTION.LIST };
		const data = {
			myAuth: {
				accountInfo: { companyName: 'My Co', roleName: 'Admin' },
				hostInfo: { hostName: 'system.netsuite.com' },
				token: { accessToken: 'secret-token' },
			},
		};

		const preparedData = prepareManageAuthActionData(selectedAction, data);

		expect(preparedData).toEqual({
			myAuth: {
				accountInfo: { companyName: 'My Co', roleName: 'Admin' },
				hostInfo: { hostName: 'system.netsuite.com' },
			},
		});
		expect(preparedData.myAuth.token).toBeUndefined();
	});
});
