/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import SuiteCloudRunner from '../core/SuiteCloudRunner';
import MessageService from '../service/MessageService';
import { VSTranslationService } from '../service/VSTranslationService';

export default abstract class BaseAction {
	abstract readonly commandName: string;
	abstract async execute(opts: { suiteCloudRunner: SuiteCloudRunner; messageService: MessageService }): Promise<void>;
	translationService = new VSTranslationService();
}
