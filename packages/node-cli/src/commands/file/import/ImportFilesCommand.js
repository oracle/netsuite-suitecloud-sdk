/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const Command = require('../../Command');
const ImportFilesAction = require('./ImportFilesAction');
const ImportFilesInputHandler = require('./ImportFilesInputHandler');
const ImportFilesOutputHandler = require('./ImportFilesOutputHandler');


module.exports = {
	create(options) {
		return Command.Builder.withOptions(options)
			.withAction(ImportFilesAction)
			.withInput(ImportFilesInputHandler)
			.withOutput(ImportFilesOutputHandler)
			.build();
	}
};

