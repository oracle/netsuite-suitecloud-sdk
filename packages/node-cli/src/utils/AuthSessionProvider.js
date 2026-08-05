/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { getAuthCredentialsById } = require('./AuthenticationUtils');

function createCredentialSessionProvider(sdkPath, executionEnvironmentContext) {
	const sessions = new Map();
	const refreshes = new Map();

	return {
		resolveAuthSession(authId) {
			const existingSession = sessions.get(authId);
			if (existingSession) {
				return existingSession;
			}

			const session = getAuthCredentialsById(authId, sdkPath).catch((error) => {
				if (sessions.get(authId) === session) {
					sessions.delete(authId);
				}
				throw error;
			});
			sessions.set(authId, session);
			return session;
		},

		async refreshAuthSession(authId, rejectedSession) {
			const currentSession = await sessions.get(authId);
			if (
				currentSession &&
				rejectedSession &&
				currentSession.accessToken !== rejectedSession.accessToken
			) {
				return currentSession;
			}

			const existingRefresh = refreshes.get(authId);
			if (existingRefresh) {
				return existingRefresh;
			}

			let refresh;
			refresh = getAuthCredentialsById(authId, sdkPath, executionEnvironmentContext)
				.then((refreshedSession) => {
					sessions.set(authId, Promise.resolve(refreshedSession));
					return refreshedSession;
				})
				.finally(() => {
					if (refreshes.get(authId) === refresh) {
						refreshes.delete(authId);
					}
				});
			refreshes.set(authId, refresh);
			return refresh;
		},
	};
}

module.exports = {
	createCredentialSessionProvider,
};
