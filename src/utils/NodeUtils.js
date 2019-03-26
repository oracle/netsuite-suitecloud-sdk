'use strict';
const os = require('os');
const chalk = require('chalk');

module.exports = {
	// https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
	COLORS: {
		DEFAULT: chalk.white,
		CYAN: chalk.cyan,
		RED: chalk.red,
		GREEN: chalk.green,
		YELLOW: chalk.yellow,
	},
	println: function(message, color) {
		console.log(this.formatString(message, { color: color}));
	},
	formatString: (str, options) => {
		var color = options.color || COLORS.DEFAULT;
		var bold = options.bold ? chalk.bold : (str => str);
		return bold(color(str))
	},
	lineBreak: os.EOL,
};
