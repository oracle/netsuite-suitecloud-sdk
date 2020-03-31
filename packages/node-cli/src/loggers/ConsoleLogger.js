/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const os = require('os');
const chalk = require('chalk');
const AVAILABLE_COLORS = {
	DEFAULT: chalk.white,
	RESULT: chalk.green,
	ERROR: chalk.red,
	INFO: chalk.cyan,
	WARNING: chalk.yellow,
};
const padding = '\u0020\u0020\u0020\u0020'; //4 spaces

class ConsoleLogger {
	constructor() {}

	println(message, color) {}

	formatString(str, options) {}

	logErrors(errorMessages) {}

	getPadding(padCount) {
		if (padCount) {
			let paddings = '';
			for (let i = 0; i < padCount; i++) {
				paddings += padding;
			}
			return paddings;
		}
		return padding;
	}

	// https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
	get COLORS() {
		return AVAILABLE_COLORS;
	}

	static get lineBreak() {
		return os.EOL;
	}
}

module.exports = ConsoleLogger;
