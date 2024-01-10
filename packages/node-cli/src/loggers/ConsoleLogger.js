/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { padding } = require('./LoggerConstants');

class ConsoleLogger {
	constructor() {}

	info(message) {}

	result(message) {}

	warning(message) {}

	error(message) {}

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
}

module.exports = ConsoleLogger;
