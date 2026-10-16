/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

type Disposable = {
	dispose(): void;
};

export type ClineConfigFileWatcher = Disposable & {
	onDidChange(listener: () => void): Disposable;
	onDidCreate(listener: () => void): Disposable;
	onDidDelete(listener: () => void): Disposable;
};

export type CreateClineConfigFileWatcher = (filePath: string) => ClineConfigFileWatcher;

const DEFAULT_REFRESH_DELAY_MS = 300;

export default class ClineConfigChangeWatcher implements Disposable {
	private readonly _disposables: Disposable[] = [];
	private _refreshTimeout: ReturnType<typeof setTimeout> | undefined;

	constructor(
		filePaths: readonly string[],
		createWatcher: CreateClineConfigFileWatcher,
		private readonly _onConfigChanged: () => void,
		private readonly _refreshDelayMs = DEFAULT_REFRESH_DELAY_MS
	) {
		for (const filePath of filePaths) {
			const watcher = createWatcher(filePath);
			this._disposables.push(
				watcher,
				watcher.onDidChange(() => this._scheduleRefresh()),
				watcher.onDidCreate(() => this._scheduleRefresh()),
				watcher.onDidDelete(() => this._scheduleRefresh())
			);
		}
	}

	dispose(): void {
		if (this._refreshTimeout) {
			clearTimeout(this._refreshTimeout);
			this._refreshTimeout = undefined;
		}
		for (const disposable of this._disposables) {
			disposable.dispose();
		}
		this._disposables.length = 0;
	}

	private _scheduleRefresh(): void {
		if (this._refreshTimeout) {
			clearTimeout(this._refreshTimeout);
		}
		this._refreshTimeout = setTimeout(() => {
			this._refreshTimeout = undefined;
			this._onConfigChanged();
		}, this._refreshDelayMs);
	}
}
