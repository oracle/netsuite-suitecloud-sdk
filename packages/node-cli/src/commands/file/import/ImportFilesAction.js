/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
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
	COMMAND_IMPORTFILES: { ERRORS, MESSAGES, WARNINGS },
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
		this._calledFromCompareFiles = true;
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

		if (params['calledfromcomparefiles']) {
			this._calledFromCompareFiles = true;
			delete params['calledfromcomparefiles'];
		}

		return params;
	}

	async execute(params) {
		try {
			if (this._projectInfoService.getProjectType() === PROJECT_SUITEAPP) {
				return ActionResult.Builder.withErrors([NodeTranslationService.getMessage(ERRORS.IS_SUITEAPP)]).build();
			}

			if (!this._calledFromCompareFiles && this._runInInteractiveMode === false) {
				this._log.info(NodeTranslationService.getMessage(WARNINGS.OVERRIDE));
			}

			const executionContextImportObjects = SdkExecutionContext.Builder.forCommand(this._commandMetadata.sdkCommand)
				.integration()
				.addParams(params)
				.build();

			const operationResult = await executeWithSpinner({
				action: this._sdkExecutor.execute(executionContextImportObjects),
				message: NodeTranslationService.getMessage(MESSAGES.IMPORTING_FILES),
			});

			if (this._calledFromCompareFiles) {
				params['calledfromcomparefiles'] = true;
			}

			return operationResult.status === SdkOperationResultUtils.STATUS.SUCCESS
				? ActionResult.Builder.withData(operationResult.data)
					.withResultMessage(operationResult.resultMessage)
					.withCommandParameters(params)
					.build()
				: ActionResult.Builder.withErrors(operationResult.errorMessages).withCommandParameters(params).build();
		} catch (error) {
			return ActionResult.Builder.withErrors([error]).build();
		}
	}
};
