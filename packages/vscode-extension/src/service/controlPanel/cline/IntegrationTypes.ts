/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { ClineScope } from '../../../controlPanel/Types';

export type CompatibilityDetails = {
	providerKey: string;
	baseUrlKey: string;
	modelKey: string;
	secretKey: string;
};

export type ClineCompatibilityResult = {
	compatible: boolean;
	message: string;
	details?: CompatibilityDetails;
};

export type ApplyClineConfigInput = {
	scope: ClineScope;
	workspacePath: string;
	apiKey: string;
	baseUrl: string;
	modelId: string;
};

export type ApplyClineConfigResult = {
	applied: boolean;
	message: string;
};

export type ClineConfigSyncResult = {
	comparable: boolean;
	inSync: boolean;
	message: string;
};

export type JsonObject = { [key: string]: any };
