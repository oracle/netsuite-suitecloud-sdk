/*
 ** Copyright (c) 2026 Oracle and/or its affiliates. All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import * as assert from 'assert';
import * as childProcess from 'child_process';
import { EventEmitter } from 'events';
import { PassThrough } from 'stream';
import { validateSdk } from '../../core/sdksetup/SdkValidator';
import { EnvironmentInformationService } from '../../util/ExtensionUtil';

const originalSpawn = childProcess.spawn;
suite('SDK Java compatibility', () => {
	teardown(() => { (childProcess as any).spawn = originalSpawn; });

	for (const version of ['17.0.12', '21.0.7', '25.0.5.0.3']) {
		test(`bundles a CLI supporting Java ${version}`, () => {
			assert.strictEqual(new EnvironmentInformationService().isJavaVersionSupported(version), true);
		});
	}

	function mockProcess(finish: (process: EventEmitter & { stderr: PassThrough }) => void) {
		(childProcess as any).spawn = (command: string, args: string[], options: object) => {
			assert.strictEqual(command, 'java');
			assert.deepStrictEqual(options, { shell: false });
			assert.deepStrictEqual(args, [
				'-DintegrationMode',
				'--add-opens',
				'java.base/java.io=ALL-UNNAMED',
				`-DclientPlatformVersion=${process.versions.node}`,
				'-jar',
				'C:/SDK with spaces/sdk.jar',
			]);
			const sdkProcess = Object.assign(new EventEmitter(), { stdout: new PassThrough(), stderr: new PassThrough() });
			setImmediate(() => finish(sdkProcess));
			return sdkProcess;
		};
	}

	test('accepts successful startup with JVM warnings', async () => {
		mockProcess(process => { process.stderr.write('WARNING: deprecated API'); process.emit('close', 0); });
		assert.strictEqual(await validateSdk('C:/SDK with spaces/sdk.jar'), true);
	});

	test('rejects SDK failures', async () => {
		mockProcess(process => process.emit('close', 1));
		assert.strictEqual(await validateSdk('C:/SDK with spaces/sdk.jar'), false);
	});

	test('settles when Java cannot start', async () => {
		mockProcess(process => { process.emit('error', new Error('ENOENT')); process.emit('close', -1); });
		assert.strictEqual(await validateSdk('C:/SDK with spaces/sdk.jar'), false);
	});
});
