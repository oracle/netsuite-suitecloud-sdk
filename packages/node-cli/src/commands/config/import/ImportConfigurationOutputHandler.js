'use strict';

const BaseOutputHandler = require('../../base/BaseOutputHandler');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const { COMMAND_IMPORTCONFIGURATION } = require('../../../services/TranslationKeys');

module.exports = class ImportConfigurationOutputHandler extends BaseOutputHandler {
	parse(actionResult) {
		const successfulImports = actionResult.data?.successfulImports ?? [];
		const failedImports = actionResult.data?.failedImports ?? [];
		if (successfulImports.length) {
			this._log.result(NodeTranslationService.getMessage(COMMAND_IMPORTCONFIGURATION.OUTPUT.IMPORTED));
			successfulImports.forEach((item) => this._log.result(`${item.type}:${item.id}`));
		} else {
			this._log.result(NodeTranslationService.getMessage(COMMAND_IMPORTCONFIGURATION.OUTPUT.NONE_IMPORTED));
		}
		if (failedImports.length) {
			this._log.error(NodeTranslationService.getMessage(COMMAND_IMPORTCONFIGURATION.OUTPUT.NOT_IMPORTED));
			failedImports.forEach((item) => this._log.error(
				`${item.type}:${item.id} failed: ${item.message ?? ''}`.trimEnd()
			));
		}
		return actionResult;
	}
};
