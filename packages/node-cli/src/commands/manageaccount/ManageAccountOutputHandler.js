/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
"use strict";
const BaseOutputHandler = require("../base/BaseOutputHandler");
const ActionResultUtils = require("../../utils/ActionResultUtils");
const NodeTranslationService = require("../../services/NodeTranslationService");

module.exports = class ManageAccountOutputFormatter extends BaseOutputHandler  {
   constructor(consoleLogger) {
      super(consoleLogger);
   }

   parse(actionResult) {
      if (actionResult.resultMessage) {
         ActionResultUtils.logResultMessage(actionResult, this.consoleLogger);
      } else if (Array.isArray(actionResult.data)) {
         actionResult.data.forEach((message) => this.consoleLogger.result(message));
      } else if (actionResult.data && actionResult.data.accountInfo) {
         this.logAccountCredentials(actionResult.data, true);
      } else if (actionResult.data) {
         Object.keys(actionResult.data).forEach((authId) =>
            this.consoleLogger.result(this.accountCredentialToString(authId, actionResult.data[authId]))
         );
      }
		return actionResult;
   }

   accountCredentialToString(authID, accountCredential) {
      const isDevLabel = accountCredential.developmentMode
         ? NodeTranslationService.getMessage(
              QUESTIONS_CHOICES.SELECT_AUTHID.EXISTING_AUTH_ID_DEV_URL,
              accountCredential.urls.app
           )
         : "";
      const accountInfo = `${accountCredential.accountInfo.roleName} @ ${accountCredential.accountInfo.companyName}`;
      const accountCredentialString = NodeTranslationService.getMessage(
         QUESTIONS_CHOICES.SELECT_AUTHID.EXISTING_AUTH_ID,
         authID,
         accountInfo,
         isDevLabel
      );
      return accountCredentialString;
   }

   logAccountCredentials(accountCredentials, isResult) {
      const log = isResult ? this.consoleLogger.result.bind(this.consoleLogger) : this.consoleLogger.info.bind(this.consoleLogger);
      const accountInfo = accountCredentials.accountInfo;

      log(NodeTranslationService.getMessage(MESSAGES.ACCOUNT_INFO.AUTHID, accountCredentials.authId));
      log(NodeTranslationService.getMessage(MESSAGES.ACCOUNT_INFO.ACCOUNT_NAME, accountInfo.companyName));
      log(NodeTranslationService.getMessage(MESSAGES.ACCOUNT_INFO.ACCOUNT_ID, accountInfo.companyId));
      log(NodeTranslationService.getMessage(MESSAGES.ACCOUNT_INFO.ROLE, accountInfo.roleName));
      log(NodeTranslationService.getMessage(MESSAGES.ACCOUNT_INFO.DOMAIN, accountCredentials.domain));
      log(
         NodeTranslationService.getMessage(
            MESSAGES.ACCOUNT_INFO.ACCOUNT_TYPE,
            this._getAccountType(accountInfo.companyId)
         )
      );
   }

   _getAccountType(accountId) {
      if (accountId.match(SANDBOX_ACCOUNT_ID_REGEX_PATTERN)) {
         return NodeTranslationService.getMessage(ACCOUNT_TYPE.SANDBOX);
      } else if (accountId.match(RELEASE_PREVIEW_ACCOUNT_ID_REGEX_PATTERN)) {
         return NodeTranslationService.getMessage(ACCOUNT_TYPE.RELEASE_PREVIEW);
      }
      return NodeTranslationService.getMessage(ACCOUNT_TYPE.PRODUCTION);
   }
}
