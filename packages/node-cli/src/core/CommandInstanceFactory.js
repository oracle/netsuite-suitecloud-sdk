/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
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
		assert(options.log);

		console.log(`CommandInstanceFactory: create with options: \n ${JSON.stringify(options)}`);
		const commandMetadata = options.commandMetadata;
		console.log(`1`);
		const commandGeneratorPath = options.runInInteractiveMode ? commandMetadata.interactiveGenerator : commandMetadata.nonInteractiveGenerator;
		console.log(`2: ${commandGeneratorPath}`);

		const Generator = require(commandGeneratorPath);
		console.log(`CommandInstanceFactory: Generator: \n ${JSON.stringify(Generator)}`);
		const generatorInstance = new Generator({
			commandMetadata,
			projectFolder: options.projectFolder,
			executionPath: options.executionPath,
			runInInteractiveMode: options.runInInteractiveMode,
			log: options.log,
		});

		return generatorInstance.create();
	}
};
