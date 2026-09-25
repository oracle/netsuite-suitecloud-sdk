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
		styled: jest.fn(),
		result: jest.fn(),
		warning: jest.fn(),
		error: jest.fn(),
	};
}

describe('ProjectCommandOutputFormatter', () => {
	it.each([logCommandOutput, logCommandErrors])('styles check boundaries and the skip hint without leaking SDF warning colors (%#)', logOutput => {
		const log = createLogMock();
		const separator = '------------------------------------------------------------';
		const hint = 'To run SDF validation only, use project:validate --skip-analysis.';
		logOutput(log, ['SDF validation', 'SDF validation: PASSED', 'Issues by file:',
			'1. Objects/example.xml (0 error(s), 1 warning(s))', '  - WARNING: SDF warning', '', separator,
			'SuiteApp analysis', 'SuiteApp Analyzer: COMPLETED', '0 errors · 1 warning', hint]);
		expect(log.styled).toHaveBeenCalledWith([{ text: 'SDF validation', style: 'bold' }]);
		expect(log.styled).toHaveBeenCalledWith([{ text: 'SDF validation: PASSED', style: 'result' }]);
		expect(log.styled).toHaveBeenCalledWith([{ text: separator, style: 'dim' }]);
		expect(log.styled).toHaveBeenCalledWith([{ text: 'SuiteApp analysis', style: 'bold' }]);
		expect(log.styled).toHaveBeenLastCalledWith([{ text: hint, style: 'dim' }]);
		expect(log.warning).not.toHaveBeenCalledWith(separator);
		expect(log.warning).not.toHaveBeenCalledWith('SuiteApp analysis');
	});

	it('styles an SDF failure independently of completed analysis', () => {
		const log = createLogMock();
		logCommandErrors(log, ['SDF validation', 'SDF validation: FAILED', 'SuiteApp analysis', 'SuiteApp Analyzer: COMPLETED']);
		expect(log.styled).toHaveBeenCalledWith([{ text: 'SDF validation: FAILED', style: 'error' }]);
		expect(log.styled).toHaveBeenCalledWith([{ text: 'SuiteApp Analyzer: COMPLETED', style: 'bold' }]);
	});

	it('resets warning-only file styling before the analyzer summary', () => {
		const log = createLogMock();
		logCommandOutput(log, ['Issues by file:', '1. Objects/example.xml (0 error(s), 1 warning(s))',
			'SUITEAPP ANALYZER SUMMARY', 'Analyzer findings: 1 error(s), 0 warning(s), 0 note(s), 0 none-level result(s)',
			'ERROR: [public-record] Restrict access.']);
		expect(log.styled).toHaveBeenCalledWith([{ text: 'SUITEAPP ANALYZER SUMMARY', style: 'bold' }]);
		expect(log.styled).toHaveBeenCalledWith([{ text: '' }, { text: 'ERROR:', style: 'error' }, { text: ' [public-record] Restrict access.' }]);
		expect(log.warning).not.toHaveBeenCalledWith('ERROR: [public-record] Restrict access.');
	});

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
			'Timestamp: Jul 23, 2026, 3:41:35 PM GMT+2',
			'Account ID: 1234567',
			'Apply Installation Preferences: Yes',
			'------------------------------------------------------------',
			'✔ Step 1: MANIFEST_VALIDATION',
			'WARNING: Warning message',
			'ERROR: Error message',
			'✖ Step 2: DEPLOY',
			'Custom line',
		]);

		expect(log.info).toHaveBeenCalledWith('DEPLOY SUMMARY');
		expect(log.info).toHaveBeenCalledWith('Timestamp: Jul 23, 2026, 3:41:35 PM GMT+2');
		expect(log.info).toHaveBeenCalledWith('Account ID: 1234567');
		expect(log.info).toHaveBeenCalledWith('Apply Installation Preferences: Yes');
		expect(log.result).toHaveBeenCalledWith('Status: SUCCESS');
		expect(log.result).toHaveBeenCalledWith('✔ Step 1: MANIFEST_VALIDATION');
		expect(log.warning).toHaveBeenCalledWith('WARNING: Warning message');
		expect(log.error).toHaveBeenCalledWith('ERROR: Error message');
		expect(log.error).toHaveBeenCalledWith('✖ Step 2: DEPLOY');
		expect(log.result).toHaveBeenCalledWith('Custom line');
	});

	it('should classify warning-only issues by file as warnings', () => {
		const log = createLogMock();
		logCommandOutput(log, [
			'Issues by file:',
			'1. FileCabinet/SuiteScripts/example.js (0 error(s), 1 warning(s))',
			'   - WARNING: Avoid using deprecated API.',
		]);

		expect(log.warning).toHaveBeenCalledWith('1. FileCabinet/SuiteScripts/example.js (0 error(s), 1 warning(s))');
		expect(log.warning).toHaveBeenCalledWith('   - WARNING: Avoid using deprecated API.');
		expect(log.info).toHaveBeenCalledWith('Issues by file:');
		expect(log.error).not.toHaveBeenCalled();
	});

	it('should print raw JSON payload directly', () => {
		const log = createLogMock();
		logRawOutput(log, { status: 'ok' }, false);
		expect(log.plain).toHaveBeenCalledWith('{\n  "status": "ok"\n}');
	});

	it('should classify error lines for formatted project output', () => {
		const log = createLogMock();
		logCommandErrors(log, [
			'Status: FAILED',
			'  - ERROR: Endpoint error',
			'  - WARNING: Validation warning',
		]);
		expect(log.error).toHaveBeenCalledWith('Status: FAILED');
		expect(log.error).toHaveBeenCalledWith('  - ERROR: Endpoint error');
		expect(log.warning).toHaveBeenCalledWith('  - WARNING: Validation warning');
		expect(log.error).not.toHaveBeenCalledWith('  - WARNING: Validation warning');
	});
});

