/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import SuiteCloudRunner from '../core/SuiteCloudRunner';
import MessageService from '../service/MessageService';
import * as TranslationKeys from '../service/TranslationKeys';
import { VSTranslationService } from '../service/VSTranslationService';
import ActionResult from '../types/ActionResult';
import { unwrapExceptionMessage } from '../util/ExtensionUtil';
import BaseAction from './BaseAction';

const translationService = new VSTranslationService();

export default class AddDependencies extends BaseAction {
	readonly commandName: string = 'project:adddependencies';

	async execute(opts: { suiteCloudRunner: SuiteCloudRunner; messageService: MessageService }) {
		opts.messageService.showTriggeredActionInfo();
		try {
			let actionResult: ActionResult = await opts.suiteCloudRunner.run({
				commandName: this.commandName,
				arguments: {},
			});

			if (actionResult.status === 'SUCCESS') {
				if (actionResult.data.length > 0) {
					opts.messageService.showCompletedActionInfo(translationService.getMessage(TranslationKeys.ADD_DEPENDENCIES.ADDED));
				} else {
					opts.messageService.showInformationMessage(translationService.getMessage(TranslationKeys.ADD_DEPENDENCIES.EMPTY));
				}
			} else {
				opts.messageService.showCompletedActionError(translationService.getMessage(TranslationKeys.ADD_DEPENDENCIES.ERROR));
			}
		} catch (error) {
			const errorMessage = translationService.getMessage(TranslationKeys.ADD_DEPENDENCIES.ERROR);
			opts.messageService.showErrorMessage(errorMessage);
			//TODO Runtime error, we don't want the user to see this message?
			console.log(errorMessage);
			console.log(unwrapExceptionMessage(error));
			// NodeConsoleLogger.println(errorMessage);
			// NodeConsoleLogger.println(unwrapExceptionMessage(error));
			return;
		}
	}
}
