/*
 ** Copyright (c) 2026 Oracle and/or its affiliates. All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { FILES } from '../ApplicationConstants';
import { JSON_OBJECTS, ObjectProject, SchemaAssociation } from './Configuration';
import { containsPath, resolveProjects } from './ProjectDiscovery';

function escapedUri(uri: vscode.Uri): string {
	// JSON language service matches decoded URIs. Its glob-to-regexp converter preserves
	// Unicode escapes, which also escape brackets and stars inside literal directory names.
	return uri.toString(true).replace(/[\\?*\[\]{}]/g, character => `\\u${character.charCodeAt(0).toString(16).padStart(4, '0')}`);
}

export function associationsFor(projects: readonly ObjectProject[], boundaries: readonly string[] = projects.map(project => project.root)): SchemaAssociation[] {
	return projects.map(project => ({
		url: project.schemaUrl,
		fileMatch: [
			`${escapedUri(vscode.Uri.file(project.objects))}/**/*.json`,
			...boundaries.filter(root => root !== project.root && containsPath(project.objects, root))
				.map(root => `!${escapedUri(vscode.Uri.file(root))}/**`),
		],
	}));
}

/** An in-memory registry consumed by VS Code's built-in JSON language extension. */
export class SchemaRegistry implements vscode.FileSystemProvider, vscode.Disposable {
	private readonly changes = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
	readonly onDidChangeFile = this.changes.event;
	private readonly subscriptions: vscode.Disposable[] = [];
	private content = Buffer.from('{"schemas":[]}');
	private modified = Date.now();
	private generation = 0;
	private disposed = false;
	private timer?: ReturnType<typeof setTimeout>;
	private pending: Promise<void> = Promise.resolve();
	projects: readonly ObjectProject[] = [];
	private boundaries: readonly string[] = [];
	readonly uri = vscode.Uri.parse(JSON_OBJECTS.REGISTRY_URI);

	constructor(private readonly log: (message: string) => void) {}

	projectForDocument(uri: vscode.Uri): ObjectProject | undefined {
		if (uri.scheme !== 'file' || !vscode.workspace.isTrusted) { return undefined; }
		return this.projects.find(project => containsPath(project.objects, uri.fsPath) &&
			!this.boundaries.some(root => root !== project.root && containsPath(project.objects, root) && containsPath(root, uri.fsPath)));
	}

	start(): void {
		this.subscriptions.push(vscode.workspace.registerFileSystemProvider(JSON_OBJECTS.REGISTRY_SCHEME, this, { isReadonly: true }));
		const watcher = vscode.workspace.createFileSystemWatcher(`**/{${FILES.SUITECLOUD_CONFIG_JS},${FILES.MANIFEST_XML},${FILES.DEPLOY_XML}}`);
		this.subscriptions.push(watcher, watcher.onDidCreate(() => this.schedule()), watcher.onDidChange(() => this.schedule()), watcher.onDidDelete(() => this.schedule()),
			vscode.workspace.onDidChangeWorkspaceFolders(() => this.schedule()),
			vscode.workspace.onDidGrantWorkspaceTrust(() => this.schedule()),
			vscode.workspace.onDidChangeConfiguration(event => { if (event.affectsConfiguration(JSON_OBJECTS.CONFIGURATION)) { this.schedule(); } }));
		void this.refresh();
	}

	private schedule(): void {
		this.generation++;
		if (this.timer) { clearTimeout(this.timer); }
		this.timer = setTimeout(() => { this.timer = undefined; void this.refresh(); }, JSON_OBJECTS.REFRESH_DELAY_MS);
	}

	refresh(force = false): Promise<void> {
		if (this.timer) { clearTimeout(this.timer); this.timer = undefined; }
		const generation = ++this.generation;
		this.pending = this.pending.then(async () => {
			if (this.disposed) { return; }
			const projects: ObjectProject[] = [];
			const boundaries = new Set<string>();
			if (vscode.workspace.isTrusted) {
				for (const folder of vscode.workspace.workspaceFolders ?? []) {
					if (folder.uri.scheme !== 'file') { continue; }
					const configs = await vscode.workspace.findFiles(new vscode.RelativePattern(folder, `**/${FILES.SUITECLOUD_CONFIG_JS}`), JSON_OBJECTS.DISCOVERY_EXCLUDE);
					const roots = new Set([folder.uri.fsPath, ...configs.map(config => path.dirname(config.fsPath))]);
					roots.forEach(root => boundaries.add(root));
					for (const root of [...roots].sort((a, b) => b.length - a.length)) {
						const settings = vscode.workspace.getConfiguration(JSON_OBJECTS.CONFIGURATION, vscode.Uri.file(root));
						if (!settings.get<boolean>(JSON_OBJECTS.ENABLED)) { continue; }
						try {
							const schemaUrl = settings.get<string>(JSON_OBJECTS.SCHEMA_URL) ?? '';
							if (new URL(schemaUrl).protocol !== 'https:') { throw new Error('The parent schema URL must use HTTPS.'); }
							for (const project of resolveProjects(root, schemaUrl)) {
								if (!projects.some(existing => existing.source === project.source)) { projects.push(project); }
							}
						} catch (error) { this.log(`JSON objects: ${root}: ${String(error)}`); }
					}
				}
			}
			if (generation !== this.generation || this.disposed) { return; }
			this.projects = projects;
			this.boundaries = [...boundaries];
			const content = Buffer.from(JSON.stringify({ schemas: associationsFor(projects, this.boundaries) }));
			if (force || !content.equals(this.content)) {
				this.content = content;
				this.modified = Date.now();
				this.changes.fire([{ type: vscode.FileChangeType.Changed, uri: this.uri }]);
			}
		}).catch(error => this.log(`JSON object discovery: ${String(error)}`));
		return this.pending;
	}

	watch(): vscode.Disposable { return new vscode.Disposable(() => undefined); }
	stat(uri: vscode.Uri): vscode.FileStat {
		this.checkUri(uri);
		return { type: vscode.FileType.File, ctime: 0, mtime: this.modified, size: this.content.length, permissions: vscode.FilePermission.Readonly };
	}
	readFile(uri: vscode.Uri): Uint8Array { this.checkUri(uri); return this.content; }
	readDirectory(): [string, vscode.FileType][] { return []; }
	writeFile(): never { throw vscode.FileSystemError.NoPermissions(); }
	delete(): never { throw vscode.FileSystemError.NoPermissions(); }
	rename(): never { throw vscode.FileSystemError.NoPermissions(); }
	createDirectory(): never { throw vscode.FileSystemError.NoPermissions(); }
	private checkUri(uri: vscode.Uri): void { if (uri.toString() !== this.uri.toString()) { throw vscode.FileSystemError.FileNotFound(uri); } }
	dispose(): void {
		this.disposed = true;
		this.generation++;
		if (this.timer) { clearTimeout(this.timer); }
		this.subscriptions.forEach(subscription => subscription.dispose());
		this.changes.dispose();
	}
}
