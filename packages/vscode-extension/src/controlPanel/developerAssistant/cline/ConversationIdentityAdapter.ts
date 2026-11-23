/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { randomUUID } from 'node:crypto';
import { constants } from 'node:fs';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { SUITECLOUD_PANEL_RUNTIME_STRINGS } from '../Strings';

const ADAPTER_NAME = 'suitecloud-conversation-identity.js';
const ADAPTER_SOURCE = path.resolve(__dirname, '../../../../resources/cline', ADAPTER_NAME);

function hasErrorCode(error: unknown, code: string): boolean {
	return error !== null && typeof error === 'object' && 'code' in error && error.code === code;
}

function collision(filePath: string): Error {
	return new Error(SUITECLOUD_PANEL_RUNTIME_STRINGS.errors.clineConfigChanged(path.basename(filePath)));
}

async function ensureDirectory(directory: string): Promise<void> {
	try {
		await fs.mkdir(directory);
	} catch (error) {
		if (!hasErrorCode(error, 'EEXIST')) {
			throw error;
		}
	}
	if (!(await fs.lstat(directory)).isDirectory()) {
		throw collision(directory);
	}
}

export async function installClineConversationIdentityAdapter(workspacePath: string): Promise<void> {
	const adapter = await fs.readFile(ADAPTER_SOURCE);
	const clineDirectory = path.join(await fs.realpath(workspacePath), '.cline');
	const pluginsDirectory = path.join(clineDirectory, 'plugins');
	await ensureDirectory(clineDirectory);
	await ensureDirectory(pluginsDirectory);

	const destination = path.join(pluginsDirectory, ADAPTER_NAME);
	const stagingPath = `${destination}.${randomUUID()}.tmp`;
	await fs.writeFile(stagingPath, adapter, { flag: 'wx' });
	try {
		await fs.link(stagingPath, destination);
	} catch (error) {
		if (!hasErrorCode(error, 'EEXIST')) {
			throw error;
		}
		if (!(await fs.lstat(destination)).isFile()) {
			throw collision(destination);
		}
		const existing = await fs.open(destination, constants.O_RDONLY | constants.O_NOFOLLOW);
		try {
			if (!(await existing.readFile()).equals(adapter)) {
				throw collision(destination);
			}
		} finally {
			await existing.close();
		}
	} finally {
		await fs.unlink(stagingPath);
	}
}
