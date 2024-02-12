/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const assert = require('assert');
const NodeTranslationService = require('../../services/NodeTranslationService');
const { lineBreak } = require('../../loggers/LoggerConstants');
const { ERRORS } = require('../../services/TranslationKeys');

module.exports = class CommandUserExtension {
	constructor(cliConfig) {
		this._cliConfig = cliConfig;
	}

	async beforeExecuting(options) {
		assert(options);
		assert(options.commandName);
		assert(options.projectFolder);
		assert(options.arguments);

		try {
			if (!this._cliConfig.beforeExecuting) {
				return options;
			}
			const beforeExecutingContext = {
				command: options.commandName,
				projectPath: options.projectFolder,
				arguments: options.arguments,
			};
			const result = await this._cliConfig.beforeExecuting(beforeExecutingContext);
			this._validateBeforeExecutingResult(result);
			return result;
		} catch (error) {
			throw NodeTranslationService.getMessage(ERRORS.CLI_CONFIG_BEFORE_EXECUTING_FAILED, lineBreak, error);
		}
	}

	onCompleted(options) {
		if (!this._cliConfig.onCompleted) {
			return options;
		}
		this._cliConfig.onCompleted(options);
	}

	onError(options) {
		if (!this._cliConfig.onError) {
			return options;
		}
		this._cliConfig.onError(options);
	}

	_validateBeforeExecutingResult(result) {
		if (typeof result === 'undefined' || typeof result.arguments !== 'object') {
			throw NodeTranslationService.getMessage(ERRORS.CLI_CONFIG_BEFORE_EXECUTING_WRONG_RETURN_VALUE);
		}
	}
};
