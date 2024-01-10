/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const chalk = require('chalk');
const os = require('os');

module.exports = {
	COLORS: {
		DEFAULT: chalk.white,
		RESULT: chalk.green,
		ERROR: chalk.red,
		INFO: chalk.cyan,
		WARNING: chalk.yellow,
	},
	padding: '\u0020\u0020\u0020\u0020', //4 spaces
	lineBreak: os.EOL,
};
