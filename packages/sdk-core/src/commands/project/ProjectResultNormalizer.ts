/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import { evaluateSdfProjectPayload, formatSdfProjectResultOutput } from './ProjectResultFormatter';
import {
	OperationResult,
	ProjectCommandSummaryContext,
	ProjectCommandType,
	SDK_OPERATION_STATUS,
} from './ProjectCommandTypes';

const RAW_OUTPUT_INDENT = 2;

export function normalizeProjectOperationResult(
	statusCode: number,
	rawBody: string,
	command: ProjectCommandType,
	rawOutput: boolean,
	summaryContext?: ProjectCommandSummaryContext,
	serverTimestamp?: string
): OperationResult {
	const parsedBody = parseJsonBody(rawBody);
	if (rawOutput) {
		return normalizeRawOutputResult(statusCode, rawBody, parsedBody, command);
	}
	if (statusCode >= 200 && statusCode < 300) {
		return normalizeSuccessResult(parsedBody, rawBody, command, summaryContext, serverTimestamp);
	}
	return normalizeErrorResult(parsedBody, statusCode, rawBody);
}

function normalizeRawOutputResult(statusCode: number, rawBody: string, parsedBody: unknown, command: ProjectCommandType): OperationResult {
	const rawPayload = parsedBody !== undefined ? parsedBody : rawBody;
	const summary = buildRawOutputSummary(command, statusCode, rawPayload);
	const payloadWithSummary = appendRawOutputSummary(rawPayload, summary);
	if (summary.status === 'SUCCESS') {
		return { status: SDK_OPERATION_STATUS.SUCCESS, data: payloadWithSummary };
	}
	return {
		status: SDK_OPERATION_STATUS.ERROR,
		httpStatusCode: statusCode,
		errorMessages: [toJsonOutput(payloadWithSummary)],
	};
}

function normalizeSuccessResult(
	parsedBody: any,
	rawBody: string,
	command: ProjectCommandType,
	summaryContext?: ProjectCommandSummaryContext,
	serverTimestamp?: string
): OperationResult {
	if (isSdkOperationLike(parsedBody)) {
		if (parsedBody.status === SDK_OPERATION_STATUS.SUCCESS) {
			return {
				status: SDK_OPERATION_STATUS.SUCCESS,
				data: parsedBody.data !== undefined ? parsedBody.data : [],
				resultMessage: typeof parsedBody.resultMessage === 'string' ? parsedBody.resultMessage : '',
			};
		}
		return normalizeErrorResult(parsedBody, 500, rawBody);
	}

	if (isSdfProjectResultPayload(parsedBody)) {
		const formattedOutput = formatSdfProjectResultOutput(command, parsedBody, {
			summaryContext,
			serverTimestamp,
		});
		if (formattedOutput.hasFailures) {
			return { status: SDK_OPERATION_STATUS.ERROR, errorMessages: formattedOutput.lines };
		}
		return { status: SDK_OPERATION_STATUS.SUCCESS, data: formattedOutput.lines };
	}

	return {
		status: SDK_OPERATION_STATUS.SUCCESS,
		data: parsedBody !== undefined && parsedBody !== null ? parsedBody : [],
	};
}

function normalizeErrorResult(parsedBody: any, statusCode: number, rawBody: string): OperationResult {
	if (isRecord(parsedBody)) {
		if (Array.isArray(parsedBody.errorMessages)) {
			return {
				status: SDK_OPERATION_STATUS.ERROR,
				errorCode: asStringOrUndefined(parsedBody.errorCode) || asStringOrUndefined(parsedBody['o:errorCode']),
				httpStatusCode: statusCode,
				errorMessages: parsedBody.errorMessages.map((message: unknown) => String(message)),
			};
		}
		const message = extractErrorMessageFromParsedBody(parsedBody);
		if (message && message.trim()) {
			return {
				status: SDK_OPERATION_STATUS.ERROR,
				errorCode: asStringOrUndefined(parsedBody.errorCode) || asStringOrUndefined(parsedBody['o:errorCode']),
				httpStatusCode: statusCode,
				errorMessages: [message],
			};
		}
	}

	const fallbackMessage = rawBody.trim() ? rawBody : `Project command request failed with status code ${statusCode}.`;
	return {
		status: SDK_OPERATION_STATUS.ERROR,
		httpStatusCode: statusCode,
		errorMessages: [fallbackMessage],
	};
}

function parseJsonBody(body: string): unknown {
	if (!body || !body.trim()) {
		return undefined;
	}
	try {
		return JSON.parse(body);
	} catch (error) {
		return undefined;
	}
}

function buildRawOutputSummary(command: ProjectCommandType, statusCode: number, payload: unknown): { action: string; status: string } {
	let hasFailures = statusCode < 200 || statusCode >= 300;
	if (!hasFailures && isSdkOperationLike(payload)) {
		hasFailures = payload.status === SDK_OPERATION_STATUS.ERROR;
	}
	if (!hasFailures && isSdfProjectResultPayload(payload)) {
		hasFailures = evaluateSdfProjectPayload(payload).hasFailures;
	}
	return { action: command, status: hasFailures ? 'FAILED' : 'SUCCESS' };
}

function appendRawOutputSummary(payload: unknown, summary: { action: string; status: string }): Record<string, unknown> {
	if (isRecord(payload) && !Array.isArray(payload)) {
		return { summary, ...payload };
	}
	return { summary, data: payload };
}

function isSdkOperationLike(value: unknown): value is { status: string; data?: unknown; resultMessage?: string } {
	return isRecord(value) && (value.status === SDK_OPERATION_STATUS.SUCCESS || value.status === SDK_OPERATION_STATUS.ERROR);
}

function isSdfProjectResultPayload(value: unknown): value is Record<string, unknown> {
	return isRecord(value) && (Array.isArray(value.steps) || Array.isArray(value.validationResults) || value.errorMessage !== undefined);
}

function extractErrorMessageFromParsedBody(parsedBody: Record<string, unknown>): string | undefined {
	const messageCandidates = [
		asStringOrUndefined(parsedBody.message),
		asStringOrUndefined(parsedBody['o:errorPath']),
		asStringOrUndefined(parsedBody.errorMessage),
		asStringOrUndefined(parsedBody.detail),
		asStringOrUndefined(parsedBody.title),
	];
	return messageCandidates.find((candidate) => candidate && candidate.trim());
}

function asStringOrUndefined(value: unknown): string | undefined {
	return typeof value === 'string' ? value : undefined;
}

function toJsonOutput(value: unknown): string {
	if (typeof value === 'string') {
		return value;
	}
	return JSON.stringify(value, null, RAW_OUTPUT_INDENT);
}

function isRecord(value: unknown): value is Record<string, any> {
	return typeof value === 'object' && value !== null;
}
