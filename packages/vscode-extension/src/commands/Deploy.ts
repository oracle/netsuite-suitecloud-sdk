import { unwrapExceptionMessage, OperationResultStatus } from '../util/ExtensionUtil';
import { scloudOutput } from '../extension';
import { MessageService } from '../service/MessageService';
import BaseAction from './BaseAction';


export default class Deploy extends BaseAction {
    constructor() {
        super({ messageService: new MessageService('deploy') });
    }

    async execute() {
        this.messageService.showTriggeredActionInfo();
        let deployResult;
        if (this.suiteCloudRunner && this.messageService) {
            try {
                deployResult = await this.suiteCloudRunner.run({
                    commandName: 'project:deploy',
                    arguments: {}
                });
            } catch (error) {
                this.messageService.showErrorMessage(unwrapExceptionMessage(error));
                return;
            }

            if (deployResult.operationResult?.status === OperationResultStatus.SUCCESS && Array.isArray(deployResult.operationResult.data)) {
                deployResult.operationResult.data.forEach((element: any) => {
                    scloudOutput.appendLine(element);
                });
                this.messageService.showCompletedActionInfo();
            } else {
                if (Array.isArray(deployResult.operationResult.errorMessages) && (deployResult.operationResult.errorMessages.length > 0)) {
                    deployResult.operationResult.errorMessages.forEach((message: string) => scloudOutput.appendLine(message));
                } else {
                    scloudOutput.appendLine(deployResult.operationResult.resultMessage);
                }
                this.messageService.showCompletedActionError();
            }
        } else {
            this.messageService.showTriggeredActionError();
        }
    }
}