/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import { Uri } from 'vscode';
import { ACP_UNRESTRICTED_FOLDERS, FILES } from '../ApplicationConstants';
import { COMPARE_FILE } from '../service/TranslationKeys';
import { actionResultStatus, ApplicationConstants, ProjectInfoService } from '../util/ExtensionUtil';
import FileImportCommon from './FileImportCommon';

export default class CompareFile extends FileImportCommon {
	private static readonly COMMAND_NAME = 'comparefile';
	private static readonly SCHEME = 'suitecloud';
	private static readonly TEMP_FOLDER_PREFIX = 'suitecloud-vscode-extension-compare-file-';

	constructor() {
		super(CompareFile.COMMAND_NAME);
	}

	protected validateBeforeExecute() {
		const superValidation = super.validateBeforeExecute(true);
		if (!superValidation.valid) {
			return superValidation;
		}

		const projectInfoService = new ProjectInfoService(this.getProjectFolderPath());
		if (projectInfoService.isSuiteAppProject()) {
			if (!this.activeFileIsUnderSuiteAppsAppIdFolder(projectInfoService)) {
				return this.unsuccessfulValidation(
					this.translationService.getMessage(COMPARE_FILE.ERROR.SUITEAPP_NOT_ALLOWED_FOLDER, projectInfoService.getApplicationId())
				);
			}
		} else {
			if (!this.activeFileIsUnderAcpUnrestrictedFolder()) {
				return this.unsuccessfulValidation(this.translationService.getMessage(COMPARE_FILE.ERROR.ACP_NOT_ALLOWED_FOLDER));
			}
		}

		return this.successfulValidation();
	}

	protected async execute() {
		const activeFilePath = this.activeFile!;
		const fileCabinetRelativePath = path.relative(this.getFileCabinetFolderPath(), activeFilePath);
		const suiteCloudFilePath = this.toSuiteCloudPath(fileCabinetRelativePath);
		// create temp project folder to import file to be compared
		const tempProjectFolderPath = fs.mkdtempSync(path.join(os.tmpdir(), CompareFile.TEMP_FOLDER_PREFIX));
		// prepare temp project to import file
		this.prepareTemporaryProject(tempProjectFolderPath);
		const importFilePath = this.getImportFilePath(tempProjectFolderPath, fileCabinetRelativePath);

		// file:import args preparation and trigger
		const fileImportArgs = {
			paths: [suiteCloudFilePath],
			excludeproperties: 'true',
			calledfromcomparefiles: 'true',
		};
		const commandActionPromise = this.runSuiteCloudCommand(fileImportArgs, tempProjectFolderPath);
		this.messageService.showStatusBarMessage(this.translationService.getMessage(COMPARE_FILE.COMPARING_FILE), true, commandActionPromise);
		
		// file:import result
		const actionResult = await commandActionPromise;
		
		if (actionResult.status === actionResultStatus.SUCCESS && actionResult.data) {
			if (actionResult.data.results[0].loaded) {
				vscode.commands.executeCommand(
					'vscode.diff',
					this.getImportedFileUri(importFilePath),
					vscode.Uri.file(activeFilePath),
					this.translationService.getMessage(COMPARE_FILE.EDITOR_LABEL, path.basename(activeFilePath))
				);
			} else {
				this.messageService.showCommandWarning();
			}
		} else {
			this.messageService.showCommandError();
		}
	}

	protected async getSelectedFiles(): Promise<string[] | undefined> {
		//Required but not used since execute is overwritten in this class.
		return undefined;
	}

	private getImportedFileUri(importFilePath: string): Uri {
		const scheme = CompareFile.SCHEME;
		const provider = new class implements vscode.TextDocumentContentProvider {
			provideTextDocumentContent(uri: vscode.Uri): string {
				return fs.readFileSync(uri.fsPath, 'utf-8');
			}
		};
		vscode.workspace.registerTextDocumentContentProvider(scheme, provider);
		const schemeUri = `${scheme}:${importFilePath}`;
		return vscode.Uri.parse(schemeUri);
	}

	private activeFileIsUnderSuiteAppsAppIdFolder(projectInfoService: typeof ProjectInfoService): boolean {
		const suiteAppFileCabinetPath = path.join(
			this.getFileCabinetFolderPath(),
			path.basename(ApplicationConstants.FOLDERS.SUITEAPPS),
			projectInfoService.getApplicationId()
		);
		return this.activeFileIsInside(suiteAppFileCabinetPath);
	}

	private activeFileIsUnderAcpUnrestrictedFolder(): boolean {
		const fileCabinetRelativePath = path.relative(this.getFileCabinetFolderPath(), this.activeFile!);
		const suiteCloudFilePath = this.toSuiteCloudPath(fileCabinetRelativePath);
		return ACP_UNRESTRICTED_FOLDERS.some(
			(unrestrictedPath) => suiteCloudFilePath === unrestrictedPath || suiteCloudFilePath.startsWith(`${unrestrictedPath}/`)
		);
	}

	private getFileCabinetFolderPath(): string {
		return path.join(this.getProjectFolderPath(), ApplicationConstants.FOLDERS.FILE_CABINET);
	}

	private activeFileIsInside(folderPath: string): boolean {
		const relativePath = path.relative(folderPath, this.activeFile!);
		return (
			relativePath !== '' &&
			relativePath !== '..' &&
			!relativePath.startsWith(`..${path.sep}`) &&
			!path.isAbsolute(relativePath)
		);
	}

	private toSuiteCloudPath(relativePath: string): string {
		return `/${relativePath.split(path.sep).join('/')}`;
	}

	private getImportFilePath(tempFolderPath: string, fileCabinetRelativePath: string): string {
		const importFilePath = path.join(
			tempFolderPath,
			path.basename(ApplicationConstants.FOLDERS.FILE_CABINET),
			fileCabinetRelativePath
		);
		fs.mkdirSync(path.dirname(importFilePath), { recursive: true });
		return importFilePath;
	}

	private prepareTemporaryProject(tempFolderPath: string) {
		const projectJsonPath = path.join(this.rootWorkspaceFolder!, FILES.PROJECT_JSON);
		fs.copyFileSync(projectJsonPath, path.join(tempFolderPath, FILES.PROJECT_JSON));

		const projectFolderPath = this.getProjectFolderPath();
		for (const projectFile of [FILES.MANIFEST_XML, FILES.DEPLOY_XML]) {
			fs.copyFileSync(path.join(projectFolderPath, projectFile), path.join(tempFolderPath, projectFile));
		}

		const suiteCloudConfig = [
			'module.exports = {',
			"\tdefaultProjectFolder: '.',",
			'\tcommands: {},',
			'};',
			'',
		].join(os.EOL);
		fs.writeFileSync(path.join(tempFolderPath, FILES.SUITECLOUD_CONFIG_JS), suiteCloudConfig, 'utf8');
	}
}
