'use strict';
const NodeUtils = require('./../utils/NodeUtils');
const BaseCommandGenerator = require('./BaseCommandGenerator');
const LocalCommand = require('sdf-cli-local').LocalCommand;

module.exports = class LocalCommandGenerator extends BaseCommandGenerator {

	constructor(options) {
		super(options);
		this.local = new LocalCommand(options);
	}

	_getCommandQuestions() {
		return this.local.getCommandQuestions();
	}

	_executeAction(answers) {
		return this.local.executeAction(answers);
	}

};
