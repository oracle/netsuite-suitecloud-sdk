/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import { AsyncLocalStorage } from 'node:async_hooks';

type SuiteCloudRequestTelemetry = {
	userAgent?: string;
};

const telemetryStorage = new AsyncLocalStorage<SuiteCloudRequestTelemetry>();

/**
 * Associates telemetry with every asynchronous SuiteCloud request performed
 * while the supplied operation is running.
 */
export function runWithSuiteCloudRequestTelemetry<T>(
	telemetry: SuiteCloudRequestTelemetry,
	operation: () => T
): T {
	return telemetryStorage.run(telemetry, operation);
}

export function getSuiteCloudRequestTelemetry(): SuiteCloudRequestTelemetry | undefined {
	return telemetryStorage.getStore();
}
