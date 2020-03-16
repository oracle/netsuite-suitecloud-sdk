/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';
const assert = require('assert');

export const ERROR = "ERROR";
export const SUCCESS = "SUCCESS";

export default class ActionResult {

	constructor(build) {
		this.validateBuild(build);

		this._status = build.status;
		this._context = build.context;
		this._error = build.error;

		Object.preventExtensions(this);
	}

	validateBuild(build) {
		assert(build);
		assert(build.status, "status is required when creating an ActionResult object.");
		if (build.status === SUCCESS) {
			assert(build.context, "context is required when ActionResult is a success.");
		}
		if (build.status === ERROR) {
			assert(build.error, "error is required when ActionResult is an error.");
		}
	}

	get status() {
		return this._status;
	}

	get context() {
		return this._context;
	}

	get error() {
		return this._error;
	}

	static get Builder() {
		class Builder {
			constructor() { }

			withSuccess(context) {
				this.status = SUCCESS;
				this.context = context;

				return this;
			}

			withError(error) {
				this.status = ERROR;
				this.error = error;

				return this;
			}

			build(context) {
				return new ActionResult({
					status: this.status,
					context: this.context,
					error: this.error
				});
			}
		};
	}

};




