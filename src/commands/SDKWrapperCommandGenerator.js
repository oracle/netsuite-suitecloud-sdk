'use strict';

const BaseCommandGenerator = require('./BaseCommandGenerator');
const SDKExecutionContext = require('../SDKExecutor').SDKExecutionContext;
const CLIException = require('../CLIException');

module.exports = class SDKWrapperCommandGenerator extends BaseCommandGenerator {
	constructor(commandMetadata, customizedCommandOptions) {
		super(commandMetadata, customizedCommandOptions);
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

	_executeAction(args) {
		let executionContext = new SDKExecutionContext(this._commandMetadata.name);

		for (const optionId in this._commandMetadata.options) {
			if (
				this._commandMetadata.options.hasOwnProperty(optionId) &&
				args.hasOwnProperty(optionId)
			) {
				executionContext.addParam(optionId, args[optionId]);
			}
		}
		return this._sdkExecutor.execute(executionContext);
	}
};
