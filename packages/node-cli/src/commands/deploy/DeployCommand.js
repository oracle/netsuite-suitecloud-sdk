/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const BaseCommand = require('../basecommand/BaseCommand');
const DeployAction = require('./DeployAction');
const DeployInputHandler = require('./DeployInputHandler');
const DeployOutputHandler = require('./DeployOutputHandler');


module.exports = class DeployCommand extends BaseCommand {
	constructor(options) {
		super(options);

        this._action = new DeployAction(options);
        this._inputHandler = new DeployInputHandler(options);
        this._outputHandler = new DeployOutputHandler(options);
	}
};
