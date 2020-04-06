/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const BaseCommand = require('../basecommand/BaseCommand');
const AddDependenciesAction = require('./AddDependenciesAction');
const AddDependenciesOutputHandler = require('./AddDependenciesOutputHandler');
const BaseInputHandler = require('../basecommand/BaseInputHandler');

module.exports = class AddDependenciesCommand extends BaseCommand {
	constructor(options) {
		super(options);

		this._action = new AddDependenciesAction(options);
		this._inputHandler = new BaseInputHandler(options);
		this._outputHandler = new AddDependenciesOutputHandler(options);
	}
}

