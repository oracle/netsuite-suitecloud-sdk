/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { ActionResult } = require('../../../services/actionresult/ActionResult');
const CommandUtils = require('../../../utils/CommandUtils');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const { executeWithSpinner } = require('../../../ui/CliSpinner');
const SdkOperationResultUtils = require('../../../utils/SdkOperationResultUtils');
const SdkExecutionContext = require('../../../SdkExecutionContext');
const ProjectInfoService = require('../../../services/ProjectInfoService');
const { PROJECT_SUITEAPP } = require('../../../ApplicationConstants');
const { getProjectDefaultAuthId } = require('../../../utils/AuthenticationUtils');
const BaseAction = require('../../base/BaseAction');
const {
	COMMAND_IMPORTFILES: { ERRORS, MESSAGES },
} = require('../../../services/TranslationKeys');

const COMMAND_OPTIONS = {
	AUTH_ID: 'authid',
	FOLDER: 'folder',
	PATHS: 'paths',
	EXCLUDE_PROPERTIES: 'excludeproperties',
	PROJECT: 'project',
};

module.exports = class ImportFilesAction extends BaseAction {
	constructor(options) {
		super(options);

		this._projectInfoService = new ProjectInfoService(this._projectFolder);
	}

	preExecute(params) {
		const { PROJECT, PATHS, EXCLUDE_PROPERTIES, AUTH_ID } = COMMAND_OPTIONS;
		params[PROJECT] = CommandUtils.quoteString(this._projectFolder);
		params[AUTH_ID] = getProjectDefaultAuthId(this._executionPath);
		if (params.hasOwnProperty(PATHS)) {
			if (Array.isArray(params[PATHS])) {
				params[PATHS] = params[PATHS].map(CommandUtils.quoteString).join(' ');
			} else {
				params[PATHS] = CommandUtils.quoteString(params[PATHS]);
			}
		}
		if (params[EXCLUDE_PROPERTIES]) {
			params[EXCLUDE_PROPERTIES] = '';
		} else {
			delete params[EXCLUDE_PROPERTIES];
		}
		return params;
	}

	async execute(params) {
		try {
			if (this._projectInfoService.getProjectType() === PROJECT_SUITEAPP) {
				throw NodeTranslationService.getMessage(ERRORS.IS_SUITEAPP);
			}

			const executionContextImportObjects = SdkExecutionContext.Builder.forCommand(this._commandMetadata.sdkCommand)
				.integration()
				.addParams(params)
				.build();

			const operationResult = await executeWithSpinner({
				action: this._sdkExecutor.execute(executionContextImportObjects),
				message: NodeTranslationService.getMessage(MESSAGES.IMPORTING_FILES),
			});

			return operationResult.status === SdkOperationResultUtils.STATUS.SUCCESS
				? ActionResult.Builder.withData(operationResult.data).withResultMessage(operationResult.resultMessage).build()
				: ActionResult.Builder.withErrors(operationResult.errorMessages).build();
		} catch (error) {
			return ActionResult.Builder.withErrors([error]).build;
		}
	}
};
