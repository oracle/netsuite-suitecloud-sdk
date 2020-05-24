/*
** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const assert = require('assert');
const OPTION_TYPE_FLAG = 'FLAG';
const INTERACTIVE_OPTION_NAME = 'interactive';
const INTERACTIVE_OPTION_ALIAS = 'i';
const NodeTranslationService = require('../services/NodeTranslationService');
const { COMMAND_OPTION_INTERACTIVE_HELP } = require('../services/TranslationKeys');
const { ActionResult } = require('../commands/actionresult/ActionResult');

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

		let commandSetup = program.command(`${commandMetadata.name} folder>`);
		//program.alias(this._alias)

		if (!runInInteractiveMode) {
			if (commandMetadata.supportsInteractiveMode) {
				const interactiveOptionHelp = NodeTranslationService.getMessage(
					COMMAND_OPTION_INTERACTIVE_HELP,
					commandMetadata.name
				);
				commandMetadata.options.interactive = {
					name: INTERACTIVE_OPTION_NAME,
					alias: INTERACTIVE_OPTION_ALIAS,
					description: interactiveOptionHelp,
					type: OPTION_TYPE_FLAG,
					mandatory: false,
				};
			}
			commandSetup = this._addNonInteractiveCommandOptions(
				commandSetup,
				commandMetadata.options
			);
		}

		commandSetup.description(commandMetadata.description).action(async (options) => {
			const actionResult = await executeCommandFunction(options);
			process.exitCode = actionResult.status === ActionResult.STATUS.SUCCESS ? 0 : 1;
		});
	}

	_addNonInteractiveCommandOptions(commandSetup, options) {
		const optionsSortedByName = Object.values(options).sort((option1, option2) =>
			option1.name.localeCompare(option2.name)
		);
		optionsSortedByName.forEach(option => {
			if (option.disableInIntegrationMode) {
				return;
			}
			let mandatoryOptionString = '';
			let optionString = '';
			if (option.alias) {
				optionString = `-${option.alias}, `;
			}
			optionString += `--${option.name}`;

			if (option.type !== OPTION_TYPE_FLAG) {
				mandatoryOptionString = '<argument>';
				optionString += ` ${mandatoryOptionString}`;
			}
			commandSetup.option(optionString, option.description);
		});
		return commandSetup;
	}
};
