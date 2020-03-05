import SuiteCloudRunner from '../core/SuiteCloudRunner';
import CommandsMetadataSingleton from '../service/CommandsMetadataSingleton';
import { getRootProjectFolder, unwrapExceptionMessage } from '../util/ExtensionUtil';
import { scloudOutput } from '../extension';
import { MessageService } from '../service/MessageService';
import BaseAction from './BaseAction';


export default class AddDependencies extends BaseAction {

    constructor() {
        super({ messageService: new MessageService('adddependencies') });
    }

    async execute() {
        if (this.suiteCloudRunner && this.messageService) {
            this.messageService.showTriggeredActionInfo();
            let addDependenciesResult;
            try {
                addDependenciesResult = await this.suiteCloudRunner.run({
                    commandName: 'project:adddependencies',
                    arguments: {},
                });
            } catch (error) {
                this.messageService.showErrorMessage(unwrapExceptionMessage(error));
                return;
            }

            if (addDependenciesResult.status === 'SUCCESS' && Array.isArray(addDependenciesResult.data)) {

                if (addDependenciesResult.data && addDependenciesResult.data.length > 0) {
                    scloudOutput.appendLine("The following dependencies have been added to the manifest file:");
                    addDependenciesResult.data.forEach((element: any) => {
                        scloudOutput.appendLine(element.type + ":" + element.value);
                    });
                    this.messageService.showCompletedActionInfo();
                }
                else {
                    scloudOutput.appendLine("There are no dependencies to add to the manifest file.");
                }
            } else {
                scloudOutput.appendLine("There was an error when adding missing dependencies.");
                if (Array.isArray(addDependenciesResult.errorMessages) && (addDependenciesResult.errorMessages.length > 0)) {
                    addDependenciesResult.errorMessages.forEach((message: string) => scloudOutput.appendLine(message));
                } else {
                    scloudOutput.appendLine(addDependenciesResult.resultMessage);
                }
                this.messageService.showCompletedActionError();
            }
        } else {
            this.messageService.showTriggeredActionError();
        }
    }
}





// function _formatOutput(operationResult) {
//     if (SDKOperationResultUtils.hasErrors(operationResult)) {
//         SDKOperationResultUtils.logResultMessage(operationResult);
//         SDKOperationResultUtils.logErrors(operationResult);
//         return;
//     }

//     const { data } = operationResult;
//     if (data.length === 0) {
//         NodeUtils.println(
//             TranslationService.getMessage(MESSAGES.NO_UNRESOLVED_DEPENDENCIES),
//             NodeUtils.COLORS.RESULT
//         );
//         return;
//     }

//     NodeUtils.println(
//         TranslationService.getMessage(MESSAGES.DEPENDENCIES_ADDED_TO_MANIFEST),
//         NodeUtils.COLORS.RESULT
//     );

//     this._getDependenciesStringsArray(data)
//         .sort()
//         .forEach(output => NodeUtils.println(output, NodeUtils.COLORS.RESULT));
// }
