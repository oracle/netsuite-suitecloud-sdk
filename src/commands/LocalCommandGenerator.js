'use strict';
const BaseCommandGenerator = require('./BaseCommandGenerator');
const LocalCommand = require('sdf-cli-local').LocalCommand;

const { COLORS } = require('./../utils/NodeUtils');
const { COMMAND_LOCAL } = require('./../services/TranslationKeys');
const TranslationService = require('./../services/TranslationService');

module.exports = class LocalCommandGenerator extends BaseCommandGenerator {

	constructor(options) {
		super(options);

		options.colors = COLORS;
		options.translation = [TranslationService, COMMAND_LOCAL];
		
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
