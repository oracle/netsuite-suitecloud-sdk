/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const Command = require('../../Command');
const CompareFilesAction = require('./CompareFilesAction');
const CompareFilesInputHandler = require('./CompareFilesInputHandler');
const CompareFilesOutputHandler = require('./CompareFilesOutputHandler');

module.exports = {
	create(options) {
		return Command.Builder.withOptions(options)
			.withAction(CompareFilesAction)
			.withInput(CompareFilesInputHandler)
			.withOutput(CompareFilesOutputHandler)
			.build();
	}
};
