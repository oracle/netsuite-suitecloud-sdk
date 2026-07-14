/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import type { RequestOptions } from 'node:https';
import { basename } from 'node:path';
import type { ProjectCommandType } from '../../api/project/ProjectCommand';
import { requestSuiteCloudHttps } from '../../http/SuiteCloudHttpsClient';
export type ProjectHttpResponse = {
	statusCode: number;
	body: string;
	serverTimestamp?: string;
};

export type ProjectRequest = {
	command: ProjectCommandType;
	hostName: string;
	accessToken: string;
	projectArchivePath: string;
	params: Record<string, unknown>;
	flags: string[];
	timeoutMs: number;
};

export interface ProjectApiClient {
	send(request: ProjectRequest): Promise<ProjectHttpResponse>;
}

const PROJECT_API_PATH = '/api/internal/sdf/v1/projects';
const MULTIPART_EOL = '\r\n';
const PROJECT_ACTION_FIELD_NAME = 'action';
const PROJECT_FILE_FIELD_NAME = 'sdfProjectZip';
const QUERY_PARAM_APPLY_INSTALLATION_PREFERENCES = 'applyinstallprefs';
const QUERY_PARAM_ACCOUNT_SPECIFIC_VALUES = 'accountspecificvalues';
const BOOLEAN_TRUE_T = 'T';
const BOOLEAN_FALSE_F = 'F';
const ACCOUNT_SPECIFIC_VALUES_DEFAULT = 'ERROR';

export class DefaultProjectApiClient implements ProjectApiClient {
	async send(request: ProjectRequest): Promise<ProjectHttpResponse> {
		const multipartPayload = await buildMultipartPayload(request.command, request.projectArchivePath);
		return sendHttpsMultipartRequest({
			hostName: request.hostName,
			pathname: buildProjectRequestPath(request.params, request.flags),
			accessToken: request.accessToken,
			payload: multipartPayload.payload,
			boundary: multipartPayload.boundary,
			timeoutMs: request.timeoutMs,
		});
	}
}

const defaultProjectApiClient = new DefaultProjectApiClient();

export function sendDefaultProjectRequest(request: ProjectRequest): Promise<ProjectHttpResponse> {
	return defaultProjectApiClient.send(request);
}

function buildProjectRequestPath(params: Record<string, unknown>, flags: string[]): string {
	const queryParams = new URLSearchParams();
	queryParams.set(
		QUERY_PARAM_APPLY_INSTALLATION_PREFERENCES,
		resolveApplyInstallationPreferencesValue(params, flags) ? BOOLEAN_TRUE_T : BOOLEAN_FALSE_F
	);
	queryParams.set(QUERY_PARAM_ACCOUNT_SPECIFIC_VALUES, resolveAccountSpecificValuesValue(params));
	return `${PROJECT_API_PATH}?${queryParams.toString()}`;
}

function resolveApplyInstallationPreferencesValue(params: Record<string, unknown>, flags: string[]): boolean {
	return flags.includes(QUERY_PARAM_APPLY_INSTALLATION_PREFERENCES)
		? true
		: asBoolean(params[QUERY_PARAM_APPLY_INSTALLATION_PREFERENCES]);
}

function resolveAccountSpecificValuesValue(params: Record<string, unknown>): string {
	const value = params[QUERY_PARAM_ACCOUNT_SPECIFIC_VALUES];
	return typeof value === 'string' && value.trim() ? value : ACCOUNT_SPECIFIC_VALUES_DEFAULT;
}

function asBoolean(value: unknown): boolean {
	if (typeof value === 'boolean') {
		return value;
	}
	if (typeof value === 'string') {
		const normalizedValue = value.trim().toUpperCase();
		return normalizedValue === 'TRUE' || normalizedValue === BOOLEAN_TRUE_T;
	}
	return false;
}

async function buildMultipartPayload(
	command: ProjectCommandType,
	projectArchivePath: string
): Promise<{ payload: Buffer; boundary: string }> {
	const archiveBuffer = await readFile(projectArchivePath);
	const boundary = `suitecloudboundary${randomBytes(10).toString('hex')}`;
	const chunks: Buffer[] = [];
	appendFilePart(chunks, boundary, PROJECT_FILE_FIELD_NAME, basename(projectArchivePath), archiveBuffer);
	appendTextPart(chunks, boundary, PROJECT_ACTION_FIELD_NAME, command);
	chunks.push(Buffer.from(`--${boundary}--${MULTIPART_EOL}`));
	return { payload: Buffer.concat(chunks), boundary };
}

function appendTextPart(chunks: Buffer[], boundary: string, fieldName: string, value: string): void {
	chunks.push(Buffer.from(`--${boundary}${MULTIPART_EOL}`));
	chunks.push(Buffer.from(`Content-Disposition: form-data; name="${fieldName}"${MULTIPART_EOL}${MULTIPART_EOL}`));
	chunks.push(Buffer.from(`${value}${MULTIPART_EOL}`));
}

function appendFilePart(
	chunks: Buffer[],
	boundary: string,
	fieldName: string,
	filename: string,
	data: Buffer
): void {
	chunks.push(Buffer.from(`--${boundary}${MULTIPART_EOL}`));
	chunks.push(
		Buffer.from(
			`Content-Disposition: form-data; name="${fieldName}"; filename="${filename}"${MULTIPART_EOL}` +
				`Content-Type: application/zip${MULTIPART_EOL}${MULTIPART_EOL}`
		)
	);
	chunks.push(data);
	chunks.push(Buffer.from(MULTIPART_EOL));
}

function sendHttpsMultipartRequest(input: {
	hostName: string;
	pathname: string;
	accessToken: string;
	payload: Buffer;
	boundary: string;
	timeoutMs: number;
}): Promise<ProjectHttpResponse> {
	return new Promise((resolve, reject) => {
		const requestOptions: RequestOptions = {
			method: 'POST',
			hostname: input.hostName,
			port: 443,
			path: input.pathname,
			headers: {
				Authorization: `Bearer ${input.accessToken}`,
				'Content-Type': `multipart/form-data; boundary=${input.boundary}`,
				'Content-Length': input.payload.length,
				Accept: 'application/json',
			},
		};

		const clientRequest = requestSuiteCloudHttps(input.hostName, requestOptions, (response) => {
			const bodyChunks: Buffer[] = [];
			response.on('data', (chunk: Buffer | Uint8Array | string) => bodyChunks.push(Buffer.from(chunk)));
			response.on('end', () => {
				resolve({
					statusCode: response.statusCode || 500,
					body: Buffer.concat(bodyChunks).toString('utf8'),
					serverTimestamp: asHeaderString(response.headers.date),
				});
			});
		});

		clientRequest.on('error', reject);
		clientRequest.setTimeout(input.timeoutMs, () => {
			clientRequest.destroy(
				new Error('Project command request timed out.')
			);
		});
		clientRequest.write(input.payload);
		clientRequest.end();
	});
}

function asHeaderString(value: string | string[] | undefined): string | undefined {
	if (typeof value === 'string' && value.trim()) {
		return value.trim();
	}
	if (Array.isArray(value)) {
		return value.find((headerValue) => headerValue.trim())?.trim();
	}
	return undefined;
}
