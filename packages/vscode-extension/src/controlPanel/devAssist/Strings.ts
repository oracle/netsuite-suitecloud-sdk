/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { DEVASSIST } from '../../ApplicationConstants';

export const SUITECLOUD_PANEL_RUNTIME_STRINGS = {
	panelTitle: 'SuiteCloud Developer Assistant',
	notificationTitle: 'SuiteCloud Developer Assistant',
	modelId: 'NetSuite',
	logPrefix: '[SuiteCloud Proxy]',
	apiKey: {
		hiddenHint: 'Hidden by default. Rotate to reveal for 5 minutes.',
		notFoundLabel: 'No API key found',
		notFoundInfo: 'No API key found. Click Generate API Key.',
		hiddenExistingLabel: 'Hidden (existing API key)',
		generateLabel: 'Generate API Key',
		rotateLabel: 'Rotate API Key',
	},
	actions: {
		proxyRunning: 'SuiteCloud Proxy is running.',
		proxyStopped: 'SuiteCloud Proxy stopped.',
		proxyAlreadyStopped: 'SuiteCloud Proxy is already stopped.',
		apiKeyGenerated: 'API key generated successfully. Copy is available for 5 minutes.',
		apiKeyRotated: 'API key rotated successfully. Copy is available for 5 minutes.',
		copyValue: (label: string) => `${label} copied to clipboard.`,
		startProxyBeforeClineChat: 'Start the SuiteCloud Proxy first, then open Cline chat.',
		startProxyBeforeClineApply: 'Start the SuiteCloud Proxy before applying Cline settings.',
		openedClineChat: 'Opened Cline chat.',
		openClineChatFailed: 'Unable to open Cline chat automatically. Open Cline from the Activity Bar and focus chat input.',
		invalidWebviewPayload: 'Received invalid webview message payload.',
		noApiKeyForClineApply: 'No API key is available. Generate an API key first.',
		noClineConfigChangesDetected: 'No change detected. Nothing to apply to Cline config.',
		clineRestartRequired: 'Restart VS Code extensions to finish configuring Cline.',
		clineConfigSaved: 'Cline configuration was saved. Restart VS Code extensions to activate it.',
		workspaceClineSetupIsManual:
			'Cline provider config is global in supported Cline versions. Copy Base URL, Model ID, and API key manually for workspace-specific setup.',
		authIdChangeCancelled: 'Auth ID change cancelled. Keeping the current running SuiteCloud Proxy configuration.',
		welcomeNotificationDisabled: 'SuiteCloud welcome popup disabled.',
		portChangeRequiresStoppedProxy: 'Stop the SuiteCloud Proxy before changing the local port.',
		authIdChangeRequiresStoppedProxy: 'Stop the SuiteCloud Proxy before changing the Auth ID.',
		apiKeyChangeRequiresStoppedProxy: 'Stop the SuiteCloud Proxy before generating or rotating the API key.',
	},
	dialogs: {
		rotateExistingPrompt:
			'Generate a new SuiteCloud Proxy API key? Existing clients using the old key will stop working until updated.',
		rotateMissingPrompt:
			'Generate a SuiteCloud Proxy API key? This key is required to start the SuiteCloud Proxy and connect a client.',
		rotateExistingAction: 'Rotate API Key',
		rotateMissingAction: 'Generate API Key',
		applyClinePrompt:
			'Apply settings to Cline using an experimental storage integration? This can fail if Cline changes its internal format.',
		applyClineAction: 'Update Cline Config',
		clineExtensionRestartRequiredPrompt:
			'Restart extensions to apply the Cline configuration? Any running commands, including deployments and validations, will be stopped.',
		restartExtensionsAction: 'Restart Extensions',
		welcomeTitle: 'SuiteCloud Developer Assistant',
		welcomeMessage:
			'Meet SuiteCloud Developer Assistant: frontier LLM with NetSuite domain expertise.',
		welcomeOpenPanelAction: 'Try now',
		welcomeRemindAction: 'Remind later',
		welcomeDisableAction: 'Do not remind',
		startProxyDisclaimer:
			'AI-generated output may contain errors or omissions. Review all output before use; it is for informational purposes only and not professional advice.',
		startProxyDisclaimerAction: 'Start Proxy',
	},
	errors: {
		invalidAuthId: 'Select a valid auth ID before starting the SuiteCloud Proxy.',
		invalidPortRange: (min: number, max: number) => `Port must be between ${min} and ${max}.`,
		unableResolveApiKeyForStart:
			'No API key is available. Generate an API key in the control panel before starting the SuiteCloud Proxy.',
	},
	friendlyErrors: {
		outputHint: '\n\nOpen Output for detailed startup logs.',
		sdkJarInvalid:
			'Unable to start the SuiteCloud Proxy because the bundled CLI JAR is invalid or corrupted. Reinstall SDK dependencies, then try again.',
		proxyStartMissing:
			(version: string) =>
				`This VS Code extension is running @oracle/suitecloud-cli v${version}, which does not include "proxy:start".\n\nSuggested fix: update/reinstall extension dependencies so v3.2.0+ is used.`,
		apiKeyStorage:
			(errorMessage: string) =>
				`${errorMessage}\n\nSuggested fix: click "Rotate API Key" in the panel. If it still fails, delete ~/.suitecloud-sdk/client_api_key.p12 and generate a new key.`,
		portConflict:
			(errorMessage: string) => `${errorMessage}\n\nSuggested fix: choose another Local Port in the panel and retry.`,
		authIssue:
			(errorMessage: string) =>
				`${errorMessage}\n\nSuggested fix: verify the selected Auth ID in "SuiteCloud: Manage Accounts", then retry.`,
		timeout:
			(errorMessage: string) => `${errorMessage}\n\nSuggested fix: open Output and check CLI startup logs for network/auth errors.`,
	},
} as const;

export const SUITECLOUD_PANEL_CLIENT_STRINGS = {
	noAccountsAvailable: 'Select from list',
	notResolved: 'Not resolved',
	generateApiKeyTitle: 'Generate API key',
	rotateApiKeyTitle: 'Rotate API key',
	openClineChatEnabledTitle: 'Open Cline chat view.',
	openClineChatDisabledTitle: 'Start the SuiteCloud Proxy to enable this.',
	syncClineIncompatibleTitle: 'Automatic Cline configuration is not supported in the current setup.',
	syncClineMissingApiKeyTitle: 'Generate an API key before configuring Cline.',
	syncClineProxyUnavailableTitle: 'Start the SuiteCloud Proxy before configuring Cline.',
	syncClineReadyTitle: 'Configure Cline with the current panel settings.',
	changePortWhileRunningTitle: 'Stop the SuiteCloud Proxy before changing the local port.',
	changeAuthIdWhileRunningTitle: 'Stop the SuiteCloud Proxy before changing the Auth ID.',
	changeApiKeyWhileRunningTitle: 'Stop the SuiteCloud Proxy before generating or rotating the API key.',
	invalidPortFormat:
		`Enter a 4 or 5 digit port between ${DEVASSIST.PORT_RANGE.MIN} and ${DEVASSIST.PORT_RANGE.MAX}.`,
} as const;
