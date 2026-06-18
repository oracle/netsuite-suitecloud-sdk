/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const CommandUtils = require('../../../utils/CommandUtils');
const { default: { prompt} } = require('inquirer');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const ProjectInfoService = require('../../../services/ProjectInfoService');
const { PROJECT_SUITEAPP, FOLDERS } = require('../../../ApplicationConstants');
const BaseInputHandler = require('../../base/BaseInputHandler');
const {
	COMMAND_COMPAREFILES: { ERRORS, QUESTIONS, MESSAGES },
} = require('../../../services/TranslationKeys');

const COMMAND_OPTIONS = {
	PATHS: 'paths',
};

module.exports = class CompareFilesInputHandler extends BaseInputHandler {
	constructor(options) {
		super(options);
		this._projectInfoService = new ProjectInfoService(this._projectFolder);
	}

	async getParameters(params) {
		if (this._projectInfoService.getProjectType() === PROJECT_SUITEAPP) {
			throw NodeTranslationService.getMessage(ERRORS.IS_SUITEAPP);
		}

		// Get local files from FileCabinet
		const localFiles = this._getLocalFiles();
		
		if (localFiles.length === 0) {
			throw NodeTranslationService.getMessage(ERRORS.NO_LOCAL_FILES);
		}

		// Let user select a file
		const selectFileQuestion = this._generateSelectFileQuestion(localFiles);
		const selectFileAnswer = await prompt([selectFileQuestion]);

		return selectFileAnswer;
	}

	_getLocalFiles() {
		const fileCabinetPath = path.join(this._projectFolder, FOLDERS.FILE_CABINET);
		const files = [];
		
		if (!fs.existsSync(fileCabinetPath)) {
			return files;
		}

		this._scanDirectory(fileCabinetPath, FOLDERS.FILE_CABINET, files);
		return files.sort();
	}

	_scanDirectory(dirPath, relativePath, files) {
		const items = fs.readdirSync(dirPath);
		
		items.forEach(item => {
			const fullPath = path.join(dirPath, item);
			const itemRelativePath = path.join(relativePath, item);
			
			if (fs.statSync(fullPath).isDirectory()) {
				this._scanDirectory(fullPath, itemRelativePath, files);
			} else {
				// Store path relative to FileCabinet root (e.g., /SuiteScripts/test.js)
				files.push('/' + itemRelativePath.replace(FOLDERS.FILE_CABINET + '/', ''));
			}
		});
	}

	_generateSelectFileQuestion(files) {
		return {
			type: CommandUtils.INQUIRER_TYPES.LIST,
			name: COMMAND_OPTIONS.PATHS,
			message: NodeTranslationService.getMessage(QUESTIONS.SELECT_LOCAL_FILE),
			choices: files.map((filePath) => ({ 
				name: filePath, 
				value: filePath 
			})),
			pageSize: 20,
		};
	}
};
