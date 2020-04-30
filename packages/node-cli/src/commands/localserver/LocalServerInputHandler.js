/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { prompt } = require('inquirer');
const BaseInputHandler = require('../base/BaseInputHandler');

module.exports = class LocalServerInputHandler extends BaseInputHandler {
	constructor(options) {
		super(options);
		this.localServer = options.localServer;
	}

	async getParameters(params) {
		return this.localServer.getCommandQuestions(prompt);
	}
};
