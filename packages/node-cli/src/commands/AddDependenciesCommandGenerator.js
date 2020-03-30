/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { ActionResult } = require('../commands/actionresult/ActionResult');
const BaseCommandGenerator = require('./BaseCommandGenerator');
const SDKExecutionContext = require('../SDKExecutionContext');
const executeWithSpinner = require('../ui/CliSpinner').executeWithSpinner;
const TranslationService = require('../services/TranslationService');
const ActionResultUtils = require('../utils/ActionResultUtils');
const SDKOperationResultUtils = require('../utils/SDKOperationResultUtils');
const CommandUtils = require('../utils/CommandUtils');
const AddDependenciesOutputFormatter = require('./formatOutput/AddDependenciesOutputFormatter');

const {
	COMMAND_ADDDEPENDENCIES: { MESSAGES },
} = require('../services/TranslationKeys');

const COMMAND_OPTIONS = {
	ALL: 'all',
	PROJECT: 'project',
};

class AddDependenciesCommandGenerator extends BaseCommandGenerator {
	constructor(options) {
		super(options);
	}

	_preExecuteAction(answers) {
		answers[COMMAND_OPTIONS.PROJECT] = CommandUtils.quoteString(this._projectFolder);
		return answers;
	}

	async _executeAction(answers) {
		try {
			const executionContext = new SDKExecutionContext({
				command: this._commandMetadata.sdkCommand,
				params: answers,
				flags: [COMMAND_OPTIONS.ALL],
				requiresContextParams: true,
			});

			const operationResult = await executeWithSpinner({
				action: this._sdkExecutor.execute(executionContext),
				message: TranslationService.getMessage(MESSAGES.ADDING_DEPENDENCIES),
			});

			return operationResult.status === SDKOperationResultUtils.SUCCESS
				? ActionResult.Builder.withData(operationResult.data)
						.withResultMessage(operationResult.resultMessage)
						.build()
				: ActionResult.Builder.withErrors(ActionResultUtils.collectErrorMessages(operationResult)).build();
		} catch (error) {
			return ActionResult.Builder.withErrors([error]).build();
		}
	}

	_supportsInteractiveMode() {
		return false;
	}

	_formatOutput(actionResult) {
		new AddDependenciesOutputFormatter(this._consoleLogger).formatOutput(actionResult);
	}
}

module.exports = AddDependenciesCommandGenerator;
