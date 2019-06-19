'use strict';
const assert = require('assert');

module.exports = class Command {
	constructor(options) {
		assert(options);
		assert(options.commandMetadata);
		assert(options.projectFolder);
		assert(options.getCommandQuestionsFunc instanceof Function);
		assert(options.preActionFunc instanceof Function);
		assert(options.actionFunc instanceof Function);

		this._commandMetadata = options.commandMetadata;
		this._projectFolder = options.projectFolder;
		this._getCommandQuestions = options.getCommandQuestionsFunc;
		this._preActionFunc = options.preActionFunc;
		this._action = options.actionFunc;
		this._options = options.options;
		this._formatOutputFunc = options.formatOutputFunc;
	}

	get commandMetadata() {
		return this._commandMetadata;
	}

	get projectFolder() {
		return this._projectFolder;
	}

	get getCommandQuestions() {
		return this._getCommandQuestions;
	}

	get preActionFunc() {
		return this._preActionFunc;
	}

	get actionFunc() {
		return this._action;
	}

	get formatOutputFunc() {
		return this._formatOutputFunc;
	}
};
