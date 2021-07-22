/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as path from 'path';
import * as vscode from 'vscode';
import { ApplicationConstants, FileUtils, ProjectInfoService } from '../util/ExtensionUtil';
import { EXTENSION_INSTALLATION } from '../service/TranslationKeys';
import { VSTranslationService } from '../service/VSTranslationService';

const COMMAND_SETUP_ACCOUNT = 'suitecloud.setupaccount';
const MANIFEST_FILE_FILENAME = "manifest.xml";
const SRC_FOLDER_NAME = 'src';

export default async function showSetupAccountWarningMessageIfNeeded(): Promise<void> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
	if (workspaceFolders) {
		const projectAbsolutePath = workspaceFolders[0].uri.fsPath;
		const projectInfoService = new ProjectInfoService(path.join(projectAbsolutePath, SRC_FOLDER_NAME));
		if (!projectInfoService.isSuiteCloudProject()) {
			return;
		}

		const projectJsonAbsolutePath = path.join(projectAbsolutePath, ApplicationConstants.FILES.PROJECT_JSON);
		if (!FileUtils.exists(projectJsonAbsolutePath)) {
			await vscode.window.showTextDocument(
				vscode.Uri.file(
					path.join(
						workspaceFolders[0].uri.fsPath,
						SRC_FOLDER_NAME,
						MANIFEST_FILE_FILENAME
					)
				)
			);

			const translationService = new VSTranslationService();
			const runSetupAccount = await vscode.window.showWarningMessage(
				translationService.getMessage(EXTENSION_INSTALLATION.PROJECT_STARTUP.MESSAGES.PROJECT_NEEDS_SETUP_ACCOUNT),
				translationService.getMessage(EXTENSION_INSTALLATION.PROJECT_STARTUP.BUTTONS.RUN_SUITECLOUD_SETUP_ACCOUNT),
			);
			if (runSetupAccount) {
				vscode.commands.executeCommand(COMMAND_SETUP_ACCOUNT);
			}
		}
	}
}
