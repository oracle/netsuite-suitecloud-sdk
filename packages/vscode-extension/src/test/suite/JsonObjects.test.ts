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
import { JsonObjects, writeObject } from '../../jsonObjects/JsonObjects';

suite('SuiteCloud JSON objects', () => {
	let directory: string;
	const url = 'https://schemas.example.test/parent.json';
	setup(async () => { directory = await fs.mkdtemp(path.join(os.tmpdir(), 'suitecloud-json-unit-')); });
	teardown(async () => { await fs.rm(directory, { recursive: true, force: true }); });
	const manifest = '<manifest projecttype="ACCOUNTCUSTOMIZATION"><projectname>Demo</projectname></manifest>';
	async function source(name: string): Promise<string> {
		const folder = path.join(directory, name);
		await fs.mkdir(folder, { recursive: true });
		await fs.writeFile(path.join(folder, 'manifest.xml'), manifest);
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
		const repository = new SchemaRepository(directory, () => undefined, async () => JSON.stringify(root));
		assert.deepStrictEqual(await generateTemplate(await repository.load(url), repository), { wrapper: [{ enabled: false, count: 0, label: '', empty: null }] });
	});

	test('resolves relative child URLs and canonical IDs without extra network requests', async () => {
		const requested: string[] = [];
		const repository = new SchemaRepository(directory, () => undefined, async request => {
			requested.push(request);
			return JSON.stringify(request === url ? { oneOf: [{ $ref: './child.json' }] } : {
				$id: 'https://schemas.example.test/canonical.json', $defs: { value: { type: 'string', enum: ['TEXT', 'SELECT'] } },
				type: 'object', required: ['field'], properties: { field: { $ref: '#/$defs/value' } },
			});
		});
		await repository.dependencies(url);
		assert.deepStrictEqual(await generateTemplate(await repository.load('./child.json', url), repository), { field: 'TEXT' });
		assert.deepStrictEqual(requested, [url, 'https://schemas.example.test/child.json']);
	});

	test('reuses a cached schema offline and retries failed uncached downloads', async () => {
		const online = new SchemaRepository(directory, () => undefined, async () => '{"type":"string"}');
		await online.load(url);
		let attempts = 0;
		const offline = new SchemaRepository(directory, () => undefined, async () => { attempts++; throw new Error('offline'); });
		assert.deepStrictEqual((await offline.load(url)).schema, { type: 'string' });
		await assert.rejects(offline.load(url + '?missing'), /offline/);
		await assert.rejects(offline.load(url + '?missing'), /offline/);
		assert.strictEqual(attempts, 3);
	});

	test('adds conditionally required fields after resolving enum defaults', async () => {
		const repository = new SchemaRepository(directory, () => undefined);
		const schema = { type: 'object', required: ['fieldType'], properties: {
			fieldType: { type: 'string', default: 'SELECT' }, selectRecordType: { type: 'string', enum: ['CUSTOMER', 'ITEM'] },
		}, if: { properties: { fieldType: { enum: ['SELECT'] } } }, then: { required: ['selectRecordType'] } };
		assert.deepStrictEqual(await generateTemplate({ schema, base: url }, repository), { fieldType: 'SELECT', selectRecordType: 'CUSTOMER' });
	});

	test('rejects recursive required fields and unsupported compositions explicitly', async () => {
		const repository = new SchemaRepository(directory, () => undefined, async () => '{"type":"object","required":["loop"],"properties":{"loop":{"$ref":"#"}}}');
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

	test('template command selects a type, validates the ID, writes required fields, and honors cancellation', async () => {
		const project = { root: directory, source: directory, objects: path.join(directory, 'Objects'), schemaUrl: url };
		const schema = { title: 'Secret', type: 'object', required: ['Secret'], properties: {
			Secret: { type: 'object', required: ['scriptId'], properties: { scriptId: { type: 'string', pattern: '^custsecret.+$', default: 'custsecret', maxLength: 40 } } },
		} };
		const repository = new SchemaRepository(path.join(directory, 'cache'), () => undefined, async () => JSON.stringify({ oneOf: [schema] }));
		const registry = { projects: [project], refresh: async () => undefined } as unknown as SchemaRegistry;
		let canceled = false;
		let opened: vscode.TextDocument | undefined;
		const controller = new JsonObjects(registry, repository, {
			showQuickPick: async (items: any[]) => canceled ? undefined : items[0],
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
		canceled = true; opened = undefined;
		await controller.create(vscode.Uri.file(directory));
		assert.strictEqual(opened, undefined);
		assert.deepStrictEqual(await fs.readdir(project.objects), ['custsecret_demo.json']);
	});
});

// These tests exercise the actual built-in JSON extension and the contributed registry.
// runJsonObjectsTest supplies an isolated multi-root workspace, never the developer's workspace.
(process.env.SUITECLOUD_JSON_TEST_ROOT ? suite : suite.skip)('SuiteCloud JSON extension-host integration', function () {
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
		assert.fail(`Timed out: ${label}`);
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
	async function completions(doc: vscode.TextDocument): Promise<string[]> {
		const list = await vscode.commands.executeCommand<vscode.CompletionList>('vscode.executeCompletionItemProvider', doc.uri, new vscode.Position(1, 2));
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
		assert.strictEqual(vscode.workspace.getConfiguration('json').inspect('schemas')?.workspaceValue, undefined);
		assert.strictEqual(vscode.workspace.getConfiguration('json').inspect('schemas')?.workspaceFolderValue, undefined);
	});

	test('newly imported JSON gets root completion and inline validation without $schema', async () => {
		const doc = await open(path.join(first, 'src', 'Objects', 'imported.json'), '{\n  \n}');
		await until(async () => (await completions(doc)).includes('Secret'), 'catalog completion');
		const invalid = await open(path.join(nested, 'application', 'Objects', 'nested', 'imported.json'), '{"Secret":{}}');
		await until(async () => vscode.languages.getDiagnostics(invalid.uri).some(d => d.message.includes('scriptId')), 'required-field diagnostic');
		assert(!vscode.languages.getDiagnostics(invalid.uri).some(d => /untrusted|Unable to load/.test(d.message)));
	});

	test('leaves JSON outside recognized Objects folders unassociated', async () => {
		const doc = await open(path.join(first, 'package-test.json'), '{\n  \n}');
		assert(!(await completions(doc)).includes('Secret'));
		const unrelated = await open(path.join(second, 'unrelated', 'Objects', 'test.json'), '{\n  \n}');
		assert(!(await completions(unrelated)).includes('Secret'));
	});

	test('generates required templates for all 15 object types in the hosted parent catalog', async () => {
		const url = vscode.workspace.getConfiguration('suitecloud.jsonObjects').get<string>('schemaUrl')!;
		const repository = new SchemaRepository(path.join(root, 'catalog-cache'), () => undefined);
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
		}
	});

	test('a saved defaultProjectFolder change moves associations and completion to the new source', async () => {
		await fs.mkdir(path.join(first, 'next'), { recursive: true });
		await fs.copyFile(path.join(first, 'src', 'manifest.xml'), path.join(first, 'next', 'manifest.xml'));
		await fs.writeFile(path.join(first, 'suitecloud.config.js'), "module.exports = { defaultProjectFolder: 'next' };\n");
		await until(async () => {
			const files = await matches();
			return files.includes(pattern(path.join(first, 'next', 'Objects'))) && !files.includes(pattern(path.join(first, 'src', 'Objects')));
		}, 'source change');
		const doc = await open(path.join(first, 'next', 'Objects', 'after-change.json'), '{\n  \n}');
		await until(async () => (await completions(doc)).includes('Secret'), 'new source completion');
		const old = await open(path.join(first, 'src', 'Objects', 'old-source.json'), '{\n  \n}');
		assert(!(await completions(old)).includes('Secret'));
	});

	test('folder enable/disable removes and restores only that folder associations', async () => {
		const config = vscode.workspace.getConfiguration('suitecloud.jsonObjects', vscode.Uri.file(first));
		await config.update('enabled', false, vscode.ConfigurationTarget.WorkspaceFolder);
		await until(async () => !(await matches()).includes(pattern(path.join(first, 'next', 'Objects'))), 'disabled project');
		assert((await matches()).includes(pattern(path.join(nested, 'application', 'Objects'))));
		await config.update('enabled', undefined, vscode.ConfigurationTarget.WorkspaceFolder);
		await until(async () => (await matches()).includes(pattern(path.join(first, 'next', 'Objects'))), 're-enabled project');
	});

	test('removed workspace folders lose their associations', async () => {
		assert(vscode.workspace.updateWorkspaceFolders(1, 1));
		await until(async () => !(await matches()).includes(pattern(path.join(nested, 'application', 'Objects'))), 'removed workspace folder');
	});
});
