/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

const ManageAccountOutputHandler = require('../../../../src/commands/account/manageauth/ManageAccountOutputHandler');

describe('ManageAccountOutputHandler', () => {
	it('reports when no authentication IDs are configured', () => {
		const log = { result: jest.fn() };
		const outputHandler = new ManageAccountOutputHandler({ log });

		outputHandler.parse({
			actionExecuted: 'list',
			data: {},
		});

		expect(log.result).toHaveBeenCalledTimes(1);
		expect(log.result).toHaveBeenCalledWith('There are no authentication IDs available.');
	});

	it('lists configured authentication IDs without showing the empty-state message', () => {
		const log = { result: jest.fn() };
		const outputHandler = new ManageAccountOutputHandler({ log });

		outputHandler.parse({
			actionExecuted: 'list',
			data: {
				myAuthId: {
					accountInfo: {
						companyName: 'Test Account',
						roleName: 'Administrator',
					},
					hostInfo: { hostName: 'system.netsuite.com' },
				},
			},
		});

		expect(log.result).toHaveBeenCalledTimes(1);
		expect(log.result).toHaveBeenCalledWith(expect.stringContaining('myAuthId'));
		expect(log.result).not.toHaveBeenCalledWith('There are no authentication IDs available.');
	});
});
