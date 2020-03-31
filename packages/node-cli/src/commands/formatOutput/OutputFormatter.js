/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

class OutputFormatter {
	constructor(consoleLogger) {
		this._consoleLogger = consoleLogger;
	}

	get consoleLogger() {
		return this._consoleLogger;
	}

	formatOutput(actionResult) {}
}

module.exports = OutputFormatter;
