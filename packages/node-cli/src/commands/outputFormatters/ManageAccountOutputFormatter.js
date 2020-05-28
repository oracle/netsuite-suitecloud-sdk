/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
"use strict";
const OutputFormatter = require("./OutputFormatter");
const ActionResultUtils = require("../../utils/ActionResultUtils");
const AccountCredentialsService = require("../../services/AccountCredentialsService");

const ACTION = {
   LIST: "list",
   EXIT: "exit",
   INFO: "info",
   RENAME: "rename",
   REMOVE: "remove",
   REVOKE: "revoke",
};

class ManageAccountOutputFormatter extends OutputFormatter {
   constructor(consoleLogger) {
      super(consoleLogger);
      this._accountCredentialsService = new AccountCredentialsService();
   }

   formatActionResult(actionResult) {
      if (actionResult.resultMessage) {
         ActionResultUtils.logResultMessage(actionResult, this.consoleLogger);
      }

      if (actionResult.actionExecuted == ACTION.INFO) {
         // actionResult.data.forEach((message) => this.consoleLogger.result(message));
         this.consoleLogger.result(this._accountCredentialsService.buildAccountCredentialsInfo(actionResult.data));
      } else if (actionResult.actionExecuted == ACTION.LIST) {
         Object.keys(actionResult.data).forEach((authId) =>
            this.consoleLogger.result(
               this._accountCredentialsService.accountCredentialToString(authId, actionResult.data[authId])
            )
         );
      }
   }
}

module.exports = ManageAccountOutputFormatter;
