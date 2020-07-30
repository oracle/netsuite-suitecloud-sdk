/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
import assert from 'assert';
import { ActionResult, ActionResultBuilder, STATUS } from './ActionResult';

export class ProxyActionResult extends ActionResult<undefined> {

	isSettingProxy: boolean;
	proxyUrl: string;
	isProxyOverridden: boolean;

	constructor(builder: ProxyActionResultBuilder) {
		super(builder);
		this.isSettingProxy = builder.isSettingProxy;
		this.proxyUrl = builder.proxyUrl;
		this.isProxyOverridden = builder.isProxyOverridden;
	}

	static get Builder() {
		return new ProxyActionResultBuilder();
	}
}

export class ProxyActionResultBuilder extends ActionResultBuilder<undefined> {

	isSettingProxy!: boolean;
	proxyUrl!: string;
	isProxyOverridden!: boolean;

	constructor() {
		super();
	}

	success() {
		this.status = STATUS.SUCCESS;
		return this;
	}

	withProxySetOption(isSettingProxy: boolean) {
		this.isSettingProxy = isSettingProxy;
		return this;
	}

	withProxyUrl(proxyUrl: string) {
		this.proxyUrl = proxyUrl;
		return this;
	}

	withProxyOverridden(isProxyOverridden: boolean) {
		this.isProxyOverridden = isProxyOverridden;
		return this;
	}

	validate() {
		assert(this.status, 'status is required when creating an ActionResult object.');
		if (this.status === STATUS.SUCCESS) {
			if (this.isSettingProxy) {
				assert(this.proxyUrl, 'proxyUrl is required when ActionResult is a success.');
			}
		} else {
			assert(this.errorMessages, 'errorMessages is required when ActionResult is an error.');
			assert(Array.isArray(this.errorMessages), 'errorMessages argument must be an array');
		}
	}

	build() {
		this.validate();
		return new ProxyActionResult(this);
	}
}
