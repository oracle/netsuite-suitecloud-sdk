'use strict';
const NodeUtils = require('./../utils/NodeUtils');
const BaseCommandGenerator = require('./BaseCommandGenerator');
const LocalCommand = require('sdf-cli-local').LocalCommand;

module.exports = class LocalCommandGenerator extends BaseCommandGenerator {

	constructor(options) {
		super(options);
		this.local = new LocalCommand(options);
	}

	_getCommandQuestions(prompt) {
		this.local.initialize();
		return this.local.getCommandQuestions(prompt);
	}

	_executeAction(answers) {
		this.local.initialize();
		return this.local.executeAction(answers);
	}

};
