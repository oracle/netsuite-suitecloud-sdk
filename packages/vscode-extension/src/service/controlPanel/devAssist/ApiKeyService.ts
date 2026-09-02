/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { SUITECLOUD_PANEL_RUNTIME_STRINGS } from '../../../controlPanel/devAssist/Strings';
import { ApiKeySource, SuiteCloudPanelState } from '../../../controlPanel/devAssist/State';

const API_KEY_PREVIEW_WINDOW_MS = 5 * 60 * 1000;
const API_KEY_EXISTS_HIDDEN_LABEL = SUITECLOUD_PANEL_RUNTIME_STRINGS.apiKey.hiddenExistingLabel;

type ApiKeyDisplayState = Pick<
	SuiteCloudPanelState,
	| 'apiKeySource'
	| 'maskedApiKey'
	| 'apiKeyVisible'
	| 'apiKeyVisibleUntilMs'
	| 'apiKeyExists'
	| 'apiKeyActionLabel'
	| 'apiKeyVisibilityInfo'
>;

export type ApiKeyResolution = {
	apiKey: string | undefined;
	displayState: ApiKeyDisplayState;
};

export type ApiKeyStorage = {
	getProxyApiKeyFromSdkStorage(): Promise<string | undefined>;
	generateProxyApiKey(): Promise<string>;
};

export default class ApiKeyService {
	private readonly _storage: ApiKeyStorage;
	private readonly _onPreviewExpired: (displayState: ApiKeyDisplayState) => void;
	private _source: Exclude<ApiKeySource, 'unknown'> = 'sdk';
	private _resolvedApiKey: string | undefined;
	private _generatedPreview: { apiKey: string; visibleUntilMs: number } | undefined;
	private _previewHideTimeout: ReturnType<typeof setTimeout> | undefined;

	constructor(
		storage: ApiKeyStorage,
		onPreviewExpired: (displayState: ApiKeyDisplayState) => void
	) {
		this._storage = storage;
		this._onPreviewExpired = onPreviewExpired;
	}

	get resolvedApiKey(): string | undefined {
		return this._resolvedApiKey;
	}

	async resolve(): Promise<ApiKeyResolution> {
		return this._resolve(true);
	}

	async resolveIgnoringReadErrors(): Promise<ApiKeyResolution> {
		return this._resolve(false);
	}

	private async _resolve(throwOnReadError: boolean): Promise<ApiKeyResolution> {
		this._clearExpiredPreview();

		let storedApiKey: string | undefined;
		try {
			storedApiKey = await this._storage.getProxyApiKeyFromSdkStorage();
		} catch (error) {
			if (throwOnReadError) {
				throw error;
			}
		}

		if (storedApiKey) {
			return this._setResolvedApiKey('sdk', storedApiKey, false);
		}
		return this._setMissingApiKey();
	}

	async generate(): Promise<ApiKeyResolution> {
		const apiKey = await this._storage.generateProxyApiKey();
		return this._setResolvedApiKey('generated', apiKey, true);
	}

	getCopyableApiKey(): string | undefined {
		this._clearExpiredPreview();
		return this._generatedPreview?.apiKey;
	}

	dispose(): void {
		this._clearPreviewHideTimeout();
		this._generatedPreview = undefined;
		this._resolvedApiKey = undefined;
	}

	private _setResolvedApiKey(
		source: Exclude<ApiKeySource, 'unknown'>,
		apiKey: string,
		reveal: boolean
	): ApiKeyResolution {
		this._source = source;
		this._resolvedApiKey = apiKey;

		if (reveal) {
			const visibleUntilMs = Date.now() + API_KEY_PREVIEW_WINDOW_MS;
			this._generatedPreview = { apiKey, visibleUntilMs };
			const displayState = this._createVisibleDisplayState(source, apiKey, visibleUntilMs);
			this._schedulePreviewHide();
			return { apiKey, displayState };
		}

		if (
			this._generatedPreview?.apiKey === apiKey &&
			Date.now() < this._generatedPreview.visibleUntilMs
		) {
			const displayState = this._createVisibleDisplayState(
				source,
				apiKey,
				this._generatedPreview.visibleUntilMs
			);
			this._schedulePreviewHide();
			return { apiKey, displayState };
		}

		return { apiKey, displayState: this._createHiddenDisplayState() };
	}

	private _setMissingApiKey(): ApiKeyResolution {
		this._clearPreviewHideTimeout();
		this._generatedPreview = undefined;
		this._resolvedApiKey = undefined;
		return {
			apiKey: undefined,
			displayState: {
				apiKeySource: 'unknown',
				maskedApiKey: SUITECLOUD_PANEL_RUNTIME_STRINGS.apiKey.notFoundLabel,
				apiKeyVisible: false,
				apiKeyVisibleUntilMs: null,
				apiKeyExists: false,
				apiKeyActionLabel: SUITECLOUD_PANEL_RUNTIME_STRINGS.apiKey.generateLabel,
				apiKeyVisibilityInfo: SUITECLOUD_PANEL_RUNTIME_STRINGS.apiKey.notFoundInfo,
			},
		};
	}

	private _createVisibleDisplayState(
		source: Exclude<ApiKeySource, 'unknown'>,
		apiKey: string,
		visibleUntilMs: number
	): ApiKeyDisplayState {
		return {
			apiKeySource: source,
			maskedApiKey: this._maskApiKey(apiKey),
			apiKeyVisible: true,
			apiKeyVisibleUntilMs: visibleUntilMs,
			apiKeyExists: true,
			apiKeyActionLabel: SUITECLOUD_PANEL_RUNTIME_STRINGS.apiKey.rotateLabel,
			apiKeyVisibilityInfo: `Available to copy for 5 minutes (until ${new Date(visibleUntilMs).toLocaleTimeString()}).`,
		};
	}

	private _createHiddenDisplayState(): ApiKeyDisplayState {
		return {
			apiKeySource: this._source,
			maskedApiKey: this._resolvedApiKey
				? this._maskApiKey(this._resolvedApiKey)
				: API_KEY_EXISTS_HIDDEN_LABEL,
			apiKeyVisible: false,
			apiKeyVisibleUntilMs: null,
			apiKeyExists: true,
			apiKeyActionLabel: SUITECLOUD_PANEL_RUNTIME_STRINGS.apiKey.rotateLabel,
			apiKeyVisibilityInfo: SUITECLOUD_PANEL_RUNTIME_STRINGS.apiKey.hiddenHint,
		};
	}

	private _maskApiKey(apiKey: string): string {
		return !apiKey || apiKey.length <= 4 ? '*' : `*${apiKey.slice(-4)}`;
	}

	private _clearExpiredPreview(): void {
		if (this._generatedPreview && Date.now() >= this._generatedPreview.visibleUntilMs) {
			this._generatedPreview = undefined;
			this._clearPreviewHideTimeout();
		}
	}

	private _clearPreviewHideTimeout(): void {
		if (this._previewHideTimeout) {
			clearTimeout(this._previewHideTimeout);
			this._previewHideTimeout = undefined;
		}
	}

	private _schedulePreviewHide(): void {
		this._clearPreviewHideTimeout();
		if (!this._generatedPreview) {
			return;
		}

		const delayMs = this._generatedPreview.visibleUntilMs - Date.now();
		if (delayMs <= 0) {
			this._generatedPreview = undefined;
			this._onPreviewExpired(this._createHiddenDisplayState());
			return;
		}

		this._previewHideTimeout = setTimeout(() => {
			this._generatedPreview = undefined;
			this._previewHideTimeout = undefined;
			this._onPreviewExpired(this._createHiddenDisplayState());
		}, delayMs);
	}
}
