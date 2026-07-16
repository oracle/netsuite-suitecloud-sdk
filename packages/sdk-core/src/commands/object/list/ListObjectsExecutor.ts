/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

import {
	OBJECT_COMMAND_STATUS,
	type CustomObjectInfo,
	type ListObjectsExecutionInput,
	type ObjectCommandOperationResult,
} from '../../../api/object/ObjectCommand';
import {
	getHttpErrorMessage,
	sendFormRequest,
	validateObjectCommandAuth,
} from '../ObjectCommandClient';
import { parseCustomObjectListXml, parseIdePayload } from '../ObjectCommandXml';

const IDE_ENDPOINT_PATH = '/app/ide/ide.nl';
const ACTION_FETCH_CUSTOM_OBJECT_LIST = 'FetchCustomObjectList';
const IDE_ACTION_KEY = 'action';
const IDE_PARAM_PACKAGE_ROOT = 'package_root';
const IDE_PARAM_OBJECT_TYPE = 'object_type';
const IDE_PARAM_SCRIPT_ID_CONTAINS = 'scriptid_contains';
const SDF_ACTION_LIST_OBJECTS = 'listobjects';
const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000;

export async function executeListObjects(
	input: ListObjectsExecutionInput
): Promise<ObjectCommandOperationResult<CustomObjectInfo[]>> {
	try {
		validateObjectCommandAuth(input);

		const requestParams: Record<string, string | string[]> = {
			[IDE_ACTION_KEY]: ACTION_FETCH_CUSTOM_OBJECT_LIST,
		};

		if (input.appId?.trim()) {
			requestParams[IDE_PARAM_PACKAGE_ROOT] = input.appId.trim().toLowerCase();
		}
		if (input.scriptIdContains?.trim()) {
			requestParams[IDE_PARAM_SCRIPT_ID_CONTAINS] = input.scriptIdContains.trim().toLowerCase();
		}
		if (input.objectTypes?.length) {
			requestParams[IDE_PARAM_OBJECT_TYPE] = input.objectTypes
				.filter((type) => typeof type === 'string' && type.trim())
				.map((type) => type.trim().toLowerCase());
		}

		const response = await sendFormRequest({
			hostName: input.hostName,
			accessToken: input.accessToken,
			path: IDE_ENDPOINT_PATH,
			actionName: SDF_ACTION_LIST_OBJECTS,
			params: requestParams,
			userAgent: input.userAgent,
			timeoutMs: input.timeoutMs ?? DEFAULT_TIMEOUT_MS,
		});

		if (response.statusCode < 200 || response.statusCode >= 300) {
			return errorResult(getHttpErrorMessage(response), response.statusCode);
		}

		const idePayload = await parseIdePayload(response.body.toString('utf8'));
		if (idePayload.errorMessage) {
			return errorResult(idePayload.errorMessage, response.statusCode);
		}

		return {
			status: OBJECT_COMMAND_STATUS.SUCCESS,
			data: idePayload.resultText ? await parseCustomObjectListXml(idePayload.resultText) : [],
		};
	} catch (error: unknown) {
		return errorResult(toErrorMessage(error), getStatusCode(error));
	}
}

function errorResult(
	message: string,
	httpStatusCode?: number
): ObjectCommandOperationResult<CustomObjectInfo[]> {
	return {
		status: OBJECT_COMMAND_STATUS.ERROR,
		httpStatusCode,
		errorMessages: [message],
	};
}

function toErrorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

function getStatusCode(error: unknown): number | undefined {
	return isRecord(error) && typeof error.statusCode === 'number' ? error.statusCode : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}
