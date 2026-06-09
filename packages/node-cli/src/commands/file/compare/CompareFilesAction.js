/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const BaseAction = require('../../base/BaseAction');
const { ActionResult } = require('../../../services/actionresult/ActionResult');
const CommandUtils = require('../../../utils/CommandUtils');
const FileUtils = require('../../../utils/FileUtils');
const FileDifferenceUtils = require('../../../utils/FileDifferenceUtils');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const SdkExecutionContext = require('../../../SdkExecutionContext');
const SdkOperationResultUtils = require('../../../utils/SdkOperationResultUtils');
const { executeWithSpinner } = require('../../../ui/CliSpinner');
const { getProjectDefaultAuthId } = require('../../../utils/AuthenticationUtils');
const { FILES, FOLDERS } = require('../../../ApplicationConstants');
const {
	COMMAND_COMPAREFILE: { ERRORS, MESSAGES },
} = require('../../../services/TranslationKeys');

const IMPORT_FILES_SDK_COMMAND = 'importfiles';
const TEMP_FOLDER_PREFIX = 'suitecloud-compare-file-';

const COMMAND_OPTIONS = {
	AUTH_ID: 'authid',
	PATH: 'path',
	PATHS: 'paths',
	PROJECT: 'project',
	EXCLUDE_PROPERTIES: 'excludeproperties',
	ALLOW_FOR_SUITEAPPS: 'allowforsuiteapps',
};

module.exports = class CompareFilesAction extends BaseAction {
	constructor(options) {
		super(options);
	}

	preExecute(params) {
		params[COMMAND_OPTIONS.AUTH_ID] = getProjectDefaultAuthId(this._executionPath);
		return params;
	}

	async execute(params) {
		let temporaryProjectFolder;
		try {
			const fileCabinetPath = params[COMMAND_OPTIONS.PATH];
			if (!fileCabinetPath) {
				throw NodeTranslationService.getMessage(ERRORS.PATH_REQUIRED);
			}

			// Build a relative, OS-agnostic path from the File Cabinet path (e.g. "/SuiteScripts/file.js").
			const relativeSegments = fileCabinetPath.split('/').filter((segment) => segment !== '');
			const localFilePath = path.join(this._projectFolder, FOLDERS.FILE_CABINET, ...relativeSegments);
			const localExists = FileUtils.exists(localFilePath);

			// Import the account version of the file into a throwaway project so it never touches the user's project.
			temporaryProjectFolder = fs.mkdtempSync(path.join(os.tmpdir(), TEMP_FOLDER_PREFIX));
			this._prepareTemporaryProject(temporaryProjectFolder, relativeSegments);

			const importResult = await this._importAccountFile(params[COMMAND_OPTIONS.AUTH_ID], temporaryProjectFolder, fileCabinetPath);
			if (importResult.status === SdkOperationResultUtils.STATUS.ERROR) {
				return ActionResult.Builder.withErrors(importResult.errorMessages).build();
			}

			const importedFile = importResult.data && Array.isArray(importResult.data.results) ? importResult.data.results[0] : undefined;
			if (!importedFile || importedFile.loaded !== true) {
				return ActionResult.Builder.withData({
					path: fileCabinetPath,
					remoteLoaded: false,
					localExists,
					message: importedFile ? importedFile.message : undefined,
				}).build();
			}

			const accountFilePath = path.join(temporaryProjectFolder, FOLDERS.FILE_CABINET, ...relativeSegments);
			const accountContent = FileUtils.readAsString(accountFilePath);
			const localContent = localExists ? FileUtils.readAsString(localFilePath) : '';

			const diff = FileDifferenceUtils.computeFileDiff(accountContent, localContent, {
				accountLabel: `account:${fileCabinetPath}`,
				localLabel: `local:${fileCabinetPath}`,
			});

			return ActionResult.Builder.withData({
				path: fileCabinetPath,
				remoteLoaded: true,
				localExists,
				identical: diff.identical,
				lines: diff.lines,
			}).build();
		} catch (error) {
			return ActionResult.Builder.withErrors([error]).build();
		} finally {
			this._removeTemporaryProject(temporaryProjectFolder);
		}
	}

	_importAccountFile(authId, temporaryProjectFolder, fileCabinetPath) {
		const executionContext = SdkExecutionContext.Builder.forCommand(IMPORT_FILES_SDK_COMMAND)
			.integration()
			.addParam(COMMAND_OPTIONS.AUTH_ID, authId)
			.addParam(COMMAND_OPTIONS.PROJECT, CommandUtils.quoteString(temporaryProjectFolder))
			.addParam(COMMAND_OPTIONS.PATHS, CommandUtils.quoteString(fileCabinetPath))
			.addFlag(COMMAND_OPTIONS.EXCLUDE_PROPERTIES)
			.addFlag(COMMAND_OPTIONS.ALLOW_FOR_SUITEAPPS)
			.build();

		return executeWithSpinner({
			action: this._sdkExecutor.execute(executionContext),
			message: NodeTranslationService.getMessage(MESSAGES.COMPARING_FILE, fileCabinetPath),
		});
	}

	_prepareTemporaryProject(temporaryProjectFolder, relativeSegments) {
		// importfiles requires a valid project (manifest + project.json) to run against.
		[FILES.MANIFEST_XML, FILES.PROJECT_JSON].forEach((fileName) => {
			const sourcePath = path.join(this._projectFolder, fileName);
			if (FileUtils.exists(sourcePath)) {
				fs.copyFileSync(sourcePath, path.join(temporaryProjectFolder, fileName));
			}
		});
		// Pre-create the destination folder so the imported file lands in a known location.
		const destinationFolder = path.join(temporaryProjectFolder, FOLDERS.FILE_CABINET, ...relativeSegments.slice(0, -1));
		FileUtils.createDirectory(destinationFolder);
	}

	_removeTemporaryProject(temporaryProjectFolder) {
		if (temporaryProjectFolder && FileUtils.exists(temporaryProjectFolder)) {
			try {
				fs.rmSync(temporaryProjectFolder, { recursive: true, force: true });
			} catch (error) {
				// Best-effort cleanup of the temporary folder; ignore failures.
			}
		}
	}
};
