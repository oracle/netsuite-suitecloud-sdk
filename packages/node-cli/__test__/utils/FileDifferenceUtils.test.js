/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const FileDifferenceUtils = require('../../src/utils/FileDifferenceUtils');

describe('FileDifferenceUtils.computeFileDiff()', () => {
	it('reports identical content with no diff lines', () => {
		const result = FileDifferenceUtils.computeFileDiff('line1\nline2\n', 'line1\nline2\n');

		expect(result.identical).toBe(true);
		expect(result.lines).toEqual([]);
	});

	it('produces a git-style unified diff for a modified line', () => {
		const result = FileDifferenceUtils.computeFileDiff('a\nb\nc\n', 'a\nB\nc\n', {
			accountLabel: 'account:/SuiteScripts/x.js',
			localLabel: 'local:/SuiteScripts/x.js',
		});

		expect(result.identical).toBe(false);
		expect(result.lines).toEqual([
			{ type: 'header', text: '--- account:/SuiteScripts/x.js' },
			{ type: 'header', text: '+++ local:/SuiteScripts/x.js' },
			{ type: 'hunk', text: '@@ -1,3 +1,3 @@' },
			{ type: 'context', text: ' a' },
			{ type: 'removed', text: '-b' },
			{ type: 'added', text: '+B' },
			{ type: 'context', text: ' c' },
		]);
	});

	it('classifies pure additions', () => {
		const result = FileDifferenceUtils.computeFileDiff('keep\n', 'keep\nnew line\n');

		expect(result.lines.filter((line) => line.type === 'added')).toEqual([{ type: 'added', text: '+new line' }]);
		expect(result.lines.filter((line) => line.type === 'removed')).toEqual([]);
	});

	it('classifies pure removals', () => {
		const result = FileDifferenceUtils.computeFileDiff('keep\ngone\n', 'keep\n');

		expect(result.lines.filter((line) => line.type === 'removed')).toEqual([{ type: 'removed', text: '-gone' }]);
		expect(result.lines.filter((line) => line.type === 'added')).toEqual([]);
	});
});

describe('FileDifferenceUtils.renderDiff()', () => {
	const lines = [
		{ type: 'header', text: '--- account' },
		{ type: 'hunk', text: '@@ -1 +1 @@' },
		{ type: 'removed', text: '-old' },
		{ type: 'added', text: '+new' },
		{ type: 'context', text: ' same' },
	];

	it('renders plain text without color', () => {
		expect(FileDifferenceUtils.renderDiff(lines, false)).toBe('--- account\n@@ -1 +1 @@\n-old\n+new\n same');
	});

	it('wraps changed lines in ANSI color codes when color is enabled', () => {
		const rendered = FileDifferenceUtils.renderDiff(lines, true);

		expect(rendered).toContain('\x1b[32m+new\x1b[0m'); // green addition
		expect(rendered).toContain('\x1b[31m-old\x1b[0m'); // red removal
		expect(rendered).toContain('\x1b[36m@@ -1 +1 @@\x1b[0m'); // cyan hunk header
		expect(rendered).toContain('\x1b[36m--- account\x1b[0m'); // cyan file header
		expect(rendered).not.toContain('\x1b[32m same'); // context stays uncolored
	});
});
