/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import { JsonObject } from './IntegrationTypes';

const POSIX_SECRET_FILE_MODE = 0o600;
const PLATFORM_IS_POSIX = process.platform !== 'win32';
const MISSING_FILE_REVISION = 'missing';

export type ClineJsonFileSnapshot = {
	data: JsonObject | null;
	revision: string;
};

export default class ClineFileStore {
	private readonly _dataDirectory: string;
	private readonly _globalStateFile: string;
	private readonly _secretsFile: string;
	private readonly _legacyWorkspaceStateFile: string;
	private readonly _providersFile: string;
	private readonly _sensitiveFiles: ReadonlySet<string>;

	constructor(dataDirectory: string = path.join(os.homedir(), '.cline', 'data')) {
		this._dataDirectory = dataDirectory;
		this._globalStateFile = path.join(this._dataDirectory, 'globalState.json');
		this._secretsFile = path.join(this._dataDirectory, 'secrets.json');
		this._legacyWorkspaceStateFile = path.join(this._dataDirectory, 'workspace', 'workspaceState.json');
		this._providersFile = path.join(this._dataDirectory, 'settings', 'providers.json');
		this._sensitiveFiles = new Set([path.resolve(this._secretsFile), path.resolve(this._providersFile)]);
	}

	get dataDirectory(): string {
		return this._dataDirectory;
	}

	get globalStateFile(): string {
		return this._globalStateFile;
	}

	get secretsFile(): string {
		return this._secretsFile;
	}

	get legacyWorkspaceStateFile(): string {
		return this._legacyWorkspaceStateFile;
	}

	get providersFile(): string {
		return this._providersFile;
	}

	async exists(filePath: string): Promise<boolean> {
		try {
			await fs.access(filePath);
			return true;
		} catch {
			return false;
		}
	}

	existsSync(filePath: string): boolean {
		try {
			fsSync.accessSync(filePath);
			return true;
		} catch {
			return false;
		}
	}

	async readJsonFile(filePath: string): Promise<JsonObject | null> {
		try {
			return (await this.readJsonFileSnapshot(filePath)).data;
		} catch {
			return null;
		}
	}

	async readJsonFileSnapshot(filePath: string): Promise<ClineJsonFileSnapshot> {
		let raw: string;
		try {
			raw = await fs.readFile(filePath, 'utf8');
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
				return { data: null, revision: MISSING_FILE_REVISION };
			}
			throw error;
		}

