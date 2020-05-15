/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import { COMMAND, DEPLOY } from '../service/TranslationKeys';
import { actionResultStatus } from '../util/ExtensionUtil';
import BaseAction from './BaseAction';

export default class Deploy extends BaseAction {

	constructor() {
		super('project:deploy');
	}

	protected async execute() {
		const commandActionPromise = this.runSubCommand({});
		const commandMessage = this.translationService.getMessage(COMMAND.TRIGGERED, this.translationService.getMessage(DEPLOY.COMMAND));
		const statusBarMessage: string = this.translationService.getMessage(DEPLOY.DEPLOYING);
		this.messageService.showInformationMessage(commandMessage, statusBarMessage, commandActionPromise);

		const actionResult = await commandActionPromise;
		if (actionResult.status === actionResultStatus.SUCCESS) {
			this.messageService.showCommandInfo();
		} else {
			this.messageService.showCommandError();
		}
	}
}
