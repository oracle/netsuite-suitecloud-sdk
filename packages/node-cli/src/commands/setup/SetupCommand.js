/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const BaseCommand = require('../basecommand/BaseCommand');
const SetupAction = require('./SetupAction');
const SetupInputHandler = require('./SetupInputHandler');
const SetupOutputHandler = require('./SetupOutputHandler');

module.exports = class SetupCommand extends BaseCommand {
	constructor(options) {
		super(options);
		this._action = new SetupAction(options);
		this._inputHandler = new SetupInputHandler(options);
		this._outputHandler = new SetupOutputHandler(options);
	}
};
