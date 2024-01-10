/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const Command = require('../../Command');
const PackageAction = require('./PackageAction');
const PackageOutputHandler = require('./PackageOutputHandler');

module.exports = {
	create(options) {
		return Command.Builder.withOptions(options)
			.withAction(PackageAction)
			.withOutput(PackageOutputHandler)
			.build();
	}
};