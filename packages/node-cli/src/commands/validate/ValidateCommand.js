/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const BaseCommand = require('../basecommand/BaseCommand');
const ValidateAction = require('./ValidateAction');
const ValidateInputHandler = require('./ValidateInputHandler');
const ValidateOutputHandler = require('./ValidateOutputHandler');

module.exports = class ValidateCommand extends BaseCommand {
	constructor(options) {
		super(options);
		this._action = new ValidateAction(options);
		this._inputHandler = new ValidateInputHandler(options);
		this._outputHandler = new ValidateOutputHandler(options);
	}
};
