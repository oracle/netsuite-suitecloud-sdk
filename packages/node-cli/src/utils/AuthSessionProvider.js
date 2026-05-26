/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { getAuthCredentialsById } = require('./AuthenticationUtils');

function createCredentialSessionProvider(sdkPath, executionEnvironmentContext) {
	return {
		resolveAuthSession: async (authId) => getAuthCredentialsById(authId, sdkPath),
		refreshAuthSession: async (authId) => getAuthCredentialsById(authId, sdkPath, executionEnvironmentContext),
	};
}

module.exports = {
	createCredentialSessionProvider,
};
