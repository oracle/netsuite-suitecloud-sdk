/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const BaseCommand = require('../basecommand/BaseCommand');
const ListFilesAction = require('./ListFilesAction');
const ListFilesInputHandler = require('./ListFilesInputHandler');
const ListFilesOutputHandler = require('./ListFilesOutputHandler');


module.exports = class ListFilesCommand extends BaseCommand {
	constructor(options) {
		super(options);

        this._action = new ListFilesAction(options);
        this._inputHandler = new ListFilesInputHandler(options);
        this._outputHandler = new ListFilesOutputHandler(options);
	}
};
