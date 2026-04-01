/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { ActionResult } = require('../../../services/actionresult/ActionResult');
const BaseAction = require('../../base/BaseAction');
const { generateApiKey } = require('../../../utils/APIKeyGenerator');

const PROXY_KEY = 'PROXY_KEY';


module.exports = class ProxyGenerateKeyAction extends BaseAction {
	constructor(options) {
		super(options);
	}

	async execute() {
		try {
			const apiKey = generateApiKey();
			const proxyKeyJson = JSON.stringify({ [PROXY_KEY]: apiKey });
			//TODO read apiKey and check whether PROXY_KEY exists or not, if it does not add
			//if it does replace by PROXY_KEY
			return ActionResult.Builder.withData({ apiKey: proxyKeyJson }).build();
		} catch (error) {
			return ActionResult.Builder.withErrors([error]).build();
		}
	}
};
