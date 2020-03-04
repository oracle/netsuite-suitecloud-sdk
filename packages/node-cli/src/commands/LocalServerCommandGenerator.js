/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';
const BaseCommandGenerator = require('./BaseCommandGenerator');
const LocalCommand = require('@oracle/suitecloud-cli-localserver-command').LocalCommand;

const { COLORS } = require('./../utils/NodeUtils');
const { COMMAND_LOCAL } = require('./../services/TranslationKeys');
const TranslationService = require('./../services/TranslationService');
const FileSystemService = require('./../services/FileSystemService');
module.exports = class LocalServerCommandGenerator extends BaseCommandGenerator {

	constructor(options) {
		super(options);

		options.filesystem = FileSystemService;
		options.colors = COLORS;
		options.translation = [TranslationService, COMMAND_LOCAL];
		
		this.local = new LocalCommand(options);
	}

	_getCommandQuestions(prompt) {
		this.local.initialize();
		return this.local.getCommandQuestions(prompt);
	}

	_executeAction(answers) {
		this.local.initialize();
		return this.local.executeAction(answers);
	}

};
