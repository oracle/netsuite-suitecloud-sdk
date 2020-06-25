/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const ProxyActionResult = require('../../../services/actionresult/ProxyActionResult');
const BaseAction = require('../../base/BaseAction');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const {
	COMMAND_PROXY: { ARGS_VALIDATION },
} = require('../../../services/TranslationKeys');
const CLISettingsService = require('../../../services/settings/CLISettingsService');
const url = require('url');

const SET_OPTION = 'set';
const CLEAR_FLAG_OPTION = 'clear';

module.exports = class ProxyCommandGenerator extends BaseAction {
	constructor(options) {
		super(options);
		this._CLISettingsService = new CLISettingsService();
	}

	async execute(params) {
		try {
			const proxyUrlArgument = params[SET_OPTION];
			const shouldClearArgument = params[CLEAR_FLAG_OPTION];

			this._validateArguments(proxyUrlArgument, shouldClearArgument);
			const isSettingProxy = !!proxyUrlArgument;

			const proxyCommandAction = {
				isSettingProxy: isSettingProxy,
				proxyUrl: proxyUrlArgument,
			};
			if (isSettingProxy) {
				this._validateProxyUrl(proxyUrlArgument);
				const setProxyResult = this._setProxy(proxyUrlArgument);
				proxyCommandAction.isProxyOverridden = setProxyResult.isProxyOverridden;
			} else {
				this._CLISettingsService.clearProxy();
			}

			const proxyCommandData = await Promise.resolve(proxyCommandAction);
			return ProxyActionResult.Builder.success()
				.withProxySetOption(proxyCommandData.isSettingProxy)
				.withProxyUrl(proxyCommandData.proxyUrl)
				.withProxyOverridden(proxyCommandData.isProxyOverridden)
				.build();
		} catch (error) {
			return ProxyActionResult.Builder.withErrors([error]).build();
		}
	}

	_validateArguments(proxyUrlArgument, shouldClearArgument) {
		if (!proxyUrlArgument && !shouldClearArgument) {
			throw NodeTranslationService.getMessage(ARGS_VALIDATION.SET_CLEAR_NEITHER_SPECIFIED);
		}
		if (proxyUrlArgument && shouldClearArgument) {
			throw NodeTranslationService.getMessage(ARGS_VALIDATION.SET_CLEAR_BOTH_SPECIFIED);
		}
	}

	_validateProxyUrl(proxyUrlArgument) {
		const proxyUrl = url.parse(proxyUrlArgument);
		if (!proxyUrl.protocol || !proxyUrl.port || !proxyUrl.hostname) {
			throw NodeTranslationService.getMessage(ARGS_VALIDATION.PROXY_URL);
		}
	}

	_setProxy(proxyUrl) {
		const proxyUrlIsDifferent = this._CLISettingsService.getProxyUrl() !== proxyUrl;
		this._CLISettingsService.setProxyUrl(proxyUrl);
		return { isProxyOverridden: proxyUrlIsDifferent };
	}
};
