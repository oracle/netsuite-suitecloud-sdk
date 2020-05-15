/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import SuiteCloudRunner from '../core/SuiteCloudRunner';
import MessageService from '../service/MessageService';
import { VSTranslationService } from '../service/VSTranslationService';
import { ActionInterface, ActionOptions } from '../types/ActionInterface';
import { getRootProjectFolder } from '../util/ExtensionUtil';

export default abstract class BaseAction implements ActionInterface {
	protected translationService = new VSTranslationService();

	protected abstract readonly commandName: string;
	protected abstract async execute(opts: ActionOptions): Promise<void>;

	public run() {
		const executionPath = getRootProjectFolder();
		const messageService = new MessageService().forCommand(this.commandName);
		const translationService = new VSTranslationService();
		const suiteCloudRunner = new SuiteCloudRunner(executionPath);
		return this.execute({
			suiteCloudRunner: suiteCloudRunner,
			messageService: messageService,
		});
	}
}
