/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

import { sendSuiteCloudRequest } from '../http/SuiteCloudRequestService';
import { OBJECT } from '../translation/TranslationKeys';
import { translationService } from '../translation/TranslationService';

export type ObjectCommandHttpResponse = {
	statusCode: number;
	body: Buffer;
	contentType?: string;
};

type FormRequestInput = {
	hostName: string;
	accessToken: string;
	path: string;
	actionName: string;
	params: Record<string, string | string[]>;
	userAgent?: string;
	timeoutMs: number;
};

const HEADER_SDF_ACTION = 'Sdf-Action';
const HEADER_USER_AGENT = 'User-Agent';
const HEADER_ACCEPT = 'Accept';
const HEADER_CONTENT_TYPE = 'Content-Type';
const CONTENT_TYPE_FORM_URLENCODED = 'application/x-www-form-urlencoded';
const CONTENT_TYPE_TEXT_XML = 'text/xml';
const CONTENT_TYPE_JSON = 'application/json';
const CONTENT_TYPE_OCTET_STREAM = 'application/octet-stream';

export async function sendFormRequest(input: FormRequestInput): Promise<ObjectCommandHttpResponse> {
	const urlSearchParams = new URLSearchParams();
	for (const [key, value] of Object.entries(input.params)) {
		if (Array.isArray(value)) {
			for (const arrayValue of value) {
				if (arrayValue !== undefined && arrayValue !== null && String(arrayValue).trim()) {
					urlSearchParams.append(key, String(arrayValue));
				}
			}
			continue;
		}
		if (value !== undefined && value !== null) {
			urlSearchParams.append(key, String(value));
		}
	}

	const response = await sendSuiteCloudRequest({
		hostName: input.hostName,
		accessToken: input.accessToken,
		method: 'POST',
		path: input.path,
		headers: {
			[HEADER_ACCEPT]: `${CONTENT_TYPE_JSON}, ${CONTENT_TYPE_OCTET_STREAM}, ${CONTENT_TYPE_TEXT_XML}`,
			[HEADER_CONTENT_TYPE]: CONTENT_TYPE_FORM_URLENCODED,
			[HEADER_SDF_ACTION]: input.actionName,
			...(input.userAgent ? { [HEADER_USER_AGENT]: input.userAgent } : {}),
		},
		body: Buffer.from(urlSearchParams.toString(), 'utf8'),
		timeoutMs: input.timeoutMs,
		timeoutMessage: translationService.getMessage(OBJECT.ERROR.REQUEST_TIMED_OUT),
	});

	return {
		statusCode: response.statusCode,
		body: response.body,
		contentType: response.headers['content-type'],
	};
}

export function isIdeLikeResponse(response: ObjectCommandHttpResponse, responseText: string): boolean {
	if (response.contentType?.toLowerCase().startsWith(CONTENT_TYPE_TEXT_XML)) {
		return true;
	}
	const trimmedResponse = responseText.trim();
	return trimmedResponse.startsWith('<ide') || trimmedResponse.startsWith('<?xml') || trimmedResponse.startsWith('<Status');
}

export function getHttpErrorMessage(response: ObjectCommandHttpResponse): string {
	const responseText = response.body.toString('utf8').trim();
	return responseText || translationService.getMessage(OBJECT.ERROR.HTTP_STATUS, response.statusCode);
}
