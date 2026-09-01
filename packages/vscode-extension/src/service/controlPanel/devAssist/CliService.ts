/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';
import { VSCODE_PLATFORM } from '../../../ApplicationConstants';
import { getSdkPath as resolveVsCodeSdkPath } from '../../../core/sdksetup/SdkProperties';
import { SuiteCloudAuthItem } from '../../../controlPanel/devAssist/State';
import { ActionResult, AuthListData } from '../../../types/ActionResult';
import { AuthenticationUtils, ExecutionEnvironmentContext } from '../../../util/ExtensionUtil';

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

	isProxyServiceSupported(): boolean {
		try {
			return typeof require(
				'@oracle/suitecloud-cli/src/services/SuiteCloudAuthProxyService'
			).SuiteCloudAuthProxyService === 'function';
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

	async refreshAuthorization(authId: string): Promise<void> {
		const result = await AuthenticationUtils.refreshAuthorization(
			authId,
			resolveVsCodeSdkPath(),
			this._createExecutionEnvironmentContext()
		);
		if (!result.isSuccess()) {
			throw new Error(
				result.errorMessages?.join('\n') || `Unable to refresh authorization for "${authId}".`
			);
		}
	}

	private _createExecutionEnvironmentContext() {
		return new ExecutionEnvironmentContext({
			platform: VSCODE_PLATFORM,
			platformVersion: vscode.version,
		});
	}
}
