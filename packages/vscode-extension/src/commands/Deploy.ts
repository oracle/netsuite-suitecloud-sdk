import SuiteCloudRunner from '../core/SuiteCloudRunner';
import MessageService from '../service/MessageService';
import VSCommandOutputHandler from '../service/VSCommandOutputHandler';
import { actionResultStatus, unwrapExceptionMessage } from '../util/ExtensionUtil';
import BaseAction from './BaseAction';

export default class Deploy extends BaseAction {
	readonly commandName: string = 'project:deploy';
	vsCommandOutputHandler = new VSCommandOutputHandler();

	async execute(opts: { suiteCloudRunner: SuiteCloudRunner; messageService: MessageService }) {
		opts.messageService.showTriggeredActionInfo();
		if (opts.suiteCloudRunner && opts.messageService) {
			try {
				let result = await opts.suiteCloudRunner.run({
					commandName: this.commandName,
					arguments: {},
				});
				if (result.status === actionResultStatus.SUCCESS) {
					opts.messageService.showCompletedActionInfo();
				} else {
					opts.messageService.showCompletedActionError();
				}
			} catch (error) {
				opts.messageService.showErrorMessage(unwrapExceptionMessage(error));
				return;
			}
		} else {
			opts.messageService.showTriggeredActionError();
		}
	}
}
