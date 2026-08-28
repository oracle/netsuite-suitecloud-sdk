/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as assert from 'assert';
import * as http from 'http';
import { ChildProcess, spawn } from 'child_process';
import { EventEmitter } from 'events';
import ProxyOutputProcessor from '../../service/controlPanel/ProxyOutputProcessor';
import ProxyProcessService from '../../service/controlPanel/ProxyProcessService';

const listen = async (): Promise<{ server: http.Server; port: number }> => {
	const server = http.createServer((_request, response) => response.end());
	await new Promise<void>((resolve, reject) => {
		server.once('error', reject);
		server.listen(0, '127.0.0.1', resolve);
	});
	const address = server.address();
	if (!address || typeof address === 'string') {
		throw new Error('Test identity server did not expose a TCP port.');
	}
	return { server, port: address.port };
};

const close = (server: http.Server): Promise<void> =>
	new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));

const getAvailablePort = async (): Promise<number> => {
	const listener = await listen();
	await close(listener.server);
	return listener.port;
};

const createFailedChildProcess = (error: Error): ChildProcess => {
	const childProcess = new EventEmitter() as ChildProcess;
	Object.assign(childProcess, {
		killed: false,
		kill: () => false,
	});
	process.nextTick(() => {
		childProcess.emit('error', error);
		childProcess.emit('close', null, null);
	});
	return childProcess;
};

suite('Control Panel Proxy Process Service', () => {
	const service = new ProxyProcessService({
		onLog: () => undefined,
		onProcessClosed: () => undefined,
	});
	const servers: http.Server[] = [];

	teardown(async () => {
		await Promise.all(servers.splice(0).map(close));
	});

	test('declares an owned process ready after it binds the requested loopback port', async () => {
		const listener = await listen();
		servers.push(listener.server);
		const fakeProcess = { pid: 1234, killed: false } as unknown as ChildProcess;
		const serviceInternals = service as any;
		serviceInternals._process = fakeProcess;

		await serviceInternals._waitForReadiness(listener.port, fakeProcess);
	});

	test('reports a synchronous spawn failure and keeps the service stopped', async () => {
		const spawnFailure = Object.assign(new Error('spawn EACCES'), { code: 'EACCES' });
		const spawnProcess = (() => {
			throw spawnFailure;
		}) as unknown as typeof spawn;
		const processService = new ProxyProcessService({
			onLog: () => undefined,
			onProcessClosed: () => assert.fail('A process that was not spawned cannot close.'),
		}, spawnProcess);

		await assert.rejects(
			processService.start({
				authId: 'test-auth-id',
				port: await getAvailablePort(),
				cwd: process.cwd(),
				sdkPath: process.execPath,
			}),
			/Unable to start SuiteCloud proxy process: spawn EACCES/
		);
		assert.strictEqual(processService.isRunning, false);
	});

	test('handles an emitted spawn error without reporting a process close', async () => {
		let processClosed = false;
		let spawnedEnvironment: NodeJS.ProcessEnv | undefined;
		const spawnProcess = ((_command: string, _args: readonly string[], options: { env?: NodeJS.ProcessEnv }) => {
			spawnedEnvironment = options.env;
			return createFailedChildProcess(Object.assign(new Error('spawn ENOENT'), { code: 'ENOENT' }));
		}) as unknown as typeof spawn;
		const processService = new ProxyProcessService({
			onLog: () => undefined,
			onProcessClosed: () => {
				processClosed = true;
			},
		}, spawnProcess);

		const sdkPath = process.execPath;
		await assert.rejects(
			processService.start({
				authId: 'test-auth-id',
				port: await getAvailablePort(),
				cwd: process.cwd(),
				sdkPath,
			}),
			/Unable to start SuiteCloud proxy process: spawn ENOENT/
		);
		assert.strictEqual(processService.isRunning, false);
		assert.strictEqual(processClosed, false);
		const { resolveCliSdkPath } = require(
			'@oracle/suitecloud-cli/src/integration/DevAssistProxyIntegration'
		);
		assert.strictEqual(resolveCliSdkPath('proxy:start', '/default/cli.jar', spawnedEnvironment), sdkPath);
	});

	test('reports process closure when a child process errors after startup', async () => {
		let processClosed = false;
		const childProcess = new EventEmitter() as ChildProcess;
		Object.assign(childProcess, { pid: 1234, killed: false });
		const processService = new ProxyProcessService({
			onLog: () => undefined,
			onProcessClosed: () => {
				processClosed = true;
			},
		});
		const serviceInternals = processService as any;
		serviceInternals._process = childProcess;
		const processError = serviceInternals._createSpawnFailurePromise(childProcess);
		serviceInternals._wireProcessOutput(childProcess);

		childProcess.emit('error', new Error('late child-process failure'));
		childProcess.emit('close', 1, null);

		await assert.rejects(processError, /late child-process failure/);
		assert.strictEqual(processService.isRunning, false);
		assert.strictEqual(processClosed, true);
	});

	test('preserves one intentional blank line in proxy output', () => {
		const messages: string[] = [];
		const outputProcessor = new ProxyOutputProcessor((line) => messages.push(line));

		outputProcessor.append('stdout', 'Proxy started.\n\n\nConnection settings:\n');

		assert.deepStrictEqual(messages, [
			'Proxy started.',
			'',
			'Connection settings:',
		]);
	});

	test('replaces CLI usage guidance without suppressing later proxy output', () => {
		const messages: string[] = [];
		const outputProcessor = new ProxyOutputProcessor((line) => messages.push(line));
		const output = [
			'Proxy started.',
			'',
			'To use it on this machine, configure your third-party tool as follows:',
			'  * API Provider: OpenAI Compatible',
			'  * API Key: Paste the API key generated by "suitecloud proxy:generatekey"',
			'',
			'Press Ctrl+C to stop the proxy.',
			'',
			'Proxy request accepted.',
			'',
		].join('\n');

		outputProcessor.append('stdout', output);

		assert.deepStrictEqual(messages, [
			'Proxy started.',
			'',
			'Proxy request accepted.',
		]);
	});

	test('preserves partial lines across output chunks', () => {
		const messages: string[] = [];
		const outputProcessor = new ProxyOutputProcessor((line) => messages.push(line));

		outputProcessor.append('stdout', 'Proxy start');
		outputProcessor.append('stdout', 'ed.\nListening');
		assert.deepStrictEqual(messages, ['Proxy started.']);

		outputProcessor.flush('stdout', true);
		assert.deepStrictEqual(messages, ['Proxy started.', 'Listening']);
	});

	test('sanitizes terminal control sequences while retaining diagnostic output', () => {
		const messages: Array<{ line: string; isError?: boolean }> = [];
		const outputProcessor = new ProxyOutputProcessor((line, isError) => {
			messages.push({ line, isError });
		});

		outputProcessor.append('stderr', '\u001b[31mProxy failed\u001b[0m\n');

		assert.deepStrictEqual(messages, [{ line: 'Proxy failed', isError: true }]);
		assert.strictEqual(outputProcessor.getDiagnosticDetails(), 'stderr: Proxy failed');
	});

});
