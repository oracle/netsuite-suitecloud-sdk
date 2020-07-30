/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
import assert from 'assert';
import { ActionResult, ActionResultBuilder, STATUS } from './ActionResult';

export const MANAGE_ACTION = {
	LIST: 'list',
	EXIT: 'exit',
	INFO: 'info',
	RENAME: 'rename',
	REMOVE: 'remove',
	REVOKE: 'revoke',
	UNKNOWN: 'unknown',
};

type ManageAccountData = any;

export class ManageAccountActionResult extends ActionResult<ManageAccountData> {

	readonly actionExecuted: string;

	constructor(builder: ManageAccountActionResultBuilder) {
		super(builder);
		this.actionExecuted = builder.actionExecuted;
	}

	static get Builder() {
		return new ManageAccountActionResultBuilder();
	}
}

export class ManageAccountActionResultBuilder extends ActionResultBuilder<ManageAccountData> {
	
	actionExecuted!: string;

	constructor() {
		super();
	}

	withExecutedAction(actionExecuted: string) {
		this.actionExecuted = actionExecuted;
		return this;
	}

	validate() {
		assert(this.status, 'status is required when creating an ActionResult object.');
		if (this.status === STATUS.SUCCESS) {
			assert(this.actionExecuted);
		}
		if (this.status === STATUS.ERROR) {
			assert(this.errorMessages, 'errorMessages is required when ActionResult is an error.');
			assert(Array.isArray(this.errorMessages), 'errorMessages argument must be an array');
		}
	}

	build() {
		this.validate();
		return new ManageAccountActionResult(this);
	}
}