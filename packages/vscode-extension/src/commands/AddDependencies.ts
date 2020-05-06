/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import SuiteCloudRunner from '../core/SuiteCloudRunner';
import MessageService from '../service/MessageService';
import { ADD_DEPENDENCIES, COMMAND } from '../service/TranslationKeys';
import ActionResult from '../types/ActionResult';
import { actionResultStatus } from '../util/ExtensionUtil';
import BaseAction from './BaseAction';

export default class AddDependencies extends BaseAction {
	readonly commandName: string = 'project:adddependencies';

	async execute(opts: { suiteCloudRunner: SuiteCloudRunner; messageService: MessageService }) {
		const commandActionPromise = opts.suiteCloudRunner.run({
			commandName: this.commandName,
			arguments: {},
		});
		const commandMessage = this.translationService.getMessage(COMMAND.TRIGGERED, this.translationService.getMessage(ADD_DEPENDENCIES.COMMAND));
		const statusBarMessage: string = this.translationService.getMessage(ADD_DEPENDENCIES.ADDING);
		opts.messageService.showInformationMessage(commandMessage, commandActionPromise, statusBarMessage);

		const actionResult: ActionResult = await commandActionPromise;

		if (actionResult.status === actionResultStatus.SUCCESS) {
			if (actionResult.data.length > 0) {
				opts.messageService.showCommandInfo(this.translationService.getMessage(ADD_DEPENDENCIES.ADDED));
			} else {
				opts.messageService.showWarningMessage(this.translationService.getMessage(ADD_DEPENDENCIES.EMPTY));
			}
		} else {
			opts.messageService.showCommandError(this.translationService.getMessage(ADD_DEPENDENCIES.ERROR));
		}
	}
}
