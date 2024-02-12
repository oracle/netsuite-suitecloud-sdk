/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { prompt, Separator } = require('inquirer');
const path = require('path');
const { FOLDERS } = require('../../../ApplicationConstants');
const {
    showValidationResults,
    validateArrayIsNotEmpty,
    validateFieldIsNotEmpty,
    validateSuiteScriptFileDoesNotExist,
    validateFileName
} = require('../../../validation/InteractiveAnswersValidator');
const {
    COMMAND_CREATEFILE: { QUESTIONS },
    YES,
    NO,
} = require('../../../services/TranslationKeys');
const ApplicationConstants = require('../../../ApplicationConstants');
const BaseInputHandler = require('../../base/BaseInputHandler');
const CommandUtils = require('../../../utils/CommandUtils');
const FileSystemService = require('../../../services/FileSystemService');
const FileCabinetService = require('../../../services/FileCabinetService');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const ProjectInfoService = require('../../../services/ProjectInfoService');
const SUITESCRIPT_MODULES = require('../../../metadata/SuiteScriptModulesMetadata');
const SUITESCRIPT_TYPES = require('../../../metadata/SuiteScriptTypesMetadata');

const ANSWER_NAMES = {
    ADD_SUITESCRIPT_MODULES: 'addSuiteScriptModules',
    NAME: 'name',
    MODULE: 'module',
    PARENT_PATH: 'parentPath',
    TYPE: 'type',
};
const SUITEAPPS_PATH = '/SuiteApps';
const SUITESCRIPTS_PATH = '/SuiteScripts';
const WEB_HOSTING_SUBFOLDER_PATH = '/Web Site Hosting Files/.*/';

module.exports = class CreateFileInputHandler extends BaseInputHandler {

    constructor(options) {
        super(options);

        this._fileSystemService = new FileSystemService();
        this._fileCabinetService = new FileCabinetService(path.join(this._projectFolder, FOLDERS.FILE_CABINET));
        this._projectInfoService = new ProjectInfoService(this._projectFolder);

        this._accountCustomizationProject = this._projectInfoService.isAccountCustomizationProject();
    }

    async getParameters(params) {
        const answers = await prompt([
            this._questionSelectSuiteScriptType(),
            this._questionAddSuiteScriptModules(),
            this._questionSelectSuiteScriptModules(),
            this._questionSelectDestinationFolder(),

        ]);

        const nameAnswer = await prompt(this._questionEnterName(answers[ANSWER_NAMES.PARENT_PATH]));
        answers[ANSWER_NAMES.NAME] = nameAnswer[ANSWER_NAMES.NAME];

        delete answers[ANSWER_NAMES.ADD_SUITESCRIPT_MODULES];

        return answers;
    }

    _questionSelectSuiteScriptType() {
        return {
            type: CommandUtils.INQUIRER_TYPES.LIST,
            name: ANSWER_NAMES.TYPE,
            message: NodeTranslationService.getMessage(QUESTIONS.CHOOSE_SUITESCRIPT_TYPE),
            pageSize: 15,
            choices: [
                ...SUITESCRIPT_TYPES.map(( suiteScriptType) => ({
                    name: suiteScriptType.name,
                    value: suiteScriptType.id,
                })),
                new Separator(),
            ],
        };
    }

    _questionAddSuiteScriptModules() {
        return {
            type: CommandUtils.INQUIRER_TYPES.LIST,
            name: ANSWER_NAMES.ADD_SUITESCRIPT_MODULES,
            message: NodeTranslationService.getMessage(QUESTIONS.ADD_SUITESCRIPT_MODULES),
            default: 0,
            choices: [
                { name: NodeTranslationService.getMessage(YES), value: true },
                { name: NodeTranslationService.getMessage(NO), value: false },
            ],
        };
    }

    _questionSelectSuiteScriptModules() {
        return {
            when: function (response) {
                return response[ANSWER_NAMES.ADD_SUITESCRIPT_MODULES];
            },
            type: CommandUtils.INQUIRER_TYPES.CHECKBOX,
            name: ANSWER_NAMES.MODULE,
            message: NodeTranslationService.getMessage(QUESTIONS.SELECT_SUITESCRIPT_MODULES),
            pageSize: 15,
            choices: [
                ...SUITESCRIPT_MODULES.map(( suiteScriptModule) => ({
                    name: suiteScriptModule.id,
                    value: suiteScriptModule.id,
                })),
                new Separator(),
            ],
            validate: (fieldValue) => showValidationResults(fieldValue, validateArrayIsNotEmpty),
        };
    }

    _questionSelectDestinationFolder() {
        return {
            type: CommandUtils.INQUIRER_TYPES.LIST,
            name: ANSWER_NAMES.PARENT_PATH,
            message: NodeTranslationService.getMessage(QUESTIONS.SELECT_FOLDER),
            pageSize: 15,
            choices: this._getFolderChoices(),
        };
    }

    _questionEnterName(parentRelativePath) {
        const parentAbsolutePath = path.join(this._projectFolder, ApplicationConstants.FOLDERS.FILE_CABINET, parentRelativePath);

        return {
            type: CommandUtils.INQUIRER_TYPES.INPUT,
            name: ANSWER_NAMES.NAME,
            message: NodeTranslationService.getMessage(QUESTIONS.ENTER_NAME),
            filter: (fieldValue) => fieldValue.trim(),
            validate: (fieldValue) => showValidationResults(
                fieldValue,
                validateFieldIsNotEmpty,
                validateFileName,
                (fieldValue) => validateSuiteScriptFileDoesNotExist(parentAbsolutePath, fieldValue)
            ),
        };
    }

    _getFolderChoices() {
        const transformFolderToChoicesObjectFuntion = (folder) => {
            let folderRestricted;

            const folderRelativePath = this._fileCabinetService.getFileCabinetRelativePath(folder) + '/';

            if (this._accountCustomizationProject) {
                folderRestricted = !(folderRelativePath.startsWith(SUITESCRIPTS_PATH) || folderRelativePath.match(WEB_HOSTING_SUBFOLDER_PATH));
            } else {
                const applicationId = this._projectInfoService.getApplicationId();
                const applicationSuiteAppFolderAbsolutePath = path.join(this._projectFolder, FOLDERS.FILE_CABINET, SUITEAPPS_PATH, '/', applicationId, '/');
                const applicationSuiteAppFolderRelativePath = this._fileCabinetService.getFileCabinetRelativePath(applicationSuiteAppFolderAbsolutePath);
                folderRestricted = !folderRelativePath.startsWith(applicationSuiteAppFolderRelativePath);
            }

            return {
                name: FOLDERS.FILE_CABINET + folderRelativePath,
                value: folderRelativePath,
                disabled: folderRestricted,
            };
        }

        return this._fileSystemService
            .getFoldersFromDirectoryRecursively(path.join(this._projectFolder, FOLDERS.FILE_CABINET))
            .map(transformFolderToChoicesObjectFuntion);
    }

};
