/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const Command = require('../../Command');
const LocalServerAction = require('./LocalServerAction');
const LocalServerInputHandler = require('./LocalServerInputHandler');

const LocalCommand = require('@oracle/suitecloud-cli-localserver-command').LocalCommand;
const { COLORS } = require('../../../loggers/LoggerConstants');
const { COMMAND_LOCAL } = require('../../../services/TranslationKeys');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const FileSystemService = require('../../../services/FileSystemService');

module.exports = {
	create(options) {

		options.localServer = new LocalCommand({
			...options,
			filesystem: FileSystemService,
			colors: COLORS,
			translation: [NodeTranslationService, COMMAND_LOCAL],
		});
		options.localServer.initialize();

		return Command.Builder.withOptions(options)
			.withAction(LocalServerAction)
			.withInput(LocalServerInputHandler)
			.build();
	}
};
