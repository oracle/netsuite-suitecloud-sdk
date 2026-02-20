/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const ConsoleLogger = require('./ConsoleLogger');

const loadLoggerFontFormatter = async () => {
	const { COLORS, BOLD } = await import('./LoggerFontFormatter.mjs');
	return { COLORS, BOLD };
};
const fontFormatterPromise = loadLoggerFontFormatter();

class NodeConsoleLogger extends ConsoleLogger {

	info(message) {
		return fontFormatterPromise.then(({ COLORS: { INFO } }) => {
			this._println(message, INFO);
		});
	}

	result(message) {
		return fontFormatterPromise.then(({ COLORS: { RESULT } }) => {
			this._println(message, RESULT);
		});
	}

	warning(message) {
		return fontFormatterPromise.then(({ COLORS: { WARNING } }) => {
			this._println(message, WARNING);
		});
	}

	error(message) {
		return fontFormatterPromise.then(({ COLORS: { ERROR } }) => {
			this._println(message, ERROR);
		});
	}

	_println(message, color) {
		console.log(color(message));
	}

}

module.exports = new NodeConsoleLogger();