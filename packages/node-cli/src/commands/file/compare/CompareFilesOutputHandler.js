/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const BaseOutputHandler = require('../../base/BaseOutputHandler');
const FileDifferenceUtils = require('../../../utils/FileDifferenceUtils');
const NodeTranslationService = require('../../../services/NodeTranslationService');

const {
	COMMAND_COMPAREFILE: { OUTPUT },
} = require('../../../services/TranslationKeys');

module.exports = class CompareFilesOutputHandler extends BaseOutputHandler {
	constructor(options) {
		super(options);
	}

	parse(actionResult) {
		const data = actionResult.data || {};

		if (data.remoteLoaded === false) {
			this._log.warning(NodeTranslationService.getMessage(OUTPUT.NOT_IN_ACCOUNT, data.path));
			return actionResult;
		}

		if (data.identical) {
			this._log.result(NodeTranslationService.getMessage(OUTPUT.IDENTICAL, data.path));
			return actionResult;
		}

		if (!data.localExists) {
			this._log.warning(NodeTranslationService.getMessage(OUTPUT.LOCAL_NOT_FOUND, data.path));
		}

		this._log.info(NodeTranslationService.getMessage(OUTPUT.DIFF_HEADER, data.path));
		this._log.println(FileDifferenceUtils.renderDiff(data.lines, this._useColor()));
		return actionResult;
	}

	// Colorize only when writing to an interactive terminal, mirroring how diff tools like git behave.
	_useColor() {
		return process.stdout.isTTY === true;
	}
};
