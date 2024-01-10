/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const assert = require('assert');

const STATUS = {
	ERROR: 'ERROR',
	SUCCESS: 'SUCCESS',
};

class ActionResult {
	constructor(parameters) {
		this.validateParameters(parameters);
		this._status = parameters.status;
		this._data = parameters.data;
		this._resultMessage = parameters.resultMessage;
		this._errorMessages = parameters.errorMessages;
		this._projectFolder = parameters.projectFolder;
		this._commandParameters = parameters.commandParameters;
		this._commandFlags = parameters.commandFlags;
	}

	validateParameters(parameters) {
		assert(parameters);
		assert(parameters.status, 'status is required when creating an ActionResult object.');
		if (parameters.status === STATUS.SUCCESS) {
			assert(parameters.data, 'data is required when ActionResult is a success.');
		}
		if (parameters.status === STATUS.ERROR) {
			assert(parameters.errorMessages, 'errorMessages is required when ActionResult is an error.');
			assert(Array.isArray(parameters.errorMessages), 'errorMessages argument must be an array');
		}
	}

	isSuccess() {
		return this._status === STATUS.SUCCESS;
	}

	get status() {
		return this._status;
	}

	get errorMessages() {
		return this._errorMessages;
	}

	get data() {
		return this._data;
	}

	get resultMessage() {
		return this._resultMessage;
	}

	get projectFolder() {
		return this._projectFolder;
	}

	get commandParameters() {
		return this._commandParameters;
	}

	get commandFlags() {
		return this._commandFlags;
	}

	static get Builder() {
		return new ActionResultBuilder();
	}
}

class ActionResultBuilder {
	constructor() {
	}

	// Used to add message on success only, error messages must never be passed
	withResultMessage(resultMessage) {
		this.resultMessage = resultMessage;
		return this;
	}

	withData(data) {
		this.status = STATUS.SUCCESS;
		this.data = data;
		return this;
	}

	withErrors(errorMessages) {
		this.status = STATUS.ERROR;
		this.errorMessages = errorMessages;
		return this;
	}

	withProjectFolder(projectFolder) {
		this.projectFolder = projectFolder;
		return this;
	}

	withCommandParameters(commandParameters) {
		this.commandParameters = commandParameters;
		return this;
	}

	withCommandFlags(commandFlags) {
		this.commandFlags = commandFlags;
		return this;
	}

	build() {
		return new ActionResult({
			status: this.status,
			...(this.data && { data: this.data }),
			...(this.resultMessage && { resultMessage: this.resultMessage }),
			...(this.errorMessages && { errorMessages: this.errorMessages }),
			...(this.projectFolder && { projectFolder: this.projectFolder }),
			...(this.commandParameters && { commandParameters: this.commandParameters }),
			...(this.commandFlags && { commandFlags: this.commandFlags }),
		});
	}
}

module.exports = { ActionResult, ActionResultBuilder, STATUS };
