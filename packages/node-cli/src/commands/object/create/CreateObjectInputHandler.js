/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const OBJECT_TYPES = require('../../../metadata/ObjectTypesMetadata');
const { prompt } = require('inquirer');
const chalk = require('chalk');
const { join } = require('path');
const { FOLDERS } = require('../../../ApplicationConstants');
const BaseInputHandler = require('../../base/BaseInputHandler');
const FileSystemService = require('../../../services/FileSystemService');

module.exports = class CreateObjectInputHandler extends BaseInputHandler {
	constructor(options) {
		super(options);

		this._fileSystemService = new FileSystemService();
	}

	async getParameters(params) {
		const transformFoldersToChoicesFunc = (folder) => {
			return { name: folder.replace(this._projectFolder, ''), value: folder };
		};
		const objectDirectoryChoices = this._fileSystemService
			.getFoldersFromDirectory(join(this._projectFolder, FOLDERS.OBJECTS))
			.map(transformFoldersToChoicesFunc);

		const mainAnswers = await prompt([
			{
				type: 'list',
				name: 'type',
				message: 'What object type would you like to create?',
				choices: OBJECT_TYPES,
			},
			{
				type: 'input',
				name: 'objectfilename',
				message: (answers_1) => `Please specify the filename for the ${chalk.green.bold(answers_1.type.name)} object`,
				transformer: (input_1, answers_2, flags) => `${answers_2.type.prefix}${input_1}.xml`,
			},
			{
				type: 'list',
				name: 'folder',
				message: (answers_4) =>
					`Where would you like to store the ${chalk.green.bold(answers_4.type.prefix + answers_4.objectfilename + '.xml')} file?`,
				choices: objectDirectoryChoices,
			},
			{
				type: 'confirm',
				name: 'createrelatedfiles',
				message: 'Would you like to also create associated files with this object?',
				when: (answers_6) => answers_6.type.hasRelatedFiles,
			},
		]);
		if (mainAnswers.createrelatedfiles) {
			const fileCabinetDirectoryChoices = this._fileSystemService
				.getFoldersFromDirectory(join(this._projectFolder, FOLDERS.FILE_CABINET))
				.map(transformFoldersToChoicesFunc);
			const answers_10 = await prompt([
				{
					type: 'input',
					name: 'relatedfilename',
					message: 'Please specify the script filename',
					transformer: (input_3, answers_7, flags) => `${input_3}.js`,
				},
				{
					type: 'list',
					name: 'relatedfiledestinationfolder',
					message: (answers_9) => `Where would you like to store the ${chalk.green.bold(answers_9.relatedfilename)}.js file?`,
					choices: fileCabinetDirectoryChoices,
				},
			]);
			return { ...answers_10, ...mainAnswers };
		}
		return mainAnswers;
	}
};
