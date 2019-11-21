/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
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

class NodeUtils {

	println(message, color) {
		console.log(this.formatString(message, { color: color }));
	}

	formatString(str, options) {
		var color = options.color || AVAILABLE_COLORS.DEFAULT;
		var bold = options.bold ? chalk.bold : str => str;
		return bold(color(str));
	}

	// https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
	get COLORS() {
		return AVAILABLE_COLORS;
	}		
	get lineBreak() {
		return os.EOL;
	}
}

module.exports = new NodeUtils();
