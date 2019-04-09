'use strict';
const os = require('os');
const chalk = require('chalk');
const AVAILABLE_COLORS = {
	DEFAULT: chalk.white,
	RESULT: chalk.green,
	ERROR: chalk.red,
	INFO: chalk.cyan,
	WARNING: chalk.yellow
};

module.exports = {
	// https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
	COLORS: AVAILABLE_COLORS,
	println: function(message, color) {
		console.log(this.formatString(message, { color: color }));
	},
	formatString: (str, options) => {
		var color = options.color || AVAILABLE_COLORS.DEFAULT;
		var bold = options.bold ? chalk.bold : str => str;
		return bold(color(str));
	},
	lineBreak: os.EOL,
};
