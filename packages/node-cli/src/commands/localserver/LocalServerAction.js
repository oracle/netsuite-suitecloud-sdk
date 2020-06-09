/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const BaseAction = require('../base/BaseAction');

module.exports = class LocalServerAction extends BaseAction {
	constructor(options) {
		super(options);
		this.localServer = options.localServer;
	}

	async execute(params) {
		return this.localServer.executeAction(params);
	}
};
