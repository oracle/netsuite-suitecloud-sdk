/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';
const ActionResult = require('../actionresult/ActionResult');
const ActionResultStatus = require('../actionresult/ActionResultStatus');

module.exports = class ActionResultBuilder {

	constructor() {}

	withSuccess(context) {
		this.status = ActionResultStatus.SUCCESS;
		this.context = context;

		return this;
	}

	withError(error) {
		this.status = ActionResultStatus.ERROR;
		this.error = error;

		return this;
	}

	build() {
		return new ActionResult({
			status: this.status,
			context: this.context,
			error: this.error
		});
	}

};
