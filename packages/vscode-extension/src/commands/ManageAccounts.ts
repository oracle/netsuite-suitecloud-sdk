/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import SuiteCloudRunner from '../core/SuiteCloudRunner';
import MessageService from '../service/MessageService';
import { COMMAND } from '../service/TranslationKeys';
import { actionResultStatus } from '../util/ExtensionUtil';
import BaseAction from './BaseAction';

export default class ManageAccounts extends BaseAction {
	readonly commandName: string = 'account:setup';
	async execute(opts: { suiteCloudRunner: SuiteCloudRunner; messageService: MessageService }) {

		const commandMessage = this.translationService.getMessage(COMMAND.TRIGGERED, `Account:setup`);

		const commandActionPromise = opts.suiteCloudRunner.run({
			commandName: this.commandName,
			arguments: {
			},
		});
		opts.messageService.showInformationMessage(commandMessage);

		const actionResult = await commandActionPromise;
		if (actionResult.status === actionResultStatus.SUCCESS) {
			opts.messageService.showCommandInfo(JSON.stringify(actionResult));
		} else {
			opts.messageService.showCommandError();
		}
		return;
	}
}
