/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';
const path = require('path');
const inquirer = require('inquirer')
const BaseCommandGenerator = require('./BaseCommandGenerator');
const CommandUtils = require('../utils/CommandUtils');
const NodeUtils = require('../utils/NodeUtils');
const OBJECT_TYPES = require('../metadata/ObjectTypesMetadata');
const ProjectInfoService = require('../services/ProjectInfoService');
const TranslationService = require('../services/TranslationService');
const FileSystemService = require('../services/FileSystemService');
const CommandsMetadataService = require('../core/CommandsMetadataService');
const executeWithSpinner = require('../ui/CliSpinner').executeWithSpinner;
const SDKOperationResultUtils = require('../utils/SDKOperationResultUtils');
const SDKExecutionContext = require('../SDKExecutionContext');
const ANSWERS_NAMES = {
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
	OVERRITE_OBJECTS: 'overwrite_objects',
};
const IMPORT_0BJECT = {
	SUCCESS: 'SUCCESS',
	FAILED: 'FAILED',
};
const { PROJECT_SUITEAPP, FOLDER_NAMES } = require('../ApplicationConstants');
const {
	COMMAND_UPDATE: { ERRORS, QUESTIONS, MESSAGES },
	ERRORS: { PROMPTING_INTERACTIVE_QUESTIONS_FAILED },
	YES,
	NO,
} = require('../services/TranslationKeys');

const {
	validateArrayIsNotEmpty,
	validateScriptId,
	validateSuiteApp,
	showValidationResults,
} = require('../validation/InteractiveAnswersValidator');
const LIST_OBJECTS_COMMAND_NAME = 'listobjects';

module.exports = class ListObjectsCommandGenerator extends BaseCommandGenerator {
    constructor(options) {
        super(options);
        this._fileSystemService = new FileSystemService();
    }

	async _getCommandQuestions(prompt) {
        const pahtToObjectsFolder = path.join(this._projectFolder, 'Objects');
        const filesInObjectsFolder = this._fileSystemService.getFilesFromDirectory(pahtToObjectsFolder)
        console.log(filesInObjectsFolder)
        const choices = filesInObjectsFolder
            .filter(filename => filename.endsWith('.txt'))
            .map(filename => filename.replace(this._projectFolder,''))
            .map(file => ({name: file}))    
        choices.push(new inquirer.Separator())

        const answers = await prompt([
            {
				when: choices.length > 1,
				type: CommandUtils.INQUIRER_TYPES.CHECKBOX,
				name: ANSWERS_NAMES.SCRIPT_ID,
				message: TranslationService.getMessage(QUESTIONS.SCRIPT_ID),
				default: 1,
				choices,
			},
        ])
        console.log(answers)
		return answers;
	}
	
	_executeAction() {}

	_preExecuteAction(args) {
		return args;
    }

    // _formatOutput(actionResult) {

    // }
}