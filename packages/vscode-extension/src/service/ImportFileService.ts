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
	protected vsConsoleLogger: VSConsoleLogger | undefined;

	constructor(messageService: MessageService, translationService: VSTranslationService, fsPath: string | undefined) {
		this.messageService = messageService;
		this.translationService = translationService;
	}

	async importFiles(
		selectedFilesPaths: string[],
		directory: string,
		statusBarMessage: string,
		executionPath: string | undefined,
		excludeProperties: boolean
	) {
		this.executionPath = executionPath;
		let commandArgs: any = { project: directory, paths: selectedFilesPaths };

		if (excludeProperties) {
			commandArgs.excludeproperties = true;
		}

		const commandActionPromise = this.runSuiteCloudCommand(commandArgs);
		this.messageService.showStatusBarMessage(statusBarMessage, true, commandActionPromise);
		return await commandActionPromise;
	}

	protected async runSuiteCloudCommand(args: { [key: string]: string } = {}) {
		if (!this.vsConsoleLogger) {
			throw Error('Logger not initialized');
		}
		return new SuiteCloudRunner(this.vsConsoleLogger, this.executionPath).run({
			commandName: COMMAND_NAME,
			arguments: args,
		});
	}

	setVsConsoleLogger(vsConsoleLogger: VSConsoleLogger) {
		this.vsConsoleLogger = vsConsoleLogger;
	}
}
