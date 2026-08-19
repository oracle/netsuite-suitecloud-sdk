/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import type { IncomingHttpHeaders } from 'node:http';
import type { RequestOptions } from 'node:https';
import { requestSuiteCloudHttps } from '../../http/SuiteCloudHttpsClient';
import { getSuiteCloudRequestTelemetry } from './SuiteCloudRequestTelemetry';

export type SuiteCloudHttpResponse = {
	statusCode: number;
	body: Buffer;
	headers: IncomingHttpHeaders;
};

export type SuiteCloudRequest = {
	hostName: string;
	accessToken: string;
	method: 'GET' | 'POST';
	path: string;
	headers?: Record<string, string>;
	body?: Buffer;
	timeoutMs: number;
	timeoutMessage: string;
};

/** Shared authenticated transport for SuiteCloud command services. */
export function sendSuiteCloudRequest(input: SuiteCloudRequest): Promise<SuiteCloudHttpResponse> {
	return new Promise((resolve, reject) => {
		const telemetry = getSuiteCloudRequestTelemetry();
		const headers: Record<string, string> = {
			Authorization: `Bearer ${input.accessToken}`,
			...(telemetry?.userAgent ? { 'User-Agent': telemetry.userAgent } : {}),
			...input.headers,
		};
		if (input.body && !headers['Content-Length']) {
			headers['Content-Length'] = String(input.body.length);
		}

		const requestOptions: RequestOptions = {
			method: input.method,
			hostname: input.hostName,
			port: 443,
			path: input.path,
			headers,
		};

		const request = requestSuiteCloudHttps(input.hostName, requestOptions, (response) => {
			const chunks: Buffer[] = [];
			response.on('data', (chunk: Buffer | Uint8Array | string) => chunks.push(Buffer.from(chunk)));
			response.on('end', () => {
				resolve({
					statusCode: response.statusCode || 500,
					body: Buffer.concat(chunks),
					headers: response.headers,
				});
			});
		});

		request.on('error', reject);
		request.setTimeout(input.timeoutMs, () => request.destroy(new Error(input.timeoutMessage)));
		if (input.body) {
			request.write(input.body);
		}
		request.end();
	});
}
