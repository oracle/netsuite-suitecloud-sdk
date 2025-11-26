/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';
import { DEVASSIST } from '../ApplicationConstants';
import { generateApiKey } from '../util/APIKeyGenerator';
import { DEVASSIST_SERVICE } from '../service/TranslationKeys';
import { VSTranslationService } from '../service/VSTranslationService';


const translationService = new VSTranslationService();

/**
 * Registers the suitecloud.createdevassistapikey command.
 * This command generates and stores a Developer Assistant API Key,
 * then displays it in a modal dialog.
 */
/**
 * Command handler for suitecloud.createdevassistapikey
 */
export async function createDevAssistApiKeyCommand(extensionContext: vscode.ExtensionContext): Promise<void> {
    // Generate the API key
    const apiKey = generateApiKey();

    // Compose the message to display - 
    // DEVASSIST_SERVICE.CREATE_API_KEY.MODAL.MAIN_MESSAGE
    const mainMessage =
        'A new API key for Developer Assistant has been generated.\n\n' +
        'To enable CLINE to communicate securely with your Developer Assistant service, please copy this key and enter it into the CLINE extension base URL.\n\n' +
        'The API key will also be stored securely and used automatically to start your SuiteCloud Developer Assistant service.\n\n' +
        'Keep this key confidential and do not share it.'+
        `\n\nAPI Key: ${apiKey}`;


    const copyButtonText = translationService.getMessage(DEVASSIST_SERVICE.CREATE_API_KEY.MODAL.COPY_BUTTON)
    // Show the modal with "Copy" action
    const selection = await vscode.window.showInformationMessage(
        mainMessage,
        { modal: true },
        copyButtonText
    );

    // DEVASSIST_SERVICE.CREATE_API_KEY.MODAL.COPY_BUTTON
    if (selection === copyButtonText) {
        // confirmation message
        await extensionContext.secrets.store(DEVASSIST.SECRET_KEY, apiKey);
        vscode.env.clipboard.writeText(apiKey);
        // DEVASSIST_SERVICE.CREATE_API_KEY.CONFIRMATION_MESSGE
        vscode.window.showInformationMessage('API key copied to clipboard!');
    } else {
        //  DEVASSIST_SERVICE.CREATE_API_KEY.CANCELED_MESSAGE
        vscode.window.showInformationMessage('API key creation canceled.');
    }
}
