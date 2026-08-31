/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { validateProxyStartInputs } from '../../../../controlPanel/devAssist/Configuration';
import { SUITECLOUD_PANEL_RUNTIME_STRINGS } from '../../../../controlPanel/devAssist/Strings';
import { SuiteCloudPanelState } from '../../../../controlPanel/devAssist/State';
import type { StartProxyInput } from './ProxyProcessService';

export type ProxyProcess = {
	readonly isRunning: boolean;
	start(input: StartProxyInput): Promise<number>;
	stop(): Promise<void>;
};

export type StartPanelProxyInput = {
	state: SuiteCloudPanelState;
	unconfiguredAuthId: string;
	isCommandSupported: () => boolean;
	getCliVersion: () => string;
	getWorkspacePath: () => string;
	getSdkPath: () => string;
	resolveApiKey: () => Promise<string | undefined>;
	onStarting: (state: SuiteCloudPanelState) => void;
};

export type StopPanelProxyInput = {
	state: SuiteCloudPanelState;
	preserveStartIntent: boolean;
	onStopping: (state: SuiteCloudPanelState) => Promise<void>;
};

export type StartPanelProxyResult = {
	pid: number;
	authId: string;
	port: number;
};

export type StopPanelProxyResult = {
	processWasRunning: boolean;
	clearStartIntent: boolean;
};

export default class ProxyLifecycleService {
	private readonly _process: ProxyProcess;

	constructor(process: ProxyProcess) {
		this._process = process;
	}

	async start(input: StartPanelProxyInput): Promise<StartPanelProxyResult> {
		validateProxyStartInputs(input.state, input.unconfiguredAuthId);
		if (!input.isCommandSupported()) {
			throw new Error(
				`The bundled @oracle/suitecloud-cli version (${input.getCliVersion()}) does not support "proxy:start". Upgrade the extension CLI dependency and reinstall.`
			);
		}

		const startingState: SuiteCloudPanelState = {
			...input.state,
			proxyStatus: 'starting',
			lastError: null,
		};
		input.onStarting(startingState);

		const apiKey = await input.resolveApiKey();
		if (!apiKey) {
			throw new Error(SUITECLOUD_PANEL_RUNTIME_STRINGS.errors.unableResolveApiKeyForStart);
		}

		const pid = await this._process.start({
			authId: startingState.authId,
			port: startingState.port,
			cwd: input.getWorkspacePath(),
			sdkPath: input.getSdkPath(),
		});
		return { pid, authId: startingState.authId, port: startingState.port };
	}

	async stop(input: StopPanelProxyInput): Promise<StopPanelProxyResult> {
		const clearStartIntent = !input.preserveStartIntent;
		if (!this._process.isRunning) {
			return {
				processWasRunning: false,
				clearStartIntent,
			};
		}

		const stoppingState: SuiteCloudPanelState = {
			...input.state,
			autoStartProxyOnStartup: clearStartIntent
				? false
				: input.state.autoStartProxyOnStartup,
			proxyStatus: 'stopping',
		};
		await input.onStopping(stoppingState);
		await this._process.stop();

		return {
			processWasRunning: true,
			clearStartIntent,
		};
	}
}
