/*
 ** Copyright (c) 2026 Oracle and/or its affiliates. All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { createHash } from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { JSON_OBJECTS } from './Configuration';

// Schemas are data from the configured catalog, not executable modules.
export type Schema = boolean | { [keyword: string]: any };
export interface SchemaNode { schema: Schema; base: string; }
export type SchemaLoader = (url: string) => Promise<string>;

async function download(url: string): Promise<string> {
	const response = await fetch(url, { signal: AbortSignal.timeout(JSON_OBJECTS.DOWNLOAD_TIMEOUT_MS) });
	if (!response.ok) { throw new Error(`Schema download failed (${response.status}): ${url}`); }
	return response.text();
}

/** Shared catalog loader for discovery and templates, with an offline disk cache. */
export class SchemaRepository {
	private readonly documents = new Map<string, Promise<Schema>>();
	constructor(private readonly cacheDirectory: string, private readonly log: (message: string) => void,
		private readonly loader: SchemaLoader = download) {}

	clear(): void { this.documents.clear(); }

	private document(url: string): Promise<Schema> {
		if (new URL(url).protocol !== 'https:') { throw new Error(`Schema URLs must use HTTPS: ${url}`); }
		let pending = this.documents.get(url);
		if (!pending) {
			pending = this.read(url).catch(error => { this.documents.delete(url); throw error; });
			this.documents.set(url, pending);
		}
		return pending;
	}

	private async read(url: string): Promise<Schema> {
		const filename = path.join(this.cacheDirectory, `${createHash('sha256').update(url).digest('hex')}.json`);
		let schema: Schema;
		try {
			schema = this.parse(await this.loader(url));
		} catch (error) {
			try {
				schema = this.parse(await fs.readFile(filename, 'utf8'));
				this.log(`Using cached JSON schema: ${url}`);
				return schema;
			} catch { throw error; }
		}
		try {
			await fs.mkdir(this.cacheDirectory, { recursive: true });
			await fs.writeFile(filename, JSON.stringify(schema));
		} catch (error) { this.log(`Could not cache JSON schema: ${String(error)}`); }
		return schema;
	}

	private parse(text: string): Schema {
		const schema = JSON.parse(text);
		if (typeof schema !== 'boolean' && (!schema || typeof schema !== 'object' || Array.isArray(schema))) {
			throw new Error('Expected a JSON Schema object.');
		}
		return schema;
	}

	async load(reference: string, base?: string): Promise<SchemaNode> {
		const url = new URL(reference, base);
		const fragment = decodeURIComponent(url.hash.slice(1));
		url.hash = '';
		let schema = await this.document(url.href);
		let scope = url.href;
		if (fragment && !fragment.startsWith('/')) { throw new Error(`Named schema anchors are not supported by the template catalog: ${reference}`); }
		for (const segment of fragment ? fragment.slice(1).split('/') : []) {
			if (typeof schema !== 'object') { throw new Error(`Unresolved schema reference: ${reference}`); }
			if (schema.$id) { scope = new URL(schema.$id, scope).href; }
			const key = segment.replace(/~1/g, '/').replace(/~0/g, '~');
			if (!Object.prototype.hasOwnProperty.call(schema, key)) { throw new Error(`Unresolved schema reference: ${reference}`); }
			schema = schema[key];
		}
		// Alias a document's canonical ID so local references don't require another download.
		const root = await this.document(url.href);
		if (typeof root === 'object' && root.$id) {
			this.documents.set(new URL(root.$id, url.href).href, Promise.resolve(root));
		}
		return { schema, base: scope };
	}

	async dereference(node: SchemaNode, seen = new Set<string>()): Promise<SchemaNode> {
		const { schema } = node;
		if (typeof schema !== 'object') { return node; }
		const base = schema.$id ? new URL(schema.$id, node.base).href : node.base;
		if (!schema.$ref) { return { schema, base }; }
		const reference = new URL(schema.$ref, base).href;
		if (seen.has(reference)) { throw new Error(`Circular schema reference: ${reference}`); }
		seen.add(reference);
		const resolved = await this.dereference(await this.load(reference), seen);
		// $ref siblings with constraints require full schema intersection; don't silently discard them.
		const siblings = Object.keys(schema).filter(key => !['$ref', '$id', '$schema', 'title', 'description', '$comment'].includes(key));
		if (siblings.length) { throw new Error(`Template generation does not support $ref siblings: ${siblings.join(', ')}`); }
		return resolved;
	}

	/** Exact URLs with empty matches let VS Code trust catalog references without changing user settings. */
	async dependencies(url: string): Promise<string[]> {
		const visited = new Set<string>();
		const visit = async (reference: string): Promise<void> => {
			const documentUrl = new URL(reference); documentUrl.hash = '';
			if (visited.has(documentUrl.href)) { return; }
			if (visited.size >= 100) { throw new Error('The JSON schema catalog exceeds 100 documents.'); }
			visited.add(documentUrl.href);
			const node = await this.load(documentUrl.href);
			const walk = async (schema: any, base: string): Promise<void> => {
				if (!schema || typeof schema !== 'object') { return; }
				if (schema.$id) { base = new URL(schema.$id, base).href; }
				if (typeof schema.$ref === 'string') { await visit(new URL(schema.$ref, base).href); }
				for (const key of ['$defs', 'definitions', 'properties', 'patternProperties', 'dependentSchemas']) {
					for (const value of Object.values(schema[key] ?? {})) { await walk(value, base); }
				}
				for (const key of ['allOf', 'anyOf', 'oneOf', 'prefixItems']) {
					for (const value of schema[key] ?? []) { await walk(value, base); }
				}
				for (const key of ['items', 'additionalProperties', 'if', 'then', 'else', 'contains', 'not', 'propertyNames', 'unevaluatedItems', 'unevaluatedProperties']) {
					await walk(schema[key], base);
				}
			};
			await walk(node.schema, node.base);
		};
		await visit(url);
		return [...visited];
	}
}
