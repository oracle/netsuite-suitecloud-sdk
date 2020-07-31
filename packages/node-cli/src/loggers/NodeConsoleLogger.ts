/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import chalk from 'chalk';
import ConsoleLogger from './ConsoleLogger';
import { COLORS } from './LoggerConstants';

class NodeConsoleLoggerClass extends ConsoleLogger {
	println(message: string, color: chalk.Chalk) {
		console.log(this._formatString(message, { color: color }));
	}

	info(message: string) {
		this.println(message, COLORS.INFO);
	}

	result(message: string) {
		this.println(message, COLORS.RESULT);
	}

	warning(message: string) {
		this.println(message, COLORS.WARNING);
	}

	error(message: string) {
		this.println(message, COLORS.ERROR);
	}

	_formatString(str: string, options: {color?: chalk.Chalk; bold?: chalk.Chalk}) {
		const color = options.color || COLORS.DEFAULT;
		const bold = options.bold ? chalk.bold : (str: string) => str;
		return bold(color(str));
	}
}

export const NodeConsoleLogger = new NodeConsoleLoggerClass();
