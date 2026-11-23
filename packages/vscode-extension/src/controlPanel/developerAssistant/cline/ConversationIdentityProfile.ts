/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { DEVELOPER_ASSISTANT } from '../../../ApplicationConstants';
import { SUITECLOUD_PANEL_RUNTIME_STRINGS } from '../Strings';
import { installClineConversationIdentityAdapter } from './ConversationIdentityAdapter';
import { CLINE_OPENAI_COMPATIBLE_PROVIDER_ID } from './Constants';
import type ClineFileStore from './FileStore';

export const CLINE_IDENTITY_PROVIDER_ID = 'suitecloud-devassist';

const BRIDGE_HEADER = 'x-netsuite-conversation-bridge';
const BRIDGE_VERSION = 'cline-bundled-v1';

export async function configureClineConversationIdentity(
	fileStore: ClineFileStore,
	{ workspacePath, baseUrl, apiKey, modelId }: {
		workspacePath: string;
		baseUrl: string;
		apiKey: string;
		modelId: string;
	}
): Promise<void> {
	const endpoint = new URL(baseUrl);
	if (endpoint.protocol !== 'http:' ||
		!['localhost', '127.0.0.1'].includes(endpoint.hostname) ||
		endpoint.pathname !== DEVELOPER_ASSISTANT.PROXY_URL.BASE_PATH ||
		endpoint.username || endpoint.password || endpoint.search || endpoint.hash) {
		throw new Error(SUITECLOUD_PANEL_RUNTIME_STRINGS.errors.clineIdentityLocalProxyRequired);
	}

	const snapshot = await fileStore.readJsonFileSnapshot(fileStore.providersFile);
	const data = snapshot.data ?? {};
	const providers = data.providers ?? {};
	if (typeof providers !== 'object' || Array.isArray(providers)) {
		throw new Error(SUITECLOUD_PANEL_RUNTIME_STRINGS.cline.providersFileUnavailable);
	}

	const existing = providers[CLINE_IDENTITY_PROVIDER_ID];
	if (existing !== undefined && (existing?.settings?.provider !== CLINE_IDENTITY_PROVIDER_ID ||
		existing.settings.headers?.[BRIDGE_HEADER] !== BRIDGE_VERSION ||
		existing.settings.baseUrl !== baseUrl)) {
		throw new Error(SUITECLOUD_PANEL_RUNTIME_STRINGS.errors.clineConfigChanged(CLINE_IDENTITY_PROVIDER_ID));
	}

	await installClineConversationIdentityAdapter(workspacePath);
	if (existing?.settings?.baseUrl === baseUrl && existing.settings.apiKey === apiKey &&
		existing.settings.model === modelId &&
		existing.settings.routingProviderId === CLINE_OPENAI_COMPATIBLE_PROVIDER_ID) {
		return;
	}

	await fileStore.writeJsonFile(fileStore.providersFile, {
		...data,
		providers: {
			...providers,
			[CLINE_IDENTITY_PROVIDER_ID]: {
				...existing,
				settings: {
					...existing?.settings,
					provider: CLINE_IDENTITY_PROVIDER_ID,
					routingProviderId: CLINE_OPENAI_COMPATIBLE_PROVIDER_ID,
					protocol: 'openai-chat',
					model: modelId,
					baseUrl,
					apiKey,
					headers: { ...existing?.settings?.headers, [BRIDGE_HEADER]: BRIDGE_VERSION },
				},
				updatedAt: new Date().toISOString(),
			},
		},
	}, snapshot.revision);
}
