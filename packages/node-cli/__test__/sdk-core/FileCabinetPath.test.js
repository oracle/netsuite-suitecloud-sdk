/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const {
	isValidImportFileCabinetPath,
} = require('../../../sdk-core/build/commands/file/FileCabinetPath');

describe('FileCabinetPath', () => {
	it('allows SuiteApp paths only when explicitly requested', () => {
		const suiteAppPath = '/SuiteApps/com.example.app/example.js';

		expect(isValidImportFileCabinetPath(suiteAppPath)).toBe(false);
		expect(isValidImportFileCabinetPath(suiteAppPath, true)).toBe(true);
	});
});
