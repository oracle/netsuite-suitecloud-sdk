/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as assert from 'assert';
import * as vscode from 'vscode';
import VSConsoleLogger from '../../loggers/VSConsoleLogger';

suite('VS Console Logger', () => {
	test('keeps injected output destinations isolated', () => {
		const commandMessages: string[] = [];
		const devAssistMessages: string[] = [];
		const commandOutput = createOutputChannel(commandMessages);
		const devAssistOutput = createOutputChannel(devAssistMessages);
		const commandLogger = new VSConsoleLogger(false, undefined, commandOutput);
		const devAssistLogger = new VSConsoleLogger(false, undefined, devAssistOutput);

		commandLogger.info('Deploy completed.');
		devAssistLogger.info('Developer Assistant proxy started.');

		assert.deepStrictEqual(commandMessages, ['Deploy completed.']);
		assert.deepStrictEqual(devAssistMessages, ['Developer Assistant proxy started.']);
	});

	test('separates lifecycle sections without duplicate blank lines', () => {
		const messages: string[] = [];
		const logger = new VSConsoleLogger(true, '/workspace/sample-project', createOutputChannel(messages));

		logger.startSection();
		logger.info('[SuiteCloud Control Panel] Starting proxy.');
		logger.info('Starting proxy process...');
		logger.endSection();
		logger.startSection();
		logger.error('[SuiteCloud Control Panel] Port is already in use.');
		logger.endSection();

		assert.match(messages[0], /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} - sample-project$/);
		assert.deepStrictEqual(messages.slice(1, 4), [
			'[SuiteCloud Control Panel] Starting proxy.',
			'Starting proxy process...',
			'',
		]);
		assert.match(messages[4], /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} - sample-project$/);
		assert.deepStrictEqual(messages.slice(5), [
			'[SuiteCloud Control Panel] Port is already in use.',
			'',
		]);
	});

	test('clears prior output and resets section spacing', () => {
		const messages: string[] = [];
		const logger = new VSConsoleLogger(false, '/workspace/sample-project', createOutputChannel(messages));

		logger.info('Previous startup output.');
		logger.clear();
		logger.startSection();
		logger.info('New startup output.');
		logger.endSection();

		assert.strictEqual(messages.length, 3);
		assert.match(messages[0], /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} - sample-project$/);
		assert.deepStrictEqual(messages.slice(1), ['New startup output.', '']);
	});
});

const createOutputChannel = (messages: string[]): vscode.OutputChannel => ({
	appendLine: (message: string) => messages.push(message),
	clear: () => messages.splice(0),
} as unknown as vscode.OutputChannel);
