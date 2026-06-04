/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';
import { DEVASSIST } from '../ApplicationConstants';
import { DEVASSIST_SERVICE } from '../service/TranslationKeys';
import { MediaFileService } from '../service/MediaFileService';
import { FEEDBACK_FORM_FILE_NAMES } from '../service/MediaFileKeys';
import { VSTranslationService } from '../service/VSTranslationService';
import { getDevAssistCurrentSettings } from '../startup/DevAssistConfiguration';
import { ApplicationConstants } from '../util/ExtensionUtil';
import VSConsoleLogger from '../loggers/VSConsoleLogger';
import {
	validateIntegerWithinInterval,
	validateMultipleOptionField,
	validateTextAreaField,
} from './WebviewFieldValidationUtils';

const translationService = new VSTranslationService();
const vsLogger = new VSConsoleLogger();

const PROXY_URL = DEVASSIST.PROXY_URL;

const FEEDBACK_FORM_EVENTS = {
	HTML_PAGE: {
		CLOSE : "CLOSE_WEBVIEW",
		SUBMIT_FEEDBACK : "SUBMIT_FEEDBACK",
		OPEN_NEW_FEEDBACK_FORM : "OPEN_NEW_FEEDBACK_FORM",
	},
	WEBVIEW_CONTROLLER: {
		RENDER_TOAST_MESSAGE : "RENDER_TOAST_MESSAGE",
	}
}

type HtmlEventMessage = {
	eventType: string;
	eventData?: FeedbackFormData
};

type FeedbackFormData = {
	feedback: string;
	topics: string[];
	rating: number;
};

const VALID_FEEDBACK_TOPICS = [
	"CodeExplanation",
	"SDFObjectGeneration",
	"SuiteScriptCodeGeneration",
	"UnitTesting",
	"Other"
]

let feedbackFormPanel: vscode.WebviewPanel | undefined;
let mediaService: MediaFileService;
const generateNonce = () => {
	const nonceCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let nonce = '';
	for (let index = 0; index < 32; index++) {
		nonce += nonceCharacters.charAt(Math.floor(Math.random() * nonceCharacters.length));
	}
	return nonce;
};

export const openDevAssistFeedbackForm = (extensionContext: vscode.ExtensionContext) => {

	// if one FeedbackForm is already open, reveal it instead of creating a new one
	if (feedbackFormPanel) {
		feedbackFormPanel.reveal();
		return;
	}

	mediaService = new MediaFileService(extensionContext);
	feedbackFormPanel = vscode.window.createWebviewPanel(
		'devassistfeedbackform',
		'SuiteCloud Developer Assistant Feedback',
		vscode.ViewColumn.One,
		{
			enableScripts: true,
			localResourceRoots: [
				vscode.Uri.file(mediaService.getMediaDirectoryFullPath()),
			],
		},
	);

	// calculate cssUri as a proper Webview File Path and generate HTML content with it
	const cssFilePath = mediaService.getMediaFileFullPath(FEEDBACK_FORM_FILE_NAMES.MAIN_PAGE.CSS);
	const cssWebviewUri = feedbackFormPanel.webview.asWebviewUri(vscode.Uri.file(cssFilePath)).toString();
	const scriptNonce = generateNonce();
	const renderFeedbackPage = (htmlFileName : string) => mediaService.generateHTMLContentFromMediaFile(
		htmlFileName,
		cssWebviewUri,
		feedbackFormPanel!.webview.cspSource,
		scriptNonce,
	);
	feedbackFormPanel.webview.html = renderFeedbackPage(FEEDBACK_FORM_FILE_NAMES.MAIN_PAGE.HTML);

	// Clean up the reference when the WebviewPanel is closed
	feedbackFormPanel.onDidDispose(
		() => { feedbackFormPanel = undefined; },
		null,
		extensionContext.subscriptions,
	);

	// Handle messages/events sent from HTML to this Webview controller
	feedbackFormPanel.webview.onDidReceiveMessage(
		(htmlEventMessage) => handleHtmlEventMessage(htmlEventMessage, renderFeedbackPage, extensionContext),
		undefined,
		extensionContext.subscriptions,
	);
};

const handleHtmlEventMessage = async (
	htmlEventMessage : HtmlEventMessage,
	renderFeedbackPage : (htmlFileName : string) => string,
	extensionContext: vscode.ExtensionContext,
) : Promise<void> => {
	switch (htmlEventMessage.eventType) {
		case FEEDBACK_FORM_EVENTS.HTML_PAGE.SUBMIT_FEEDBACK:
			await handleSubmitFeedbackFormEvent(htmlEventMessage.eventData!, renderFeedbackPage, extensionContext);
			break;

		case FEEDBACK_FORM_EVENTS.HTML_PAGE.OPEN_NEW_FEEDBACK_FORM:
			feedbackFormPanel!.webview.html = renderFeedbackPage(FEEDBACK_FORM_FILE_NAMES.MAIN_PAGE.HTML);
			break;

		case FEEDBACK_FORM_EVENTS.HTML_PAGE.CLOSE:
			feedbackFormPanel?.dispose();
			break;
	}
}

