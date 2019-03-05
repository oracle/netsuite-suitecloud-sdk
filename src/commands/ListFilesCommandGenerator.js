'use strict';
const NodeUtils = require('./../utils/NodeUtils');
const BaseCommandGenerator = require('./BaseCommandGenerator');
const SDKExecutionContext = require('../SDKExecutor').SDKExecutionContext;

module.exports = class ListFilesCommandGenerator extends BaseCommandGenerator {
	constructor(options) {
		super(options);
	}

	_getCommandQuestions() {
		return new Promise(resolve => {

			let executionContext = new SDKExecutionContext({
				command: 'listfolders',
				showOutput: false,
            });
            NodeUtils.println("Loading folders...", NodeUtils.COLORS.CYAN);
            
			return this._sdkExecutor.execute(executionContext).then(result => {
				resolve([                    
                    {
						type: 'list',
						name: this._commandMetadata.options.folder.name,
						message: 'Select the FileCabinet folder',
						default: '/SuiteScripts',
						choices: JSON.parse(result),
					}
				]);
			});
		});
	}

	_executeAction(answers) {
		let executionContext = new SDKExecutionContext({
			command: this._commandMetadata.name,
			params: answers,
        });
		return this._sdkExecutor.execute(executionContext);
	}
};
