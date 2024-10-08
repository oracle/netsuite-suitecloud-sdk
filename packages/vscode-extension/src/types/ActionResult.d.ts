/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

export interface ActionResult<T> {
	status: string;
	resultMessage: string;
	errorMessages: string[];
	data: T;
	isSuccess: () => boolean;
	[key: string]: any;
}

export interface AuthenticateActionResult extends ActionResult<undefined> {
	mode: string;
	authId: string;
	accountInfo: {
		companyName: string;
		roleName: string;
	};
}

export type AuthListData = {
	[authID: string]: {
		accountInfo: {
			companyName: string;
			roleId: number;
			roleName: string;
			entityId: number;
			companyId: string;
		};
		token: {
			accessToken: string;
			expirationDate: string;
			refreshToken: string;
		};
		hostInfo: {
			hostName: string;
			clientId: string;
		};
		certificateInfo: {
			privateKeyPath: string;
			certificateId:string;
		}
	};
};

export type ValidationResult = { valid: false; message: string } | { valid: true };
