import * as path from 'path';
import {  COMPARE_OBJECT } from '../service/TranslationKeys';
import { VSTranslationService } from './VSTranslationService';
import SuiteCloudRunner from '../core/SuiteCloudRunner';
import MessageService from './MessageService';
import { getRootProjectFolder } from '../util/ExtensionUtil';

const COMMAND_NAME = 'object:import';

export default class ImportObjectService {
	protected readonly translationService: VSTranslationService;
	protected executionPath?: string;
	protected readonly messageService: MessageService;
	protected filePath?: string;

	constructor(messageService: MessageService, translationService: VSTranslationService, fsPath: string | undefined) {
		this.messageService = messageService;
		this.translationService = translationService;
		// this.executionPath = getRootProjectFolder(fsPath)
	}

	async importObject(activeFile: string , temporaryDirectory: string, statusBarMessage: string, executionPath: string | undefined) {
        this.executionPath = executionPath;
        const scriptId = path.basename(activeFile, '.xml');

		//TODO Prototype of import...Fix the way we look for destinationFolder
		// It should take the path in reference to the project that could be java or nodejs (with src) types
		const commandActionPromise = this.runSuiteCloudCommand({ scriptid: scriptId, type: 'ALL', destinationfolder: temporaryDirectory });
		this.messageService.showStatusBarMessage(statusBarMessage, true, commandActionPromise);
		return await commandActionPromise;
	}

	protected async runSuiteCloudCommand(args: { [key: string]: string } = {}) {
        
		return new SuiteCloudRunner(this.executionPath).run({
			commandName: COMMAND_NAME,
			arguments: args,
		});
	}
}
