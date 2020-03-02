import * as vscode from 'vscode';
import SuiteCloudRunner from '../core/SuiteCloudRunner';
import CommandsMetadataSingleton from '../service/CommandsMetadataSingleton';
import { getRootProjectFolder } from '../util/ExtensionUtil';
import { scloudOutput } from '../extension';
import { MessageService } from '../service/MessageService';

const objectTypes: [] = require('@oracle/netsuite-suitecloud-nodejs-cli/src/metadata/ObjectTypesMetadata');

export default async function listobjects() {
    const listobjectsInfo = new MessageService('listobjects');

    const executionPath = getRootProjectFolder();
    if (executionPath) {
        const suiteCloudRunner = new SuiteCloudRunner(executionPath, CommandsMetadataSingleton.getInstance().getMetadata());

        const selectedType = await vscode.window.showQuickPick(
            objectTypes.map((objectType: any) => objectType.value.type),
            {
                placeHolder: 'select your object type or nothing to list them all',
                canPickMany: true,
            }
        );

        const args: { [key: string]: string } = {};
        if (selectedType === undefined) {
            return;
        } else {
            args.type = selectedType.join(' ');
        }

        listobjectsInfo.showTriggerActionInfo();

        const listObjectsResult = await suiteCloudRunner.run({
            commandName: 'listobjects',
            arguments: {
                ...args,
            },
            runInInteractiveMode: false,
        });

        if (listObjectsResult.status === 'SUCCESS') {
            const listedObjects = listObjectsResult.data.map((el: any) => `${el.type}: ${el.scriptId}`);
            listedObjects.forEach((obj: string) => scloudOutput.appendLine(obj));
            listobjectsInfo.showCompletedActionInfo();
        } else {
            scloudOutput.appendLine(listObjectsResult.resultMessage);
            listobjectsInfo.showFailedActionInfo();
        }

    } else {
        listobjectsInfo.showTriggerActionFailed();
    }
}