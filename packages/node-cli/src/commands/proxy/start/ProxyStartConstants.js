/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const PROXY_START = {
	COMMAND: {
		OPTIONS: {
			AUTH_ID: 'authid',
			PORT: 'port',
		},
	},
	PORT_RANGE: {
		MIN: 1024,
		MAX: 65535,
	},
	DEFAULT_PORT: 8181,
	ALLOWED_PROXY_PATH_PREFIX: '/api/internal/devassist/',
};

module.exports = {
	PROXY_START,
};