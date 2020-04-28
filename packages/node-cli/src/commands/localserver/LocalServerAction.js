/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const BaseAction = require('../basecommand/BaseAction');
const LocalCommand = require('@oracle/suitecloud-cli-localserver-command').LocalCommand;

const { prompt } = require('inquirer');
const { COLORS } = require('../../loggers/LoggerConstants');
const { COMMAND_LOCAL } = require('../../services/TranslationKeys');
const NodeTranslationService = require('../../services/NodeTranslationService');
const FileSystemService = require('../../services/FileSystemService');

module.exports = class LocalServerAction extends BaseAction {
	constructor(options) {
		super(options);

		options.filesystem = FileSystemService;
		options.colors = COLORS;
		options.translation = [NodeTranslationService, COMMAND_LOCAL];

		this.local = new LocalCommand(options);
	}

	async execute(params) {
		this.local.initialize();
		const answers = await this.local.getCommandQuestions(prompt);
		return this.local.executeAction(answers);
	}
};
