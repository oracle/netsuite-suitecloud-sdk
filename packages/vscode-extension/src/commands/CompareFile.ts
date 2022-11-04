/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import { Uri } from 'vscode';
import { ACP_UNRESTRICTED_FOLDERS } from '../ApplicationConstants';
import { COMPARE_FILE } from '../service/TranslationKeys';
import { actionResultStatus, ApplicationConstants, ProjectInfoService } from '../util/ExtensionUtil';
import FileImportCommon from './FileImportCommon';

export default class CompareFile extends FileImportCommon {
	private static readonly ACCOUNT_COPY_BASE_NAME = 'accountCopy';
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
		const provider = new (class implements vscode.TextDocumentContentProvider {
			provideTextDocumentContent(uri: vscode.Uri): string {
				return fs.readFileSync(importFilePath, 'utf-8');
			}
		})();
		vscode.workspace.registerTextDocumentContentProvider(scheme, provider);
		const accountCopyExtension = path.extname(importFilePath);
		const schemeUri = `${scheme}: ${CompareFile.ACCOUNT_COPY_BASE_NAME}.${accountCopyExtension}`;
		return vscode.Uri.parse(schemeUri);
	}

	private activeFileIsUnderSuiteAppsAppIdFolder(projectInfoService: typeof ProjectInfoService): boolean {
		const suiteAppFileCabinetPath = path.join(
			this.getFileCabinetFolderPath(),
			ApplicationConstants.FOLDERS.SUITEAPPS,
			projectInfoService.getApplicationId()
		);
		return this.activeFile!.startsWith(suiteAppFileCabinetPath);
	}

	private activeFileIsUnderAcpUnrestrictedFolder(): boolean {
		const activeFileRelativePath = this.activeFile?.replace(this.getFileCabinetFolderPath(), '').replace(/\\/g, '/');
		return ACP_UNRESTRICTED_FOLDERS.some((unrestricedPath) => activeFileRelativePath?.startsWith(unrestricedPath));
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
