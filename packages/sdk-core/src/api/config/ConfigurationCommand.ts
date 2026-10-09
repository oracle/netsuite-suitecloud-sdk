/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

import { SDK_OPERATION_STATUS, type OperationResult } from '../OperationResult';

export const CONFIGURATION_COMMAND_STATUS = SDK_OPERATION_STATUS;

export type ImportConfigurationExecutionInput = {
	hostName: string;
	accessToken: string;
	projectFolder: string;
	userAgent?: string;
	timeoutMs?: number;
};

export type ConfigurationImportResultItem = {
	id: string;
	type: string;
	message?: string;
};

export type ImportConfigurationResult = {
	successfulImports: ConfigurationImportResultItem[];
	failedImports: ConfigurationImportResultItem[];
};

export type ConfigurationCommandOperationResult = OperationResult<ImportConfigurationResult>;
