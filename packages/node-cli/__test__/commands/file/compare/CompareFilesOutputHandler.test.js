/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { ActionResult } = require('../../../../src/services/actionresult/ActionResult');
const CompareFilesOutputHandler = require('../../../../src/commands/file/compare/CompareFilesOutputHandler');

describe('CompareFilesOutputHandler parse()', () => {
	let outputHandler;
	let resultMock;
	let warningMock;
	let infoMock;
	let printlnMock;

	beforeEach(() => {
		resultMock = jest.fn();
		warningMock = jest.fn();
		infoMock = jest.fn();
		printlnMock = jest.fn();
		const Logger = jest.fn(() => ({
			result: resultMock,
			warning: warningMock,
			info: infoMock,
			println: printlnMock,
		}));
		outputHandler = new CompareFilesOutputHandler({ log: new Logger() });
	});

	it('warns when the file does not exist in the account', () => {
		const actionResult = ActionResult.Builder.withData({
			path: '/SuiteScripts/x.js',
			remoteLoaded: false,
			localExists: true,
		}).build();

		outputHandler.parse(actionResult);

		expect(warningMock).toHaveBeenCalledTimes(1);
		expect(warningMock.mock.calls[0][0]).toContain('/SuiteScripts/x.js');
		expect(printlnMock).not.toHaveBeenCalled();
	});

	it('reports identical files without printing a diff', () => {
		const actionResult = ActionResult.Builder.withData({
			path: '/SuiteScripts/x.js',
			remoteLoaded: true,
			localExists: true,
			identical: true,
			lines: [],
		}).build();

		outputHandler.parse(actionResult);

		expect(resultMock).toHaveBeenCalledTimes(1);
		expect(resultMock.mock.calls[0][0]).toContain('identical');
		expect(printlnMock).not.toHaveBeenCalled();
	});

	it('prints the diff header and the rendered diff when files differ', () => {
		const lines = [
			{ type: 'header', text: '--- account:/SuiteScripts/x.js' },
			{ type: 'header', text: '+++ local:/SuiteScripts/x.js' },
			{ type: 'hunk', text: '@@ -1,1 +1,1 @@' },
			{ type: 'removed', text: '-old' },
			{ type: 'added', text: '+new' },
		];
		const actionResult = ActionResult.Builder.withData({
			path: '/SuiteScripts/x.js',
			remoteLoaded: true,
			localExists: true,
			identical: false,
			lines,
		}).build();

		outputHandler.parse(actionResult);

		expect(infoMock).toHaveBeenCalledTimes(1);
		expect(printlnMock).toHaveBeenCalledTimes(1);
		const printed = printlnMock.mock.calls[0][0];
		expect(printed).toContain('-old');
		expect(printed).toContain('+new');
	});

	it('warns about a missing local file but still prints the diff', () => {
		const lines = [
			{ type: 'header', text: '--- account:/SuiteScripts/x.js' },
			{ type: 'removed', text: '-gone' },
		];
		const actionResult = ActionResult.Builder.withData({
			path: '/SuiteScripts/x.js',
			remoteLoaded: true,
			localExists: false,
			identical: false,
			lines,
		}).build();

		outputHandler.parse(actionResult);

		expect(warningMock).toHaveBeenCalledTimes(1);
		expect(printlnMock).toHaveBeenCalledTimes(1);
	});
});
