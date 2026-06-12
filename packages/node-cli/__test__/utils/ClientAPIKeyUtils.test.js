/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

jest.mock('../../src/ui/CliSpinner', () => ({
	executeWithSpinner: jest.fn().mockImplementation(({ action }) => action),
}));

const { writeClientAPIKeyFileContents } = require('../../src/utils/ClientAPIKeyUtils');

describe('ClientAPIKeyUtils', () => {
	describe('writeClientAPIKeyFileContents()', () => {
		it('should pass raw JSON content to the SDK write command', async () => {
			const rawContent = '{"schemaVersion":1,"defaultKey":"proxyKey","keys":{"proxyKey":{"creationDate":"2026-04-13T12:46:52.577Z","value":"c3a0e7594461071caed3087c25849d3ccc028e1b37a3439a610e639938c3b94a"}}}';
			const sdkExecutor = {
				execute: jest.fn().mockResolvedValue({
					status: 'SUCCESS',
					errorMessages: [],
				}),
			};

			await writeClientAPIKeyFileContents(sdkExecutor, rawContent);

			const executionContext = sdkExecutor.execute.mock.calls[0][0];
			expect(executionContext.getCommand()).toBe('writeclientapikeycontent');
			expect(executionContext.isIntegrationMode()).toBe(true);
			expect(executionContext.getParams()).toEqual({
				'-content': rawContent,
			});
		});
	});
});
