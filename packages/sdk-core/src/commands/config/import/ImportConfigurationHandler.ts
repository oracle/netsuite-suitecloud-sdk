/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

import type {
	ConfigurationCommandOperationResult,
	ImportConfigurationExecutionInput,
} from '../../../api/config/ConfigurationCommand';
import { executeImportConfiguration } from './ImportConfigurationExecutor';

export function executeImportConfigurationCommand(
	input: ImportConfigurationExecutionInput
): Promise<ConfigurationCommandOperationResult> {
	return executeImportConfiguration(input);
}
