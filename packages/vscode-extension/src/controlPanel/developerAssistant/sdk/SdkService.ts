/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';
import { VSCODE_PLATFORM } from '../../../ApplicationConstants';
import { getSdkPath as resolveVsCodeSdkPath } from '../../../core/sdksetup/SdkProperties';
import { SuiteCloudAuthItem } from '../State';
import { ActionResult, AuthListData } from '../../../types/ActionResult';
import {
	ApplicationConstants,
	AuthenticationUtils,
	ExecutionEnvironmentContext,
} from '../../../util/ExtensionUtil';
import type { ExecutionEnvironmentContextInstance } from '../../../types/JavascriptNodeCli';
import { SUITECLOUD_PANEL_RUNTIME_STRINGS } from '../Strings';

export default class SdkService {
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
			throw new Error(
				authIdsActionResult.errorMessages?.join('\n') ||
					SUITECLOUD_PANEL_RUNTIME_STRINGS.errors.authIdsListFailed
			);
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
		await this._refreshAuthorization(authId, this._createExecutionEnvironmentContext());
	}

	async ensureAuthorizationReady(
		authId: string,
		onReauthorizationRequired: () => void
	): Promise<void> {
		const executionEnvironmentContext = this._createExecutionEnvironmentContext();
		const result = await AuthenticationUtils.checkIfReauthorizationIsNeeded(
			authId,
			resolveVsCodeSdkPath(),
			executionEnvironmentContext
		);
		if (!result.isSuccess()) {
			throw new Error(
				result.errorMessages?.join('\n') ||
					SUITECLOUD_PANEL_RUNTIME_STRINGS.errors.authCheckFailed(authId)
			);
		}

		const needsReauthorizationKey =
			ApplicationConstants.AUTHORIZATION_PROPERTIES_KEYS.NEEDS_REAUTHORIZATION;
		if (!result.data?.[needsReauthorizationKey]) {
			return;
		}

		onReauthorizationRequired();
		await this._refreshAuthorization(authId, executionEnvironmentContext);
	}

	private async _refreshAuthorization(
		authId: string,
		executionEnvironmentContext: ExecutionEnvironmentContextInstance
	): Promise<void> {
		const result = await AuthenticationUtils.refreshAuthorization(
			authId,
			resolveVsCodeSdkPath(),
			executionEnvironmentContext
		);
		if (!result.isSuccess()) {
			throw new Error(
				result.errorMessages?.join('\n') ||
					SUITECLOUD_PANEL_RUNTIME_STRINGS.errors.authRefreshFailed(authId)
			);
		}
	}

	private _createExecutionEnvironmentContext(): ExecutionEnvironmentContextInstance {
		return new ExecutionEnvironmentContext({
			platform: VSCODE_PLATFORM,
			platformVersion: vscode.version,
		});
	}
}
