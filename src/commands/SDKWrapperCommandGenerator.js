'use strict';

const BaseCommandGenerator = require('./BaseCommandGenerator');
const executeWithSpinner = require('../ui/CliSpinner').executeWithSpinner;
const CommandUtils = require('../utils/CommandUtils');
const SDKExecutionContext = require('../SDKExecutionContext');
const TranslationService = require('../services/TranslationService');
const {
	COMMAND_SDK_WRAPPER: { MESSAGES },
} = require('../services/TranslationKeys');

const FLAG_OPTION_TYPE = 'FLAG';
const PROJECT_DIRECTORY_OPTION = 'projectdirectory';
const PROJECT_OPTION = 'project';

module.exports = class SDKWrapperCommandGenerator extends BaseCommandGenerator {
	constructor(options) {
		super(options);
	}

	_supportsInteractiveMode() {
		return false;
	}

	_setProjectFolderOptionsIfPresent(args) {
		const projectOptions = [PROJECT_OPTION, PROJECT_DIRECTORY_OPTION];
		projectOptions.forEach(projectOption => {
			if (this._commandMetadata.options[projectOption]) {
				args[projectOption] = CommandUtils.quoteString(this._projectFolder);
			}
		});
	}

	_preExecuteAction(args) {
		this._setProjectFolderOptionsIfPresent(args);
		return args;
	}

	_executeAction(args) {
		const executionContext = new SDKExecutionContext({
			command: this._commandMetadata.name,
			integrationMode: false,
		});

		for (const optionId in this._commandMetadata.options) {
			if (
				this._commandMetadata.options.hasOwnProperty(optionId) &&
				args.hasOwnProperty(optionId)
			) {
				if (this._commandMetadata.options[optionId].type === FLAG_OPTION_TYPE) {
					if (args[optionId]) {
						executionContext.addFlag(optionId);
					}
				} else {
					executionContext.addParam(optionId, args[optionId]);
				}
			}
		}
		return executeWithSpinner({
			action: this._sdkExecutor.execute(executionContext),
			message: TranslationService.getMessage(
				MESSAGES.EXECUTING_COMMAND,
				this._commandMetadata.name
			),
		});
	}
};
