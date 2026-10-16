/*
 ** Copyright (c) 2026 Oracle and/or its affiliates. All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';
import { JSON_OBJECTS } from './Configuration';
import { Schema, SchemaRepository } from './SchemaRepository';
import { SchemaRegistry } from './SchemaRegistry';
import { checkSchemaAccess } from './SchemaDownloads';

interface YamlExtensionAPI {
	registerContributor(scheme: string, schema: (resource: string) => string | undefined,
		content: (uri: string) => Promise<string>): boolean;
}

export function yamlSchemaUri(location: string, revision: number): string {
	const url = new URL(location);
	const fragment = decodeURIComponent(url.hash.slice(1));
	url.hash = '';
	return vscode.Uri.from({ scheme: JSON_OBJECTS.YAML_SCHEMA_SCHEME, authority: 'schema', path: '/schema.json',
		query: new URLSearchParams({ url: url.href, revision: String(revision) }).toString(), fragment }).toString();
}

/** Route schema references through the same download policy, leaving instance defaults untouched. */
export function adaptYamlSchema(schema: Schema, base: string, revision: number): Schema {
	if (typeof schema === 'boolean') { return schema; }
	base = schema.$id ? new URL(schema.$id, base).href : base;
	const result = { ...schema };
	if (schema.$id) { result.$id = yamlSchemaUri(base, revision); }
	for (const key of ['$ref', '$dynamicRef', '$recursiveRef']) {
		if (typeof schema[key] === 'string') { result[key] = yamlSchemaUri(new URL(schema[key], base).href, revision); }
	}
	for (const key of ['$defs', 'definitions', 'properties', 'patternProperties', 'dependentSchemas']) {
		if (schema[key]) { result[key] = Object.fromEntries(Object.entries(schema[key]).map(([name, value]) =>
			[name, adaptYamlSchema(value as Schema, base, revision)])); }
	}
	for (const key of ['allOf', 'anyOf', 'oneOf', 'prefixItems']) {
		if (Array.isArray(schema[key])) { result[key] = schema[key].map((value: Schema) => adaptYamlSchema(value, base, revision)); }
	}
	for (const key of ['items', 'additionalItems', 'additionalProperties', 'if', 'then', 'else', 'contains', 'not', 'propertyNames', 'unevaluatedItems', 'unevaluatedProperties']) {
		if (schema[key] !== undefined) {
			result[key] = Array.isArray(schema[key]) ? schema[key].map((value: Schema) => adaptYamlSchema(value, base, revision)) : adaptYamlSchema(schema[key], base, revision);
		}
	}
	if (schema.dependencies) {
		result.dependencies = Object.fromEntries(Object.entries(schema.dependencies).map(([name, value]) =>
			[name, Array.isArray(value) ? value : adaptYamlSchema(value as Schema, base, revision)]));
	}
	return result;
}

export class YamlSupport implements vscode.Disposable {
	private revision = 0;
	private disposed = false;
	private readonly diagnostics = vscode.languages.createDiagnosticCollection('SuiteCloud Schemas');
	private readonly subscriptions: vscode.Disposable[];

	constructor(private readonly registry: SchemaRegistry, private readonly repository: SchemaRepository,
		private readonly log: (message: string) => void) {
		this.subscriptions = [this.diagnostics, registry.onDidChangeFile(() => this.refresh()),
			vscode.workspace.onDidCloseTextDocument(document => this.diagnostics.delete(document.uri)),
			vscode.workspace.onDidChangeConfiguration(event => {
				if (event.affectsConfiguration('json.schemaDownload') || event.affectsConfiguration('http')) {
					this.repository.clear(); this.refresh();
				}
			})];
	}

	async start(): Promise<void> {
		const extension = vscode.extensions.getExtension<YamlExtensionAPI>(JSON_OBJECTS.YAML_EXTENSION);
		if (!extension) { throw new Error('Install and enable YAML by Red Hat for SuiteCloud YAML support.'); }
		const api = await extension.activate();
		if (this.disposed) { return; }
		if (!api.registerContributor(JSON_OBJECTS.YAML_SCHEMA_SCHEME, resource => {
			if (this.disposed) { return undefined; }
			const uri = vscode.Uri.parse(resource);
			const project = this.projectForDocument(uri);
			return project ? yamlSchemaUri(project.schemaUrl, this.revision) : undefined;
		}, async resource => {
			if (this.disposed) { throw new Error('SuiteCloud YAML support has stopped.'); }
			const parameters = new URLSearchParams(vscode.Uri.parse(resource).query);
			const url = parameters.get('url');
			if (!url) { throw new Error('Missing SuiteCloud schema URL.'); }
			try {
				const node = await this.repository.load(url);
				return JSON.stringify(adaptYamlSchema(node.schema, node.base, Number(parameters.get('revision'))));
			} catch (error) {
				this.log(`SuiteCloud YAML schema: ${url}: ${String(error)}`);
				throw error;
			}
		})) { throw new Error('SuiteCloud YAML schema provider is already registered.'); }
	}

	private refresh(): void {
		this.revision++;
		this.diagnostics.clear();
		vscode.workspace.textDocuments.forEach(document => this.projectForDocument(document.uri));
	}

	private projectForDocument(uri: vscode.Uri) {
		const project = /\.ya?ml$/i.test(uri.path) ? this.registry.projectForDocument(uri) : undefined;
		this.diagnostics.delete(uri);
		if (project) {
			try { checkSchemaAccess(project.schemaUrl); }
			catch (error) {
				// Older YAML contributor APIs discard schema-load errors. Surface policy failures
				// explicitly; all object validation still belongs to the YAML language service.
				this.diagnostics.set(uri, [new vscode.Diagnostic(new vscode.Range(0, 0, 0, 1), String(error), vscode.DiagnosticSeverity.Warning)]);
			}
		}
		return project;
	}

	dispose(): void {
		// Red Hat's contributor API has no unregister method; callbacks become inert.
		this.disposed = true;
		this.subscriptions.forEach(subscription => subscription.dispose());
	}
}