const handleSubmitFeedbackFormEvent = async (
	formData : FeedbackFormData,
	renderFeedbackPage : (htmlFileName : string) => string,
	extensionContext: vscode.ExtensionContext,
) => {

	// validate Feedback Form Data
	const validationResult = validateFormData(formData);
	if (typeof validationResult === 'string') {
		await sendErrorEventToHtml(translationService.getMessage(DEVASSIST_SERVICE.FEEDBACK_FORM.GENERIC_VALIDATION_ERROR_WRAPPER, validationResult));
		return;
	}

	feedbackFormPanel!.webview.html = renderFeedbackPage(FEEDBACK_FORM_FILE_NAMES.SUBMITTING_HTML);

	// Send request to NetSuite Backend through Proxy
	try {
		const currentProxySettings = getDevAssistCurrentSettings();
		const requestBody = JSON.stringify(formData);
		const devassistApiKey = await extensionContext.secrets.get(DEVASSIST.SECRET_STORAGE_KEY_ID);
		const response = await fetch(`${PROXY_URL.SCHEME}${PROXY_URL.LOCALHOST_IP}:${currentProxySettings.localPort}${PROXY_URL.FEEDBACK_PATH}`, {
			method: 'POST',
			headers: { 
				'Content-Type': 'application/json',
				'authorization':`Bearer ${devassistApiKey}`
			 },
			body: requestBody
		});

		if (response.ok) {
			vsLogger.printTimestamp();
			vsLogger.info(translationService.getMessage(DEVASSIST_SERVICE.FEEDBACK_FORM.SUBMIT_SUCCESS));
			vsLogger.info('');
			feedbackFormPanel!.webview.html = renderFeedbackPage(FEEDBACK_FORM_FILE_NAMES.SUCCESS_HTML);
		}
		else {
			// SERVER_ERROR (but proxy is running, a response was received)
			vsLogger.printTimestamp();
			vsLogger.error(translationService.getMessage(DEVASSIST_SERVICE.FEEDBACK_FORM.SUBMITTING_EXTERNAL_ERROR, response.status.toString(), response.statusText));

			// "Manual reauthentication is needed" proxy event
			if (response.status === ApplicationConstants.HTTP_RESPONSE_CODE.FORBIDDEN) {
				const responseBody : any = await response.json();
				feedbackFormPanel!.webview.html = renderFeedbackPage(FEEDBACK_FORM_FILE_NAMES.MAIN_PAGE.HTML);
				await sendErrorEventToHtml(translationService.getMessage(DEVASSIST_SERVICE.FEEDBACK_FORM.SUBMITTING_ERROR_REAUTHORIZE_TOAST, responseBody.error));
				vsLogger.error(responseBody.error);

			}
			else {
				feedbackFormPanel!.webview.html = renderFeedbackPage(FEEDBACK_FORM_FILE_NAMES.FAILURE_HTML);
			}
			vsLogger.error('');
		}
	} catch (error) {
		// VSCODE ERROR, PROXY_NOT_LOADED, PROXY_ERROR, REQUEST_FORMATING_ERROR (Not even a response received)
		vsLogger.printTimestamp();
		vsLogger.error(translationService.getMessage(DEVASSIST_SERVICE.FEEDBACK_FORM.SUBMITTING_INTERNAL_ERROR, error ? '\n' + error : ''));
		vsLogger.error('');

		// TODO: Find a way to not delete the user input when swaping HTML / clicking out
		// 	-> https://code.visualstudio.com/api/extension-guides/webview#getstate-and-setstate
		feedbackFormPanel!.webview.html = renderFeedbackPage(FEEDBACK_FORM_FILE_NAMES.MAIN_PAGE.HTML);
		await sendErrorEventToHtml(translationService.getMessage(DEVASSIST_SERVICE.FEEDBACK_FORM.SUBMITTING_ERROR_TOAST));
	}
}


const sendErrorEventToHtml = async (message: string) => {
	await feedbackFormPanel!.webview.postMessage({
		eventType: FEEDBACK_FORM_EVENTS.WEBVIEW_CONTROLLER.RENDER_TOAST_MESSAGE,
		eventData: {
			toastMessageLevel : 'error',
			toastMessageContent: message}
	});
}

const validateFormData = (formData : FeedbackFormData) => {

	// validate feedback field (textArea)
	let validationResult = validateTextAreaField("Your feedback (text area)", formData.feedback, 1000);
	if (typeof validationResult === 'string') {
		return validationResult;
	}

	// validate selectedTopic field
	validationResult = validateMultipleOptionField("Your feedback (topic multi-choice selector)", formData.topics, VALID_FEEDBACK_TOPICS);
	if (typeof validationResult === 'string') {
		return validationResult;
	}

	// validate rating field (integer 0 < x <= 5)
	validationResult = validateIntegerWithinInterval("Rating", formData.rating, 1, 5);
	if (typeof validationResult === 'string') {
		return validationResult;
	}

	return true;
}