		const parsed = JSON.parse(raw);
		if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
			throw new Error(`Cline configuration file is not a JSON object: ${filePath}`);
		}
		return {
			data: parsed,
			revision: this._calculateRevision(raw),
		};
	}

	async writeJsonFile(
		filePath: string,
		data: JsonObject,
		expectedRevision?: string
	): Promise<string> {
		const directory = path.dirname(filePath);
		await fs.mkdir(directory, { recursive: true });
		if (expectedRevision !== undefined) {
			const currentRevision = await this._readRevision(filePath);
			if (currentRevision !== expectedRevision) {
				throw new Error(
					`Cline configuration changed while SuiteCloud was preparing the update: ${path.basename(filePath)}. Retry the operation.`
				);
			}
		}

		const temporaryPath = `${filePath}.tmp.${crypto.randomUUID()}`;
		const mode = this._resolveFileMode(filePath);
		const serializedData = JSON.stringify(data, null, 2);
		try {
			await fs.writeFile(temporaryPath, serializedData, {
				encoding: 'utf8',
				...(mode ? { mode } : {}),
			});
			await fs.rename(temporaryPath, filePath);
		} catch (error) {
			try {
				await fs.unlink(temporaryPath);
			} catch {
				// best-effort temporary file cleanup
			}
			throw error;
		}
		if (mode) {
			try {
				await fs.chmod(filePath, mode);
			} catch {
				// best-effort hardening only
			}
		}
		return this._calculateRevision(serializedData);
	}

	async createBackup(originalPath: string): Promise<string> {
		const backupPath = `${originalPath}.bak.${crypto.randomUUID()}`;
		await fs.copyFile(originalPath, backupPath);
		const mode = this._resolveFileMode(originalPath);
		if (mode) {
			try {
				await fs.chmod(backupPath, mode);
			} catch {
				// best-effort hardening only
			}
		}
		return backupPath;
	}

	async restoreFromBackups(
		backupPaths: string[],
		writtenRevisions?: ReadonlyMap<string, string>
	): Promise<void> {
		const sortedBackups = backupPaths.slice().sort();
		for (const backupPath of sortedBackups) {
			const originalPath = backupPath.replace(/\.bak\.[^.]+$/, '');
			if (
				writtenRevisions &&
				(
					!writtenRevisions.has(originalPath) ||
					await this._readRevision(originalPath) !== writtenRevisions.get(originalPath)
				)
			) {
				continue;
			}
			try {
				await fs.copyFile(backupPath, originalPath);
			} catch {
				// best effort rollback only
			}
		}
	}

	async cleanupBackups(backupPaths: string[]): Promise<void> {
		for (const backupPath of backupPaths) {
			try {
				await fs.unlink(backupPath);
			} catch {
				// best-effort cleanup only
			}
		}
	}

	async removeFiles(
		filePaths: string[],
		writtenRevisions?: ReadonlyMap<string, string>
	): Promise<void> {
		for (const filePath of filePaths) {
			if (
				writtenRevisions &&
				(
					!writtenRevisions.has(filePath) ||
					await this._readRevision(filePath) !== writtenRevisions.get(filePath)
				)
			) {
				continue;
			}
			try {
				await fs.unlink(filePath);
			} catch {
				// best-effort rollback only
			}
		}
	}

	getWorkspaceStatePath(workspacePath: string): string {
		if (workspacePath) {
			const discoveredPath = this._findWorkspaceStatePathForWorkspaceRoot(workspacePath);
			if (discoveredPath) {
				return discoveredPath;
			}
		}

		if (this.existsSync(this._legacyWorkspaceStateFile)) {
			return this._legacyWorkspaceStateFile;
		}

		const hash = this._workspaceHash(workspacePath || process.cwd());
		return path.join(this._dataDirectory, 'workspaces', hash, 'workspaceState.json');
	}

	private _workspaceHash(workspacePath: string): string {
		let hash = 0;
		for (let index = 0; index < workspacePath.length; index++) {
			const charCode = workspacePath.charCodeAt(index);
			hash = (hash << 5) - hash + charCode;
			hash |= 0;
		}
		return Math.abs(hash).toString(16).substring(0, 8);
	}

	private _findWorkspaceStatePathForWorkspaceRoot(workspacePath: string): string | undefined {
		const workspaceRoots = this._readWorkspaceRootsFromGlobalState();
		if (!workspaceRoots || workspaceRoots.length === 0) {
			return undefined;
		}

		const normalizedInputPath = path.resolve(workspacePath);
		const match = workspaceRoots.find((root: any) => {
			const candidatePath = typeof root?.path === 'string' ? path.resolve(root.path) : '';
			return candidatePath && candidatePath === normalizedInputPath;
		});
		if (!match) {
			return undefined;
		}

		const targetName = typeof match.name === 'string' ? match.name : path.basename(normalizedInputPath);
		const workspacesDirectory = path.join(this._dataDirectory, 'workspaces');
		try {
			const folders = fsSync.readdirSync(workspacesDirectory);
			for (const folder of folders) {
				const workspaceStatePath = path.join(workspacesDirectory, folder, 'workspaceState.json');
				if (!this.existsSync(workspaceStatePath)) {
					continue;
				}
				const raw = fsSync.readFileSync(workspaceStatePath, 'utf8');
				const json = JSON.parse(raw);
				if (json?.workspaceFolderName === targetName) {
					return workspaceStatePath;
				}
			}
		} catch {
			return undefined;
		}

		return undefined;
	}

	private _readWorkspaceRootsFromGlobalState(): any[] | undefined {
		try {
			if (!this.existsSync(this._globalStateFile)) {
				return undefined;
			}
			const raw = fsSync.readFileSync(this._globalStateFile, 'utf8');
			const globalState = JSON.parse(raw);
			if (Array.isArray(globalState?.workspaceRoots)) {
				return globalState.workspaceRoots;
			}
			return undefined;
		} catch {
			return undefined;
		}
	}

	private _resolveFileMode(filePath: string): number | undefined {
		if (!PLATFORM_IS_POSIX) {
			return undefined;
		}
		const resolvedPath = path.resolve(filePath);
		if (!this._sensitiveFiles.has(resolvedPath)) {
			return undefined;
		}
		return POSIX_SECRET_FILE_MODE;
	}

	private async _readRevision(filePath: string): Promise<string> {
		try {
			return this._calculateRevision(await fs.readFile(filePath, 'utf8'));
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
				return MISSING_FILE_REVISION;
			}
			throw error;
		}
	}

	private _calculateRevision(raw: string): string {
		return crypto.createHash('sha256').update(raw, 'utf8').digest('hex');
	}
}
