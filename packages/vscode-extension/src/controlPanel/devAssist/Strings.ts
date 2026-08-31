/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

export const SUITECLOUD_PANEL_RUNTIME_STRINGS = {
	panelTitle: 'SuiteCloud Control Panel',
	notificationTitle: 'SuiteCloud Dev Assist',
	modelId: 'NetSuite',
	logPrefix: '[SuiteCloud Control Panel]',
	apiKey: {
		hiddenHint: 'Hidden by default. Rotate to reveal for 5 minutes.',
		notFoundLabel: 'No API key found',
		notFoundInfo: 'No API key found. Click Generate API Key.',
		hiddenExistingLabel: 'Hidden (existing API key)',
		generateLabel: 'Generate API Key',
		rotateLabel: 'Rotate API Key',
	},
	actions: {
		proxyRunning: 'SuiteCloud proxy is running.',
		proxyStopped: 'Proxy stopped.',
		proxyAlreadyStopped: 'Proxy is already stopped.',
		apiKeyGenerated: 'API key generated successfully. Copy is available for 5 minutes.',
		apiKeyRotated: 'API key rotated successfully. Copy is available for 5 minutes.',
		copyValue: (label: string) => `${label} copied to clipboard.`,
		startProxyBeforeClineChat: 'Start proxy first, then open Cline chat.',
		startProxyBeforeClineApply: 'Start the SuiteCloud proxy before applying Cline settings.',
		openedClineChat: 'Opened Cline chat.',
		openClineChatFailed: 'Unable to open Cline chat automatically. Open Cline from the Activity Bar and focus chat input.',
		invalidWebviewPayload: 'Received invalid webview message payload.',
		noApiKeyForClineApply: 'No API key is available yet. Start proxy or rotate key first.',
		noClineConfigChangesDetected: 'No change detected. Nothing to apply to Cline config.',
		workspaceClineSetupIsManual:
			'Cline provider config is global in supported Cline versions. Copy Base URL, Model ID, and API key manually for workspace-specific setup.',
		authIdChangeCancelled: 'Auth ID change cancelled. Keeping current running proxy configuration.',
		welcomeNotificationDisabled: 'SuiteCloud welcome popup disabled.',
		portChangeRequiresStoppedProxy: 'Stop the proxy before changing the local port.',
		authIdChangeRequiresStoppedProxy: 'Stop the proxy before changing the Auth ID.',
		apiKeyChangeRequiresStoppedProxy: 'Stop the proxy before generating or rotating the API key.',
	},
	dialogs: {
		rotateExistingPrompt:
			'Generate a new SuiteCloud proxy API key? Existing clients using the old key will stop working until updated.',
		rotateMissingPrompt:
			'Generate a SuiteCloud proxy API key? This key is required to start the local service and connect a client.',
		rotateExistingAction: 'Rotate API Key',
		rotateMissingAction: 'Generate API Key',
		cancelAction: 'Cancel',
		applyClinePrompt:
			'Apply settings to Cline using an experimental storage integration? This can fail if Cline changes its internal format.',
		applyClineAction: 'Update Cline Config',
		clineExtensionRestartRequiredPrompt:
			'Restart VS Code extensions to activate the new Cline configuration. Running extension commands, including SuiteCloud deployments and validations, will be interrupted.',
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
		invalidAuthId: 'Select a valid auth ID before starting the proxy.',
		invalidPortRange: (min: number, max: number) => `Port must be between ${min} and ${max}.`,
		unableResolveApiKeyForStart: 'Unable to resolve an API key for SuiteCloud proxy startup.',
	},
	friendlyErrors: {
		outputHint: '\n\nOpen Output for detailed startup logs.',
		sdkJarInvalid:
			'Unable to start proxy because the bundled CLI JAR is invalid or corrupted. Reinstall SDK dependencies, then try again.',
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
	openClineChatDisabledTitle: 'Start the local service to enable this.',
	applyClineIncompatibleTitle: 'Automatic Cline update is not supported on this machine. Copy values manually.',
	applyClineMissingApiKeyTitle: 'Generate or rotate API key first.',
	applyClineProxyUnavailableTitle: 'Start the local service to enable this.',
	applyClineReadyTitle: 'Apply current panel settings to Cline configuration.',
	changePortWhileRunningTitle: 'Stop the local service before changing the local port.',
	changeAuthIdWhileRunningTitle: 'Stop the local service before changing the Auth ID.',
	changeApiKeyWhileRunningTitle: 'Stop the local service before generating or rotating the API key.',
	invalidPortFormat: 'Enter a 4 or 5 digit port between 1024 and 65535.',
} as const;

export type SuiteCloudPanelClientStrings = typeof SUITECLOUD_PANEL_CLIENT_STRINGS;
