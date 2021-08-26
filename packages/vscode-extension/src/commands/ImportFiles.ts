/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import { QuickPickItem } from 'vscode';
import ListFilesService from '../service/ListFilesService';
import { IMPORT_FILES, LIST_FILES } from '../service/TranslationKeys';
import { FolderItem } from '../types/FolderItem';
import FileImportCommon from './FileImportCommon';

const COMMAND_NAME = 'importfiles';

export default class ImportFiles extends FileImportCommon {
	constructor() {
		super(COMMAND_NAME);
	}

	protected async getSelectedFiles(): Promise<string[] | undefined> {
		const listFilesService = new ListFilesService(this.messageService, this.translationService, this.rootWorkspaceFolder);
		const fileCabinetFolders: FolderItem[] | undefined = await listFilesService.getAccountFileCabinetFolders();
		if (!fileCabinetFolders) {
			return;
		}
		const selectedFolder: QuickPickItem | undefined = await listFilesService.selectFolder(
			fileCabinetFolders,
			this.translationService.getMessage(IMPORT_FILES.QUESTIONS.SELECT_FOLDER)
		);
		if (!selectedFolder) {
			return;
		}
		const files = await listFilesService.getFilesFromSelectedAccountFileCabinetFolder(selectedFolder.label);
		if (!files || files.length === 0) {
			throw this.translationService.getMessage(LIST_FILES.ERROR.NO_FILES_FOUND);
		}
		const selectedFiles: QuickPickItem[] | undefined = await listFilesService.selectFiles(files);

		if (!selectedFiles) {
			return;
		}
		return selectedFiles.map((file) => file.label.replace(/\\/g, '/'));
	}
}
