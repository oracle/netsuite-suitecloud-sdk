import { window } from 'vscode';
import SuiteCloudRunner from '../core/SuiteCloudRunner';
import MessageService from '../service/MessageService';
import VSCommandOutputHandler from '../service/VSCommandOutputHandler';
import { OperationResultStatus, unwrapExceptionMessage } from '../util/ExtensionUtil';
import BaseAction from './BaseAction';

const objectTypes: {
	name: string;
	value: { name: string; type: string; prefix: string; hasRelatedFiles: boolean; relatedFiles?: { type: string }[] };
}[] = require('@oracle/suitecloud-cli/src/metadata/ObjectTypesMetadata');

export default class ListObjects extends BaseAction {
	readonly commandName: string = "object:list";
	vsCommandOutputHandler = new VSCommandOutputHandler();

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
			let result;
			try {
				result = await opts.suiteCloudRunner.run({
					commandName: this.commandName,
					arguments: { type: selectedObjectTypes.join(' ') }
				});
			} catch (error) {
				opts.messageService.showErrorMessage(unwrapExceptionMessage(error));
				return;
			}

			if (result.status === OperationResultStatus.SUCCESS) {
				this.vsCommandOutputHandler.showSuccessResult(result);
				opts.messageService.showCompletedActionInfo();
			} else {
				this.vsCommandOutputHandler.showErrorResult(result);
				opts.messageService.showCompletedActionError();
			}
		} else {
			opts.messageService.showTriggeredActionError();
		}
	}
}
