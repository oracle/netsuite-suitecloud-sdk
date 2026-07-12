/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const sdkCore = require('@oracle/suitecloud-sdk-core');
const publicApi = require('@oracle/suitecloud-sdk-core/public');

describe('sdk-core public API', () => {
	it('keeps legacy command status constants compatible with the shared contract', () => {
		expect(sdkCore.commands.FILE_COMMAND_STATUS).toEqual(publicApi.SDK_OPERATION_STATUS);
		expect(sdkCore.commands.OBJECT_COMMAND_STATUS).toEqual(publicApi.SDK_OPERATION_STATUS);
		expect(sdkCore.commands.SDK_OPERATION_STATUS).toBe(publicApi.SDK_OPERATION_STATUS);
		expect(sdkCore.publicApi.SDK_OPERATION_STATUS).toBe(publicApi.SDK_OPERATION_STATUS);
	});

	it('supports explicit dependency replacement through the composition root', async () => {
		const archiveService = {
			create: jest.fn().mockResolvedValue('/tmp/project.zip'),
			remove: jest.fn().mockResolvedValue(undefined),
		};
		const apiClient = {
			send: jest.fn().mockResolvedValue({
				statusCode: 200,
				body: JSON.stringify({
					status: 'SUCCESS',
					data: ['Deployed'],
					resultMessage: 'Deployment completed',
				}),
			}),
		};
		const core = publicApi.createSdkCore({ project: { archiveService, apiClient } });

		const result = await core.project.execute({
			command: publicApi.PROJECT_COMMAND.DEPLOY,
			projectFolder: '/tmp/project',
			hostName: 'system.netsuite.com',
			accessToken: 'token',
		});

		expect(result).toEqual({
			status: publicApi.SDK_OPERATION_STATUS.SUCCESS,
			data: ['Deployed'],
			resultMessage: 'Deployment completed',
		});
		expect(archiveService.create).toHaveBeenCalledWith('/tmp/project');
		expect(apiClient.send).toHaveBeenCalledTimes(1);
		expect(archiveService.remove).toHaveBeenCalledWith('/tmp/project.zip');
	});
});
