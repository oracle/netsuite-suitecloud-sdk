/*
** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const crypto = require('crypto');

class APIKeyGenerator {

	/**
	 * Generates a secure random API key.
	 * @param {number} length Number of random bytes (default 32 = 64 hex chars).
	 * @returns {string} Hex-encoded API key.
	 */
	generateApiKey(length = 32) {
		return crypto.randomBytes(length).toString('hex');
	}

}

module.exports = new APIKeyGenerator();
