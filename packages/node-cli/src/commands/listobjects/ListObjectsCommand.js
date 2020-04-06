/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const BaseCommand = require('../basecommand/BaseCommand');
const ListObjectsAction = require('./ListObjectsAction');
const ListObjectsInputHandler = require('./ListObjectsInputHandler');
const ListObjectsOutputHandler = require('./ListObjectsOutputHandler');


module.exports = class ListFilesCommand extends BaseCommand {
	constructor(options) {
        super(options);

        this._action = new ListObjectsAction(options);
        this._inputHandler = new ListObjectsInputHandler(options);
        this._outputHandler = new ListObjectsOutputHandler(options);
	}
};
