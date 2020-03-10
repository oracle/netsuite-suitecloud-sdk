import SuiteCloudRunner from '../core/SuiteCloudRunner';
import MessageService from '../service/MessageService';
import { unwrapExceptionMessage } from '../util/ExtensionUtil';
import BaseAction from './BaseAction';
import VSCommandOutputHandler from '../service/VSCommandOutputHandler';


export default class Deploy extends BaseAction {
    readonly commandName: string = "deploy";

    async execute(opts: {
        suiteCloudRunner: SuiteCloudRunner,
        messageService: MessageService
    }) {
        opts.messageService.showTriggeredActionInfo();
        if (opts.suiteCloudRunner && opts.messageService) {
            try {
                let result = await opts.suiteCloudRunner.run({
                    commandName: 'project:deploy',
                    arguments: {}
                });
                if (result.status === "SUCCESS") {
                    VSCommandOutputHandler.showSuccessResult(result.operationResult);
                    opts.messageService.showCompletedActionInfo();
                }
                else {
                    VSCommandOutputHandler.showErrorResult(result.operationResult);
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