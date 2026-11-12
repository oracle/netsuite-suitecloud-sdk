/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

export const CLAUDE_MANIFEST_PATH = '.claude-plugin/plugin.json';
export const CODEX_MANIFEST_PATH = '.codex-plugin/plugin.json';

export const GENERATED_MANIFEST_PATHS = new Set([
	CLAUDE_MANIFEST_PATH,
	CODEX_MANIFEST_PATH,
]);

export const FRONTMATTER_REQUIRED_FIELDS = ['name', 'description', 'license'];
