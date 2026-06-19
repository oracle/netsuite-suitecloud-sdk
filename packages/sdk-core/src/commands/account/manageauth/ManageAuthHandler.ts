/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

// Java source of truth:
// - cli/.../handler/ManageAuthHandler.java (option validation and operation selection)
export const COMMAND_OPTIONS = {
	INFO: 'info',
	LIST: 'list',
	REMOVE: 'remove',
	RENAME: 'rename',
	RENAMETO: 'renameto',
} as const;

export const MANAGE_AUTH_ACTION = {
	LIST: 'list',
	INFO: 'info',
	RENAME: 'rename',
	REMOVE: 'remove',
} as const;

export const MANAGE_AUTH_VALIDATION_ERROR = {
	NO_OPTION: 'NO_OPTION',
	ONLY_ONE_OPTION_ALLOWED: 'ONLY_ONE_OPTION_ALLOWED',
	MISSING_OPTION: 'MISSING_OPTION',
} as const;

export type ManageAuthParams = {
	info?: string;
	list?: boolean;
	remove?: string;
	rename?: string;
	renameto?: string;
	[key: string]: unknown;
};

export type ManageAuthValidationError = {
	errorCode: typeof MANAGE_AUTH_VALIDATION_ERROR[keyof typeof MANAGE_AUTH_VALIDATION_ERROR];
	missingOption?: typeof COMMAND_OPTIONS[keyof typeof COMMAND_OPTIONS];
};

export type ManageAuthSelectionResult = {
	action?: typeof MANAGE_AUTH_ACTION[keyof typeof MANAGE_AUTH_ACTION];
	authId?: string;
	newAuthId?: string;
	validationError?: ManageAuthValidationError;
};

export type ManageAuthInfoPayload = {
	accountInfo?: unknown;
	hostInfo?: {
		hostName?: string;
	};
	[key: string]: unknown;
};

export type ManageAuthInfoResult = {
	authId?: string;
	accountInfo?: unknown;
	domain?: string;
};

export type ManageAuthListItem = {
	accountInfo?: unknown;
	hostInfo?: {
		hostName?: string;
	};
};

export type ManageAuthListResult = Record<string, ManageAuthListItem>;

export function validateManageAuthOptions(params: ManageAuthParams): ManageAuthValidationError | null {
	const hasList = Boolean(params[COMMAND_OPTIONS.LIST]);
	const hasInfo = Boolean(params[COMMAND_OPTIONS.INFO]);
	const hasRemove = Boolean(params[COMMAND_OPTIONS.REMOVE]);
	const hasRename = Boolean(params[COMMAND_OPTIONS.RENAME]);
	const hasRenameTo = Boolean(params[COMMAND_OPTIONS.RENAMETO]);

	const selectedOptionsCount = [hasList, hasInfo, hasRemove, hasRename || hasRenameTo].filter(Boolean).length;
	if (selectedOptionsCount > 1) {
		return { errorCode: MANAGE_AUTH_VALIDATION_ERROR.ONLY_ONE_OPTION_ALLOWED };
	}
	if (hasRename && !hasRenameTo) {
		return { errorCode: MANAGE_AUTH_VALIDATION_ERROR.MISSING_OPTION, missingOption: COMMAND_OPTIONS.RENAMETO };
	}
	if (!hasRename && hasRenameTo) {
		return { errorCode: MANAGE_AUTH_VALIDATION_ERROR.MISSING_OPTION, missingOption: COMMAND_OPTIONS.RENAME };
	}
	if (selectedOptionsCount === 0) {
		return { errorCode: MANAGE_AUTH_VALIDATION_ERROR.NO_OPTION };
	}

	return null;
}

export function selectManageAuthAction(params: ManageAuthParams): ManageAuthSelectionResult {
	const validationError = validateManageAuthOptions(params);
	if (validationError) {
		return { validationError };
	}

	if (params[COMMAND_OPTIONS.LIST]) {
		return { action: MANAGE_AUTH_ACTION.LIST };
	}
	if (params[COMMAND_OPTIONS.INFO]) {
		return { action: MANAGE_AUTH_ACTION.INFO, authId: String(params[COMMAND_OPTIONS.INFO]) };
	}
	if (params[COMMAND_OPTIONS.RENAME] && params[COMMAND_OPTIONS.RENAMETO]) {
		return {
			action: MANAGE_AUTH_ACTION.RENAME,
			authId: String(params[COMMAND_OPTIONS.RENAME]),
			newAuthId: String(params[COMMAND_OPTIONS.RENAMETO]),
		};
	}
	if (params[COMMAND_OPTIONS.REMOVE]) {
		return { action: MANAGE_AUTH_ACTION.REMOVE, authId: String(params[COMMAND_OPTIONS.REMOVE]) };
	}

	return { validationError: { errorCode: MANAGE_AUTH_VALIDATION_ERROR.NO_OPTION } };
}

export function prepareManageAuthInfoData(
	selectedOptions: ManageAuthSelectionResult,
	data: ManageAuthInfoPayload
): ManageAuthInfoPayload | ManageAuthInfoResult {
	if (!selectedOptions || selectedOptions.action !== MANAGE_AUTH_ACTION.INFO) {
		return data;
	}

	return {
		authId: selectedOptions.authId,
		accountInfo: data.accountInfo,
		...(data?.hostInfo?.hostName && { domain: data.hostInfo.hostName }),
	};
}

export function sanitizeManageAuthListData(data: unknown): ManageAuthListResult {
	if (!data || typeof data !== 'object') {
		return {};
	}

	return Object.entries(data as Record<string, ManageAuthInfoPayload>).reduce<ManageAuthListResult>(
		(sanitized, [authId, authData]) => {
			sanitized[authId] = {
				...(authData?.accountInfo && { accountInfo: authData.accountInfo }),
				...(authData?.hostInfo && { hostInfo: authData.hostInfo }),
			};
			return sanitized;
		},
		{}
	);
}

export function prepareManageAuthActionData(
	selectedOptions: ManageAuthSelectionResult,
	data: ManageAuthInfoPayload
): ManageAuthInfoPayload | ManageAuthInfoResult | ManageAuthListResult {
	if (!selectedOptions) {
		return data;
	}

	if (selectedOptions.action === MANAGE_AUTH_ACTION.INFO) {
		return prepareManageAuthInfoData(selectedOptions, data);
	}
	if (selectedOptions.action === MANAGE_AUTH_ACTION.LIST) {
		return sanitizeManageAuthListData(data);
	}

	return data;
}
