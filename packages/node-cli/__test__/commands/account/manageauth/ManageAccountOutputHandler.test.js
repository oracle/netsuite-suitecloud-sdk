/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

const ManageAccountOutputHandler = require('../../../../src/commands/account/manageauth/ManageAccountOutputHandler');

describe('ManageAccountOutputHandler', () => {
	it('reports when no authentication IDs are configured', () => {
		const log = { info: jest.fn(), result: jest.fn() };
		const outputHandler = new ManageAccountOutputHandler({ log });

		outputHandler.parse({
			actionExecuted: 'list',
			data: {},
		});

		expect(log.info).toHaveBeenCalledTimes(1);
		expect(log.info).toHaveBeenCalledWith('There are no authentication IDs available.');
		expect(log.result).not.toHaveBeenCalled();
	});
});
