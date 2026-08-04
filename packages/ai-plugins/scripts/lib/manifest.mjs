/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { CLAUDE_MANIFEST_PATH, CODEX_MANIFEST_PATH } from './constants.mjs';

export function generateManifest(pluginConfig) {
	const manifest = {
		...pluginConfig.metadata,
		version: pluginConfig.version,
		skills: './skills/',
	};

	if (pluginConfig.platform === 'anthropic') {
		return {
			manifestPath: CLAUDE_MANIFEST_PATH,
			manifest,
		};
	}

	return {
		manifestPath: CODEX_MANIFEST_PATH,
		manifest,
	};
}
