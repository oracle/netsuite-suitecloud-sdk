/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
import assert from 'assert';

export const STATUS = {
	ERROR: 'ERROR',
	SUCCESS: 'SUCCESS',
};

export class ActionResult<T> {

	readonly status: string;
	readonly data: T;
	readonly resultMessage: string;
	readonly errorMessages: string[];
	readonly projectFolder: string;

	constructor(builder: ActionResultBuilder<T>) {
		this.status = builder.status;
		this.data = builder.data;
		this.resultMessage = builder.resultMessage;
		this.errorMessages = builder.errorMessages;
		this.projectFolder = builder.projectFolder;
	}

	isSuccess() {
		return this.status === STATUS.SUCCESS;
	}

	static get Builder() {
		return new ActionResultBuilder();
	}
}

export class ActionResultBuilder<T> {
	resultMessage!: string;
	status!: string;
	data!: T;
	errorMessages!: string[];
	projectFolder!: string;

	constructor() {}

	// Used to add message on success only, error messages must never be passed
	withResultMessage(resultMessage: string) {
		this.resultMessage = resultMessage;
		return this;
	}

	withData(data: T) {
		this.status = STATUS.SUCCESS;
		this.data = data;
		return this;
	}

	withErrors(errorMessages: string[]) {
		this.status = STATUS.ERROR;
		this.errorMessages = errorMessages;
		return this;
	}

	withProjectFolder(projectFolder: string) {
		this.projectFolder = projectFolder;
		return this;
	}

	protected validate() {
		assert(this.status, 'status is required when creating an ActionResult object.');
		if (this.status === STATUS.SUCCESS) {
			assert(this.data, 'data is required when ActionResult is a success.');
		}
		if (this.status === STATUS.ERROR) {
			assert(this.errorMessages, 'errorMessages is required when ActionResult is an error.');
			assert(Array.isArray(this.errorMessages), 'errorMessages argument must be an array');
		}
	}

	build() {
		this.validate();
		return new ActionResult<T>(this);
	}
}
