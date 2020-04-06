/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const BaseCommand = require('../basecommand/BaseCommand');
const ImportFilesAction = require('./ImportFilesAction');
const ImportFilesInputHandler = require('./ImportFilesInputHandler');
const ImportFilesOutputHandler = require('./ImportFilesOutputHandler');


module.exports = class ImportFilesCommand extends BaseCommand {
	constructor(options) {
		super(options);

        this._action = new ImportFilesAction(options);
        this._inputHandler = new ImportFilesInputHandler(options);
        this._outputHandler = new ImportFilesOutputHandler(options);
	}
};
