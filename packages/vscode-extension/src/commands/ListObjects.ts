/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { window } from 'vscode';
import SuiteCloudRunner from '../core/SuiteCloudRunner';
import MessageService from '../service/MessageService';
import { COMMAND, LIST_OBJECTS } from '../service/TranslationKeys';
import { actionResultStatus } from '../util/ExtensionUtil';
import BaseAction from './BaseAction';

const objectTypes: {
	name: string;
	value: { name: string; type: string; prefix: string; hasRelatedFiles: boolean; relatedFiles?: { type: string }[] };
}[] = require('@oracle/suitecloud-cli/src/metadata/ObjectTypesMetadata');

export default class ListObjects extends BaseAction {
	readonly commandName: string = 'object:list';

	async execute(opts: { suiteCloudRunner: SuiteCloudRunner; messageService: MessageService }) {
		if (opts.suiteCloudRunner && opts.messageService) {
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

			const commandAction = opts.suiteCloudRunner.run({
				commandName: this.commandName,
				arguments: { type: selectedObjectTypes.join(' ') },
			});
			const commandMessage = this.translationService.getMessage(COMMAND.TRIGGERED, [this.translationService.getMessage(LIST_OBJECTS.COMMAND)]);
			const statusBarMessage = this.translationService.getMessage(LIST_OBJECTS.LISTING);
			opts.messageService.showTriggeredActionInfo(commandAction, commandMessage, statusBarMessage);

			let actionResult = await commandAction;
			if (actionResult.status === actionResultStatus.SUCCESS) {
				opts.messageService.showCompletedActionInfo();
			} else {
				opts.messageService.showCompletedActionError();
			}
		} else {
			opts.messageService.showTriggeredActionError();
		}
	}
}
