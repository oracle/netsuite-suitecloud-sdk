'use strict';

const BaseCommandGenerator = require('./BaseCommandGenerator');
const SDKExecutionContext = require('../SDKExecutionContext');
const CLIException = require('../CLIException');
const NodeUtils = require('../utils/NodeUtils');

const FLAG_OPTION_TYPE = 'FLAG';
const PROJECT_DIRECTORY_OPTION = 'projectdirectory';
const PROJECT_OPTION = 'project';

module.exports = class SDKWrapperCommandGenerator extends BaseCommandGenerator {
	constructor(options) {
		super(options);
	}

	_getCommandQuestions() {
		throw new CLIException(
			5,
			`Command ${this._commandMetadata.name} does not support interactive mode`
		);
	}

	_supportsInteractiveMode() {
		return false;
	}

	_setProjectFolderOptionsIfPresent(args) {
		var projectOptions = [PROJECT_OPTION, PROJECT_DIRECTORY_OPTION];
		projectOptions.forEach(projectOption => {
			if (this._commandMetadata.options[projectOption]) {
				args[projectOption] = this._projectFolder;
			}
		});
	}

	_preExecuteAction(args) {
		this._setProjectFolderOptionsIfPresent(args);
		return args;
	}

	_executeAction(args) {
		let executionContext = new SDKExecutionContext({
			command: this._commandMetadata.name,
			integrationMode: false
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

		return this._sdkExecutor.execute(executionContext);
	}

	// _formatOutput(result){
	// 	NodeUtils.println(result, NodeUtils.COLORS.RESULT);
	// }
};
