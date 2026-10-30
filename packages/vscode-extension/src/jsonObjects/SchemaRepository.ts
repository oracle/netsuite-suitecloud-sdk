/*
 ** Copyright (c) 2026 Oracle and/or its affiliates. All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { checkSchemaAccess, loadSchemaDocument, refreshSchemaDocuments } from './SchemaDownloads';

// Schemas are data from the configured catalog, not executable modules.
export type Schema = boolean | { [keyword: string]: any };
export interface SchemaNode { schema: Schema; base: string; }
export type SchemaLoader = (url: string) => Promise<string>;

/** Schema interpretation for on-demand templates only; editor language services resolve their own schemas. */
export class SchemaRepository {
	private readonly documents = new Map<string, Promise<Schema>>();
	constructor(private readonly loader: SchemaLoader = loadSchemaDocument,
		private readonly checkAccess: (url: string) => void = checkSchemaAccess) {}

	clear(): void { this.documents.clear(); refreshSchemaDocuments(); }

	private document(url: string): Promise<Schema> {
		if (new URL(url).protocol !== 'https:') { throw new Error(`Schema URLs must use HTTPS: ${url}`); }
		this.checkAccess(url);
		let pending = this.documents.get(url);
		if (!pending) {
			pending = this.loader(url).then(text => this.parse(text)).catch(error => { this.documents.delete(url); throw error; });
			this.documents.set(url, pending);
		}
		return pending;
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

}
