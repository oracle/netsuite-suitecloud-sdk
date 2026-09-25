/*
 ** Copyright (c) 2026 Oracle and/or its affiliates. All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { execFileSync } = require('node:child_process');
const { resolve } = require('node:path');

function render(color) {
	const env = { ...process.env };
	delete env.FORCE_COLOR;
	delete env.NO_COLOR;
	if (color) env.FORCE_COLOR = '1';
	else env.NO_COLOR = '1';
	const script = `
		const log = require(${JSON.stringify(resolve(__dirname, '../../src/loggers/NodeConsoleLogger'))});
		log.info('before');
		log.styled([{ text: 'WARNING:', style: 'warning' }, { text: ' description' }]);
		log.styled([{ text: 'Objects/a.xml', style: 'bold' }]);
		log.styled([{ text: 'Rule: example', style: 'dim' }]);
		log.result('after');
	`;
	return execFileSync(process.execPath, ['-e', script], { env, encoding: 'utf8' });
}

it('retains output order with asynchronous colors and styles', () => {
	const output = render(true);
	expect(output.replace(/\u001b\[[0-9;]*m/g, '')).toBe('before\nWARNING: description\nObjects/a.xml\nRule: example\nafter\n');
	expect(output).toContain('\u001b[33mWARNING:\u001b[39m description');
	expect(output).toContain('\u001b[1mObjects/a.xml\u001b[22m');
	expect(output).toContain('\u001b[2mRule: example\u001b[22m');
});

it('respects NO_COLOR with readable plain text', () => {
	const output = render(false);
	expect(output).toBe('before\nWARNING: description\nObjects/a.xml\nRule: example\nafter\n');
	expect(output).not.toContain('\u001b');
});
