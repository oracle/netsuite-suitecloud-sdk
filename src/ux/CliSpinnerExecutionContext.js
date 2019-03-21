'use strict';

module.exports = class CliSpinnerExecutionContext {

	constructor(options) {
		this._message = options.message;
	}

	getMessage() {
		return this._message;
	}

};