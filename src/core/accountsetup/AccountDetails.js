/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

module.exports = class AccountDetails {
	constructor(options) {
		this._netsuiteUrl = options.netsuiteUrl;
		this._accountId = options.accountId;
		this._accountName = options.accountName;
		this._email = options.email;
		this._roleId = options.roleId;
		this._roleName = options.roleName;
		this._password = options.password;
		this._isAccountSetup = true;
		this._isDevelopment = options.isDevelopment;
	}

	static fromJson(json) {
		return new AccountDetails({
			netsuiteUrl: json.netsuiteUrl,
			accountId: json.accountId,
			accountName: json.accountName,
			email: json.email,
			roleId: json.roleId,
			roleName: json.roleName,
			password: json.password,
			isDevelopment: json.isDevelopment,
		});
	}

	toJSONWithoutPassword() {
		return {
			netsuiteUrl: this._netsuiteUrl,
			accountId: this._accountId,
			accountName: this._accountName,
			email: this._email,
			roleId: this._roleId,
			roleName: this._roleName,
			isDevelopment: this._isDevelopment,
		};
	}

	get email() {
		return this._email;
	}

	get password() {
		return this._password;
	}

	get roleId() {
		return this._roleId;
	}

	get roleName() {
		return this._roleName;
	}

	get accountId() {
		return this._accountId;
	}

	get accountName() {
		return this._accountName;
	}

	get netSuiteUrl() {
		return this._netsuiteUrl;
	}

	get isAccountSetup() {
		return this._isAccountSetup;
	}

	get isDevelopment() {
		return this._isDevelopment;
	}
};
