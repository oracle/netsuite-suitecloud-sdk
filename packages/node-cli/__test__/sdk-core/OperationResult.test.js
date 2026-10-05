/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const sdkCore = require('@oracle/suitecloud-sdk-core');

describe('sdk-core operation status', () => {
	it('uses one status object across every command family', () => {
		const { commands } = sdkCore;

		expect(commands.FILE_COMMAND_STATUS).toBe(commands.SDK_OPERATION_STATUS);
		expect(commands.OBJECT_COMMAND_STATUS).toBe(commands.SDK_OPERATION_STATUS);
		expect(commands.FILE_CREATE_STATUS).toBe(commands.SDK_OPERATION_STATUS);
		expect(commands.CREATE_PROJECT_OPERATION_STATUS).toBe(commands.SDK_OPERATION_STATUS);
		expect(commands.PACKAGE_PROJECT_OPERATION_STATUS).toBe(commands.SDK_OPERATION_STATUS);
	});
});
