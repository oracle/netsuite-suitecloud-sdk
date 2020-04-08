/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import SuiteCloudRunner from '../core/SuiteCloudRunner';
import MessageService from '../service/MessageService';
import { COMMAND, DEPLOY } from '../service/TranslationKeys';
import { actionResultStatus } from '../util/ExtensionUtil';
import BaseAction from './BaseAction';

export default class Deploy extends BaseAction {
	readonly commandName: string = 'project:deploy';

	async execute(opts: { suiteCloudRunner: SuiteCloudRunner; messageService: MessageService }) {
		const commandActionPromise = opts.suiteCloudRunner.run({
			commandName: this.commandName,
			arguments: {},
		});
		const commandMessage = this.translationService.getMessage(COMMAND.TRIGGERED, this.translationService.getMessage(DEPLOY.COMMAND));
		const statusBarMessage: string = this.translationService.getMessage(DEPLOY.DEPLOYING);
		opts.messageService.showTriggeredActionInfo(commandMessage, commandActionPromise, statusBarMessage);

		const actionResult = await commandActionPromise;
		if (actionResult.status === actionResultStatus.SUCCESS) {
			opts.messageService.showCompletedActionInfo();
		} else {
			opts.messageService.showCompletedActionError();
		}
	}
}
