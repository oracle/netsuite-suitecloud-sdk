/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const Command = require('../../Command');
const UpdateAction = require('./UpdateAction');
const UpdateInputHandler = require('./UpdateInputHandler');
const UpdateOutputHandler = require('./UpdateOutputHandler');

module.exports = {
	create(options) {
		return Command.Builder.withOptions(options)
			.withAction(UpdateAction)
			.withInput(UpdateInputHandler)
			.withOutput(UpdateOutputHandler)
			.build();
	}
};