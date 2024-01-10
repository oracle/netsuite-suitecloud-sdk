/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const path = require('path');
const { prompt, Separator } = require('inquirer');
const CommandUtils = require('../../../utils/CommandUtils');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const FileSystemService = require('../../../services/FileSystemService');
const BaseInputHandler = require('../../base/BaseInputHandler');

const {
	COMMAND_UPDATE: { ERRORS, QUESTIONS, MESSAGES },
	YES,
	NO,
} = require('../../../services/TranslationKeys');

const { validateArrayIsNotEmpty, validateScriptId, showValidationResults } = require('../../../validation/InteractiveAnswersValidator');

const { FOLDERS } = require('../../../ApplicationConstants');
const ANSWERS_NAMES = {
	FILTER_BY_SCRIPT_ID: 'filterByScriptId',
	INCLUDE_CUSTOM_INSTANCES: 'includeinstances',
	OVERWRITE_OBJECTS: 'overwriteObjects',
	SCRIPT_ID_LIST: 'scriptid',
	SCRIPT_ID_FILTER: 'scriptIdFilter',
};

const COMMAND_OPTIONS = {
	AUTH_ID: 'authid',
	INCLUDE_CUSTOM_INSTANCES: 'includeinstances',
	PROJECT: 'project',
	SCRIPT_ID: 'scriptid',
};

const CUSTOM_RECORD_PREFIX = 'customrecord';

const MAX_ENTRIES_BEFORE_FILTER = 30;
const XML_EXTENSION = '.xml';

