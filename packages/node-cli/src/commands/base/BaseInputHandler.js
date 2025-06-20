/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const NodeTranslationService = require('../../services/NodeTranslationService');
const {
	ERRORS: {
		ERRORS_INQUIRER_PROMPT_NOT_INITIALIZED,
		ERRORS_INQUIRER_SEPARATOR_NOT_INITIALIZED,
	},
} = require('../../services/TranslationKeys');
const loadInquirerUtils = async () => {
	const { InquirerPrompt, InquirerSeparator } = await import('../../utils/InquirerUtils.mjs');
	return { InquirerPrompt, InquirerSeparator };
};

module.exports = class BaseInputHandler {
	constructor(options) {
		this._projectFolder = options.projectFolder;
		this._commandMetadata = options.commandMetadata;
		this._executionPath = options.executionPath;
		this._log = options.log;
		this._runInInteractiveMode = options.runInInteractiveMode;
		this._executionEnvironmentContext = options.executionEnvironmentContext;
		this._sdkPath = options.sdkPath;
		//This two values will store prompt and separator classes imported from the inquirer library
		this._prompt = null;
		this._separator = null;
	}

	//Inquirer library is ESM therefore it must be loaded in async way
	async initInquirer() {
		if (this._prompt === null || this._separator === null) {
			const { InquirerPrompt, InquirerSeparator } = await loadInquirerUtils();
			this._prompt = InquirerPrompt.prompt;
			this._separator = InquirerSeparator.Separator;
		}
	}

	//Before using prompt initInquirer() must be run
	get prompt() {
		if (this._prompt === null) {
			throw NodeTranslationService.getMessage(ERRORS_INQUIRER_PROMPT_NOT_INITIALIZED);
		} else {
			return this._prompt;
		}
	}

	//Before using separator initInquirer() must be run
	get separator() {
		if (this._separator === null) {
			throw NodeTranslationService.getMessage(ERRORS_INQUIRER_SEPARATOR_NOT_INITIALIZED);
		} else {
			return this._separator;
		}
	}

	async getParameters(params) {
		return params;
	}
};
