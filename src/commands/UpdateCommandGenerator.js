/*
 ** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const path = require('path');
const inquirer = require('inquirer');
const BaseCommandGenerator = require('./BaseCommandGenerator');
const CommandUtils = require('../utils/CommandUtils');
const TranslationService = require('../services/TranslationService');
const FileSystemService = require('../services/FileSystemService');
const executeWithSpinner = require('../ui/CliSpinner').executeWithSpinner;
const NodeUtils = require('../utils/NodeUtils');
const SDKExecutionContext = require('../SDKExecutionContext');
const SDKOperationResultUtils = require('../utils/SDKOperationResultUtils');

const {
	COMMAND_UPDATE: { ERRORS, QUESTIONS, MESSAGES, OUTPUT },
	YES,
	NO,
} = require('../services/TranslationKeys');

const { validateArrayIsNotEmpty, validateScriptId, showValidationResults } = require('../validation/InteractiveAnswersValidator');

const { FOLDER_NAMES } = require('../ApplicationConstants');
const ANSWERS_NAMES = {
	FILTER_BY_SCRIPT_ID: 'filterByScriptId',
	OVERWRITE_OBJECTS: 'overwriteObjects',
	SCRIPT_ID_LIST: 'scriptid',
	SCRIPT_ID_FILTER: 'scriptIdFilter',
};

const COMMAND_OPTIONS = {
	PROJECT: 'project',
	SCRIPT_ID: 'scriptid',
};

const MAX_ENTRIES_BEFORE_FILTER = 30;
const XML_EXTENSION = '.xml';

const UPADATED_OBJECT_TYPE = {
	SUCCESS: 'SUCCESS',
};

module.exports = class UpdateCommandGenerator extends BaseCommandGenerator {
	constructor(options) {
		super(options);
		this._fileSystemService = new FileSystemService();
	}

	async _getCommandQuestions(prompt) {
		const pahtToObjectsFolder = path.join(this._projectFolder, FOLDER_NAMES.OBJECTS);
		const filesInObjectsFolder = this._fileSystemService.getFilesFromDirectory(pahtToObjectsFolder);
		const foundXMLFiles = filesInObjectsFolder
			.filter(filename => filename.endsWith(XML_EXTENSION))
			.map(file => ({
				name: file.replace(this._projectFolder, '').slice(0, -XML_EXTENSION.length),
				value: path.basename(file, XML_EXTENSION),
			}));

		if (foundXMLFiles.length == 0) {
			throw TranslationService.getMessage(ERRORS.NO_OBJECTS_IN_PROJECT);
		}

		let filteredObjects;

		if (foundXMLFiles.length > MAX_ENTRIES_BEFORE_FILTER) {
			const filterAnswers = await prompt([
				{
					type: CommandUtils.INQUIRER_TYPES.LIST,
					name: ANSWERS_NAMES.FILTER_BY_SCRIPT_ID,
					message: TranslationService.getMessage(QUESTIONS.FILTER_BY_SCRIPT_ID),
					default: false,
					choices: [
						{ name: TranslationService.getMessage(YES), value: true },
						{ name: TranslationService.getMessage(NO), value: false },
					],
				},
				{
					when: response => {
						return response[ANSWERS_NAMES.FILTER_BY_SCRIPT_ID];
					},
					type: CommandUtils.INQUIRER_TYPES.INPUT,
					name: ANSWERS_NAMES.SCRIPT_ID_FILTER,
					message: TranslationService.getMessage(QUESTIONS.SCRIPT_ID_FILTER),
					validate: fieldValue => showValidationResults(fieldValue, validateScriptId),
				},
			]);
			filteredObjects = filterAnswers[ANSWERS_NAMES.FILTER_BY_SCRIPT_ID]
				? foundXMLFiles.filter(element => element.value.includes(filterAnswers[ANSWERS_NAMES.SCRIPT_ID_FILTER]))
				: foundXMLFiles;
			if (filteredObjects.length === 0) {
				throw TranslationService.getMessage(MESSAGES.NO_OBJECTS_WITH_SCRIPT_ID_FILTER);
			}
		} else {
			filteredObjects = foundXMLFiles;
		}

		filteredObjects.push(new inquirer.Separator());

		const answers = await prompt([
			{
				when: foundXMLFiles.length > 1,
				type: CommandUtils.INQUIRER_TYPES.CHECKBOX,
				name: ANSWERS_NAMES.SCRIPT_ID_LIST,
				message: TranslationService.getMessage(QUESTIONS.SCRIPT_ID),
				default: 1,
				choices: filteredObjects,
				validate: fieldValue => showValidationResults(fieldValue, validateArrayIsNotEmpty),
			},
			{
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: ANSWERS_NAMES.OVERWRITE_OBJECTS,
				message: TranslationService.getMessage(QUESTIONS.OVERWRITE_OBJECTS),
				default: 0,
				choices: [
					{ name: TranslationService.getMessage(YES), value: true },
					{ name: TranslationService.getMessage(NO), value: false },
				],
			},
		]);

		return {
			[ANSWERS_NAMES.OVERWRITE_OBJECTS]: answers[ANSWERS_NAMES.OVERWRITE_OBJECTS],
			[COMMAND_OPTIONS.SCRIPT_ID]: [...new Set(answers[ANSWERS_NAMES.SCRIPT_ID_LIST])].join(' '),
		};
	}

	_preExecuteAction(args) {
		return {
			...args,
			[COMMAND_OPTIONS.PROJECT]: CommandUtils.quoteString(this._projectFolder),
		};
	}

	async _executeAction(args) {
		if (args.hasOwnProperty(ANSWERS_NAMES.OVERWRITE_OBJECTS) && !args[ANSWERS_NAMES.OVERWRITE_OBJECTS]) {
			throw TranslationService.getMessage(MESSAGES.CANCEL_UPDATE);
		}
		const SDKParams = CommandUtils.extractCommandOptions(args, this._commandMetadata);

		const executionContextForUpdate = new SDKExecutionContext({
			command: this._commandMetadata.name,
			includeProjectDefaultAuthId: true,
			params: SDKParams,
		});

		return await executeWithSpinner({
			action: this._sdkExecutor.execute(executionContextForUpdate),
			message: TranslationService.getMessage(MESSAGES.UPDATING_OBJECTS),
		});
	}

	_formatOutput(operationResult) {
		const { data } = operationResult;

		if (SDKOperationResultUtils.hasErrors(operationResult)) {
			SDKOperationResultUtils.logResultMessage(operationResult);
			SDKOperationResultUtils.logErrors(operationResult);
			return;
		}

		const updatedObjects = data.filter(element => element.type === UPADATED_OBJECT_TYPE.SUCCESS);
		const noUpdatedObjects = data.filter(element => element.type !== UPADATED_OBJECT_TYPE.SUCCESS);
		const sortByKey = (a, b) => (a.key > b.key ? 1 : -1);

		if (updatedObjects.length > 0) {
			NodeUtils.println(TranslationService.getMessage(OUTPUT.UPDATED_OBJECTS), NodeUtils.COLORS.RESULT);
			updatedObjects.sort(sortByKey).forEach(updatedObject => NodeUtils.println(updatedObject.key, NodeUtils.COLORS.RESULT));
		}
		if (noUpdatedObjects.length > 0) {
			NodeUtils.println(TranslationService.getMessage(OUTPUT.NO_UPDATED_OBJECTS), NodeUtils.COLORS.WARNING);
			noUpdatedObjects.sort(sortByKey).forEach(noUpdatedObject => NodeUtils.println(noUpdatedObject.message, NodeUtils.COLORS.WARNING));
		}
	}
};
