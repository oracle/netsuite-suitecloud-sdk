'use strict';
const NodeUtils = require('./../utils/NodeUtils');
const BaseCommandGenerator = require('./BaseCommandGenerator');
const LocalCommand = require('sdf-cli-local').LocalCommand;

module.exports = class LocalCommandGenerator extends BaseCommandGenerator {

	constructor(options) {
		super(options);
		this.local = new LocalCommand(options);
	}

	create(runInInteractiveMode){
		this.local.initialize();
		return super.create(runInInteractiveMode);
	}

	_getCommandQuestions(prompt) {
		return this.local.getCommandQuestions(prompt);
	}

	_executeAction(answers) {
		return this.local.executeAction(answers);
	}

};
