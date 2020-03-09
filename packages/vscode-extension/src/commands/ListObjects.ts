import { window } from 'vscode';
import SuiteCloudRunner from '../core/SuiteCloudRunner';
import { scloudOutput } from '../extension';
import { MessageService } from '../service/MessageService';
import { OperationResultStatus, unwrapExceptionMessage } from '../util/ExtensionUtil';
import BaseAction from './BaseAction';

const objectTypes: {
	name: string;
	value: { name: string; type: string; prefix: string; hasRelatedFiles: boolean; relatedFiles?: { type: string }[] };
}[] = require('@oracle/suitecloud-cli/src/metadata/ObjectTypesMetadata');

export default class ListObjects extends BaseAction {
	static readonly commandName = "listdependencies";


	async execute(opts: {
		suiteCloudRunner: SuiteCloudRunner,
		messageService: MessageService
	}) {

		if (opts.suiteCloudRunner && opts.messageService) {

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

			opts.messageService.showTriggeredActionInfo();
			let listObjectsResult;
			try {
				listObjectsResult = await opts.suiteCloudRunner.run({
					commandName: 'object:list',
					arguments: { type: selectedObjectTypes.join(' ') }
				});
			} catch (error) {
				opts.messageService.showErrorMessage(unwrapExceptionMessage(error));
				return;
			}

			if (listObjectsResult.status === OperationResultStatus.SUCCESS) {
				const listedObjects = listObjectsResult.data.map((el: { type: string; scriptId: string }) => `${el.type}: ${el.scriptId}`);
				listedObjects.forEach((obj: string) => scloudOutput.appendLine(obj));
				opts.messageService.showCompletedActionInfo();
			} else {
				scloudOutput.appendLine(listObjectsResult.resultMessage);
				opts.messageService.showCompletedActionError();
			}
		} else {
			opts.messageService.showTriggeredActionError();
		}
	}
}
