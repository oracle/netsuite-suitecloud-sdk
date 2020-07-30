/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import { window } from 'vscode';
import { COMMAND, LIST_OBJECTS } from '../service/TranslationKeys';
import { STATUS } from '@oracle/suitecloud-cli/dist/services/actionresult/ActionResult';
import BaseAction from './BaseAction';

const objectTypes: {
	name: string;
	value: { name: string; type: string; prefix: string; hasRelatedFiles: boolean; relatedFiles?: { type: string }[] };
}[] = require('@oracle/suitecloud-cli/dist/metadata/ObjectTypesMetadata');

const COMMAND_NAME = 'object:list';

export default class ListObjects extends BaseAction {

	constructor() {
		super(COMMAND_NAME);
	}

	protected async execute() {
		const selectedObjectTypes = await window.showQuickPick(
			objectTypes.map(objectType => objectType.value.type),
			{
				placeHolder: 'select your object type or nothing to list them all',
				canPickMany: true,
			}
		);

		if (selectedObjectTypes === undefined) {
			return;
		}

		const commandActionPromise = this.runSuiteCloudCommand({ type: selectedObjectTypes.join(' ')});
		const commandMessage = this.translationService.getMessage(COMMAND.TRIGGERED, this.translationService.getMessage(LIST_OBJECTS.COMMAND));
		const statusBarMessage = this.translationService.getMessage(LIST_OBJECTS.LISTING);
		this.messageService.showInformationMessage(commandMessage, statusBarMessage, commandActionPromise);

		const actionResult = await commandActionPromise;
		if (actionResult.status === STATUS.SUCCESS) {
			this.messageService.showCommandInfo();
		} else {
			this.messageService.showCommandError();
		}
	}
}
