/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { diffLines, diffWords } = require('diff');
const BaseAction = require('../../base/BaseAction');
const CommandUtils = require('../../../utils/CommandUtils');
const { executeWithSpinner } = require('../../../ui/CliSpinner');
const SdkOperationResultUtils = require('../../../utils/SdkOperationResultUtils');
const SdkExecutionContext = require('../../../SdkExecutionContext');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const { ActionResult } = require('../../../services/actionresult/ActionResult');
const { getProjectDefaultAuthId } = require('../../../utils/AuthenticationUtils');
const ProjectInfoService = require('../../../services/ProjectInfoService');
const { FOLDERS, FILES } = require('../../../ApplicationConstants');

const {
	COMMAND_COMPAREFILES: { MESSAGES, ERRORS },
} = require('../../../services/TranslationKeys');

const COMMAND_OPTIONS = {
	PATHS: 'paths',
	PROJECT: 'project',
	AUTH_ID: 'authid',
	EXCLUDE_PROPERTIES: 'excludeproperties',
};

const TEMP_FOLDER_PREFIX = 'suitecloud-compare-file-';

module.exports = class CompareFilesAction extends BaseAction {
	constructor(options) {
		super(options);
		this._projectInfoService = new ProjectInfoService(this._projectFolder);
	}

	preExecute(params) {
		const { PATHS, PROJECT, EXCLUDE_PROPERTIES, AUTH_ID } = COMMAND_OPTIONS;

		if (params.hasOwnProperty(PATHS)) {
			if (Array.isArray(params[PATHS])) {
				params[PATHS] = params[PATHS].map(CommandUtils.quoteString).join(' ');
			} else {
				params[PATHS] = CommandUtils.quoteString(params[PATHS]);
			}
		}
		params[PROJECT] = CommandUtils.quoteString(this._projectFolder);
		params[AUTH_ID] = getProjectDefaultAuthId(this._executionPath);
		params[EXCLUDE_PROPERTIES] = '';
		
		return params;
	}

	async execute(params) {
		let tempProjectFolder;
		
		try {
			// Get the file path from params
			const filePath = Array.isArray(params.paths) ? params.paths[0] : params.paths;
			
			// Check if file path is provided
			if (!filePath) {
				return ActionResult.Builder.withErrors([
					'No file specified. Use -i flag for interactive mode or provide a file path.\n',
					'Example: suitecloud file:compare --paths /SuiteScripts/test-script.js'
				]).build();
			}
			
			const cleanFilePath = filePath.replace(/"/g, '');
			const localFilePath = path.join(this._projectFolder, FOLDERS.FILE_CABINET, cleanFilePath);
			
			// Create temp folder for importing account file
			tempProjectFolder = fs.mkdtempSync(path.join(os.tmpdir(), TEMP_FOLDER_PREFIX));
			
			// Copy manifest and project.json to temp folder
			this._prepareTempProject(tempProjectFolder);

			// Try to import file from account
			const importResult = await this._importFileFromAccount(params, tempProjectFolder, filePath);
			
			// Check if file exists in account
			if (importResult.status === SdkOperationResultUtils.STATUS.ERROR) {
				// Check if the error is because file doesn't exist in account
				const errorMessage = Array.isArray(importResult.errorMessages) 
					? importResult.errorMessages.join(' ') 
					: importResult.errorMessages;
				
				if (this._isFileNotFoundError(errorMessage)) {
					this._cleanupTempFolder(tempProjectFolder);
					return ActionResult.Builder.withData({
						filePath: cleanFilePath,
						fileNotFound: true,
					})
					.withResultMessage(NodeTranslationService.getMessage(ERRORS.FILE_NOT_IN_ACCOUNT, cleanFilePath))
					.build();
				}
				
				// Other import error
				this._cleanupTempFolder(tempProjectFolder);
				return ActionResult.Builder.withErrors(importResult.errorMessages).build();
			}

			// Check if import actually loaded the file
			if (!importResult.data || !importResult.data.results || !importResult.data.results[0] || !importResult.data.results[0].loaded) {
				this._cleanupTempFolder(tempProjectFolder);
				return ActionResult.Builder.withData({
					filePath: cleanFilePath,
					fileNotFound: true,
				})
				.withResultMessage(NodeTranslationService.getMessage(ERRORS.FILE_NOT_IN_ACCOUNT, cleanFilePath))
				.build();
			}

			// Get the imported file path
			const importedFilePath = path.join(tempProjectFolder, FOLDERS.FILE_CABINET, cleanFilePath);
			
			// Check if imported file exists
			if (!fs.existsSync(importedFilePath)) {
				this._cleanupTempFolder(tempProjectFolder);
				return ActionResult.Builder.withData({
					filePath: cleanFilePath,
					fileNotFound: true,
				})
				.withResultMessage(NodeTranslationService.getMessage(ERRORS.FILE_NOT_IN_ACCOUNT, cleanFilePath))
				.build();
			}
			
			// Read both files
			const localContent = fs.readFileSync(localFilePath, 'utf8');
			const accountContent = fs.readFileSync(importedFilePath, 'utf8');
			
			// Generate side-by-side diff
			const diffData = this._generateSideBySideDiff(accountContent, localContent);
			
			// Cleanup temp folder
			this._cleanupTempFolder(tempProjectFolder);
			
			return ActionResult.Builder.withData({
				filePath: cleanFilePath,
				diffData: diffData,
				hasDifferences: diffData.hasDifferences,
				fileNotFound: false,
			})
			.withResultMessage(NodeTranslationService.getMessage(MESSAGES.COMPARE_COMPLETE))
			.build();
			
		} catch (error) {
			if (tempProjectFolder) {
				this._cleanupTempFolder(tempProjectFolder);
			}
			return ActionResult.Builder.withErrors([error.message || error]).build();
		}
	}

	_isFileNotFoundError(errorMessage) {
		if (!errorMessage) return false;
		const lowerError = errorMessage.toLowerCase();
		return lowerError.includes('not found') || 
		       lowerError.includes('does not exist') || 
		       lowerError.includes('could not find') ||
		       lowerError.includes('file not found') ||
		       lowerError.includes('unable to find') ||
		       lowerError.includes('no such file');
	}

	_prepareTempProject(tempFolder) {
		// Copy manifest.xml
		const manifestSource = path.join(this._projectFolder, FILES.MANIFEST_XML);
		const manifestDest = path.join(tempFolder, FILES.MANIFEST_XML);
		fs.copyFileSync(manifestSource, manifestDest);
		
		// Copy project.json
		const projectJsonSource = path.join(this._executionPath, FILES.PROJECT_JSON);
		const projectJsonDest = path.join(tempFolder, FILES.PROJECT_JSON);
		fs.copyFileSync(projectJsonSource, projectJsonDest);
	}

	async _importFileFromAccount(params, tempProjectFolder, filePath) {
		const importParams = {
			...params,
			project: CommandUtils.quoteString(tempProjectFolder),
		};

		const executionContext = SdkExecutionContext.Builder.forCommand('importfiles')
			.integration()
			.addParams(importParams)
			.build();

		return await executeWithSpinner({
			action: this._sdkExecutor.execute(executionContext),
			message: NodeTranslationService.getMessage(MESSAGES.IMPORTING_FILE),
		});
	}

	_generateSideBySideDiff(accountContent, localContent) {
		const accountLines = accountContent.split('\n');
		const localLines = localContent.split('\n');
		const diff = diffLines(accountContent, localContent);
		
		const lines = [];
		let accountLineNum = 0;
		let localLineNum = 0;
		let hasDifferences = false;
		
		// Process diff parts
		for (const part of diff) {
			const partLines = part.value.split('\n');
			if (partLines[partLines.length - 1] === '') {
				partLines.pop();
			}
			
			for (const line of partLines) {
				if (part.added) {
					// Line exists only in local (added)
					lines.push({
						accountLineNum: '',
						accountContent: '',
						localLineNum: ++localLineNum,
						localContent: line,
						status: 'added',
						marker: '>>'
					});
					hasDifferences = true;
				} else if (part.removed) {
					// Line exists only in account (removed from local perspective)
					lines.push({
						accountLineNum: ++accountLineNum,
						accountContent: line,
						localLineNum: '',
						localContent: '',
						status: 'removed',
						marker: '<<'
					});
					hasDifferences = true;
				} else {
					// Line exists in both (unchanged)
					lines.push({
						accountLineNum: ++accountLineNum,
						accountContent: line,
						localLineNum: ++localLineNum,
						localContent: line,
						status: 'unchanged',
						marker: '  '
					});
				}
			}
		}
		
		return {
			lines,
			hasDifferences,
			accountTotalLines: accountLines.length,
			localTotalLines: localLines.length,
			changesAdded: lines.filter(l => l.status === 'added').length,
			changesRemoved: lines.filter(l => l.status === 'removed').length
		};
	}

	_cleanupTempFolder(tempFolder) {
		try {
			fs.rmSync(tempFolder, { recursive: true, force: true });
		} catch (error) {
			// Ignore cleanup errors
		}
	}
};
