/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import https from 'node:https';
import crypto from 'node:crypto';
import path from 'node:path';
import os from 'node:os';
import fsPromises from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import { ProjectCommandType } from './ProjectCommandTypes';

const execFileAsync = promisify(execFile);

const PROJECT_API_PATH = '/api/internal/sdf/v1/projects';
const MULTIPART_EOL = '\r\n';
const PROJECT_ACTION_FIELD_NAME = 'action';
const PROJECT_FILE_FIELD_NAME = 'sdfProjectZip';
const QUERY_PARAM_APPLY_INSTALLATION_PREFERENCES = 'applyinstallprefs';
const QUERY_PARAM_ACCOUNT_SPECIFIC_VALUES = 'accountspecificvalues';
const BOOLEAN_TRUE_T = 'T';
const BOOLEAN_FALSE_F = 'F';
const ACCOUNT_SPECIFIC_VALUES_DEFAULT = 'ERROR';
const PROJECT_ARCHIVE_PREFIX = 'suitecloud-project';
const ZIP_BINARY_NAME = 'zip';
const ZIP_EXCLUDES = ['.git/*', 'node_modules/*', '.DS_Store', 'build/*'];

export type HttpResponse = {
	statusCode: number;
	body: string;
	serverTimestamp?: string;
};

export async function createDefaultProjectArchive(projectFolder: string): Promise<string> {
	const fileName = `${PROJECT_ARCHIVE_PREFIX}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.zip`;
	const projectArchivePath = path.join(os.tmpdir(), fileName);
	const zipCommandArgs = ['-r', '-q', projectArchivePath, '.', '-x', ...ZIP_EXCLUDES];

	try {
		await execFileAsync(ZIP_BINARY_NAME, zipCommandArgs, { cwd: projectFolder });
		return projectArchivePath;
	} catch (error: any) {
		throw new Error(
			`Unable to archive project folder "${projectFolder}". Verify "${ZIP_BINARY_NAME}" is installed and available in PATH.`
		);
	}
}

export async function sendDefaultProjectRequest(requestInput: {
	command: ProjectCommandType;
	hostName: string;
	accessToken: string;
	projectArchivePath: string;
	params: Record<string, unknown>;
	flags: string[];
	timeoutMs: number;
}): Promise<HttpResponse> {
	const multipartPayload = await buildMultipartPayload(requestInput.command, requestInput.projectArchivePath);
	const requestPath = buildProjectRequestPath(requestInput.params, requestInput.flags);
	return sendHttpsMultipartRequest({
		hostName: requestInput.hostName,
		pathname: requestPath,
		accessToken: requestInput.accessToken,
		payload: multipartPayload,
		boundary: multipartPayload.boundary,
		timeoutMs: requestInput.timeoutMs,
	});
}

export async function deleteFileQuietly(filepath: string): Promise<void> {
	try {
		await fsPromises.unlink(filepath);
	} catch (error) {
		// File cleanup errors are non-fatal.
	}
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
	if (flags.includes(QUERY_PARAM_APPLY_INSTALLATION_PREFERENCES)) {
		return true;
	}
	return asBoolean(params[QUERY_PARAM_APPLY_INSTALLATION_PREFERENCES]);
}

function resolveAccountSpecificValuesValue(params: Record<string, unknown>): string {
	const accountSpecificValues = params[QUERY_PARAM_ACCOUNT_SPECIFIC_VALUES];
	if (typeof accountSpecificValues === 'string' && accountSpecificValues.trim()) {
		return accountSpecificValues;
	}
	return ACCOUNT_SPECIFIC_VALUES_DEFAULT;
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

async function buildMultipartPayload(command: ProjectCommandType, projectArchivePath: string): Promise<{ payload: Buffer; boundary: string }> {
	const archiveBuffer = await fsPromises.readFile(projectArchivePath);
	const boundary = `suitecloudboundary${crypto.randomBytes(10).toString('hex')}`;
	const chunks: Buffer[] = [];

	appendFilePart(chunks, boundary, PROJECT_FILE_FIELD_NAME, path.basename(projectArchivePath), archiveBuffer);
	appendTextPart(chunks, boundary, PROJECT_ACTION_FIELD_NAME, command);
	chunks.push(Buffer.from(`--${boundary}--${MULTIPART_EOL}`));

	return { payload: Buffer.concat(chunks), boundary };
}

function appendTextPart(chunks: Buffer[], boundary: string, fieldName: string, value: string): void {
	chunks.push(Buffer.from(`--${boundary}${MULTIPART_EOL}`));
	chunks.push(Buffer.from(`Content-Disposition: form-data; name="${fieldName}"${MULTIPART_EOL}${MULTIPART_EOL}`));
	chunks.push(Buffer.from(`${value}${MULTIPART_EOL}`));
}

function appendFilePart(chunks: Buffer[], boundary: string, fieldName: string, filename: string, data: Buffer): void {
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

async function sendHttpsMultipartRequest(input: {
	hostName: string;
	pathname: string;
	accessToken: string;
	payload: { payload: Buffer; boundary: string };
	boundary: string;
	timeoutMs: number;
}): Promise<HttpResponse> {
	return new Promise((resolve, reject) => {
		const requestOptions: any = {
			method: 'POST',
			hostname: input.hostName,
			port: 443,
			path: input.pathname,
			headers: {
				Authorization: `Bearer ${input.accessToken}`,
				'Content-Type': `multipart/form-data; boundary=${input.boundary}`,
				'Content-Length': input.payload.payload.length,
				Accept: 'application/json',
			},
		};

		if (input.hostName.includes('vm.eng')) {
			requestOptions.agent = new https.Agent({ rejectUnauthorized: false });
		}

		const request = https.request(requestOptions, (response) => {
			const bodyChunks: Buffer[] = [];
			response.on('data', (chunk) => bodyChunks.push(Buffer.from(chunk)));
			response.on('end', () => {
				resolve({
					statusCode: response.statusCode || 500,
					body: Buffer.concat(bodyChunks).toString('utf8'),
					serverTimestamp: asHeaderString(response.headers?.date),
				});
			});
		});

		request.on('error', (error) => reject(error));
		request.setTimeout(input.timeoutMs, () => {
			request.destroy(new Error('Project command request timed out.'));
		});

		request.write(input.payload.payload);
		request.end();
	});
}

function asHeaderString(value: unknown): string | undefined {
	if (typeof value === 'string' && value.trim()) {
		return value.trim();
	}
	if (Array.isArray(value)) {
		const first = value.find((headerValue) => typeof headerValue === 'string' && headerValue.trim());
		return typeof first === 'string' ? first.trim() : undefined;
	}
	return undefined;
}
