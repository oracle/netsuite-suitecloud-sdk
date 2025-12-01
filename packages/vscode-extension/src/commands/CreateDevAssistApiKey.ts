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
 * Registers the suitecloud.createdevassistapikey command.
 * This command generates and stores a Developer Assistant API Key,
 * then displays it in a modal dialog.
 */
/**
 * Command handler for suitecloud.createdevassistapikey
 */
export async function createDevAssistApiKeyCommand(extensionContext: vscode.ExtensionContext): Promise<string | undefined> {
    // Generate the API key
    const apiKey = generateApiKey();

    // Compose the message to display in the modal window
    const modalMessage = translationService.getMessage(DEVASSIST_SERVICE.CREATE_API_KEY.MODAL.MAIN_MESSAGE, apiKey);

    // const rawMessage = 'A new API key has been generated for SuiteCloud Developer Assistant:\n\n' +
    //     apiKey + '\n\n' +
    //     'Paste the API key into the OpenAI Compatible API Key field in CLINE settings.\n\n' +
    //     'When your SuiteCloud Developer Assistant service starts, copy the base URL from the SuiteCloud output panel into the Base URL field in CLINE settings.\n\n' +
    //     'Keep this API key confidential and do not share it.'

    const copyButtonText = translationService.getMessage(DEVASSIST_SERVICE.CREATE_API_KEY.MODAL.COPY_BUTTON)
    // Show the modal with "Copy" action
    const selection = await vscode.window.showInformationMessage(
        modalMessage,
        { modal: true },
        copyButtonText
    );

    // DEVASSIST_SERVICE.CREATE_API_KEY.MODAL.COPY_BUTTON
    if (selection === copyButtonText) {
        // save apiKey
        await extensionContext.secrets.store(DEVASSIST.SECRET_KEY, apiKey);
        // copy apiKey to clipboard
        vscode.env.clipboard.writeText(apiKey);
        // confirmation message
        vscode.window.showInformationMessage(translationService.getMessage(DEVASSIST_SERVICE.CREATE_API_KEY.CONFIRMATION_MESSGE));
        // show suitecloud output
        output.show();
        return apiKey;
    } else {
        // cancel message
        vscode.window.showInformationMessage(translationService.getMessage(DEVASSIST_SERVICE.CREATE_API_KEY.CANCELED_MESSAGE));
        return;
    }
}
