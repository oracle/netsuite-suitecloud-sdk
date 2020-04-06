/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const BaseCommand = require('../basecommand/BaseCommand');
const ImportObjectsAction = require('./ImportObjectsAction');
const ImportObjectsInputHandler = require('./ImportObjectsInputHandler');
const ImportObjectsOutputHandler = require('./ImportObjectsOutputHandler');


module.exports = class ImportObjectsCommand extends BaseCommand {
	constructor(options) {
		super(options);

        this._action = new ImportObjectsAction(options);
        this._inputHandler = new ImportObjectsInputHandler(options);
        this._outputHandler = new ImportObjectsOutputHandler(options);
	}
};
