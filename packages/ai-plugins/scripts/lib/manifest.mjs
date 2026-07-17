/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { CLAUDE_MANIFEST_PATH, CODEX_MANIFEST_PATH } from './constants.mjs';
function buildAuthor(metadata) {
	const author = { name: metadata.authorName };
	if (metadata.authorUrl) {
		author.url = metadata.authorUrl;
	}
	return author;
}

function buildInterface(metadata) {
	return {
		displayName: metadata.name,
		shortDescription: metadata.shortDescription ?? metadata.description,
		longDescription: metadata.longDescription ?? metadata.description,
		developerName: metadata.authorName,
		category: metadata.category ?? 'Developer Tools',
		capabilities: metadata.capabilities ?? ['Read'],
		websiteURL: metadata.homepage,
		privacyPolicyURL: metadata.privacyPolicyUrl ?? metadata.homepage,
	};
}

export function generateManifest(pluginConfig) {
	const base = {
		name: pluginConfig.metadata.name,
		description: pluginConfig.metadata.description,
		version: pluginConfig.version,
		author: buildAuthor(pluginConfig.metadata),
		license: pluginConfig.metadata.license,
		keywords: pluginConfig.metadata.keywords,
		homepage: pluginConfig.metadata.homepage,
		repository: pluginConfig.metadata.repository,
		skills: './skills/',
	};

	if (pluginConfig.platform === 'claude') {
		return {
			manifestPath: CLAUDE_MANIFEST_PATH,
			manifest: base,
		};
	}

	return {
		manifestPath: CODEX_MANIFEST_PATH,
		manifest: {
			...base,
			interface: buildInterface(pluginConfig.metadata),
		},
	};
}
