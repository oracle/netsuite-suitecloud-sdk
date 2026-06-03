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

	// Prints a message verbatim, with no color applied. It is still chained on the font formatter promise so that
	// its output stays ordered relative to the colored info()/result()/error()/warning() calls.
	println(message) {
		return fontFormatterPromise.then(() => {
			console.log(message);
		});
	}

	_println(message, color) {
		console.log(color(message));
	}

}

module.exports = new NodeConsoleLogger();