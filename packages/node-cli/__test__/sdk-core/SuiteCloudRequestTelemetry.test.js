/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { http } = require('@oracle/suitecloud-sdk-core');

describe('SuiteCloud request telemetry', () => {
	it('keeps the telemetry context through asynchronous command work', async () => {
		const telemetry = { userAgent: 'VSCode/1.99 Linux SuiteCloudSDK/2026.1.0 Java/17.0.6;amd64' };

		await http.runWithSuiteCloudRequestTelemetry(telemetry, async () => {
			await Promise.resolve();
			expect(http.getSuiteCloudRequestTelemetry()).toEqual(telemetry);
		});

		expect(http.getSuiteCloudRequestTelemetry()).toBeUndefined();
	});
});
