/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import { UNRESTRICTED_FOLDERS } from '../ApplicationConstants';
import { COMPARE_FILE } from '../service/TranslationKeys';
import { actionResultStatus, ApplicationConstants, ProjectInfoService } from '../util/ExtensionUtil';
import FileImportCommon from './FileImportCommon';

export default class CompareFile extends FileImportCommon {
	private static readonly COMMAND_NAME = 'comparefile';
	private static readonly TEMP_FOLDER_PREFIX = 'suitecloud-vscode-extension-compare-file-';

	constructor() {
		super(CompareFile.COMMAND_NAME);
	}

	protected validateBeforeExecute() {
		const projectInfoService = new ProjectInfoService(this.getProjectFolderPath());
		if (projectInfoService.isSuiteAppProject()) {
			return this.unsuccessfulValidation(this.translationService.getMessage(COMPARE_FILE.ERROR.COMPARE_FILE_TO_SUITEAPP_NOT_ALLOWED));
		}

		const superValidation = super.validateBeforeExecute();
		if (!superValidation.valid) {
			return superValidation;
		}

		if (!this.activeFileIsUnderUnrestrictedFolder()) {
			return this.unsuccessfulValidation(this.translationService.getMessage(COMPARE_FILE.ERROR.NOT_ALLOWED_FOLDER));
		}

		return this.successfulValidation();
	}

	protected async execute() {
		const activeFilePath = this.activeFile!;
		const tempFolderPath = fs.mkdtempSync(path.join(os.tmpdir(), CompareFile.TEMP_FOLDER_PREFIX));

		this.copyManifestFileToTempFolder(tempFolderPath);
		this.copyProjectJsonToTempFolder(tempFolderPath);
		const activeFileRelativePath = activeFilePath.split(this.getFileCabinetFolderPath())[1]?.replace(/\\/g, '/');
		const importFilePath = this.getImportFilePath(tempFolderPath, activeFilePath, activeFileRelativePath);

		const selectedFilesPaths = [];
		selectedFilesPaths.push(activeFileRelativePath);

		const commandArgs = {
			paths: selectedFilesPaths,
			excludeproperties: 'true',
			calledfromcomparefiles: 'true',
		};

		const commandActionPromise = this.runSuiteCloudCommand(commandArgs, tempFolderPath);
		this.messageService.showStatusBarMessage(this.translationService.getMessage(COMPARE_FILE.COMPARING_FILE), true, commandActionPromise);
		const actionResult = await commandActionPromise;
		if (actionResult.status === actionResultStatus.SUCCESS && actionResult.data) {
			const compareWindowTitle =
				this.translationService.getMessage(COMPARE_FILE.COMPARE_FILE_WITH_ACCOUNT_FILE) + ' - ' + path.basename(activeFilePath);
			vscode.commands.executeCommand('vscode.diff', vscode.Uri.file(activeFilePath), vscode.Uri.file(importFilePath), compareWindowTitle);
		} else {
			this.messageService.showCommandError();
		}
	}

	protected async getSelectedFiles(): Promise<string[] | undefined> {
		//Required but not used since execute is overwritten in this class.
		return undefined;
	}

	private activeFileIsUnderUnrestrictedFolder(): boolean {
		const activeFileRelativePath = this.activeFile?.replace(this.getFileCabinetFolderPath(), '').replace(/\\/g, '/');
		return UNRESTRICTED_FOLDERS.some((unrestricedPath) => activeFileRelativePath?.startsWith(unrestricedPath));
	}

	private getFileCabinetFolderPath(): string {
		return path.join(this.getProjectFolderPath(), ApplicationConstants.FOLDERS.FILE_CABINET);
	}

	private getImportFilePath(tempFolderPath: string, activeFilePath: string, activeFileRelativePath: string): string {
		const importFileParentFolderPath = path.join(tempFolderPath, ApplicationConstants.FOLDERS.FILE_CABINET, path.dirname(activeFileRelativePath));
		fs.mkdirSync(importFileParentFolderPath, { recursive: true });

		return path.join(importFileParentFolderPath, path.basename(activeFilePath));
	}

	private copyProjectJsonToTempFolder(tempFolderPath: string) {
		const projectJsonPath = path.join(this.rootWorkspaceFolder!, ApplicationConstants.FILES.PROJECT_JSON);
		fs.copyFileSync(projectJsonPath, path.join(tempFolderPath, ApplicationConstants.FILES.PROJECT_JSON));
	}

	private copyManifestFileToTempFolder(tempFolderPath: string) {
		const manifestFilePath = path.join(this.getProjectFolderPath(), ApplicationConstants.FILES.MANIFEST_XML);
		fs.copyFileSync(manifestFilePath, path.join(tempFolderPath, ApplicationConstants.FILES.MANIFEST_XML));
	}
}
