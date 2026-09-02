/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { validateProxyStartInputs } from '../../../../controlPanel/devAssist/Configuration';
import { SUITECLOUD_PANEL_RUNTIME_STRINGS } from '../../../../controlPanel/devAssist/Strings';
import { SuiteCloudPanelState } from '../../../../controlPanel/devAssist/State';
import type { StartProxyInput } from './ProxyService';

export type ProxyRuntime = {
	readonly isRunning: boolean;
	start(input: StartProxyInput): Promise<void>;
	stop(): Promise<void>;
};

export type StartPanelProxyInput = {
	state: SuiteCloudPanelState;
	unconfiguredAuthId: string;
	isProxySupported: () => boolean;
	getCliVersion: () => string;
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
	authId: string;
	port: number;
};

export type StopPanelProxyResult = {
	proxyWasRunning: boolean;
	clearStartIntent: boolean;
};

export default class ProxyLifecycleService {
	private readonly _proxy: ProxyRuntime;

	constructor(proxy: ProxyRuntime) {
		this._proxy = proxy;
	}

	async start(input: StartPanelProxyInput): Promise<StartPanelProxyResult> {
		validateProxyStartInputs(input.state, input.unconfiguredAuthId);
		if (!input.isProxySupported()) {
			throw new Error(
				`The bundled @oracle/suitecloud-cli version (${input.getCliVersion()}) does not include the SuiteCloud proxy service. Upgrade the extension CLI dependency and reinstall.`
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

		await this._proxy.start({
			authId: startingState.authId,
			port: startingState.port,
			sdkPath: input.getSdkPath(),
			apiKey,
		});
		return { authId: startingState.authId, port: startingState.port };
	}

	async stop(input: StopPanelProxyInput): Promise<StopPanelProxyResult> {
		const clearStartIntent = !input.preserveStartIntent;
		if (!this._proxy.isRunning) {
			return {
				proxyWasRunning: false,
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
		await this._proxy.stop();

		return {
			proxyWasRunning: true,
			clearStartIntent,
		};
	}
}
