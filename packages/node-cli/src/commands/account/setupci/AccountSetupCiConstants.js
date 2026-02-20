/*
 ** Copyright (c) 2025 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
module.exports = {
	ACCOUNT_SETUP_CI: {
		COMMAND: {
			OPTIONS: {
				ACCOUNT: 'account',
				AUTHID: 'authid',
				CERTIFCATEID: 'certificateid',
				PRIVATEKEYPATH: 'privatekeypath',
				DOMAIN: 'domain',
				SELECT: 'select'
			},
			SDK_COMMAND: 'authenticateci',
			MANDATORY_PARAMS_FOR_SETUP_MODE: ['account', 'authid', 'certificateid', 'privatekeypath']
		},
	}
};
