/*
 ** Copyright (c) 2026 Oracle and/or its affiliates. All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';
import { JSON_OBJECTS } from './Configuration';
import { SchemaRegistry } from './SchemaRegistry';

interface YamlExtensionAPI {
	registerContributor(name: string, schema: (resource: string) => string | undefined,
		content: (uri: string) => string): boolean;
}

/** Only select the schema. Red Hat YAML owns downloading, references and diagnostics. */
export class YamlSupport implements vscode.Disposable {
	private disposed = false;

	constructor(private readonly registry: SchemaRegistry) {}

	async start(): Promise<void> {
		const extension = vscode.extensions.getExtension<YamlExtensionAPI>(JSON_OBJECTS.YAML_EXTENSION);
		if (!extension) { throw new Error('Install and enable YAML by Red Hat for SuiteCloud YAML support.'); }
		const api = await extension.activate();
		if (this.disposed) { return; }
		if (!api.registerContributor(JSON_OBJECTS.YAML_SCHEMA_SCHEME, resource => {
			if (this.disposed) { return undefined; }
			const uri = vscode.Uri.parse(resource);
			return /\.ya?ml$/i.test(uri.path) ? this.registry.projectForDocument(uri)?.schemaUrl : undefined;
		}, () => {
			// HTTPS schemas use the language service's native loader, never this callback.
			throw new Error('SuiteCloud contributes HTTPS schema URLs only.');
		})) { throw new Error('SuiteCloud YAML schema provider is already registered.'); }
	}

	dispose(): void {
		// The contributor API has no unregister method; make its callback inert.
		this.disposed = true;
	}
}
