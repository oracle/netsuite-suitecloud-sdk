'use strict';

module.exports = class SDKExecutionContext {
	constructor(options) {
		this._command = options.command;
		this._showOutput = typeof options.showOutput === 'undefined' ? true : options.showOutput;
		this._params = {};
		this._flags = [];
		this._cliSpinnerExecutionContext = options.cliSpinnerExecutionContext;

		if (options.params) {
			Object.keys(options.params).forEach(key => {
				this.addParam(key, options.params[key]);
			});
		}

		if (options.flags) {
			options.flags.forEach(flag => {
				this.addFlag(flag);
			});
		}
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

	getCliSpinnerExecutionContext() {
		return this._cliSpinnerExecutionContext;
	}
};
