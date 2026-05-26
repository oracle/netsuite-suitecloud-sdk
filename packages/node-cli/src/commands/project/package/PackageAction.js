/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const BaseAction = require('../../base/BaseAction');
const { executeWithSpinner } = require('../../../ui/CliSpinner');
const CommandUtils = require('../../../utils/CommandUtils');
const { ActionResult } = require('../../../services/actionresult/ActionResult');
const NodeTranslationService = require('../../../services/NodeTranslationService');
const AccountSpecificValuesUtils = require('../../../utils/AccountSpecificValuesUtils');
const { COMMAND_PACKAGE } = require('../../../services/TranslationKeys');
const {
	preparePackageParams,
	executePackageCommand,
} = require('@oracle/suitecloud-sdk-core/commands/project/package/PackageHandler');

module.exports = class PackageAction extends BaseAction {
	preExecute(params) {
		AccountSpecificValuesUtils.validate(params, this._projectFolder);

		return {
			...preparePackageParams(params, this._executionPath, this._projectFolder),
			...AccountSpecificValuesUtils.transformArgument(params),
		};
	}

	async execute(params) {
		const sdkParams = CommandUtils.extractCommandOptions(params, this._commandMetadata);

		await this._log.warning(NodeTranslationService.getMessage(COMMAND_PACKAGE.LOCAL_VALIDATION_NOT_EXECUTED));

		const operationResult = await executeWithSpinner({
			action: executePackageCommand({
				projectFolder: unquote(sdkParams.project),
				destinationFolder: unquote(sdkParams.destination),
			}),
			message: NodeTranslationService.getMessage(COMMAND_PACKAGE.PACKAGING),
		});
		return operationResult.status === 'SUCCESS'
			? ActionResult.Builder.withData(operationResult.data).withResultMessage(operationResult.resultMessage).build()
			: ActionResult.Builder.withErrors(operationResult.errorMessages).build();
	}
};

function unquote(value) {
	if (typeof value === 'string' && value.length > 1 && value.startsWith('"') && value.endsWith('"')) {
		return value.slice(1, -1);
	}
	return value;
}
