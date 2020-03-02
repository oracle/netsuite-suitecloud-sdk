import SuiteCloudRunner from '../core/SuiteCloudRunner';
import CommandsMetadataSingleton from '../service/CommandsMetadataSingleton';
import { getRootProjectFolder, unwrapExceptionMessage } from '../util/ExtensionUtil';
import { scloudOutput } from '../extension';
import { MessageService } from '../service/MessageService';


export default async function deploy() {

    const deployInfo = new MessageService('deploy');
    const executionPath = getRootProjectFolder();

    if (executionPath) {
        const suiteCloudRunner = new SuiteCloudRunner(executionPath, CommandsMetadataSingleton.getInstance().getMetadata());

        deployInfo.showTriggerActionInfo();

        const deployResult = await suiteCloudRunner.run({
            commandName: 'deploy',
            arguments: {},
            runInInteractiveMode: false,
        });

        // there was an exception and there is no operationResult
        if (!deployResult.hasOwnProperty('operationResult')) {
            deployInfo.showErrorMessage(unwrapExceptionMessage(deployResult));
            return;
        }

        if (Array.isArray(deployResult.operationResult.data)) {
            deployResult.operationResult.data.forEach((element: any) => {
                scloudOutput.appendLine(element);
            });
            deployInfo.showCompletedActionInfo();
        } else {
            scloudOutput.appendLine(deployResult.operationResult.resultMessage);
            if (Array.isArray(deployResult.operationResult.errorMessages) && (deployResult.operationResult.errorMessages.length > 0)) {
                deployResult.operationResult.errorMessages.forEach((message: string) => scloudOutput.appendLine(message));
            } 
            deployInfo.showFailedActionInfo();
        }
    } else {
        deployInfo.showTriggerActionFailed();
    }
}