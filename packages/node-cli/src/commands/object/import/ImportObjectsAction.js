/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { ActionResult } = require('../../../services/actionresult/ActionResult');
const CommandUtils = require('../../../utils/CommandUtils');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const executeWithSpinner = require('../../../ui/CliSpinner').executeWithSpinner;
const SdkOperationResultUtils = require('../../../utils/SdkOperationResultUtils');
const SdkExecutionContext = require('../../../SdkExecutionContext');
const { getProjectDefaultAuthId } = require('../../../utils/AuthenticationUtils');
const BaseAction = require('../../base/BaseAction');
const {
	COMMAND_IMPORTOBJECTS: { MESSAGES },
} = require('../../../services/TranslationKeys');

const ANSWERS_NAMES = {
	AUTH_ID: 'authid',
	APP_ID: 'appid',
	SCRIPT_ID: 'scriptid',
	SPECIFY_SCRIPT_ID: 'specifyscriptid',
	SPECIFY_SUITEAPP: 'specifysuiteapp',
	OBJECT_TYPE: 'type',
	SPECIFY_OBJECT_TYPE: 'specifyObjectType',
	TYPE_CHOICES_ARRAY: 'typeChoicesArray',
	DESTINATION_FOLDER: 'destinationfolder',
	PROJECT_FOLDER: 'project',
	OBJECTS_SELECTED: 'objects_selected',
	OVERWRITE_OBJECTS: 'overwrite_objects',
	IMPORT_REFERENCED_SUITESCRIPTS: 'import_referenced_suitescripts',
};

const COMMAND_FLAGS = {
	EXCLUDE_FILES: 'excludefiles',
};

const NUMBER_OF_SCRIPTS = 35;

module.exports = class ImportObjectsAction extends BaseAction {
	constructor(options) {
		super(options);
	}

	preExecute(answers) {
		answers[ANSWERS_NAMES.PROJECT_FOLDER] = CommandUtils.quoteString(this._projectFolder);
		answers[ANSWERS_NAMES.AUTH_ID] = getProjectDefaultAuthId(this._executionPath);

		return answers;
	}

	async execute(params) {
		if (params[ANSWERS_NAMES.OVERWRITE_OBJECTS] === false) {
			throw NodeTranslationService.getMessage(MESSAGES.CANCEL_IMPORT);
		}

		try {
			const flags = [];
			if (this._runInInteractiveMode) {
				if (params[ANSWERS_NAMES.IMPORT_REFERENCED_SUITESCRIPTS] !== undefined && !params[ANSWERS_NAMES.IMPORT_REFERENCED_SUITESCRIPTS]) {
					flags.push(COMMAND_FLAGS.EXCLUDE_FILES);
					delete params[ANSWERS_NAMES.IMPORT_REFERENCED_SUITESCRIPTS];
				}
			} else {
				if (params[COMMAND_FLAGS.EXCLUDE_FILES]) {
					flags.push(COMMAND_FLAGS.EXCLUDE_FILES);
					delete params[COMMAND_FLAGS.EXCLUDE_FILES];
				}
			}

			let scriptIdArray = params[ANSWERS_NAMES.SCRIPT_ID].split(' ');
			delete params[ANSWERS_NAMES.SCRIPT_ID];
			let operationResultData = {
				failedImports: [],
				successfulImports: [],
				errorImports: []
			};
			let operationResultStatus = SdkOperationResultUtils.STATUS.SUCCESS;

			for (let i = 0; i<scriptIdArray.length; i = i+NUMBER_OF_SCRIPTS) {
				let partialScriptIds = scriptIdArray.slice(i, i+NUMBER_OF_SCRIPTS)
				let partialScriptIdsString = partialScriptIds.join(' ');
				let sdkParams = CommandUtils.extractCommandOptions(params, this._commandMetadata);
				let partialExecutionContextForImportObjects = SdkExecutionContext.Builder.forCommand(this._commandMetadata.sdkCommand)
					.integration()
					.addFlags(flags)
					.addParams(sdkParams)
					.addParam(ANSWERS_NAMES.SCRIPT_ID, partialScriptIdsString)
					.build();
				const partialOperationResult = await executeWithSpinner({
					action: this._sdkExecutor.execute(partialExecutionContextForImportObjects),
					message: NodeTranslationService.getMessage(
						MESSAGES.IMPORTING_OBJECTS,
						(i/NUMBER_OF_SCRIPTS)+1,
						Math.ceil(scriptIdArray.length/NUMBER_OF_SCRIPTS)
					)
				});
				if (partialOperationResult.status === SdkOperationResultUtils.STATUS.ERROR) {
					operationResultData.errorImports = operationResultData.errorImports.concat({
						scriptIds: partialScriptIds,
						reason: partialOperationResult.errorMessages[0]
					})
				}
				else {
					if (partialOperationResult.data.failedImports.length > 0) {
						operationResultData.failedImports = operationResultData.failedImports.concat(partialOperationResult.data.failedImports);
					}
					if (partialOperationResult.data.successfulImports.length > 0) {
						operationResultData.successfulImports = operationResultData.successfulImports.concat(partialOperationResult.data.successfulImports);
					}
				}
				
			}

			return operationResultStatus === SdkOperationResultUtils.STATUS.SUCCESS
				? ActionResult.Builder.withData(operationResultData).build()
				// This will never happen. It will throw exception and enter in the catch block
				: ActionResult.Builder.withErrors(errorMessages).build();
		} catch (error) {
			return ActionResult.Builder.withErrors([error]).build();
		}
	}
};
