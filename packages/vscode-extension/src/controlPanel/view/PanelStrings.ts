/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { DEVELOPER_ASSISTANT } from '../../ApplicationConstants';

export const CONTROL_PANEL_TITLE = 'SuiteCloud Developer Assistant';

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
		`Enter a 4 or 5 digit port between ${DEVELOPER_ASSISTANT.PORT_RANGE.MIN} and ${DEVELOPER_ASSISTANT.PORT_RANGE.MAX}.`,
} as const;
