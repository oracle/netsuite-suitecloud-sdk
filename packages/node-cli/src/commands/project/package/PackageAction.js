/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const path = require('path');
const BaseAction = require('../../base/BaseAction');
const SdkExecutionContext = require('../../../SdkExecutionContext');
const { executeWithSpinner } = require('../../../ui/CliSpinner');
const SdkOperationResultUtils = require('../../../utils/SdkOperationResultUtils');
const CommandUtils = require('../../../utils/CommandUtils');
const { ActionResult } = require('../../../services/actionresult/ActionResult');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const AccountSpecificValuesUtils = require('../../../utils/AccountSpecificValuesUtils');
const FileUtils = require('../../../utils/FileUtils');
const { ERRORS, COMMAND_PACKAGE } = require('../../../services/TranslationKeys');
const {
	LINKS: { INFO },
} = require('../../../ApplicationConstants');

const {
	FILES: { MANIFEST_XML },
} = require('../../../ApplicationConstants');
const { lineBreak } = require('../../../loggers/LoggerConstants');

const COMMAND_OPTIONS = {
	PROJECT: 'project',
	DESTINATION: 'destination',
};

const DEFAULT_DESTINATION_FOLDER = 'build';

module.exports = class PackageAction extends BaseAction {
	constructor(options) {
		super(options);
	}

	preExecute(params) {
		this._checkWorkingDirectoryContainsValidProject();
		AccountSpecificValuesUtils.validate(params, this._projectFolder);

		return {
			[COMMAND_OPTIONS.DESTINATION]: CommandUtils.quoteString(path.join(this._executionPath, DEFAULT_DESTINATION_FOLDER)),
			[COMMAND_OPTIONS.PROJECT]: CommandUtils.quoteString(this._projectFolder),
			...AccountSpecificValuesUtils.transformArgument(params),
		};
	}

	async execute(params) {
		const sdkParams = CommandUtils.extractCommandOptions(params, this._commandMetadata);

		const executionContext = SdkExecutionContext.Builder.forCommand(this._commandMetadata.sdkCommand).integration().addParams(sdkParams).build();

		this._log.warning(NodeTranslationService.getMessage(COMMAND_PACKAGE.LOCAL_VALIDATION_NOT_EXECUTED));

		const operationResult = await executeWithSpinner({
			action: this._sdkExecutor.execute(executionContext),
			message: NodeTranslationService.getMessage(COMMAND_PACKAGE.PACKAGING),
		});
		return operationResult.status === SdkOperationResultUtils.STATUS.SUCCESS
			? ActionResult.Builder.withData(operationResult.data).withResultMessage(operationResult.resultMessage).build()
			: ActionResult.Builder.withErrors(operationResult.errorMessages).build();
	}

	_checkWorkingDirectoryContainsValidProject() {
		if (!FileUtils.exists(path.join(this._projectFolder, MANIFEST_XML))) {
			throw (
				NodeTranslationService.getMessage(ERRORS.NOT_PROJECT_FOLDER, MANIFEST_XML, this._projectFolder, this._commandMetadata.name) +
				lineBreak +
				NodeTranslationService.getMessage(ERRORS.SEE_PROJECT_STRUCTURE, INFO.PROJECT_STRUCTURE)
			);
		}
	}
};
