/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as assert from 'assert';
import ClineConfigChangeWatcher, {
	ClineConfigFileWatcher,
} from '../../service/controlPanel/devAssist/cline/ConfigChangeWatcher';

type ConfigEvent = 'change' | 'create' | 'delete';

class TestFileWatcher implements ClineConfigFileWatcher {
	private readonly _listeners: Record<ConfigEvent, Array<() => void>> = {
		change: [],
		create: [],
		delete: [],
	};
	private _disposed = false;

	onDidChange(listener: () => void) {
		return this._subscribe('change', listener);
	}

	onDidCreate(listener: () => void) {
		return this._subscribe('create', listener);
	}

	onDidDelete(listener: () => void) {
		return this._subscribe('delete', listener);
	}

	fire(event: ConfigEvent): void {
		for (const listener of this._listeners[event]) {
			listener();
		}
	}

	dispose(): void {
		this._disposed = true;
	}

	get disposed(): boolean {
		return this._disposed;
	}

	private _subscribe(event: ConfigEvent, listener: () => void) {
		this._listeners[event].push(listener);
		return {
			dispose: () => {
				this._listeners[event] = this._listeners[event].filter(
					(candidate) => candidate !== listener
				);
			},
		};
	}
}

suite('Cline Config Change Watcher', () => {
	test('coalesces Cline file changes into one compatibility refresh', async () => {
		const watchers: TestFileWatcher[] = [];
		let refreshCount = 0;
		const watcher = new ClineConfigChangeWatcher(
			['providers.json', 'globalState.json', 'secrets.json'],
			() => {
				const fileWatcher = new TestFileWatcher();
				watchers.push(fileWatcher);
				return fileWatcher;
			},
			() => refreshCount++,
			5
		);

		watchers[0].fire('change');
		watchers[1].fire('change');
		watchers[2].fire('create');
		await new Promise((resolve) => setTimeout(resolve, 20));

		assert.strictEqual(refreshCount, 1);
		watcher.dispose();
		assert.ok(watchers.every((fileWatcher) => fileWatcher.disposed));
	});

	test('cancels a pending refresh when disposed', async () => {
		let fileWatcher: TestFileWatcher | undefined;
		let refreshCount = 0;
		const watcher = new ClineConfigChangeWatcher(
			['providers.json'],
			() => (fileWatcher = new TestFileWatcher()),
			() => refreshCount++,
			5
		);

		fileWatcher?.fire('delete');
		watcher.dispose();
		await new Promise((resolve) => setTimeout(resolve, 20));

		assert.strictEqual(refreshCount, 0);
	});
});
