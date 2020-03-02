/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';
const assert = require('assert');
const ActionResultStatus = require('../actionresult/ActionResultStatus');

module.exports = class ActionResult {

	constructor(options) {
		assert(options);
		assert(options.status, "status is required when creating an ActionResult object.");

		if (options.status === ActionResultStatus.SUCCESS) {
			assert(options.context, "context is required when ActionResult is a success.");
		}

		if (options.status === ActionResultStatus.ERROR) {
			assert(options.error, "error is required when ActionResult is an error.");
		}

		this._status = options.status;
		this._context = options.context;
		this._error = options.error;

		Object.preventExtensions(this);
	}

	get getStatus() {
		return this._status;
	}

	get getContext() {
		return this._context;
	}

	get getError() {
		return this._error;
	}

};