module.exports = class UpdateInputHandler extends BaseInputHandler {
	constructor(options) {
		super(options);
		this._fileSystemService = new FileSystemService();
	}

	async getParameters(params) {
		const foundXMLFiles = this._searchFilesFromObjectsFolder();
		let filteredObjectsList = await this._getObjectsToSelect(foundXMLFiles);
		const selectedScriptIds = await this._getSelectedScriptIds(filteredObjectsList);
		const customRecordsAndSegments = selectedScriptIds.filter((scriptid) => scriptid.startsWith(CUSTOM_RECORD_PREFIX));
		const includeCustomInstances = await this._includeCustomInstancesQuestion(customRecordsAndSegments);
		const overwriteObjects = await this._overwriteQuestion(includeCustomInstances);

		return {
			[ANSWERS_NAMES.OVERWRITE_OBJECTS]: overwriteObjects,
			[COMMAND_OPTIONS.SCRIPT_ID]: selectedScriptIds,
			[COMMAND_OPTIONS.INCLUDE_CUSTOM_INSTANCES]: includeCustomInstances,
		};
	}

	_searchFilesFromObjectsFolder() {
		const pathToObjectsFolder = path.join(this._projectFolder, FOLDERS.OBJECTS);
		const filesInObjectsFolder = this._fileSystemService.getFilesFromDirectory(pathToObjectsFolder);
		const foundXMLFiles = filesInObjectsFolder
			.filter((filename) => filename.endsWith(XML_EXTENSION))
			.map((file) => ({
				name: file.replace(this._projectFolder, '').slice(0, -XML_EXTENSION.length),
				value: path.basename(file, XML_EXTENSION),
			}));

		if (foundXMLFiles.length === 0) {
			throw NodeTranslationService.getMessage(ERRORS.NO_OBJECTS_IN_PROJECT);
		}
		return foundXMLFiles;
	}

	async _getObjectsToSelect(foundXMLFiles) {
		if (foundXMLFiles.length > MAX_ENTRIES_BEFORE_FILTER) {
			const filteredObjects = await this._filterObjectsByScriptId(foundXMLFiles);
			if (filteredObjects.length === 0) {
				throw NodeTranslationService.getMessage(MESSAGES.NO_OBJECTS_WITH_SCRIPT_ID_FILTER);
			}
			return filteredObjects;
		} else {
			return foundXMLFiles;
		}
	}

	async _filterObjectsByScriptId(foundXMLFiles) {
		const filterAnswers = await this._questionFilterByScriptId();
		const filteredObjects = filterAnswers[ANSWERS_NAMES.FILTER_BY_SCRIPT_ID]
			? foundXMLFiles.filter((element) => element.value.includes(filterAnswers[ANSWERS_NAMES.SCRIPT_ID_FILTER]))
			: foundXMLFiles;
		return filteredObjects;
	}

	async _getSelectedScriptIds(filteredObjects) {
		filteredObjects.push(new Separator());
		const selectObjectsToUpdateQuestion = {
			type: CommandUtils.INQUIRER_TYPES.CHECKBOX,
			name: ANSWERS_NAMES.SCRIPT_ID_LIST,
			message: NodeTranslationService.getMessage(QUESTIONS.SCRIPT_ID),
			default: 1,
			choices: filteredObjects,
			validate: (fieldValue) => showValidationResults(fieldValue, validateArrayIsNotEmpty),
		};
		const answers = await prompt([selectObjectsToUpdateQuestion]);

		return answers[ANSWERS_NAMES.SCRIPT_ID_LIST];
	}

	async _questionFilterByScriptId() {
		return await prompt([
			{
				type: CommandUtils.INQUIRER_TYPES.LIST,
				name: ANSWERS_NAMES.FILTER_BY_SCRIPT_ID,
				message: NodeTranslationService.getMessage(QUESTIONS.FILTER_BY_SCRIPT_ID),
				default: false,
				choices: [
					{ name: NodeTranslationService.getMessage(YES), value: true },
					{ name: NodeTranslationService.getMessage(NO), value: false },
				],
			},
			{
				when: (response) => {
					return response[ANSWERS_NAMES.FILTER_BY_SCRIPT_ID];
				},
				type: CommandUtils.INQUIRER_TYPES.INPUT,
				name: ANSWERS_NAMES.SCRIPT_ID_FILTER,
				message: NodeTranslationService.getMessage(QUESTIONS.SCRIPT_ID_FILTER),
				validate: (fieldValue) => showValidationResults(fieldValue, validateScriptId),
			},
		]);
	}
	async _includeCustomInstancesQuestion(customRecordsAndSegments) {
		const includeCustomInstancesQuestions = {
			when: customRecordsAndSegments.length >= 1,
			type: CommandUtils.INQUIRER_TYPES.LIST,
			name: ANSWERS_NAMES.INCLUDE_CUSTOM_INSTANCES,
			message: NodeTranslationService.getMessage(QUESTIONS.INCLUDE_CUSTOM_INSTANCES),
			default: false,
			choices: [
				{ name: NodeTranslationService.getMessage(YES), value: true },
				{ name: NodeTranslationService.getMessage(NO), value: false },
			],
		};
		const answer = await prompt([includeCustomInstancesQuestions]);
		return answer[ANSWERS_NAMES.INCLUDE_CUSTOM_INSTANCES];
	}

	async _overwriteQuestion(includeCustomInstances) {
		const message = includeCustomInstances
			? NodeTranslationService.getMessage(QUESTIONS.OVERWRITE_OBJECTS_WITH_CUSTOM_INSTANCES)
			: NodeTranslationService.getMessage(QUESTIONS.OVERWRITE_OBJECTS);
		const overwriteObjectsQuestion = {
			type: CommandUtils.INQUIRER_TYPES.LIST,
			name: ANSWERS_NAMES.OVERWRITE_OBJECTS,
			message: message,
			default: 0,
			choices: [
				{ name: NodeTranslationService.getMessage(YES), value: true },
				{ name: NodeTranslationService.getMessage(NO), value: false },
			],
		};
		const answers = await prompt([overwriteObjectsQuestion]);
		return answers[ANSWERS_NAMES.OVERWRITE_OBJECTS];
	}
};
