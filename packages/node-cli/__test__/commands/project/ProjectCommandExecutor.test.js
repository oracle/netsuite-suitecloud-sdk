/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const {
	executeProjectCommand,
	PROJECT_COMMAND,
	SDK_OPERATION_STATUS,
} = require('@oracle/suitecloud-sdk-core/commands/project/ProjectCommandExecutor');

describe('ProjectCommandExecutor', () => {
	it('should return successful sdk-like payload when server response is successful', async () => {
		const deleteFile = jest.fn().mockResolvedValue(undefined);
		const result = await executeProjectCommand(
			{
				command: PROJECT_COMMAND.DEPLOY,
				projectFolder: '/tmp/project',
				hostName: 'system.netsuite.com',
				accessToken: 'token',
			},
			{
				createProjectArchive: async () => '/tmp/project.zip',
				deleteFile,
				sendProjectRequest: async () => ({
					statusCode: 200,
					body: JSON.stringify({
						status: 'SUCCESS',
						data: ['Deployed'],
						resultMessage: 'Deployment completed',
					}),
				}),
			}
		);

		expect(result).toEqual({
			status: SDK_OPERATION_STATUS.SUCCESS,
			data: ['Deployed'],
			resultMessage: 'Deployment completed',
		});
		expect(deleteFile).toHaveBeenCalledWith('/tmp/project.zip');
	});

	it('should normalize non-sdk successful payloads', async () => {
		const result = await executeProjectCommand(
			{
				command: PROJECT_COMMAND.PREVIEW,
				projectFolder: '/tmp/project',
				hostName: 'system.netsuite.com',
				accessToken: 'token',
			},
			{
				createProjectArchive: async () => '/tmp/project.zip',
				deleteFile: async () => undefined,
				sendProjectRequest: async () => ({
					statusCode: 200,
					body: JSON.stringify({ preview: true }),
				}),
			}
		);

		expect(result.status).toBe(SDK_OPERATION_STATUS.SUCCESS);
		expect(result.data).toEqual({ preview: true });
	});

	it('should return error status when request fails', async () => {
		const result = await executeProjectCommand(
			{
				command: PROJECT_COMMAND.VALIDATE,
				projectFolder: '/tmp/project',
				hostName: 'system.netsuite.com',
				accessToken: 'token',
			},
			{
				createProjectArchive: async () => '/tmp/project.zip',
				deleteFile: async () => undefined,
				sendProjectRequest: async () => {
					throw new Error('Network unavailable');
				},
			}
		);

		expect(result.status).toBe(SDK_OPERATION_STATUS.ERROR);
		expect(result.errorMessages).toEqual(['Network unavailable']);
	});

	it('should normalize API error payloads from project endpoint', async () => {
		const result = await executeProjectCommand(
			{
				command: PROJECT_COMMAND.DEPLOY,
				projectFolder: '/tmp/project',
				hostName: 'system.netsuite.com',
				accessToken: 'token',
			},
			{
				createProjectArchive: async () => '/tmp/project.zip',
				deleteFile: async () => undefined,
				sendProjectRequest: async () => ({
					statusCode: 404,
					body: JSON.stringify({
						title: 'Resource Not Found',
						status: 404,
						'o:errorPath': 'HTTP 404 Not Found',
					}),
				}),
			}
		);

		expect(result.status).toBe(SDK_OPERATION_STATUS.ERROR);
		expect(result.httpStatusCode).toBe(404);
		expect(result.errorMessages).toEqual(['HTTP 404 Not Found']);
	});

	it('should format successful SDF endpoint payload into CLI output lines', async () => {
		const result = await executeProjectCommand(
			{
				command: PROJECT_COMMAND.DEPLOY,
				projectFolder: '/tmp/project',
				hostName: 'system.netsuite.com',
				accessToken: 'token',
			},
			{
				createProjectArchive: async () => '/tmp/project.zip',
				deleteFile: async () => undefined,
				sendProjectRequest: async () => ({
					statusCode: 200,
					body: JSON.stringify({
						steps: [
							{ name: 'MANIFEST_VALIDATION', status: 'SUCCESSFUL' },
							{ name: 'DEPLOY', status: 'SUCCESSFUL' },
						],
						validationResults: [
							{
								type: 'WARNING',
								message: 'Warning message',
								validationDetails: { component: '~/Objects/customrecord.xml' },
							},
						],
					}),
				}),
			}
		);

		expect(result.status).toBe(SDK_OPERATION_STATUS.SUCCESS);
			expect(result.data).toEqual(expect.arrayContaining([
				'DEPLOY SUMMARY',
				'Status: SUCCESS',
				'Steps: 2/2 successful',
				'Validation Results: 0 error(s), 1 warning(s)',
				'SDF Errors: none',
				'------------------------------------------------------------',
				'✔ Step 1: MANIFEST_VALIDATION',
				'✔ Step 2: DEPLOY',
				'Issues by file:',
				'1. ~/Objects/customrecord.xml (0 error(s), 1 warning(s))',
				'  - WARNING: Warning message',
			]));
		});

	it('should mark SDF endpoint payload as failed when any step fails', async () => {
		const result = await executeProjectCommand(
			{
				command: PROJECT_COMMAND.VALIDATE,
				projectFolder: '/tmp/project',
				hostName: 'system.netsuite.com',
				accessToken: 'token',
			},
			{
				createProjectArchive: async () => '/tmp/project.zip',
				deleteFile: async () => undefined,
				sendProjectRequest: async () => ({
					statusCode: 200,
					body: JSON.stringify({
						steps: [
							{ name: 'MANIFEST_VALIDATION', status: 'SUCCESSFUL' },
							{ name: 'VALIDATE', status: 'FAILURE' },
						],
						validationResults: [],
					}),
				}),
			}
		);

		expect(result.status).toBe(SDK_OPERATION_STATUS.ERROR);
		expect(result.errorMessages).toEqual(expect.arrayContaining([
			'VALIDATE SUMMARY',
			'Status: FAILED',
			'✔ Step 1: MANIFEST_VALIDATION',
			'✖ Step 2: VALIDATE',
		]));
	});

	it('should return raw JSON payload when raw output mode is enabled', async () => {
		const payload = {
			steps: [{ name: 'DEPLOY', status: 'SUCCESSFUL' }],
			validationResults: [],
		};
		const result = await executeProjectCommand(
			{
				command: PROJECT_COMMAND.DEPLOY,
				projectFolder: '/tmp/project',
				hostName: 'system.netsuite.com',
				accessToken: 'token',
				rawOutput: true,
			},
			{
				createProjectArchive: async () => '/tmp/project.zip',
				deleteFile: async () => undefined,
				sendProjectRequest: async () => ({
					statusCode: 200,
					body: JSON.stringify(payload),
				}),
			}
		);

		expect(result.status).toBe(SDK_OPERATION_STATUS.SUCCESS);
		expect(result.data).toEqual({
			summary: {
				action: 'deploy',
				status: 'SUCCESS',
			},
			...payload,
		});
	});

	it('should return raw JSON error payload when raw output mode is enabled', async () => {
		const result = await executeProjectCommand(
			{
				command: PROJECT_COMMAND.DEPLOY,
				projectFolder: '/tmp/project',
				hostName: 'system.netsuite.com',
				accessToken: 'token',
				rawOutput: true,
			},
			{
				createProjectArchive: async () => '/tmp/project.zip',
				deleteFile: async () => undefined,
				sendProjectRequest: async () => ({
					statusCode: 400,
					body: JSON.stringify({
						title: 'Bad Request',
						status: 400,
					}),
				}),
			}
		);

		expect(result.status).toBe(SDK_OPERATION_STATUS.ERROR);
		expect(result.httpStatusCode).toBe(400);
		expect(result.errorMessages).toEqual([
			'{\n  "summary": {\n    "action": "deploy",\n    "status": "FAILED"\n  },\n  "title": "Bad Request",\n  "status": 400\n}',
		]);
	});

	it('should mark raw output as failed when any project step fails', async () => {
		const result = await executeProjectCommand(
			{
				command: PROJECT_COMMAND.DEPLOY,
				projectFolder: '/tmp/project',
				hostName: 'system.netsuite.com',
				accessToken: 'token',
				rawOutput: true,
			},
			{
				createProjectArchive: async () => '/tmp/project.zip',
				deleteFile: async () => undefined,
				sendProjectRequest: async () => ({
					statusCode: 200,
					body: JSON.stringify({
						steps: [
							{ name: 'DEPLOY', status: 'SUCCESSFUL' },
							{ name: 'CUSTOM_OBJECT_VALIDATION', status: 'FAILED' },
						],
						validationResults: [
							{ type: 'WARNING', message: 'A warning' },
						],
					}),
				}),
			}
		);

		expect(result.status).toBe(SDK_OPERATION_STATUS.ERROR);
		expect(result.httpStatusCode).toBe(200);
		expect(result.errorMessages).toEqual([
			'{\n  "summary": {\n    "action": "deploy",\n    "status": "FAILED"\n  },\n  "steps": [\n    {\n      "name": "DEPLOY",\n      "status": "SUCCESSFUL"\n    },\n    {\n      "name": "CUSTOM_OBJECT_VALIDATION",\n      "status": "FAILED"\n    }\n  ],\n  "validationResults": [\n    {\n      "type": "WARNING",\n      "message": "A warning"\n    }\n  ]\n}',
		]);
	});
});
