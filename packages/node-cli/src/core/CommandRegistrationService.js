/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { Option } = require('commander');

const assert = require('assert');
const NodeTranslationService = require('../services/NodeTranslationService');
const { COMMAND_OPTIONS } = require('../services/TranslationKeys');
const OPTION_TYPE = {
	FLAG: 'FLAG',
	SINGLE: 'SINGLE',
	MULTIPLE: 'MULTIPLE',
};
const INTERACTIVE_OPTION_NAME = 'interactive';
const INTERACTIVE_OPTION_ALIAS = 'i';
const HELP_OPTION_ALIAS_NAME = '-h, --help';

const EXIT_CODE = {
	SUCCESS: 0,
	ERROR: 1,
};

module.exports = class CommandRegistrationService {
	register(options) {
		assert(options);
		assert(options.commandMetadata);
		assert(options.program);
		assert(options.executeCommandFunction);
		assert(typeof options.runInInteractiveMode === 'boolean');

		const commandMetadata = options.commandMetadata;
		const program = options.program;
		const executeCommandFunction = options.executeCommandFunction;
		const runInInteractiveMode = options.runInInteractiveMode;

		const helpMessage = NodeTranslationService.getMessage(COMMAND_OPTIONS.HELP);

		let commandSetup = program.command(commandMetadata.name).helpOption(HELP_OPTION_ALIAS_NAME, helpMessage);

		if (!runInInteractiveMode) {
			if (commandMetadata.supportsInteractiveMode) {
				const interactiveOptionHelp = NodeTranslationService.getMessage(COMMAND_OPTIONS.INTERACTIVE_HELP, commandMetadata.name);
				commandMetadata.options.interactive = {
					name: INTERACTIVE_OPTION_NAME,
					alias: INTERACTIVE_OPTION_ALIAS,
					description: interactiveOptionHelp,
					type: OPTION_TYPE.FLAG,
					mandatory: false,
				};
			}
			commandSetup = this._addNonInteractiveCommandOptions(commandSetup, commandMetadata.options);
		}

		commandSetup.description(commandMetadata.description).action(async (options) => {
			const actionResult = await executeCommandFunction(options);
			process.exitCode = actionResult.isSuccess() ? EXIT_CODE.SUCCESS : EXIT_CODE.ERROR;
		});
	}

	_addNonInteractiveCommandOptions(commandSetup, options) {
		const optionsSortedByName = Object.values(options).sort((option1, option2) => option1.name.localeCompare(option2.name));
		optionsSortedByName.forEach((option) => {
			if (option.disableInIntegrationMode) {
				return;
			}
			let optionString = '';
			if (option.alias) {
				optionString = `-${option.alias}, `;
			}
			optionString += `--${option.name}`;

			if (option.type === OPTION_TYPE.SINGLE) {
				optionString += ` <argument>`;
			} else if (option.type === OPTION_TYPE.MULTIPLE) {
				optionString += ` <arguments...>`;
			}

			const commandOption = new Option(optionString, option.description);
			if (option.hidden) {
				commandOption.hideHelp();
			}
			commandSetup.addOption(commandOption);
		});
		return commandSetup;
	}
};