it('uses neutral descriptions and warning labels for analysis even after SDF failure', () => {
	const log = createLogMock();
	logCommandErrors(log, ['Status: FAILED', 'SuiteApp Analyzer: COMPLETED', 'SUITEAPP ANALYZER SUMMARY', 'Objects/a.xml', '  WARNING: Sensitive field', '    Use API secret.', '    Rule: sensitive-field']);
	expect(log.error).toHaveBeenCalledWith('Status: FAILED');
	expect(log.styled).toHaveBeenCalledWith([{ text: '  ' }, { text: 'WARNING:', style: 'warning' }, { text: ' Sensitive field' }]);
	expect(log.styled).toHaveBeenCalledWith([{ text: 'Objects/a.xml', style: 'bold' }]);
	expect(log.styled).toHaveBeenCalledWith([{ text: '    Use API secret.', style: undefined }]);
	expect(log.info).not.toHaveBeenCalled();
});

it('keeps analysis prose neutral and limits color to completion, labels and nonzero counts', () => {
	const log = createLogMock();
	logCommandOutput(log, ['SuiteApp analysis completed', '0 errors · 8 warnings', '', 'Objects/a.xml',
		'  WARNING: Sensitive field', '    Use API secret.', '    Rule: sensitive-field',
		'Analyzer findings are advisory. Analysis does not establish deployment readiness.']);
	expect(log.styled).toHaveBeenCalledWith([{ text: 'SuiteApp analysis completed', style: 'result' }]);
	expect(log.styled).toHaveBeenCalledWith([{ text: '0 errors', style: undefined }, { text: ' · ' }, { text: '8 warnings', style: 'warning' }]);
	expect(log.styled).toHaveBeenCalledWith([{ text: '    Rule: sensitive-field', style: 'dim' }]);
	expect(log.styled).toHaveBeenLastCalledWith([{ text: 'Analyzer findings are advisory. Analysis does not establish deployment readiness.', style: 'dim' }]);
	expect(log.info).not.toHaveBeenCalled();
	expect(log.result).not.toHaveBeenCalled();
});

it('keeps failures red, notes dim, and descriptions neutral', () => {
	const log = createLogMock();
	logCommandErrors(log, ['SuiteApp analysis failed', '1 error · 0 warnings · 1 note', '  ERROR: Public record', '    Restrict access.', '  NOTE: Review settings']);
	expect(log.styled).toHaveBeenCalledWith([{ text: 'SuiteApp analysis failed', style: 'error' }]);
	expect(log.styled).toHaveBeenCalledWith([{ text: '1 error', style: 'error' }, { text: ' · ' }, { text: '0 warnings', style: undefined }, { text: ' · ' }, { text: '1 note', style: undefined }]);
	expect(log.styled).toHaveBeenCalledWith([{ text: '    Restrict access.', style: undefined }]);
	expect(log.styled).toHaveBeenCalledWith([{ text: '  ' }, { text: 'NOTE:', style: 'dim' }, { text: ' Review settings' }]);
});

it('preserves plain text for loggers without styled output', () => {
	const log = createLogMock();
	delete log.styled;
	logCommandOutput(log, ['SuiteApp analysis completed', '0 errors · 0 warnings']);
	expect(log.plain.mock.calls).toEqual([['SuiteApp analysis completed'], ['0 errors · 0 warnings']]);
});
