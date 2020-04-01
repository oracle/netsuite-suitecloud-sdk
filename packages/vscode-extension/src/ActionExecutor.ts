import BaseAction from './commands/BaseAction';
import SuiteCloudRunner from './core/SuiteCloudRunner';
import CommandsMetadataSingleton from './service/CommandsMetadataSingleton';
import MessageService from './service/MessageService';
import { NOT_IN_VALID_PROJECT } from './service/TranslationKeys';
import { VSTranslationService } from './service/VSTranslationService';
import { getRootProjectFolder } from './util/ExtensionUtil';

// HANDLES EXECUTION OF ACTIONS - CENTRAL POINT
export class ActionExecutor {
	execute<T extends BaseAction>(action: T) {
		const executionPath = getRootProjectFolder();
		const messageService = new MessageService(action.commandName);
		const translationService = new VSTranslationService();
		if (!executionPath) {
			messageService.showErrorMessage(translationService.getMessage(NOT_IN_VALID_PROJECT));
		} else {
			const suiteCloudRunner = new SuiteCloudRunner(executionPath, CommandsMetadataSingleton.getInstance().getMetadata());
			action.execute({
				suiteCloudRunner: suiteCloudRunner,
				messageService,
			});
		}
	}
}
