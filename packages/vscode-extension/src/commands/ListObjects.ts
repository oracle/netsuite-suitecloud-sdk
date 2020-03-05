import { window } from 'vscode';
import { scloudOutput } from '../extension';
import { MessageService } from '../service/MessageService';
import BaseAction from './BaseAction';
import { unwrapExceptionMessage, OperationResultStatus } from '../util/ExtensionUtil';

const objectTypes: {
	name: string;
	value: { name: string; type: string; prefix: string; hasRelatedFiles: boolean; relatedFiles?: { type: string }[] };
}[] = require('@oracle/netsuite-suitecloud-nodejs-cli/src/metadata/ObjectTypesMetadata');

export default class ListObjects extends BaseAction {

	constructor() {
		super({ messageService: new MessageService('deploy') });
	}

	async execute() {

		if (this.suiteCloudRunner && this.messageService) {

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

			this.messageService.showTriggeredActionInfo();
			let listObjectsResult;
			try {
				listObjectsResult = await this.suiteCloudRunner.run({
					commandName: 'object:list',
					arguments: { type: selectedObjectTypes.join(' ') }
				});
			} catch (error) {
				this.messageService.showErrorMessage(unwrapExceptionMessage(error));
				return;
			}

			if (listObjectsResult.status === OperationResultStatus.SUCCESS) {
				const listedObjects = listObjectsResult.data.map((el: { type: string; scriptId: string }) => `${el.type}: ${el.scriptId}`);
				listedObjects.forEach((obj: string) => scloudOutput.appendLine(obj));
				this.messageService.showCompletedActionInfo();
			} else {
				scloudOutput.appendLine(listObjectsResult.resultMessage);
				this.messageService.showCompletedActionError();
			}
		} else {
			this.messageService.showTriggeredActionError();
		}
	}
}
