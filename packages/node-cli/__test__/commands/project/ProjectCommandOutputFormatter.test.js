/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const {
	isRawOutputRequested,
	logCommandOutput,
	logCommandErrors,
	logRawOutput,
} = require('../../../src/commands/project/ProjectCommandOutputFormatter');

function createLogMock() {
	return {
		info: jest.fn(),
		plain: jest.fn(),
		result: jest.fn(),
		warning: jest.fn(),
		error: jest.fn(),
	};
}

describe('ProjectCommandOutputFormatter', () => {
	it('should detect raw output request from command parameters', () => {
		expect(isRawOutputRequested({ commandParameters: { json: true } })).toBe(true);
		expect(isRawOutputRequested({ commandParameters: {} })).toBe(false);
	});

	it('should classify output lines by level for formatted project output', () => {
		const log = createLogMock();
		logCommandOutput(log, [
			'DEPLOY SUMMARY',
			'Status: SUCCESS',
			'Steps: 2/2 successful',
			'Validation Results: 0 error(s), 0 warning(s)',
			'SDF Errors: none',
			'------------------------------------------------------------',
			'✔ Step 1: MANIFEST_VALIDATION',
			'WARNING: Warning message',
			'ERROR: Error message',
			'✖ Step 2: DEPLOY',
			'Custom line',
		]);

		expect(log.info).toHaveBeenCalledWith('DEPLOY SUMMARY');
		expect(log.result).toHaveBeenCalledWith('Status: SUCCESS');
		expect(log.result).toHaveBeenCalledWith('✔ Step 1: MANIFEST_VALIDATION');
		expect(log.warning).toHaveBeenCalledWith('WARNING: Warning message');
		expect(log.error).toHaveBeenCalledWith('ERROR: Error message');
		expect(log.error).toHaveBeenCalledWith('✖ Step 2: DEPLOY');
		expect(log.result).toHaveBeenCalledWith('Custom line');
	});

	it('should print raw JSON payload directly', () => {
		const log = createLogMock();
		logRawOutput(log, { status: 'ok' }, false);
		expect(log.plain).toHaveBeenCalledWith('{\n  "status": "ok"\n}');
	});

	it('should classify error lines for formatted project output', () => {
		const log = createLogMock();
		logCommandErrors(log, ['Status: FAILED', 'ERROR: Endpoint error']);
		expect(log.error).toHaveBeenCalledWith('Status: FAILED');
		expect(log.error).toHaveBeenCalledWith('ERROR: Endpoint error');
	});
});
