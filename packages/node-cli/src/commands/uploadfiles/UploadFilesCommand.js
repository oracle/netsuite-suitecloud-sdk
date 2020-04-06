/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const BaseCommand = require('../basecommand/BaseCommand');
const UploadFilesAction = require('./UploadFilesAction');
const UploadFilesInputHandler = require('./UploadFilesInputHandler');
const UploadFilesOutputHandler = require('./UploadFilesOutputHandler');

module.exports = class UploadFilesCommand extends BaseCommand {
	constructor(options) {
		super(options);
		this._action = new UploadFilesAction(options);
		this._inputHandler = new UploadFilesInputHandler(options);
		this._outputHandler = new UploadFilesOutputHandler(options);
	}
};
