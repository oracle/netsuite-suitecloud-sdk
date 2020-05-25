/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
"use strict";

const BaseAction = require('../base/BaseAction');
const SdkExecutionContext = require("../../SdkExecutionContext");
const { executeWithSpinner } = require("../../ui/CliSpinner");
const SdkOperationResultUtils = require("../../utils/SdkOperationResultUtils");
const CommandUtils = require("../../utils/CommandUtils");
const NodeTranslationService = require("../../services/NodeTranslationService");
const { ManageAccountActionResult } = require("../../services/actionresult/ManageAccountActionResult");
const { COMMAND_MANAGE_ACCOUNT } = require("../../services/TranslationKeys");


module.exports = class ManageAccountAction extends BaseAction {
   constructor(options) {
      super(options);
   }

   async execute(params) {
      const sdkParams = CommandUtils.extractCommandOptions(params, this._commandMetadata);

      const executionContext = SdkExecutionContext.Builder.forCommand(this._commandMetadata.sdkCommand)
			.integration()
         .addParams(sdkParams)
         .build();

      const operationResult = await executeWithSpinner({
         action: this._sdkExecutor.execute(executionContext),
         message: NodeTranslationService.getMessage(COMMAND_MANAGE_ACCOUNT.MESSAGES.UPDATING_CREDENTIALS),
      });

      return operationResult.status === SdkOperationResultUtils.STATUS.SUCCESS
         ? ManageAccountActionResult.Builder.withData(operationResult.data)
              .withResultMessage(operationResult.resultMessage)
              .build()
         : ManageAccountActionResult.Builder.withErrors(
              SdkOperationResultUtils.collectErrorMessages(operationResult)
           ).build();
   }
};
