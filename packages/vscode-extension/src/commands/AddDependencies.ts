/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import SuiteCloudRunner from '../core/SuiteCloudRunner';
import { scloudOutput } from '../extension';
import OperationResult from '../OperationResult';
import { MessageService, VSCommandOutputHandler } from '../service/MessageService';
import * as TranslationKeys from '../service/TranslationKeys';
import { TranslationService } from '../service/TranslationService';
import { unwrapExceptionMessage } from '../util/ExtensionUtil';
import BaseAction from './BaseAction';

const SUCCESS = "SUCCESS";
const translationService = new TranslationService();

export default class AddDependencies extends BaseAction {
    static readonly commandName = "adddependencies";

    async execute(opts: {
        suiteCloudRunner: SuiteCloudRunner,
        messageService: MessageService
    }) {
        if (opts.suiteCloudRunner && opts.messageService) {
            opts.messageService.showTriggeredActionInfo();
            try {
                let result = await opts.suiteCloudRunner.run({
                    commandName: 'project:adddependencies',
                    arguments: {},
                });

                if (result.status === SUCCESS) {
                    VSCommandOutputHandler.showSuccessResult(result, this.successFormatOutput);
                    opts.messageService.showCompletedActionInfo();
                }
                else {
                    VSCommandOutputHandler.showErrorResult(result.errorMessages, this.errorFormatOutput);
                    opts.messageService.showCompletedActionError();
                }

            } catch (error) {
                opts.messageService.showErrorMessage(unwrapExceptionMessage(error));
                return;
            }


        } else {
            opts.messageService.showTriggeredActionError();
        }
    }

    private successFormatOutput(result: OperationResult) {
        if (result.resultMessage) {
            scloudOutput.appendLine(result.resultMessage);
        }
        if (result.data && result.data.length > 0) {
            let message = translationService.getMessage(TranslationKeys.ADD_DEPENDENCIES.ADDED);
            scloudOutput.appendLine(message);
            result.data.forEach((element: any) => {
                scloudOutput.appendLine(element.type + ":" + element.value);
            });
        }
        else {
            let message = translationService.getMessage(TranslationKeys.ADD_DEPENDENCIES.EMPTY);
            scloudOutput.appendLine(message);
        }
    }

    private errorFormatOutput(result: OperationResult) {
        let message = translationService.getMessage(TranslationKeys.ADD_DEPENDENCIES.ERROR);
        scloudOutput.appendLine(message);
        if (Array.isArray(result.errorMessages) && (result.errorMessages.length > 0)) {
            result.errorMessages.forEach((message: string) => scloudOutput.appendLine(message));
        } else {
            scloudOutput.appendLine(result.resultMessage);
        }
    }
}