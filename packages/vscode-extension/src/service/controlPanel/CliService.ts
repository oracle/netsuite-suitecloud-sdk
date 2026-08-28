/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';
import { DEVASSIST, VSCODE_PLATFORM } from '../../ApplicationConstants';
import { getSdkPath as resolveVsCodeSdkPath } from '../../core/sdksetup/SdkProperties';
import { SuiteCloudAuthItem } from '../../controlPanel/Types';
import { ActionResult, AuthListData } from '../../types/ActionResult';
import { AuthenticationUtils, ExecutionEnvironmentContext } from '../../util/ExtensionUtil';

const getDevAssistProxyIntegration = (): any => {
	try {
		return require('@oracle/suitecloud-cli/src/integration/DevAssistProxyIntegration');
	} catch {
		throw new Error('The bundled SuiteCloud CLI does not expose the Dev Assist proxy integration API.');
	}
};

export default class CliService {
	getSdkPath(): string {
		return resolveVsCodeSdkPath();
	}

	getBundledCliVersion(): string {
		try {
			const cliPackageJson = require('@oracle/suitecloud-cli/package.json');
			return typeof cliPackageJson?.version === 'string' ? cliPackageJson.version : 'unknown';
		} catch {
			return 'unknown';
		}
	}

	isProxyStartCommandSupported(): boolean {
		try {
			return getDevAssistProxyIntegration().isProxyStartSupported();
		} catch {
			return false;
		}
	}

	async getAvailableAuthIds(): Promise<SuiteCloudAuthItem[]> {
		const authIdsActionResult: ActionResult<AuthListData> = await AuthenticationUtils.getAuthIds(resolveVsCodeSdkPath());
		if (!authIdsActionResult.isSuccess()) {
			throw new Error(authIdsActionResult.errorMessages?.join('\n') || 'Unable to list configured auth IDs.');
		}

		return Object.keys(authIdsActionResult.data || {})
			.map((authId) => {
				const credentials = authIdsActionResult.data[authId];
				return {
					authId,
					companyName: credentials.accountInfo.companyName,
					roleName: credentials.accountInfo.roleName,
				};
			})
			.sort((left, right) => left.authId.localeCompare(right.authId));
	}

	getDefaultPanelSettings(): { authId: string; localPort: number } {
		return {
			authId: DEVASSIST.DEFAULT_VALUES.authID,
			localPort: DEVASSIST.DEFAULT_VALUES.localPort,
		};
	}

	async getProxyApiKeyFromSdkStorage(): Promise<string | undefined> {
		return getDevAssistProxyIntegration().readProxyApiKey(
			resolveVsCodeSdkPath(),
			this._createExecutionEnvironmentContext()
		);
	}

	async generateProxyApiKey(): Promise<string> {
		const result = await getDevAssistProxyIntegration().generateAndStoreProxyApiKey(
			resolveVsCodeSdkPath(),
			this._createExecutionEnvironmentContext()
		);
		if (!this._isSuccessfulSdkOperationResult(result.writeResult)) {
			throw new Error(
				`Unable to persist generated proxy API key: ${this._extractSdkWriteErrors(result.writeResult)}`
			);
		}
		if (!result.apiKey || typeof result.apiKey !== 'string') {
			throw new Error('Generated proxy API key is empty.');
		}
		return result.apiKey;
	}

	private _isSuccessfulSdkOperationResult(operationResult: any): boolean {
		const status = typeof operationResult?.status === 'string'
			? operationResult.status.toUpperCase()
			: '';
		return status === 'SUCCESS';
	}

	private _extractSdkWriteErrors(operationResult: any): string {
		if (Array.isArray(operationResult?.errorMessages) && operationResult.errorMessages.length > 0) {
			return operationResult.errorMessages.join('\n');
		}
		if (typeof operationResult?.resultMessage === 'string' && operationResult.resultMessage.trim()) {
			return operationResult.resultMessage.trim();
		}
		return 'Unknown write error.';
	}

	private _createExecutionEnvironmentContext() {
		return new ExecutionEnvironmentContext({
			platform: VSCODE_PLATFORM,
			platformVersion: vscode.version,
		});
	}
}
