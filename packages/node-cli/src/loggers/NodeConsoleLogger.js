/*
 ** Copyright (c) 2022 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the FUTC Oracle License v 1.0 as shown at https://www.oracle.com/downloads/licenses/oracle-free-license.html.
 */
'use strict';

const chalk = require('chalk');
const ConsoleLogger = require('./ConsoleLogger');
const { COLORS } = require('./LoggerConstants');

class NodeConsoleLogger extends ConsoleLogger {
	println(message, color) {
		console.log(this.formatString(message, { color: color }));
	}

	info(message) {
		this.println(message, COLORS.INFO);
	}

	result(message) {
		this.println(message, COLORS.RESULT);
	}

	warning(message) {
		this.println(message, COLORS.WARNING);
	}

	error(message) {
		this.println(message, COLORS.ERROR);
	}

	formatString(str, options) {
		const color = options.color || COLORS.DEFAULT;
		const bold = options.bold ? chalk.bold : str => str;
		return bold(color(str));
	}
}

module.exports = new NodeConsoleLogger();
