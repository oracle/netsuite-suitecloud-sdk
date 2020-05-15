/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { ActionResult } = require('../commands/actionresult/ActionResult');
const BaseCommandGenerator = require('./BaseCommandGenerator');
const SdkExecutionContext = require('../SdkExecutionContext');
const executeWithSpinner = require('../ui/CliSpinner').executeWithSpinner;
const NodeTranslationService = require('../services/NodeTranslationService');
const SdkOperationResultUtils = require('../utils/SdkOperationResultUtils');
const CommandUtils = require('../utils/CommandUtils');
const AddDependenciesOutputFormatter = require('./outputFormatters/AddDependenciesOutputFormatter');

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
		this._outputFormatter = new AddDependenciesOutputFormatter(options.consoleLogger);
	}

	_preExecuteAction(answers) {
		answers[COMMAND_OPTIONS.PROJECT] = CommandUtils.quoteString(this._projectFolder);
		return answers;
	}

	async _executeAction(answers) {
		try {
			const executionContext = SdkExecutionContext.Builder.forCommand(this._commandMetadata.sdkCommand)
				.integration()
				.addParams(answers)
				.addFlag(COMMAND_OPTIONS.ALL)
				.build();

			const operationResult = await executeWithSpinner({
				action: this._sdkExecutor.execute(executionContext),
				message: NodeTranslationService.getMessage(MESSAGES.ADDING_DEPENDENCIES),
			});

			return operationResult.status === SdkOperationResultUtils.STATUS.SUCCESS
				? ActionResult.Builder.withData(operationResult.data)
						.withResultMessage(operationResult.resultMessage)
						.build()
				: ActionResult.Builder.withErrors(SdkOperationResultUtils.collectErrorMessages(operationResult)).build();
		} catch (error) {
			return ActionResult.Builder.withErrors([error]).build();
		}
	}

	_supportsInteractiveMode() {
		return false;
	}
}

module.exports = AddDependenciesCommandGenerator;
