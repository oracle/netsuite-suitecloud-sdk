/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const ConsoleLogger = require('./ConsoleLogger');

const loadLoggerConstants = async () => {
	const { COLORS, BOLD } = await import('./LoggerFontConstants.mjs');
	return { COLORS, BOLD };
};
const LoggerConstants = loadLoggerConstants();

class NodeConsoleLogger extends ConsoleLogger {

	info(message) {
		LoggerConstants.then(({ COLORS: { INFO } }) => {
			this._println(message, INFO);
		});
	}

	result(message) {
		LoggerConstants.then(({ COLORS: { RESULT } }) => {
			this._println(message, RESULT);
		});
	}

	warning(message) {
		LoggerConstants.then(({ COLORS: { WARNING } }) => {
			this._println(message, WARNING);
		});
	}

	error(message) {
		LoggerConstants.then(({ COLORS: { ERROR } }) => {
			this._println(message, ERROR);
		});
	}

	_println(message, color, isBold) {
		let formatterString = this._formatString(message, { color: color, bold: isBold });
		formatterString.then(chalkFormatter => {
			console.log(chalkFormatter);
		});
	}

	async _formatString(str, options) {
		const color = options.color || LoggerConstants.DEFAULT;
		const bold = options.bold ? LoggerConstants.BOLD : str => str;
		return bold(color(str));
	}
}

module.exports = new NodeConsoleLogger();
