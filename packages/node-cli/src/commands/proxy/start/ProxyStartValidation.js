/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const NodeTranslationService = require('../../../services/NodeTranslationService');
const { COMMAND_PROXY_START } = require('../../../services/TranslationKeys');
const {
	PROXY_START: {
		PORT_RANGE,
	},
} = require('./ProxyStartConstants');

function isValidProxyStartPort(value) {
	const port = Number(value);
	return !Number.isNaN(port) && port >= PORT_RANGE.MIN && port <= PORT_RANGE.MAX;
}

function getInvalidProxyStartPortMessage() {
	return NodeTranslationService.getMessage(COMMAND_PROXY_START.ERRORS.PORT_MUST_BE_NUMBER, PORT_RANGE.MIN, PORT_RANGE.MAX);
}

module.exports = {
	isValidProxyStartPort,
	getInvalidProxyStartPortMessage,
};