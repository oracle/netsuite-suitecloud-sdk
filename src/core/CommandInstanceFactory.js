/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const assert = require('assert');

module.exports = class CommandInstanceFactory {
	create(options) {
		assert(options);
		assert(options.commandMetadata);
		assert(options.projectFolder);
		assert(options.executionPath);
		assert(typeof options.runInInteractiveMode === 'boolean');

		const commandMetadata = options.commandMetadata;
		const commandGeneratorPath = options.runInInteractiveMode
			? commandMetadata.interactiveGenerator
			: commandMetadata.nonInteractiveGenerator;

		const Generator = require(commandGeneratorPath);
		const generatorInstance = new Generator({
			commandMetadata,
			projectFolder: options.projectFolder,
			executionPath: options.executionPath,
			runInInteractiveMode: options.runInInteractiveMode,
		});

		return generatorInstance.create();
	}
};
