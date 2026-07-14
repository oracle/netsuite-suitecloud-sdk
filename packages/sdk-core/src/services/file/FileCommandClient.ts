/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

import type { FileCommandAuthInput } from '../../api/file/FileCommand';
import { sendSuiteCloudRequest } from '../http/SuiteCloudRequestService';
import { FILE } from '../translation/TranslationKeys';
import { translationService } from '../translation/TranslationService';

export type FileCommandHttpResponse = {
	statusCode: number;
	body: Buffer;
};

type FileCommandRequest = {
	hostName: string;
	accessToken: string;
	method: 'POST' | 'GET';
	path: string;
	headers: Record<string, string>;
	body?: Buffer;
	timeoutMs: number;
};

const IDE_ENDPOINT_PATH = '/app/ide/ide.nl';
const HEADER_SDF_ACTION = 'Sdf-Action';
const HEADER_USER_AGENT = 'User-Agent';
const HEADER_ACCEPT = 'Accept';
const HEADER_CONTENT_TYPE = 'Content-Type';
const CONTENT_TYPE_FORM_URLENCODED = 'application/x-www-form-urlencoded';
const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000;

export async function sendIdeRequest(
	input: FileCommandAuthInput,
	sdfAction: string,
	ideAction: string,
	params: Record<string, string>
): Promise<FileCommandHttpResponse> {
	const requestParams = new URLSearchParams();
	requestParams.set('action', ideAction);
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined && value !== null && value !== '') {
			requestParams.set(key, value);
		}
	}

	return sendFileCommandRequest({
		hostName: input.hostName,
		accessToken: input.accessToken,
		method: 'POST',
		path: IDE_ENDPOINT_PATH,
		headers: {
			[HEADER_CONTENT_TYPE]: CONTENT_TYPE_FORM_URLENCODED,
			[HEADER_ACCEPT]: 'text/xml',
			[HEADER_SDF_ACTION]: sdfAction,
			...(input.userAgent ? { [HEADER_USER_AGENT]: input.userAgent } : {}),
		},
		body: Buffer.from(requestParams.toString(), 'utf8'),
		timeoutMs: input.timeoutMs ?? DEFAULT_TIMEOUT_MS,
	});
}

export function sendFileCommandRequest(options: FileCommandRequest): Promise<FileCommandHttpResponse> {
	return sendSuiteCloudRequest({
		...options,
		timeoutMessage: translationService.getMessage(FILE.ERROR.REQUEST_TIMED_OUT),
	});
}

export function getHttpErrorMessage(response: FileCommandHttpResponse): string {
	const rawText = response.body.toString('utf8').trim();
	if (!rawText) {
		return translationService.getMessage(FILE.ERROR.REQUEST_FAILED_WITH_STATUS_CODE, response.statusCode);
	}

	try {
		const parsedBody = JSON.parse(rawText);
		if (isRecord(parsedBody)) {
			const message = asString(parsedBody.message) || asString(parsedBody.detail) || asString(parsedBody.title);
			if (message) {
				return message;
			}
			const nestedErrorMessage = isRecord(parsedBody.error) ? asString(parsedBody.error.message) : undefined;
			if (nestedErrorMessage) {
				return nestedErrorMessage;
			}
		}
	} catch {
		// Non-JSON responses are handled below.
	}

	if (looksLikeIdeResponse(rawText)) {
		return translationService.getMessage(FILE.ERROR.UNKNOWN_SERVER_RESPONSE);
	}
	return rawText;
}

export function looksLikeIdeResponse(responseText: string): boolean {
	const normalizedText = responseText.trim();
	return normalizedText.startsWith('<ide>') || normalizedText.startsWith('<?xml');
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function asString(value: unknown): string {
	if (typeof value === 'string') {
		return value;
	}
	if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
		return value[0];
	}
	return '';
}
