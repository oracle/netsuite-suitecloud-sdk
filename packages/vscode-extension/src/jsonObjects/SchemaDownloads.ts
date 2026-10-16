/*
 ** Copyright (c) 2026 Oracle and/or its affiliates. All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';
import { JSON_OBJECTS } from './Configuration';

let revision = 0;
export function refreshSchemaDocuments(): void { revision++; }

/** Match the domain, subdomain wildcard and path-prefix rules of VS Code's JSON setting. */
export function isSchemaLocationTrusted(location: string, domains: Record<string, boolean>): boolean {
	const url = new URL(location);
	if (/^(?:.*\.)?localhost$|^127\.0\.0\.1$|^\[::1\]$/i.test(url.hostname)) { return true; }
	for (const [pattern, allowed] of Object.entries(domains)) {
		if (pattern === '*') { return allowed; }
		try {
			const entry = new URL(pattern);
			const host = entry.host.toLowerCase();
			const matchesHost = host === url.host.toLowerCase() || (host.startsWith('*.') &&
				(url.host.toLowerCase() === host.slice(2) || url.host.toLowerCase().endsWith(host.slice(1))));
			const prefix = entry.pathname.endsWith('/') ? entry.pathname : `${entry.pathname}/`;
			if (entry.protocol === url.protocol && matchesHost && (url.pathname === entry.pathname || url.pathname.startsWith(prefix))) {
				return allowed;
			}
		} catch { /* Invalid native setting entries don't authorize a download. */ }
	}
	return false;
}

export function checkSchemaAccess(url: string): void {
	if (new URL(url).protocol !== 'https:') { throw new Error(`Schema URLs must use HTTPS: ${url}`); }
	if (!vscode.workspace.isTrusted) { throw new Error('Trust the workspace before loading SuiteCloud schemas.'); }
	const settings = vscode.workspace.getConfiguration('json');
	if (!settings.get<boolean>('schemaDownload.enable', true)) {
		throw new Error('Schema downloading is disabled by json.schemaDownload.enable.');
	}
	if (!isSchemaLocationTrusted(url, settings.get<Record<string, boolean>>('schemaDownload.trustedDomains', {}))) {
		throw new Error(`Schema location is not trusted. Configure json.schemaDownload.trustedDomains for ${url}`);
	}
}

/**
 * Red Hat YAML exposes schema documents through its json-schema content provider.
 * It owns HTTP proxy/TLS handling, ETag caching and offline fallback. VS Code's
 * built-in JSON extension has no public schema-download API.
 */
export async function loadSchemaDocument(url: string): Promise<string> {
	checkSchemaAccess(url);
	const extension = vscode.extensions.getExtension(JSON_OBJECTS.YAML_EXTENSION);
	if (!extension) { throw new Error('Install and enable YAML by Red Hat to load SuiteCloud templates and YAML schemas.'); }
	await extension.activate();
	const uri = vscode.Uri.from({ scheme: 'json-schema', authority: 'suitecloud', path: '/schema.json',
		query: `revision=${revision}`, fragment: url });
	const document = await vscode.workspace.openTextDocument(uri);
	checkSchemaAccess(url);
	return document.getText();
}
