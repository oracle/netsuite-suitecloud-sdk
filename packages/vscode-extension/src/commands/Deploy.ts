/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import SuiteCloudRunner from '../core/SuiteCloudRunner';
import MessageService from '../service/MessageService';
import { actionResultStatus, unwrapExceptionMessage } from '../util/ExtensionUtil';
import BaseAction from './BaseAction';

export default class Deploy extends BaseAction {
	readonly commandName: string = 'project:deploy';

	async execute(opts: { suiteCloudRunner: SuiteCloudRunner; messageService: MessageService }) {
		opts.messageService.showTriggeredActionInfo();
		if (opts.suiteCloudRunner && opts.messageService) {
			let actionResult = await opts.suiteCloudRunner.run({
				commandName: this.commandName,
				arguments: {},
			});
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
