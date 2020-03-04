import SuiteCloudRunner from '../core/SuiteCloudRunner';
import CommandsMetadataSingleton from '../service/CommandsMetadataSingleton';
import { getRootProjectFolder, unwrapExceptionMessage } from '../util/ExtensionUtil';
import { scloudOutput } from '../extension';
import { MessageService } from '../service/MessageService';


export default async function adddependencies() {

    const addDependenciesInfo = new MessageService('adddependencies');
    const executionPath = getRootProjectFolder();

    if (executionPath) {
        const suiteCloudRunner = new SuiteCloudRunner(executionPath, CommandsMetadataSingleton.getInstance().getMetadata());

        addDependenciesInfo.showTriggeredActionInfo();
        let addDependenciesResult;
        try {
            addDependenciesResult = await suiteCloudRunner.run({
                commandName: 'project:adddependencies',
                arguments: {},
            });
        } catch (error) {
            addDependenciesInfo.showErrorMessage(unwrapExceptionMessage(error));
            return;
        }

        if (addDependenciesResult.status === 'SUCCESS' && Array.isArray(addDependenciesResult.data)) {
            addDependenciesResult.data.forEach((element: any) => {
                scloudOutput.appendLine(element);
            });
            addDependenciesInfo.showCompletedActionInfo();
        } else {
            if (Array.isArray(addDependenciesResult.errorMessages) && (addDependenciesResult.errorMessages.length > 0)) {
                addDependenciesResult.errorMessages.forEach((message: string) => scloudOutput.appendLine(message));
            } else {
                scloudOutput.appendLine(addDependenciesResult.resultMessage);
            }
            addDependenciesInfo.showCompletedActionError();
        }
    } else {
        addDependenciesInfo.showTriggeredActionError();
    }
}