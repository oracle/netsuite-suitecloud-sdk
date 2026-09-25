/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const ConsoleLogger = require('./ConsoleLogger');

const loadLoggerFontFormatter = async () => {
	const { COLORS, BOLD, DIM } = await import('./LoggerFontFormatter.mjs');
	return { COLORS, BOLD, DIM };
};
const fontFormatterPromise = loadLoggerFontFormatter();

class NodeConsoleLogger extends ConsoleLogger {

	info(message) {
		return fontFormatterPromise.then(({ COLORS: { INFO } }) => {
			this._println(message, INFO);
		});
	}

	plain(message) {
		console.log(message);
	}

	styled(parts) {
		// Use the same promise as colored output so mixed styles retain line order.
		return fontFormatterPromise.then(({ COLORS, BOLD, DIM }) => {
			const styles = { bold: BOLD, dim: DIM, warning: COLORS.WARNING, error: COLORS.ERROR, result: COLORS.RESULT };
			console.log(parts.map(({ text, style }) => styles[style] ? styles[style](text) : text).join(''));
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
