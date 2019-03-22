'use strict';

const assert = require('assert');

module.exports = class SDKExecutionContext {
	constructor(options) {
		assert(options.command, "Command is mandatory option");
		this._command = options.command;

		this._showOutput = typeof options.showOutput === 'undefined' ? true : options.showOutput;
		this._params = {};
		this._flags = [];

		this._setSpinner(options.displaySpinner, options.spinnerMessage);

		if (options.params) {
			this._addParams(options.params);
		}

		if (options.flags) {
			this._addFlags(options.flags);
		}
	}

	_setSpinner(displaySpinner, spinnerMessage) {
		this._displaySpinner = displaySpinner;
		if (this._displaySpinner) {
			assert(spinnerMessage, "Message is mandatory when spinner is enabled");
			this._spinnerMessage = spinnerMessage;
		}
	}

	_addParams(params) {
		Object.keys(params).forEach(key => {
			this.addParam(key, params[key]);
		});
	}

	_addFlags(flags) {
		flags.forEach(flag => {
			this.addFlag(flag);
		});
	}

	get showOutput() {
		return this._showOutput;
	}

	getCommand() {
		return this._command;
	}

	addParam(name, value) {
		this._params[`-${name}`] = value;
	}

	getParams() {
		return this._params;
	}

	addFlag(flag) {
		this._flags.push(`-${flag}`);
	}

	getFlags() {
		return this._flags;
	}

	displaySpinner() {
		return this._displaySpinner;
	}

	getSpinnerMessage() {
		return this._spinnerMessage;
	}
};
