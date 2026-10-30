/*
 ** Copyright (c) 2026 Oracle and/or its affiliates. All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as vscode from 'vscode';
import { stringify as stringifyYaml } from 'yaml';
import { commandsInfoMap } from '../commandsMap';
import { JSON_OBJECT_MESSAGES } from '../service/TranslationKeys';
import { VSTranslationService } from '../service/VSTranslationService';
import { ObjectProject } from './Configuration';
import { containsPath, projectForPath } from './ProjectDiscovery';
import { SchemaNode, SchemaRepository } from './SchemaRepository';
import { SchemaRegistry } from './SchemaRegistry';
import { generateTemplate, JsonValue } from './TemplateGenerator';
import { YamlSupport } from './YamlSupport';

const translations = new VSTranslationService();
const message = (key: string, ...parameters: string[]) => translations.getMessage(key, ...parameters);

export function initializeJsonObjects(context: vscode.ExtensionContext, log: (text: string) => void): void {
	const repository = new SchemaRepository();
	const registry = new SchemaRegistry(log);
	const yaml = new YamlSupport(registry);
	const objects = new JsonObjects(registry, repository);
	context.subscriptions.push(registry, yaml,
		registry.onDidChangeFile(() => {
			// Discovery runs after activation and after workspace trust is granted.
			// Keep network work off the activation path; native providers own disk caching.
			void objects.prefetch().catch(error => log(`SuiteCloud template schema preload: ${String(error)}`));
		}),
		vscode.commands.registerCommand(commandsInfoMap.createjsonobject.vscodeCommandId, (uri?: vscode.Uri) => objects.create(uri)),
		vscode.commands.registerCommand(commandsInfoMap.refreshjsonschemas.vscodeCommandId, async () => {
			repository.clear();
			await registry.refresh(true);
			// Use the built-in command to invalidate its HTTP and language-server caches too.
			await vscode.extensions.getExtension('vscode.json-language-features')?.activate();
			await vscode.commands.executeCommand('json.clearCache');
		}));
	registry.start();
	void yaml.start().catch(error => log(`SuiteCloud YAML: ${String(error)}`));
}

export type ObjectFormat = 'json' | 'yaml' | 'yml';

export async function writeObject(directory: string, scriptId: string, template: JsonValue, format: ObjectFormat = 'json'): Promise<vscode.Uri> {
	if (!/^[a-zA-Z0-9_]+$/.test(scriptId)) { throw new Error(message(JSON_OBJECT_MESSAGES.SCRIPT_ID_INVALID)); }
	if (!['json', 'yaml', 'yml'].includes(format)) { throw new Error(`Unsupported object format: ${format}`); }
	await fs.mkdir(directory, { recursive: true });
	const uri = vscode.Uri.file(path.join(directory, `${scriptId}.${format}`));
	// Exclusive creation prevents overwriting files created while the prompts were open.
	await fs.writeFile(uri.fsPath, format === 'json' ? JSON.stringify(template, null, '\t') + '\n' : stringifyYaml(template), { flag: 'wx' });
	return uri;
}

export class JsonObjects {
	constructor(private readonly registry: SchemaRegistry, private readonly repository: SchemaRepository,
		private readonly ui: Pick<typeof vscode.window, 'showQuickPick' | 'showInputBox' | 'showErrorMessage' | 'withProgress' | 'showTextDocument'> = vscode.window) {}

	/** Warm each catalog once through the repository's shared request/memory cache. */
	async prefetch(): Promise<void> {
		await Promise.all([...new Set(this.registry.projects.map(project => project.schemaUrl))]
			.map(url => this.loadTypes(url)));
	}

	private async loadTypes(url: string) {
		const parent = await this.repository.dereference(await this.repository.load(url));
		if (typeof parent.schema !== 'object' || !Array.isArray(parent.schema.oneOf)) {
			throw new Error(message(JSON_OBJECT_MESSAGES.CATALOG_INVALID));
		}
		return Promise.all(parent.schema.oneOf.map(async (schema: SchemaNode['schema']) => {
			const node = await this.repository.dereference({ schema, base: parent.base });
			if (typeof node.schema !== 'object') { throw new Error(message(JSON_OBJECT_MESSAGES.CATALOG_INVALID)); }
			return { label: node.schema.title ?? node.schema.required?.[0] ?? node.base,
				description: node.schema.description, node };
		}));
	}

	async create(contextUri?: vscode.Uri): Promise<void> {
		try {
			if (!vscode.workspace.isTrusted) { throw new Error(message(JSON_OBJECT_MESSAGES.TRUST_REQUIRED)); }
			await this.registry.refresh();
			const project = await this.chooseProject(contextUri ?? vscode.window.activeTextEditor?.document.uri, !!contextUri);
			if (!project) { return; }
			const types = await this.ui.withProgress({ location: vscode.ProgressLocation.Notification,
				title: message(JSON_OBJECT_MESSAGES.LOADING) }, () => this.loadTypes(project.schemaUrl));
			const selected = await this.ui.showQuickPick(types, { title: commandsInfoMap.createjsonobject.vscodeCommandName,
				placeHolder: message(JSON_OBJECT_MESSAGES.CHOOSE_TYPE) });
			if (!selected) { return; }
			const format = await this.ui.showQuickPick([
				{ label: 'JSON (.json)', extension: 'json' as const },
				{ label: 'YAML (.yaml)', extension: 'yaml' as const },
				{ label: 'YAML (.yml)', extension: 'yml' as const },
			], { placeHolder: message(JSON_OBJECT_MESSAGES.CHOOSE_FORMAT) });
			if (!format) { return; }
			const template = await generateTemplate(selected.node, this.repository);
			const wrapper = template && typeof template === 'object' && !Array.isArray(template) ? Object.keys(template)[0] : undefined;
			const body = wrapper && (template as Record<string, JsonValue>)[wrapper];
			if (!body || typeof body !== 'object' || Array.isArray(body) || typeof body.scriptId !== 'string' || typeof selected.node.schema !== 'object') {
				throw new Error(message(JSON_OBJECT_MESSAGES.CATALOG_INVALID));
			}
			const objectNode = await this.repository.dereference({ schema: selected.node.schema.properties[wrapper!], base: selected.node.base });
			const idNode = await this.repository.dereference({ schema: typeof objectNode.schema === 'object' ? objectNode.schema.properties.scriptId : false, base: objectNode.base });
			const idSchema = typeof idNode.schema === 'object' ? idNode.schema : {};
			const scriptId = await this.ui.showInputBox({ title: commandsInfoMap.createjsonobject.vscodeCommandName,
				prompt: message(JSON_OBJECT_MESSAGES.SCRIPT_ID), value: body.scriptId,
				valueSelection: [body.scriptId.length, body.scriptId.length],
				validateInput: value => {
					if (!/^[a-zA-Z0-9_]+$/.test(value)) { return message(JSON_OBJECT_MESSAGES.SCRIPT_ID_INVALID); }
					if ((idSchema.pattern && !new RegExp(idSchema.pattern).test(value)) ||
						(idSchema.maxLength && value.length > idSchema.maxLength) || (idSchema.minLength && value.length < idSchema.minLength)) {
						return message(JSON_OBJECT_MESSAGES.SCRIPT_ID_SCHEMA, String(idSchema.pattern ?? ''), String(idSchema.maxLength ?? ''));
					}
					return undefined;
				} });
			if (scriptId === undefined) { return; }
			body.scriptId = scriptId;
			await this.registry.refresh();
			if (!this.registry.projects.some(current => current.source === project.source && current.schemaUrl === project.schemaUrl)) {
				throw new Error(message(JSON_OBJECT_MESSAGES.PROJECT_CHANGED));
			}
			let directory = project.objects;
			if (contextUri?.scheme === 'file' && containsPath(project.objects, contextUri.fsPath) && (await fs.stat(contextUri.fsPath)).isDirectory()) {
				directory = contextUri.fsPath;
			}
			const uri = await writeObject(directory, scriptId, template, format.extension);
			const document = await vscode.workspace.openTextDocument(uri);
			await this.ui.showTextDocument(document);
		} catch (error) {
			await this.ui.showErrorMessage(message(JSON_OBJECT_MESSAGES.CREATE_ERROR, String(error)));
		}
	}

	private async chooseProject(uri?: vscode.Uri, explicitContext = false): Promise<ObjectProject | undefined> {
		const projects = this.registry.projects;
		if (!projects.length) { throw new Error(message(JSON_OBJECT_MESSAGES.NO_PROJECT)); }
		const contextual = uri?.scheme === 'file' ? projectForPath(projects, uri.fsPath) : undefined;
		if (contextual) { return contextual; }
		if (explicitContext && (!uri || !projects.some(project => containsPath(project.root, uri.fsPath)))) {
			throw new Error(message(JSON_OBJECT_MESSAGES.NO_PROJECT));
		}
		if (projects.length === 1) { return projects[0]; }
		return (await this.ui.showQuickPick(projects.map(project => ({
			label: path.basename(project.root), description: project.source, project,
		})), { placeHolder: message(JSON_OBJECT_MESSAGES.CHOOSE_PROJECT) }))?.project;
	}
}
