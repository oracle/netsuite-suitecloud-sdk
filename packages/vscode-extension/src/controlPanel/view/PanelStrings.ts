/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { DEVELOPER_ASSISTANT } from '../../ApplicationConstants';
import { CONTROL_PANEL } from '../../service/TranslationKeys';
import { VSTranslationService } from '../../service/VSTranslationService';

const translationService = new VSTranslationService();
const message = (key: string, ...params: Array<string | number>): string =>
	translationService.getMessage(key, ...params.map(String));

export const CONTROL_PANEL_TITLE = message(CONTROL_PANEL.TITLE);

export const SUITECLOUD_PANEL_CLIENT_STRINGS = {
	authIdPlaceholder: message(CONTROL_PANEL.CLIENT.AUTH_ID_PLACEHOLDER),
	defaultApiKeyActionLabel: message(CONTROL_PANEL.CLIENT.DEFAULT_API_KEY_ACTION_LABEL),
	notResolved: message(CONTROL_PANEL.CLIENT.NOT_RESOLVED),
	generateApiKeyTitle: message(CONTROL_PANEL.CLIENT.GENERATE_API_KEY_TITLE),
	rotateApiKeyTitle: message(CONTROL_PANEL.CLIENT.ROTATE_API_KEY_TITLE),
	openClineChatEnabledTitle: message(CONTROL_PANEL.CLIENT.OPEN_CLINE_ENABLED_TITLE),
	openClineChatDisabledTitle: message(CONTROL_PANEL.CLIENT.OPEN_CLINE_DISABLED_TITLE),
	syncClineIncompatibleTitle: message(CONTROL_PANEL.CLIENT.CLINE_INCOMPATIBLE_TITLE),
	syncClineMissingApiKeyTitle: message(CONTROL_PANEL.CLIENT.CLINE_MISSING_API_KEY_TITLE),
	syncClineProxyUnavailableTitle: message(
		CONTROL_PANEL.CLIENT.CLINE_PROXY_UNAVAILABLE_TITLE
	),
	syncClineReadyTitle: message(CONTROL_PANEL.CLIENT.CLINE_READY_TITLE),
	changePortWhileRunningTitle: message(
		CONTROL_PANEL.CLIENT.CHANGE_PORT_WHILE_RUNNING_TITLE
	),
	changeAuthIdWhileRunningTitle: message(
		CONTROL_PANEL.CLIENT.CHANGE_AUTH_ID_WHILE_RUNNING_TITLE
	),
	changeApiKeyWhileRunningTitle: message(
		CONTROL_PANEL.CLIENT.CHANGE_API_KEY_WHILE_RUNNING_TITLE
	),
	invalidPortFormat: message(
		CONTROL_PANEL.CLIENT.INVALID_PORT_FORMAT,
		DEVELOPER_ASSISTANT.PORT_RANGE.MIN,
		DEVELOPER_ASSISTANT.PORT_RANGE.MAX
	),
	statusStopped: message(CONTROL_PANEL.CLIENT.STATUS_STOPPED),
	statusStarting: message(CONTROL_PANEL.CLIENT.STATUS_STARTING),
	statusRunning: message(CONTROL_PANEL.CLIENT.STATUS_RUNNING),
	statusStopping: message(CONTROL_PANEL.CLIENT.STATUS_STOPPING),
	statusError: message(CONTROL_PANEL.CLIENT.STATUS_ERROR),
	apiKeyCopyCountdownTitle: message(CONTROL_PANEL.CLIENT.API_KEY_COPY_COUNTDOWN_TITLE),
	clineMarketplaceLabel: message(CONTROL_PANEL.CLIENT.CLINE_MARKETPLACE_LABEL),
	clineMarketplaceTitle: message(CONTROL_PANEL.CLIENT.CLINE_MARKETPLACE_TITLE),
	clineOpenLabel: message(CONTROL_PANEL.CLIENT.CLINE_OPEN_LABEL),
	clineConfigureLabel: message(CONTROL_PANEL.CLIENT.CLINE_CONFIGURE_LABEL),
	clineInstalled: message(CONTROL_PANEL.CLIENT.CLINE_INSTALLED),
	clineNotInstalled: message(CONTROL_PANEL.CLIENT.CLINE_NOT_INSTALLED),
	clineConfigured: message(CONTROL_PANEL.CLIENT.CLINE_CONFIGURED),
	clineNotConfigured: message(CONTROL_PANEL.CLIENT.CLINE_NOT_CONFIGURED),
	clineReady: message(CONTROL_PANEL.CLIENT.CLINE_READY),
	clineNotReady: message(CONTROL_PANEL.CLIENT.CLINE_NOT_READY),
	feedbackProxyRequired: message(CONTROL_PANEL.CLIENT.FEEDBACK_PROXY_REQUIRED),
	feedbackIncomplete: message(CONTROL_PANEL.CLIENT.FEEDBACK_INCOMPLETE),
	feedbackSend: message(CONTROL_PANEL.CLIENT.FEEDBACK_SEND),
	feedbackShare: message(CONTROL_PANEL.CLIENT.FEEDBACK_SHARE),
	providerConfigurationLabel: message(CONTROL_PANEL.CLIENT.PROVIDER_CONFIGURATION_LABEL),
	providerConfigurationShow: message(CONTROL_PANEL.CLIENT.PROVIDER_CONFIGURATION_SHOW),
	setupAuthId: message(CONTROL_PANEL.CLIENT.SETUP_AUTH_ID),
	sdkPreparing: message(CONTROL_PANEL.CLIENT.SDK_PREPARING),
	apiKeyGeneratedWithValue: message(CONTROL_PANEL.CLIENT.API_KEY_GENERATED_WITH_VALUE),
	apiKeyGenerated: message(CONTROL_PANEL.CLIENT.API_KEY_GENERATED),
	apiKeyNotGenerated: message(CONTROL_PANEL.CLIENT.API_KEY_NOT_GENERATED),
	providerApiKeyValueTemplate: message(CONTROL_PANEL.CLIENT.PROVIDER_API_KEY_VALUE),
	providerApiKeyMissing: message(CONTROL_PANEL.CLIENT.PROVIDER_API_KEY_MISSING),
	proxyStart: message(CONTROL_PANEL.CLIENT.PROXY_START),
	proxyStarting: message(CONTROL_PANEL.CLIENT.PROXY_STARTING),
	proxyStop: message(CONTROL_PANEL.CLIENT.PROXY_STOP),
	proxyStopping: message(CONTROL_PANEL.CLIENT.PROXY_STOPPING),
	proxyStartTitle: message(CONTROL_PANEL.CLIENT.PROXY_START_TITLE),
	proxyStopTitle: message(CONTROL_PANEL.CLIENT.PROXY_STOP_TITLE),
} as const;
