/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';
import { DEVASSIST } from '../ApplicationConstants';
import { generateApiKey } from '../util/APIKeyGenerator';
import { DEVASSIST_SERVICE } from '../service/TranslationKeys';
import { VSTranslationService } from '../service/VSTranslationService';
import { output } from '../suitecloud';


const translationService = new VSTranslationService();

/**
 * Command handler for suitecloud.createdevassistapikey
 * This command generates and stores a Developer Assistant API Key,
 */
export async function createDevAssistApiKey(extensionContext: vscode.ExtensionContext): Promise<string | undefined> {
    const apiKey = generateApiKey();

    const modalMessage = translationService.getMessage(DEVASSIST_SERVICE.CREATE_API_KEY.MODAL.MAIN_MESSAGE, apiKey);
    const copyButtonText = translationService.getMessage(DEVASSIST_SERVICE.CREATE_API_KEY.MODAL.COPY_BUTTON)

    // Show the modal with copy button
    const selection = await vscode.window.showInformationMessage(
        modalMessage,
        { modal: true },
        copyButtonText
    );

    if (selection === copyButtonText) {
        // store API Key and show confirmation
        await extensionContext.secrets.store(DEVASSIST.SECRET_STORAGE_KEY_ID, apiKey);
        vscode.env.clipboard.writeText(apiKey);
        vscode.window.showInformationMessage(translationService.getMessage(DEVASSIST_SERVICE.CREATE_API_KEY.CONFIRMATION_MESSAGE));
        output.show();
        return apiKey;
    } else {
        // cancel the process
        vscode.window.showInformationMessage(translationService.getMessage(DEVASSIST_SERVICE.CREATE_API_KEY.CANCELED_MESSAGE));
        return;
    }
}
