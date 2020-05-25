/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
"use strict";
const BaseOutputHandler = require("../base/BaseOutputHandler");
const ActionResultUtils = require("../../utils/ActionResultUtils");

module.exports = class ManageAccountOutputFormatter extends BaseOutputHandler  {
   constructor(consoleLogger) {
      super(consoleLogger);
   }

   parse(actionResult) {
      if (actionResult.resultMessage) {
         ActionResultUtils.logResultMessage(actionResult, this.consoleLogger);
      }
      if (Array.isArray(actionResult.data)) {
         actionResult.data.forEach((message) => this.consoleLogger.result(message));
      }
      return actionResult;
   }
}
