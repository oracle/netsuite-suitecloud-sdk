import { VSTranslationService } from './VSTranslationService';
import SuiteCloudRunner from '../core/SuiteCloudRunner';
import MessageService from './MessageService';
import VSConsoleLogger from '../loggers/VSConsoleLogger';

const COMMAND_NAME = 'file:import';

export default class ImportFileService {
	protected readonly translationService: VSTranslationService;
	protected executionPath?: string;
	protected readonly messageService: MessageService;
	protected filePath?: string;
	protected vsConsoleLogger: VSConsoleLogger;

	constructor(messageService: MessageService, translationService: VSTranslationService, vSConsoleLogger: VSConsoleLogger, fsPath: string | undefined) {
		this.messageService = messageService;
		this.translationService = translationService;
		this.vsConsoleLogger = vSConsoleLogger;
		// this.executionPath = getRootProjectFolder(fsPath)
	}

	async importFile(activeFile: string, directory: string, statusBarMessage: string, executionPath: string | undefined, includeProperties: boolean) {
		this.executionPath = executionPath;

		//TODO Prototype of import...Fix the way we look for destinationFolder
		// It should take the path in reference to the project that could be java or nodejs (with src) types

		const filePath = this.executionPath ? activeFile.split(this.executionPath + '\\src\\FileCabinet')[1].replace(/\\/g, '/') : activeFile;
		let commandArgs: any = { project: directory, paths: filePath };
		if (!includeProperties) {
			commandArgs.excludeproperties = true;
		}

		const commandActionPromise = this.runSuiteCloudCommand(commandArgs);
		this.messageService.showStatusBarMessage(statusBarMessage, true, commandActionPromise);
		return await commandActionPromise;
	}

	protected async runSuiteCloudCommand(args: { [key: string]: string } = {}) {
		return new SuiteCloudRunner(this.vsConsoleLogger, this.executionPath).run({
			commandName: COMMAND_NAME,
			arguments: args,
		});
	}
}