/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const BaseCommand = require('../basecommand/BaseCommand');
const UpdateAction = require('./UpdateAction');
const UpdateInputHandler = require('./UpdateInputHandler');
const UpdateOutputHandler = require('./UpdateOutputHandler');

module.exports = class UpdateCommand extends BaseCommand {
	constructor(options) {
		super(options);
		this._action = new UpdateAction(options);
		this._inputHandler = new UpdateInputHandler(options);
		this._outputHandler = new UpdateOutputHandler(options);
	}
};
