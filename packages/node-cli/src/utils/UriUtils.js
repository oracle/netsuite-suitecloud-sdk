/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const {
	SUITECLOUD_PROXY_SERVICE: {
		REGEX_SYSTEM_URL,
		REGEX_ACCOUNT_SPECIFIC_URL,
		REGEX_SUITETALK_API_PRODUCTION_URL,
	}
} = require('../ApplicationConstants');

function isProductionDomain(url) {
	return (
		REGEX_SYSTEM_URL.test(url) ||
		REGEX_ACCOUNT_SPECIFIC_URL.test(url) ||
		REGEX_SUITETALK_API_PRODUCTION_URL.test(url)
	);
}

module.exports = { isProductionDomain };