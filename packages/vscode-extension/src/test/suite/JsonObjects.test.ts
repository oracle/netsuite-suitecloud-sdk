/*
 ** Copyright (c) 2026 Oracle and/or its affiliates. All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as assert from 'assert';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import { containsPath, projectForPath, resolveProjects } from '../../jsonObjects/ProjectDiscovery';
import { associationsFor, SchemaRegistry } from '../../jsonObjects/SchemaRegistry';
import { SchemaRepository } from '../../jsonObjects/SchemaRepository';
import { generateTemplate } from '../../jsonObjects/TemplateGenerator';
import { parse as parseYaml } from 'yaml';
import { checkSchemaAccess, isSchemaLocationTrusted } from '../../jsonObjects/SchemaDownloads';
import { JsonObjects, writeObject } from '../../jsonObjects/JsonObjects';
import { JSON_OBJECTS } from '../../jsonObjects/Configuration';

suite('SuiteCloud JSON and YAML objects', () => {
	let directory: string;
	const url = 'https://schemas.example.test/parent.json';
	setup(async () => { directory = await fs.mkdtemp(path.join(os.tmpdir(), 'suitecloud-json-unit-')); });
	teardown(async () => { await fs.rm(directory, { recursive: true, force: true }); });
	const manifest = '<manifest projecttype="ACCOUNTCUSTOMIZATION"><frameworkversion>1.0</frameworkversion><projectname>Demo</projectname></manifest>';
	async function source(name: string): Promise<string> {
		const folder = path.join(directory, name);
		await fs.mkdir(folder, { recursive: true });
		await fs.writeFile(path.join(folder, 'manifest.xml'), manifest);
		await fs.writeFile(path.join(folder, 'deploy.xml'), '<deploy/>');
		return folder;
	}

	test('uses each config default and account/object import override, deduplicating sources', async () => {
		await source('src'); await source('account'); await source('objects');
		await fs.writeFile(path.join(directory, 'suitecloud.config.js'), `module.exports = { defaultProjectFolder: 'src', commands: {
			'account:import': { projectFolder: 'account' }, 'object:import': { projectFolder: 'objects' } } };`);
		assert.deepStrictEqual(resolveProjects(directory, url).map(project => path.basename(project.source)), ['src', 'objects', 'account']);
	});

	test('reloads config and project-owned helper modules, drops invalid manifests', async () => {
		await source('old'); await source('new');
		const helper = path.join(directory, 'folder.js');
		await fs.writeFile(helper, `module.exports = 'old';`);
		await fs.writeFile(path.join(directory, 'suitecloud.config.js'), `module.exports = { defaultProjectFolder: require('./folder') };`);
		assert.strictEqual(resolveProjects(directory, url)[0].source, path.join(directory, 'old'));
		await fs.writeFile(helper, `module.exports = 'new';`);
		assert.strictEqual(resolveProjects(directory, url)[0].source, path.join(directory, 'new'));
		await fs.writeFile(path.join(directory, 'new', 'manifest.xml'), '<invalid/>');
		assert.deepStrictEqual(resolveProjects(directory, url), []);
	});

	test('recognizes a source folder opened directly without a config', async () => {
		assert.strictEqual(resolveProjects(await source('direct'), url).length, 1);
	});

	for (const format of ['json', 'yaml', 'yml']) {
		test(`recognizes ${format} control files through the shared SDK and rejects mixed generations`, async () => {
			const folder = path.join(directory, 'application');
			await fs.mkdir(folder);
			await fs.writeFile(path.join(directory, 'suitecloud.config.js'), "module.exports = { defaultProjectFolder: 'application' };");
			await fs.writeFile(path.join(folder, `manifest.${format}`), JSON.stringify({
				manifest: { projecttype: 'ACCOUNTCUSTOMIZATION', frameworkversion: '2.0', projectname: 'Demo' },
			}));
			await fs.writeFile(path.join(folder, `deploy.${format}`), '{"deploy":[]}');
			assert.strictEqual(resolveProjects(directory, url)[0].source, folder);
			assert.strictEqual(resolveProjects(folder, url)[0].source, folder);
			await fs.writeFile(path.join(folder, 'deploy.xml'), '<deploy/>');
			assert.deepStrictEqual(resolveProjects(directory, url), []);
		});
	}

	test('uses structural path boundaries and the nearest source in nested projects', () => {
		assert.strictEqual(containsPath('/demo/app', '/demo/application/file'), false);
		const parent = { root: '/demo', source: '/demo/src', objects: '/demo/src/Objects', schemaUrl: url };
		const child = { root: '/demo/src/Objects/child', source: '/demo/src/Objects/child/app', objects: '/demo/src/Objects/child/app/Objects', schemaUrl: url + '?child' };
		assert.strictEqual(projectForPath([parent, child], child.objects), child);
		assert.strictEqual(projectForPath([parent, child], path.join(child.root, 'suitecloud.config.js')), child);
		assert.strictEqual(projectForPath([parent, child], '/demo/src/file'), parent);
		assert(associationsFor([parent, child])[0].fileMatch.includes('!file:///demo/src/Objects/child/**'));
		assert(!associationsFor([parent])[0].fileMatch.includes('*.json'));
	});

	test('asks for a project when a config root has multiple command destinations', () => {
		const project = { root: '/demo', source: '/demo/src', objects: '/demo/src/Objects', schemaUrl: url };
		assert.strictEqual(projectForPath([project, { ...project, source: '/demo/import' }], '/demo/suitecloud.config.js'), undefined);
	});

	test('extends PoC defaults through required objects, arrays and JSON pointer references', async () => {
		const root = { $defs: { item: { type: 'object', required: ['enabled', 'count', 'label', 'empty'], properties: {
			enabled: { type: 'boolean', default: false }, count: { type: 'integer', default: 0 }, label: { type: 'string', default: '' }, empty: { type: 'null', default: null }, optional: { type: 'string' },
		} } }, type: 'object', required: ['wrapper'], properties: { wrapper: { type: 'array', minItems: 1, items: { $ref: '#/$defs/item' } } } };
		const repository = new SchemaRepository(async () => JSON.stringify(root), () => undefined);
		assert.deepStrictEqual(await generateTemplate(await repository.load(url), repository), { wrapper: [{ enabled: false, count: 0, label: '', empty: null }] });
	});

	test('resolves relative child URLs and canonical IDs without extra network requests', async () => {
		const requested: string[] = [];
		const repository = new SchemaRepository(async request => {
			requested.push(request);
			return JSON.stringify(request === url ? { oneOf: [{ $ref: './child.json' }] } : {
				$id: 'https://schemas.example.test/canonical.json', $defs: { value: { type: 'string', enum: ['TEXT', 'SELECT'] } },
				type: 'object', required: ['field'], properties: { field: { $ref: '#/$defs/value' } },
			});
		}, () => undefined);
		await repository.load(url);
		assert.deepStrictEqual(await generateTemplate(await repository.load('./child.json', url), repository), { field: 'TEXT' });
		assert.deepStrictEqual(requested, [url, 'https://schemas.example.test/child.json']);
	});

	test('delegates downloads, checks access even for memory hits, and retries failures', async () => {
		let attempts = 0;
		let allowed = true;
		const repository = new SchemaRepository(async () => {
			attempts++;
			if (attempts === 1) { throw new Error('offline'); }
			return '{"type":"string"}';
		}, () => { if (!allowed) { throw new Error('disabled'); } });
		await assert.rejects(repository.load(url), /offline/);
		assert.deepStrictEqual((await repository.load(url)).schema, { type: 'string' });
		await repository.load(url);
		assert.strictEqual(attempts, 2);
		allowed = false;
		await assert.rejects(repository.load(url), /disabled/);
		allowed = true;
		repository.clear();
		await repository.load(url);
		assert.strictEqual(attempts, 3);
	});

	test('uses native trust setting domain, path, wildcard and deny semantics', () => {
		const trusted = { 'https://raw.githubusercontent.com/oracle/netsuite-suitecloud-sdk/': true };
		assert(isSchemaLocationTrusted('https://raw.githubusercontent.com/oracle/netsuite-suitecloud-sdk/dev/schema.json', trusted));
		assert(!isSchemaLocationTrusted('https://raw.githubusercontent.com/oracle/netsuite-suitecloud-sdk-other/schema.json', trusted));
		assert(!isSchemaLocationTrusted('https://raw.githubusercontent.com/another/repo/schema.json', trusted));
		assert(isSchemaLocationTrusted(url, { 'https://*.example.test': true }));
		assert(!isSchemaLocationTrusted(url, { 'https://*.example.test': false, '*': true }));
		assert(!isSchemaLocationTrusted(url, { 'invalid': true }));
	});

	test('adds conditionally required fields after resolving enum defaults', async () => {
		const repository = new SchemaRepository();
		const schema = { type: 'object', required: ['fieldType'], properties: {
			fieldType: { type: 'string', default: 'SELECT' }, selectRecordType: { type: 'string', enum: ['CUSTOMER', 'ITEM'] },
		}, if: { properties: { fieldType: { enum: ['SELECT'] } } }, then: { required: ['selectRecordType'] } };
		assert.deepStrictEqual(await generateTemplate({ schema, base: url }, repository), { fieldType: 'SELECT', selectRecordType: 'CUSTOMER' });
	});

	test('rejects recursive required fields and unsupported compositions explicitly', async () => {
		const repository = new SchemaRepository(async () => '{"type":"object","required":["loop"],"properties":{"loop":{"$ref":"#"}}}', () => undefined);
		await assert.rejects(generateTemplate(await repository.load(url), repository), /recursive/);
		await assert.rejects(generateTemplate({ schema: { anyOf: [{ type: 'string' }] }, base: url }, repository), /compositions/);
		await assert.rejects(repository.load('file:///tmp/schema.json'), /HTTPS/);
	});

	test('writes a plain JSON object and never overwrites an existing file', async () => {
		const template = { Secret: { scriptId: 'custsecret_demo' } };
		const uri = await writeObject(path.join(directory, 'Objects'), 'custsecret_demo', template);
		assert.deepStrictEqual(JSON.parse(await fs.readFile(uri.fsPath, 'utf8')), template);
		await assert.rejects(writeObject(path.dirname(uri.fsPath), 'custsecret_demo', {}), /EEXIST/);
		await assert.rejects(writeObject(directory, '../outside', {}), /letters/);
		assert.deepStrictEqual(JSON.parse(await fs.readFile(uri.fsPath, 'utf8')), template);
	});

	for (const format of ['yaml', 'yml'] as const) {
		test(`writes ${format} templates with lossless scalar types and refuses overwrites`, async () => {
			const template = { Secret: { scriptId: 'custsecret_demo', version: '1.0', enabled: false, count: 0, empty: null, text: 'yes' } };
			const uri = await writeObject(directory, 'custsecret_demo', template, format);
			assert(uri.fsPath.endsWith(`.${format}`));
			assert.deepStrictEqual(parseYaml(await fs.readFile(uri.fsPath, 'utf8')), template);
			await assert.rejects(writeObject(directory, 'custsecret_demo', {}, format), /EEXIST/);
		});
	}

	test('preloads parent and child schemas, shares concurrent requests, and refreshes explicitly', async () => {
		const child = new URL('child.json', url).href;
		const requests: string[] = [];
		const repository = new SchemaRepository(async location => {
			requests.push(location);
			return JSON.stringify(location === url ? { oneOf: [{ $ref: './child.json' }] } : { title: 'Secret', type: 'object' });
		}, () => undefined);
		const project = { root: directory, source: directory, objects: path.join(directory, 'Objects'), schemaUrl: url };
		const registry = { projects: [project, { ...project, root: directory + '-second' }] } as unknown as SchemaRegistry;
		const controller = new JsonObjects(registry, repository);
		await Promise.all([controller.prefetch(), controller.prefetch()]);
		assert.deepStrictEqual(requests, [url, child]);
		await controller.prefetch();
		assert.deepStrictEqual(requests, [url, child]);
		repository.clear();
		await controller.prefetch();
		assert.deepStrictEqual(requests, [url, child, url, child]);
	});

	test('preload skips absent projects and retries failed requests without bypassing access checks', async () => {
		let attempts = 0;
		let allowed = true;
		const repository = new SchemaRepository(async () => {
			if (++attempts === 1) { throw new Error('Offline without a cached schema'); }
			return '{"oneOf":[]}';
		}, () => { if (!allowed) { throw new Error('Downloads disabled'); } });
		const registry = { projects: [] } as unknown as SchemaRegistry;
		const controller = new JsonObjects(registry, repository);
		await controller.prefetch();
		assert.strictEqual(attempts, 0);
		registry.projects = [{ root: directory, source: directory, objects: directory, schemaUrl: url }];
		await assert.rejects(controller.prefetch(), /Offline/);
		await controller.prefetch();
		assert.strictEqual(attempts, 2);
		allowed = false;
		await assert.rejects(controller.prefetch(), /Downloads disabled/);
		assert.strictEqual(attempts, 2);
	});

	test('template command selects a type, validates the ID, writes required fields, and honors cancellation', async () => {
		const project = { root: directory, source: directory, objects: path.join(directory, 'Objects'), schemaUrl: url };
		const schema = { title: 'Secret', type: 'object', required: ['Secret'], properties: {
			Secret: { type: 'object', required: ['scriptId'], properties: { scriptId: { type: 'string', pattern: '^custsecret.+$', default: 'custsecret', maxLength: 40 } } },
		} };
		const repository = new SchemaRepository(async () => JSON.stringify({ oneOf: [schema] }), () => undefined);
		const registry = { projects: [project], refresh: async () => undefined } as unknown as SchemaRegistry;
		let canceled = false;
		let useYaml = false;
		let opened: vscode.TextDocument | undefined;
		const controller = new JsonObjects(registry, repository, {
			showQuickPick: async (items: any[]) => canceled ? undefined : useYaml && items[0].extension ? items[1] : items[0],
			withProgress: async (_options: any, task: any) => task(),
			showInputBox: async (options: vscode.InputBoxOptions) => {
				assert(options.validateInput!('custsecret'));
				assert.strictEqual(options.validateInput!('custsecret_demo'), undefined);
				return 'custsecret_demo';
			},
			showTextDocument: async (document: vscode.TextDocument) => { opened = document; },
			showErrorMessage: async (error: string) => { assert.fail(error); },
		} as any);
		await controller.create(vscode.Uri.file(directory));
		assert.deepStrictEqual(JSON.parse(opened!.getText()), { Secret: { scriptId: 'custsecret_demo' } });
		useYaml = true;
		await controller.create(vscode.Uri.file(directory));
		assert(opened!.uri.fsPath.endsWith('.yaml'));
		assert.deepStrictEqual(parseYaml(opened!.getText()), { Secret: { scriptId: 'custsecret_demo' } });
		canceled = true; opened = undefined;
		await controller.create(vscode.Uri.file(directory));
		assert.strictEqual(opened, undefined);
		assert.deepStrictEqual(await fs.readdir(project.objects), ['custsecret_demo.json', 'custsecret_demo.yaml']);
	});
});

// These tests exercise the actual built-in JSON extension and the contributed registry.
// runJsonObjectsTest supplies an isolated multi-root workspace, never the developer's workspace.
(process.env.SUITECLOUD_JSON_TEST_ROOT ? suite : suite.skip)('SuiteCloud object extension-host integration', function () {
	this.timeout(60000);
	const root = process.env.SUITECLOUD_JSON_TEST_ROOT ?? '';
	const first = path.join(root, 'project [a]');
	const second = path.join(root, 'repository-b');
	const nested = path.join(second, 'nested-project');
	const registryUri = vscode.Uri.parse('suitecloud-schema://registry/associations.json');
	const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
	async function until(check: () => Promise<boolean>, label: string): Promise<void> {
		const deadline = Date.now() + 45000;
		while (Date.now() < deadline) { if (await check()) { return; } await delay(250); }
		assert.fail(`Timed out: ${label}; visible editors: ${JSON.stringify(vscode.window.visibleTextEditors.map(editor => editor.document.uri.path))}; diagnostics: ${JSON.stringify(vscode.languages.getDiagnostics().map(([uri, diagnostics]) => [uri.path, diagnostics.map(d => d.message)]))}`);
	}
	async function matches(): Promise<string[]> {
		const data = JSON.parse(Buffer.from(await vscode.workspace.fs.readFile(registryUri)).toString());
		return data.schemas.flatMap((schema: any) => schema.fileMatch);
	}
	const pattern = (folder: string) => `${vscode.Uri.file(folder).toString(true).replace('[', '\\u005b').replace(']', '\\u005d')}/**/*.json`;
	async function open(filename: string, text: string): Promise<vscode.TextDocument> {
		await fs.mkdir(path.dirname(filename), { recursive: true }); await fs.writeFile(filename, text);
		const doc = await vscode.workspace.openTextDocument(filename); await vscode.window.showTextDocument(doc);
		return doc;
	}
	async function completions(doc: vscode.TextDocument, position = new vscode.Position(1, 2)): Promise<string[]> {
		const list = await vscode.commands.executeCommand<vscode.CompletionList>('vscode.executeCompletionItemProvider', doc.uri, position);
		return list?.items.map(item => typeof item.label === 'string' ? item.label : item.label.label) ?? [];
	}

	suiteSetup(async () => {
		await vscode.extensions.getExtension('Oracle.suitecloud-vscode-extension')!.activate();
		await until(async () => (await matches()).includes(pattern(path.join(first, 'src', 'Objects'))), 'first project discovery');
	});

	test('discovers two workspace roots and nested configs with independent source folders', async () => {
		const files = await matches();
		assert(files.includes(pattern(path.join(nested, 'application', 'Objects'))));
		assert.strictEqual(files.filter(value => !value.startsWith('!')).length, 2);
		assert.strictEqual(vscode.workspace.getConfiguration('suitecloud.jsonObjects', vscode.Uri.file(first)).get('schemaUrl'),
			'https://retired.example.invalid/parent.json');
		const registry = JSON.parse(Buffer.from(await vscode.workspace.fs.readFile(registryUri)).toString());
		assert.deepStrictEqual(registry.schemas.map((schema: any) => schema.url), [JSON_OBJECTS.PARENT_SCHEMA_URL, JSON_OBJECTS.PARENT_SCHEMA_URL]);
		assert.strictEqual(vscode.workspace.getConfiguration('json').inspect('schemas')?.workspaceValue, undefined);
		assert.strictEqual(vscode.workspace.getConfiguration('json').inspect('schemas')?.workspaceFolderValue, undefined);
	});

	test('activation preloads the hosted parent and child schemas without opening a template command', async () => {
		const parentUrl = JSON_OBJECTS.PARENT_SCHEMA_URL;
		const loadedSchemas = () => vscode.workspace.textDocuments.filter(document =>
			document.uri.scheme === 'json-schema' && document.uri.fragment.startsWith(new URL('.', parentUrl).href));
		await until(async () => loadedSchemas().some(document => document.uri.fragment === parentUrl), 'background parent preload');
		const parent = loadedSchemas().find(document => document.uri.fragment === parentUrl)!;
		const children = JSON.parse(parent.getText()).oneOf.map((entry: { $ref: string }) => new URL(entry.$ref, parentUrl).href);
		await until(async () => children.every((url: string) => loadedSchemas().some(document => document.uri.fragment === url)), 'background child preload');
	});

	test('newly imported JSON gets root completion and inline validation without $schema', async () => {
		const doc = await open(path.join(first, 'src', 'Objects', 'imported.json'), '{\n  \n}');
		await until(async () => (await completions(doc)).includes('Secret'), 'catalog completion');
		const invalid = await open(path.join(nested, 'application', 'Objects', 'nested', 'imported.json'), '{"Secret":{}}');
		await until(async () => {
			// Startup views can steal the preview editor while the language server initializes.
			// JSON uses pull diagnostics, which only run for visible documents.
			if (!vscode.window.visibleTextEditors.some(editor => editor.document.uri.toString() === invalid.uri.toString())) {
				await vscode.window.showTextDocument(invalid);
			}
			return vscode.languages.getDiagnostics(invalid.uri).some(d => d.message.includes('scriptId'));
		}, 'required-field diagnostic');
		assert(!vscode.languages.getDiagnostics(invalid.uri).some(d => /untrusted|Unable to load/.test(d.message)));
	});

	test('leaves JSON outside recognized Objects folders unassociated', async () => {
		const doc = await open(path.join(first, 'package-test.json'), '{\n  \n}');
		assert(!(await completions(doc)).includes('Secret'));
		const unrelated = await open(path.join(second, 'unrelated', 'Objects', 'test.json'), '{\n  \n}');
		assert(!(await completions(unrelated)).includes('Secret'));
	});

	for (const format of ['yaml', 'yml']) {
		test(`newly imported ${format} gets catalog, field and enum completion plus validation`, async () => {
			const doc = await open(path.join(first, 'src', 'Objects', `imported.${format}`), '\n');
			await until(async () => (await completions(doc, new vscode.Position(0, 0))).includes('Secret'), `${format} root completion`);
			const field = await open(path.join(nested, 'application', 'Objects', 'nested', `field.${format}`), 'CustomField:\n  \n');
			await until(async () => (await completions(field)).includes('fieldType'), `${format} field completion`);
			const value = await open(path.join(first, 'src', 'Objects', `enum.${format}`), 'CustomField:\n  fieldType: \n');
			await until(async () => (await completions(value, new vscode.Position(1, 13))).includes('CHECKBOX'), `${format} enum completion`);
			const invalid = await open(path.join(nested, 'application', 'Objects', `invalid.${format}`), 'Secret: {}\n');
			await until(async () => vscode.languages.getDiagnostics(invalid.uri).some(d => d.message.includes('scriptId')), `${format} required field`);
			assert(!vscode.languages.getDiagnostics(invalid.uri).some(d => /Unable to load|untrusted/.test(d.message)));
			const outside = await open(path.join(first, `unrelated.${format}`), '\n');
			assert(!(await completions(outside, new vscode.Position(0, 0))).includes('Secret'));
			assert.strictEqual(vscode.workspace.getConfiguration('yaml').inspect('schemas')?.workspaceValue, undefined);
		});
	}

	test('template downloads honor JSON settings while YAML uses its native loader', async () => {
		const url = JSON_OBJECTS.PARENT_SCHEMA_URL;
		checkSchemaAccess(url);
		const config = vscode.workspace.getConfiguration('json');
		const repository = new SchemaRepository();
		await repository.load(url);
		try {
			await config.update('schemaDownload.enable', false, vscode.ConfigurationTarget.Global);
			await assert.rejects(repository.load(url), /json.schemaDownload.enable/);
			const doc = await open(path.join(first, 'src', 'Objects', 'disabled.yaml'), 'Secret: {}\n');
			await until(async () => vscode.languages.getDiagnostics(doc.uri).some(d => d.message.includes('scriptId')), 'YAML validates independently of JSON download settings');
		} finally { await config.update('schemaDownload.enable', undefined, vscode.ConfigurationTarget.Global); }
		const doc = await open(path.join(first, 'src', 'Objects', 'restored.yml'), '\n');
		await until(async () => (await completions(doc, new vscode.Position(0, 0))).includes('Secret'), 'YAML downloads restored');
		try {
			await config.update('schemaDownload.trustedDomains', { 'https://raw.githubusercontent.com/oracle/netsuite-suitecloud-sdk/': false }, vscode.ConfigurationTarget.Global);
			await assert.rejects(repository.load(url), /not trusted/);
		} finally { await config.update('schemaDownload.trustedDomains', undefined, vscode.ConfigurationTarget.Global); }
	});

	test('generates required templates for all 15 object types in the hosted parent catalog', async () => {
		const url = JSON_OBJECTS.PARENT_SCHEMA_URL;
		const repository = new SchemaRepository();
		const parent = await repository.load(url);
		assert(typeof parent.schema === 'object');
		assert.strictEqual(parent.schema.oneOf.length, 15);
		for (const schema of parent.schema.oneOf) {
			const node = await repository.dereference({ schema, base: parent.base });
			const template = await generateTemplate(node, repository) as any;
			assert(typeof node.schema === 'object');
			for (const wrapper of node.schema.required) {
				assert(template[wrapper]);
				for (const field of node.schema.properties[wrapper].required) { assert(Object.prototype.hasOwnProperty.call(template[wrapper], field), `${wrapper}.${field}`); }
			}
			assert.strictEqual(template.$schema, undefined);
			for (const format of ['yaml', 'yml'] as const) {
				const uri = await writeObject(path.join(root, 'templates'), node.schema.required[0], template, format);
				assert.deepStrictEqual(parseYaml(await fs.readFile(uri.fsPath, 'utf8')), template);
			}
		}
	});

	test('a saved defaultProjectFolder change moves associations and completion to the new source', async () => {
		await fs.mkdir(path.join(first, 'next'), { recursive: true });
		await fs.copyFile(path.join(first, 'src', 'manifest.xml'), path.join(first, 'next', 'manifest.xml'));
		await fs.copyFile(path.join(first, 'src', 'deploy.xml'), path.join(first, 'next', 'deploy.xml'));
		await fs.writeFile(path.join(first, 'suitecloud.config.js'), "module.exports = { defaultProjectFolder: 'next' };\n");
		await until(async () => {
			const files = await matches();
			return files.includes(pattern(path.join(first, 'next', 'Objects'))) && !files.includes(pattern(path.join(first, 'src', 'Objects')));
		}, 'source change');
		const doc = await open(path.join(first, 'next', 'Objects', 'after-change.json'), '{\n  \n}');
		await until(async () => (await completions(doc)).includes('Secret'), 'new source completion');
		const old = await open(path.join(first, 'src', 'Objects', 'old-source.json'), '{\n  \n}');
		assert(!(await completions(old)).includes('Secret'));
		const yaml = await open(path.join(first, 'next', 'Objects', 'after-change.yaml'), '\n');
		await until(async () => (await completions(yaml, new vscode.Position(0, 0))).includes('Secret'), 'YAML new source completion');
		const oldYaml = await vscode.workspace.openTextDocument(path.join(first, 'src', 'Objects', 'imported.yaml'));
		assert(!(await completions(oldYaml, new vscode.Position(0, 0))).includes('Secret'));
	});

	test('folder enable/disable removes and restores only that folder associations', async () => {
		const config = vscode.workspace.getConfiguration('suitecloud.jsonObjects', vscode.Uri.file(first));
		await config.update('enabled', false, vscode.ConfigurationTarget.WorkspaceFolder);
		await until(async () => !(await matches()).includes(pattern(path.join(first, 'next', 'Objects'))), 'disabled project');
		assert((await matches()).includes(pattern(path.join(nested, 'application', 'Objects'))));
		const yaml = await vscode.workspace.openTextDocument(path.join(first, 'next', 'Objects', 'after-change.yaml'));
		assert(!(await completions(yaml, new vscode.Position(0, 0))).includes('Secret'));
		await config.update('enabled', undefined, vscode.ConfigurationTarget.WorkspaceFolder);
		await until(async () => (await matches()).includes(pattern(path.join(first, 'next', 'Objects'))), 're-enabled project');
		await until(async () => (await completions(yaml, new vscode.Position(0, 0))).includes('Secret'), 'YAML re-enabled project');
	});

	for (const format of ['json', 'yaml', 'yml']) {
		test(`${format} control-file create, change, delete and atomic replacement refresh discovery`, async () => {
			const source = path.join(first, `source-${format}`);
			const manifestPath = path.join(source, `manifest.${format}`);
			const deployPath = path.join(source, `deploy.${format}`);
			const manifest = JSON.stringify({ manifest: { projecttype: 'ACCOUNTCUSTOMIZATION', frameworkversion: '2.0' } });
			await fs.mkdir(source);
			await fs.writeFile(path.join(first, 'suitecloud.config.js'), `module.exports = { defaultProjectFolder: 'source-${format}' };`);
			await until(async () => !(await matches()).includes(pattern(path.join(first, 'next', 'Objects'))), 'old source removed');
			await fs.writeFile(manifestPath, manifest);
			await fs.writeFile(deployPath, '{"deploy":[]}');
			const recognized = async () => (await matches()).includes(pattern(path.join(source, 'Objects')));
			await until(recognized, `${format} project discovered after control-file creation`);
			const object = await open(path.join(source, 'Objects', 'imported.json'), '{\n  \n}');
			await until(async () => (await completions(object)).includes('Secret'), `${format} project JSON completion`);
			const yaml = await open(path.join(source, 'Objects', 'imported.yaml'), 'Secret: {}\n');
			await until(async () => vscode.languages.getDiagnostics(yaml.uri).some(d => d.message.includes('scriptId')), `${format} project YAML validation`);
			await fs.writeFile(manifestPath, '{}');
			await until(async () => !(await recognized()), 'invalid metadata removed');
			await fs.writeFile(manifestPath + '.tmp', manifest);
			await fs.rename(manifestPath + '.tmp', manifestPath);
			await until(recognized, 'atomic manifest replacement discovered');
			await fs.unlink(deployPath);
			await until(async () => !(await recognized()), 'deleted deploy removed');
			await fs.writeFile(deployPath, '{"deploy":[]}');
			await until(recognized, 'restored deploy discovered');
			await fs.writeFile(path.join(first, 'suitecloud.config.js'), "module.exports = { defaultProjectFolder: 'next' };");
			await until(async () => (await matches()).includes(pattern(path.join(first, 'next', 'Objects'))), 'original project restored');
		});
	}

	test('removed workspace folders lose their associations', async () => {
		assert(vscode.workspace.updateWorkspaceFolders(1, 1));
		await until(async () => !(await matches()).includes(pattern(path.join(nested, 'application', 'Objects'))), 'removed workspace folder');
	});
});
