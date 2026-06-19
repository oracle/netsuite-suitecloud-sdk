/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const Command = require('../../Command');
const ProxyGenerateKeyAction = require('./ProxyGenerateKeyAction');
const ProxyGenerateKeyOutputHandler =  require('./ProxyGenerateKeyOutputHandler');

module.exports = {
	create(options) {
		return Command.Builder.withOptions(options)
			.withAction(ProxyGenerateKeyAction)
			.withOutput(ProxyGenerateKeyOutputHandler)
			.build();
	},
};