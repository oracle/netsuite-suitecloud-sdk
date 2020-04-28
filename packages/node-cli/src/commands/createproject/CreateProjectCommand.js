/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const BaseCommand = require('../basecommand/BaseCommand');
const CreateProjectAction = require('./CreateProjectAction');
const CreateProjectInputHandler = require('./CreateProjectInputHandler');
const CreateProjectOutputHandler = require('./CreateProjectOutputHandler');

module.exports = class CreateProjectCommand extends BaseCommand {
	constructor(options) {
		super(options);

		this._action = new CreateProjectAction(options);
		this._inputHandler = new CreateProjectInputHandler(options);
		this._outputHandler = new CreateProjectOutputHandler(options);
	}
};
