import { window } from 'vscode';
import SuiteCloudRunner from '../core/SuiteCloudRunner';
import CommandsMetadataSingleton from '../service/CommandsMetadataSingleton';
import { getRootProjectFolder, unwrapExceptionMessage, actionResultStatus } from '../util/ExtensionUtil';
import { scloudOutput } from '../extension';
import { MessageService } from '../service/MessageService';

const objectTypes: {
	name: string;
	value: { name: string; type: string; prefix: string; hasRelatedFiles: boolean; relatedFiles?: { type: string }[] };
}[] = require('@oracle/suitecloud-cli/src/metadata/ObjectTypesMetadata');

export default async function listobjects() {
	const listobjectsMessageService = new MessageService('listobjects');
	const executionPath = getRootProjectFolder();

	if (executionPath) {
		const suiteCloudRunner = new SuiteCloudRunner(executionPath, CommandsMetadataSingleton.getInstance().getMetadata());

		const selectedObjectTypes = await window.showQuickPick(
			objectTypes.map(objectType => objectType.value.type),
			{
				placeHolder: 'select your object type or nothing to list them all',
				canPickMany: true
			}
		);

		if (selectedObjectTypes === undefined) {
			return;
		}

		listobjectsMessageService.showTriggeredActionInfo();
		let listObjectsResult;
		try {
			listObjectsResult = await suiteCloudRunner.run({
				commandName: 'object:list',
				arguments: { type: selectedObjectTypes.join(' ') }
			});
		} catch (error) {
			listobjectsMessageService.showErrorMessage(unwrapExceptionMessage(error));
			return;
		}

		if (listObjectsResult.status === actionResultStatus.SUCCESS) {
			const listedObjects = listObjectsResult.data.map((el: { type: string; scriptId: string }) => `${el.type}: ${el.scriptId}`);
			listedObjects.forEach((obj: string) => scloudOutput.appendLine(obj));
			listobjectsMessageService.showCompletedActionInfo();
		} else {
			scloudOutput.appendLine(listObjectsResult.resultMessage);
			listobjectsMessageService.showCompletedActionError();
		}
	} else {
		listobjectsMessageService.showTriggeredActionError();
	}
}
