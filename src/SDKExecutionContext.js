'use strict';

const assert = require('assert');

module.exports = class SDKExecutionContext {
	constructor(options) {
		assert(options.command, 'Command is mandatory option');
		this._command = options.command;

		this._showOutput = typeof options.showOutput === 'undefined' ? true : options.showOutput;
		this._params = {};
		this._flags = [];

		if (options.params) {
			this._addParams(options.params);
		}

		if (options.flags) {
			this._addFlags(options.flags);
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

};
