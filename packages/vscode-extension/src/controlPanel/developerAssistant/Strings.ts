/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { CONTROL_PANEL } from '../../service/TranslationKeys';
import { VSTranslationService } from '../../service/VSTranslationService';

const translationService = new VSTranslationService();
const message = (key: string, ...params: Array<string | number>): string =>
	translationService.getMessage(key, ...params.map(String));

export const SUITECLOUD_PANEL_RUNTIME_STRINGS = {
	notificationTitle: message(CONTROL_PANEL.TITLE),
	modelId: 'NetSuite',
	logPrefix: '[SuiteCloud Proxy]',
	apiKey: {
		hiddenHint: message(CONTROL_PANEL.API_KEY.HIDDEN_HINT),
		notFoundLabel: message(CONTROL_PANEL.API_KEY.NOT_FOUND_LABEL),
		notFoundInfo: message(CONTROL_PANEL.API_KEY.NOT_FOUND_INFO),
		hiddenExistingLabel: message(CONTROL_PANEL.API_KEY.HIDDEN_EXISTING_LABEL),
		generateLabel: message(CONTROL_PANEL.API_KEY.GENERATE_LABEL),
		rotateLabel: message(CONTROL_PANEL.API_KEY.ROTATE_LABEL),
	},
	cline: {
		notInstalled: message(CONTROL_PANEL.CLINE.NOT_INSTALLED),
		workspaceManual: message(CONTROL_PANEL.CLINE.WORKSPACE_MANUAL),
		workspaceCopyInstructions: message(CONTROL_PANEL.CLINE.WORKSPACE_COPY_INSTRUCTIONS),
		automaticUpdateUnsupported: message(CONTROL_PANEL.CLINE.AUTOMATIC_UPDATE_UNSUPPORTED),
		automaticUpdateSupported: message(CONTROL_PANEL.CLINE.AUTOMATIC_UPDATE_SUPPORTED),
		generateApiKey: message(CONTROL_PANEL.CLINE.GENERATE_API_KEY),
		configMismatch: message(CONTROL_PANEL.CLINE.CONFIG_MISMATCH),
		storageDirectoryMissing: message(CONTROL_PANEL.CLINE.STORAGE_DIRECTORY_MISSING),
		apiKeyMissingForComparison: message(
			CONTROL_PANEL.CLINE.API_KEY_MISSING_FOR_COMPARISON
		),
		providersSettingsNotComparable: message(
			CONTROL_PANEL.CLINE.PROVIDERS_SETTINGS_NOT_COMPARABLE
		),
		providersSettingsIncomplete: message(
			CONTROL_PANEL.CLINE.PROVIDERS_SETTINGS_INCOMPLETE
		),
		legacySettingsNotComparable: message(
			CONTROL_PANEL.CLINE.LEGACY_SETTINGS_NOT_COMPARABLE
		),
		legacySettingsIncomplete: message(
			CONTROL_PANEL.CLINE.LEGACY_SETTINGS_INCOMPLETE
		),
		providersFormatUnavailable: message(CONTROL_PANEL.CLINE.PROVIDERS_FORMAT_UNAVAILABLE),
		providersFormatDetected: message(CONTROL_PANEL.CLINE.PROVIDERS_FORMAT_DETECTED),
		providersFileUnavailable: message(CONTROL_PANEL.CLINE.PROVIDERS_FILE_UNAVAILABLE),
		providersGlobalUpdated: message(CONTROL_PANEL.CLINE.PROVIDERS_GLOBAL_UPDATED),
		providersWorkspaceUpdated: message(CONTROL_PANEL.CLINE.PROVIDERS_WORKSPACE_UPDATED),
		stateFileMissing: message(CONTROL_PANEL.CLINE.STATE_FILE_MISSING),
		secretsFileMissing: message(CONTROL_PANEL.CLINE.SECRETS_FILE_MISSING),
		storageFormatUnrecognized: message(CONTROL_PANEL.CLINE.STORAGE_FORMAT_UNRECOGNIZED),
		storageCompatible: message(CONTROL_PANEL.CLINE.STORAGE_COMPATIBLE),
		settingsUpdated: message(CONTROL_PANEL.CLINE.SETTINGS_UPDATED),
	},
	presentation: {
		outputChannelName: message(CONTROL_PANEL.PRESENTATION.OUTPUT_CHANNEL_NAME),
		openOutputAction: message(CONTROL_PANEL.PRESENTATION.OPEN_OUTPUT_ACTION),
		proxyStartingStatus: message(CONTROL_PANEL.PRESENTATION.PROXY_STARTING_STATUS),
		providerSettingsIntro: message(CONTROL_PANEL.PRESENTATION.PROVIDER_SETTINGS_INTRO),
		providerSettingsProvider: message(
			CONTROL_PANEL.PRESENTATION.PROVIDER_SETTINGS_PROVIDER
		),
		providerSettingsBaseUrl: (baseUrl: string) =>
			message(CONTROL_PANEL.PRESENTATION.PROVIDER_SETTINGS_BASE_URL, baseUrl),
		providerSettingsApiKey: message(
			CONTROL_PANEL.PRESENTATION.PROVIDER_SETTINGS_API_KEY
		),
		providerSettingsModelId: (modelId: string) =>
			message(CONTROL_PANEL.PRESENTATION.PROVIDER_SETTINGS_MODEL_ID, modelId),
	},
	actions: {
		proxyRunning: message(CONTROL_PANEL.ACTIONS.PROXY_RUNNING),
		proxyStopped: message(CONTROL_PANEL.ACTIONS.PROXY_STOPPED),
		proxyAlreadyStopped: message(CONTROL_PANEL.ACTIONS.PROXY_ALREADY_STOPPED),
		apiKeyGenerated: message(CONTROL_PANEL.ACTIONS.API_KEY_GENERATED),
		apiKeyRotated: message(CONTROL_PANEL.ACTIONS.API_KEY_ROTATED),
		copyValue: (label: string) => message(CONTROL_PANEL.ACTIONS.COPY_VALUE, label),
		startProxyBeforeClineChat: message(CONTROL_PANEL.ACTIONS.START_PROXY_BEFORE_CLINE_CHAT),
		startProxyBeforeClineApply: message(CONTROL_PANEL.ACTIONS.START_PROXY_BEFORE_CLINE_APPLY),
		openedClineChat: message(CONTROL_PANEL.ACTIONS.OPENED_CLINE_CHAT),
		openClineChatFailed: message(CONTROL_PANEL.ACTIONS.OPEN_CLINE_CHAT_FAILED),
		invalidWebviewPayload: message(CONTROL_PANEL.ACTIONS.INVALID_WEBVIEW_PAYLOAD),
		noApiKeyForClineApply: message(CONTROL_PANEL.ACTIONS.NO_API_KEY_FOR_CLINE_APPLY),
		noClineConfigChangesDetected: message(CONTROL_PANEL.ACTIONS.NO_CLINE_CONFIG_CHANGES),
		clineRestartRequired: message(CONTROL_PANEL.ACTIONS.CLINE_RESTART_REQUIRED),
		clineConfigSaved: message(CONTROL_PANEL.ACTIONS.CLINE_CONFIG_SAVED),
		workspaceClineSetupIsManual: message(CONTROL_PANEL.ACTIONS.WORKSPACE_CLINE_SETUP_MANUAL),
		welcomeNotificationDisabled: message(CONTROL_PANEL.ACTIONS.WELCOME_NOTIFICATION_DISABLED),
		portChangeRequiresStoppedProxy: message(
			CONTROL_PANEL.ACTIONS.PORT_CHANGE_REQUIRES_STOPPED_PROXY
		),
		authIdChangeRequiresStoppedProxy: message(
			CONTROL_PANEL.ACTIONS.AUTH_ID_CHANGE_REQUIRES_STOPPED_PROXY
		),
		apiKeyChangeRequiresStoppedProxy: message(
			CONTROL_PANEL.ACTIONS.API_KEY_CHANGE_REQUIRES_STOPPED_PROXY
		),
		reauthorizationRequired: (authId: string) =>
			message(CONTROL_PANEL.ACTIONS.REAUTHORIZATION_REQUIRED, authId),
	},
	dialogs: {
		rotateExistingPrompt: message(CONTROL_PANEL.DIALOGS.ROTATE_EXISTING_PROMPT),
		rotateMissingPrompt: message(CONTROL_PANEL.DIALOGS.ROTATE_MISSING_PROMPT),
		rotateExistingAction: message(CONTROL_PANEL.DIALOGS.ROTATE_EXISTING_ACTION),
		rotateMissingAction: message(CONTROL_PANEL.DIALOGS.ROTATE_MISSING_ACTION),
		clineExtensionRestartRequiredPrompt: message(CONTROL_PANEL.DIALOGS.CLINE_RESTART_PROMPT),
		restartExtensionsAction: message(CONTROL_PANEL.DIALOGS.RESTART_EXTENSIONS_ACTION),
		welcomeMessage: message(CONTROL_PANEL.DIALOGS.WELCOME_MESSAGE),
		welcomeOpenPanelAction: message(CONTROL_PANEL.DIALOGS.WELCOME_OPEN_PANEL_ACTION),
		welcomeRemindAction: message(CONTROL_PANEL.DIALOGS.WELCOME_REMIND_ACTION),
		welcomeDisableAction: message(CONTROL_PANEL.DIALOGS.WELCOME_DISABLE_ACTION),
		startProxyDisclaimer: message(CONTROL_PANEL.DIALOGS.START_PROXY_DISCLAIMER),
		startProxyDisclaimerAction: message(CONTROL_PANEL.DIALOGS.START_PROXY_DISCLAIMER_ACTION),
	},
	errors: {
		invalidAuthId: message(CONTROL_PANEL.ERRORS.INVALID_AUTH_ID),
		invalidPortRange: (min: number, max: number) =>
			message(CONTROL_PANEL.ERRORS.INVALID_PORT_RANGE, min, max),
		missingApiKey: message(CONTROL_PANEL.ERRORS.MISSING_API_KEY),
		unableResolveApiKeyForStart: message(CONTROL_PANEL.ERRORS.MISSING_API_KEY_FOR_START),
		apiKeyCopyExpired: message(CONTROL_PANEL.ERRORS.API_KEY_COPY_EXPIRED),
		apiKeyReadFailed: message(CONTROL_PANEL.ERRORS.API_KEY_READ_FAILED),
		apiKeyGenerateFailed: message(CONTROL_PANEL.ERRORS.API_KEY_GENERATE_FAILED),
		apiKeyEmpty: message(CONTROL_PANEL.ERRORS.API_KEY_EMPTY),
		proxyStoppedUnexpectedly: message(CONTROL_PANEL.ERRORS.PROXY_STOPPED_UNEXPECTEDLY),
		proxyAlreadyRunning: message(CONTROL_PANEL.ERRORS.PROXY_ALREADY_RUNNING),
		proxyPortInUse: (port: number) => message(CONTROL_PANEL.ERRORS.PROXY_PORT_IN_USE, port),
		proxyStartCancelled: message(CONTROL_PANEL.ERRORS.PROXY_START_CANCELLED),
		proxyStartFailed: (details: string) => message(CONTROL_PANEL.ERRORS.PROXY_START_FAILED, details),
		proxyStartTimeout: message(CONTROL_PANEL.ERRORS.PROXY_START_TIMEOUT),
		proxyEventStartFailed: message(CONTROL_PANEL.ERRORS.PROXY_EVENT_START_FAILED),
		proxyEventError: message(CONTROL_PANEL.ERRORS.PROXY_EVENT_ERROR),
		proxyAuthorizationRefreshRequired: message(CONTROL_PANEL.ERRORS.PROXY_AUTH_REFRESH_REQUIRED),
		proxyAuthorizationRefreshFailed: (details: string) =>
			message(CONTROL_PANEL.ERRORS.PROXY_AUTH_REFRESH_FAILED, details),
		proxyUnavailableInCli: (version: string) =>
			message(CONTROL_PANEL.ERRORS.PROXY_UNAVAILABLE_IN_CLI, version),
		proxyAutoStartFailed: (details: string) =>
			message(CONTROL_PANEL.ERRORS.PROXY_AUTO_START_FAILED, details),
		feedbackProxyRequired: message(CONTROL_PANEL.ERRORS.FEEDBACK_PROXY_REQUIRED),
		feedbackRequired: message(CONTROL_PANEL.ERRORS.FEEDBACK_REQUIRED),
		feedbackMaxLength: (maxLength: number) =>
			message(CONTROL_PANEL.ERRORS.FEEDBACK_MAX_LENGTH, maxLength),
		feedbackInvalidRating: message(CONTROL_PANEL.ERRORS.FEEDBACK_INVALID_RATING),
		feedbackTopicRequired: message(CONTROL_PANEL.ERRORS.FEEDBACK_TOPIC_REQUIRED),
		feedbackInvalidTopic: message(CONTROL_PANEL.ERRORS.FEEDBACK_INVALID_TOPIC),
		feedbackTimeout: message(CONTROL_PANEL.ERRORS.FEEDBACK_TIMEOUT),
		feedbackSubmitFailedWithBody: (status: number, body: string) =>
			message(CONTROL_PANEL.ERRORS.FEEDBACK_SUBMIT_FAILED_WITH_BODY, status, body),
		feedbackSubmitFailed: (status: number, statusText: string) =>
			message(CONTROL_PANEL.ERRORS.FEEDBACK_SUBMIT_FAILED, status, statusText),
		authIdsListFailed: message(CONTROL_PANEL.ERRORS.AUTH_IDS_LIST_FAILED),
		authCheckFailed: (authId: string) =>
			message(CONTROL_PANEL.ERRORS.AUTH_CHECK_FAILED, authId),
		authRefreshFailed: (authId: string) =>
			message(CONTROL_PANEL.ERRORS.AUTH_REFRESH_FAILED, authId),
		preferencesSaveFailed: (details: string) =>
			message(CONTROL_PANEL.ERRORS.PREFERENCES_SAVE_FAILED, details),
		commandQueueFailed: (details: string) =>
			message(CONTROL_PANEL.ERRORS.COMMAND_QUEUE_FAILED, details),
		stateRefreshFailed: (details: string) =>
			message(CONTROL_PANEL.ERRORS.STATE_REFRESH_FAILED, details),
		notificationFailed: (details: string) =>
			message(CONTROL_PANEL.ERRORS.NOTIFICATION_FAILED, details),
		clineApiKeyUnavailable: message(CONTROL_PANEL.ERRORS.CLINE_API_KEY_UNAVAILABLE),
		clinePendingApplyFailed: (details: string) =>
			message(CONTROL_PANEL.ERRORS.CLINE_PENDING_APPLY_FAILED, details),
		clineProxyRecoveryFailed: (details: string) =>
			message(CONTROL_PANEL.ERRORS.CLINE_PROXY_RECOVERY_FAILED, details),
		clineExtensionRestartFailed: (restartError: string, recoveryError?: string) =>
			recoveryError
				? message(
					CONTROL_PANEL.ERRORS.CLINE_EXTENSION_RESTART_AND_RECOVERY_FAILED,
					restartError,
					recoveryError
				)
				: message(CONTROL_PANEL.ERRORS.CLINE_EXTENSION_RESTART_FAILED, restartError),
		clineConfigNotJsonObject: (filePath: string) =>
			message(CONTROL_PANEL.ERRORS.CLINE_CONFIG_NOT_JSON_OBJECT, filePath),
		clineConfigChanged: (fileName: string) =>
			message(CONTROL_PANEL.ERRORS.CLINE_CONFIG_CHANGED, fileName),
		clineProvidersApplyFailed: (details: string) =>
			message(CONTROL_PANEL.ERRORS.CLINE_PROVIDERS_APPLY_FAILED, details),
		clineLegacyApplyFailed: (details: string) =>
			message(CONTROL_PANEL.ERRORS.CLINE_LEGACY_APPLY_FAILED, details),
		operationFailed: message(CONTROL_PANEL.ERRORS.OPERATION_FAILED),
	},
	friendlyErrors: {
		outputHint: message(CONTROL_PANEL.FRIENDLY_ERRORS.OUTPUT_HINT),
		sdkJarInvalid: message(CONTROL_PANEL.FRIENDLY_ERRORS.SDK_JAR_INVALID),
		proxyStartMissing: (version: string) =>
			message(CONTROL_PANEL.FRIENDLY_ERRORS.PROXY_START_MISSING, version),
		apiKeyStorage: (errorMessage: string) =>
			message(CONTROL_PANEL.FRIENDLY_ERRORS.API_KEY_STORAGE, errorMessage),
		portConflict: (errorMessage: string) =>
			message(CONTROL_PANEL.FRIENDLY_ERRORS.PORT_CONFLICT, errorMessage),
		authIssue: (errorMessage: string) =>
			message(CONTROL_PANEL.FRIENDLY_ERRORS.AUTH_ISSUE, errorMessage),
		timeout: (errorMessage: string) =>
			message(CONTROL_PANEL.FRIENDLY_ERRORS.TIMEOUT, errorMessage),
		accountConnectionTimeout: (errorMessage: string) =>
			message(CONTROL_PANEL.FRIENDLY_ERRORS.ACCOUNT_CONNECTION_TIMEOUT, errorMessage),
	},
	messages: {
		proxyAuthorizationRefreshed: (authId: string) =>
			message(CONTROL_PANEL.MESSAGES.PROXY_AUTH_REFRESHED, authId),
		proxyListening: (port: number) =>
			message(CONTROL_PANEL.MESSAGES.PROXY_LISTENING, port),
		proxyStarting: (port: number, authId: string) =>
			message(CONTROL_PANEL.MESSAGES.PROXY_STARTING, port, authId),
		proxyStopping: message(CONTROL_PANEL.MESSAGES.PROXY_STOPPING),
		clinePendingConfigApplied: message(
			CONTROL_PANEL.MESSAGES.CLINE_PENDING_CONFIG_APPLIED
		),
		feedbackSubmitted: message(CONTROL_PANEL.MESSAGES.FEEDBACK_SUBMITTED),
	},
} as const;
