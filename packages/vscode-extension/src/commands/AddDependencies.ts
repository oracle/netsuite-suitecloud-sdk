/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import SuiteCloudRunner from '../core/SuiteCloudRunner';
import { Output } from '../extension';
import OperationResult from '../types/OperationResult';
import MessageService from '../service/MessageService';
import * as TranslationKeys from '../service/TranslationKeys';
import { TranslationService } from '../service/TranslationService';
import VSCommandOutputHandler from '../service/VSCommandOutputHandler';
import { unwrapExceptionMessage, OperationResultStatus } from '../util/ExtensionUtil';
import BaseAction from './BaseAction';

const translationService = new TranslationService();

const DEPENDENCY_TYPES = {
    FEATURE: {
        name: 'FEATURE',
        prefix: 'Feature -',
    },
    FILE: {
        name: 'FILE',
        prefix: 'File -',
    },
    FOLDER: {
        name: 'FOLDER',
        prefix: 'Folder -',
    },
    OBJECT: {
        name: 'OBJECT',
        prefix: 'Object -',
    },
    PLATFORMEXTENSION: {
        name: 'PLATFORMEXTENSION',
        prefix: 'Platform Extension -',
    },
};

const FEATURE_REQUIRED = 'required';
const FEATURE_OPTIONAL = 'optional';

const OBJECT_REFERENCE_ATTRIBUTES = {
    APP_ID: 'appId=',
    BUNDLE_ID: 'bundleId=',
    OBJECT_TYPE: 'objectType=',
    SCRIPT_ID: 'scriptId=',
};

const OBJECT_CONTAINER_PREFIX = {
    BUNDLE: 'Bundle',
    SUITEAPP: 'Application',
};

export default class AddDependencies extends BaseAction {
    readonly commandName: string = "project:adddependencies";
    vsCommandOutputHandler = new VSCommandOutputHandler();


    async execute(opts: {
        suiteCloudRunner: SuiteCloudRunner,
        messageService: MessageService
    }) {
        opts.messageService.showTriggeredActionInfo();
        try {
            let result: OperationResult = await opts.suiteCloudRunner.run({
                commandName: this.commandName,
                arguments: {},
            });

            if (result.status === OperationResultStatus.SUCCESS) {
                if (result.data.length > 0) {
                    opts.messageService.showCompletedActionInfo(translationService.getMessage(TranslationKeys.ADD_DEPENDENCIES.ADDED));
                }
                else {
                    opts.messageService.showInformationMessage(translationService.getMessage(TranslationKeys.ADD_DEPENDENCIES.EMPTY));
                }
                this.vsCommandOutputHandler.showSuccessResult(result, this.successFormatOutput.bind(this));
            }
            else {
                this.vsCommandOutputHandler.showErrorResult(result, this.errorFormatOutput);
                opts.messageService.showCompletedActionError(translationService.getMessage(TranslationKeys.ADD_DEPENDENCIES.ERROR));
            }

        } catch (error) {
            const errorMessage = translationService.getMessage(TranslationKeys.ADD_DEPENDENCIES.ERROR);
            opts.messageService.showErrorMessage(errorMessage);
            this.vsCommandOutputHandler.showErrorResult(errorMessage);
            this.vsCommandOutputHandler.showErrorResult(unwrapExceptionMessage(error));
            return;
        }
    }

    private successFormatOutput(result: OperationResult) {
        if (result.data && result.data.length > 0) {
            const message = translationService.getMessage(TranslationKeys.ADD_DEPENDENCIES.ADDED_LOG);
            Output.appendLine(message);

            this.getDependenciesStringsArray(result.data).forEach((element: string) => {
                Output.appendLine(element);
            });
        }
        else {
            const message = translationService.getMessage(TranslationKeys.ADD_DEPENDENCIES.EMPTY);
            Output.appendLine(message);
        }
    }

    private errorFormatOutput(result: OperationResult) {
        let message = translationService.getMessage(TranslationKeys.ADD_DEPENDENCIES.ERROR);
        Output.appendLine(message);
        if (Array.isArray(result.errorMessages) && (result.errorMessages.length > 0)) {
            result.errorMessages.forEach((message: string) => Output.appendLine(message));
        } else {
            Output.appendLine(result.resultMessage);
        }
    }


    private getDependenciesStringsArray(data: any[]) {
        const dependenciesString: string[] = [];
        //Features
        const features = data.filter(dependency => dependency.type === DEPENDENCY_TYPES.FEATURE.name);
        features.forEach(feature => {
            const requiredOrOptional = feature.required ? FEATURE_REQUIRED : FEATURE_OPTIONAL;
            dependenciesString.push(`${DEPENDENCY_TYPES.FEATURE.prefix} ${feature.value}:${requiredOrOptional}`);
        });
        //Files
        const files = data.filter(dependency => dependency.type === DEPENDENCY_TYPES.FILE.name);
        files.forEach(file => {
            dependenciesString.push(`${DEPENDENCY_TYPES.FILE.prefix} ${file.value}`);
        });
        //Folders
        const folders = data.filter(dependency => dependency.type === DEPENDENCY_TYPES.FOLDER.name);
        folders.forEach(folder => {
            dependenciesString.push(`${DEPENDENCY_TYPES.FOLDER.prefix} ${folder.value}`);
        });
        //Objects - Regular, SuiteApp,  Bundle dependencies
        const objects = data.filter(dependency => dependency.type === DEPENDENCY_TYPES.OBJECT.name);
        objects.forEach(object => {
            const appIdDisplay = object.appId
                ? `in [${OBJECT_CONTAINER_PREFIX.SUITEAPP} - ${OBJECT_REFERENCE_ATTRIBUTES.APP_ID}${object.appId}]`
                : '';
            const bundleIdDisplay = object.bundleIds
                ? `in [${OBJECT_CONTAINER_PREFIX.BUNDLE} - ${OBJECT_REFERENCE_ATTRIBUTES.BUNDLE_ID}${object.bundleIds}]`
                : '';
            const scriptIdDisplay = `${OBJECT_REFERENCE_ATTRIBUTES.SCRIPT_ID}${object.scriptId}`;
            dependenciesString.push(`[${DEPENDENCY_TYPES.OBJECT.prefix} ${scriptIdDisplay}] ${appIdDisplay}${bundleIdDisplay}`);
        });
        //Platform Extensions
        const platforExtensions = data.filter(dependency => dependency.type === DEPENDENCY_TYPES.PLATFORMEXTENSION.name);
        platforExtensions.forEach(platforExtension => {
            const appIdDisplay = platforExtension.appId
                ? `${OBJECT_REFERENCE_ATTRIBUTES.APP_ID}${platforExtension.appId}, `
                : '';
            const objectTypeDisplay = `${OBJECT_REFERENCE_ATTRIBUTES.OBJECT_TYPE}${platforExtension.objectType}`;
            dependenciesString.push(`${DEPENDENCY_TYPES.PLATFORMEXTENSION.prefix} ${appIdDisplay}${objectTypeDisplay}`);
        });
        return dependenciesString;
    }

}


