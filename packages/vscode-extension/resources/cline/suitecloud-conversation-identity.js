/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

export default {
	name: 'suitecloud-conversation-identity',
	manifest: {
		capabilities: ['rules'],
		providerIds: ['suitecloud-devassist'],
		modelIds: ['netsuite'],
	},
	setup(api, context) {
		const sessionId = context.session?.sessionId;
		if (typeof sessionId !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(sessionId)) {
			return;
		}
		api.registerRule({
			id: 'suitecloud-conversation-identity',
			content: `<netsuite-conversation-id>${sessionId}</netsuite-conversation-id>`,
		});
	},
};
