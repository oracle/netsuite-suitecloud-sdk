/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const chalk = require('chalk');
const ConsoleLogger = require('./ConsoleLogger');
const { COLORS } = require('./LoggerConstants');

class NodeConsoleLogger extends ConsoleLogger {

	info(message) {
		this._println(message, COLORS.INFO);
	}

	result(message) {
		this._println(message, COLORS.RESULT);
	}

	warning(message) {
		this._println(message, COLORS.WARNING);
	}

	error(message) {
		this._println(message, COLORS.ERROR);
	}

	_println(message, color, isBold) {
		console.log(this._formatString(message, { color: color, bold: isBold }));
	}

	_formatString(str, options) {
		const color = options.color || COLORS.DEFAULT;
		const bold = options.bold ? chalk.bold : str => str;
		return bold(color(str));
	}
}

module.exports = new NodeConsoleLogger();
