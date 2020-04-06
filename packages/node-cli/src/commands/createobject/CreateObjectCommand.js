/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const BaseCommand = require('../basecommand/BaseCommand');
const CreateObjectAction = require('./CreateObjectAction');
const CreateObjectInputHandler = require('./CreateObjectInputHandler');
const BaseOutputHandler = require('../basecommand/BaseOutputHandler');

module.exports = class CreateObjectCommand extends BaseCommand {
	constructor(options) {
		super(options);

		this._action = new CreateObjectAction(options);
		this._inputHandler = new CreateObjectInputHandler(options);
		this._outputHandler = new BaseOutputHandler(options);
	}
};
