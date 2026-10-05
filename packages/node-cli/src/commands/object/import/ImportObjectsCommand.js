/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const Command = require('../../Command');
const ImportObjectsAction = require('./ImportObjectsAction');
const ImportObjectsInputHandler = require('./ImportObjectsInputHandler');
const ImportObjectsOutputHandler = require('./ImportObjectsOutputHandler');
const { createCredentialSessionProvider } = require('../../../utils/AuthSessionProvider');

module.exports = {
	create(options) {
		const commandOptions = {
			...options,
			authSessionProvider: createCredentialSessionProvider(
				options.sdkPath,
				options.executionEnvironmentContext
			),
		};
		return Command.Builder.withOptions(commandOptions)
			.withAction(ImportObjectsAction)
			.withInput(ImportObjectsInputHandler)
			.withOutput(ImportObjectsOutputHandler)
			.build();
	}
};
