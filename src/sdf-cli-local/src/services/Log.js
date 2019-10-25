/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const Translation = require('./Translation');

class Log {
	constructor() {
		this.separator = '-'.repeat(45);
		this.colors = {};
	}

	start(colors) {
		this.colors = colors;
	}

	_time() {
		const date = new Date();
		const timestamp = [date.getHours(), date.getMinutes(), date.getSeconds()].join(':');

		return `[${timestamp}.${date.getMilliseconds()}] `;
	}

	custom(message, params, color = this.colors.DEFAULT) {
		message = Translation.getMessage(message, params) || message;
		if (typeof color !== 'function') {
			color = msg => msg;
		}
		console.log(color(this._time() + message));
	}

	info(message, params) {
		this.custom(message, params, this.colors.INFO);
	}
	result(message, params) {
		this.custom(message, params, this.colors.RESULT);
	}
	default(message, params) {
		this.custom(message, params, this.colors.DEFAULT);
	}
	error(message, params) {
		this.custom(message, params, this.colors.ERROR);
	}
}

module.exports = new Log();
