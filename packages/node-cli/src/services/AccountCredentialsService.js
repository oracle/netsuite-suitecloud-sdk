/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
"use strict";
const os = require("os");
const NodeTranslationService = require("./NodeTranslationService");

const {
   ACCOUNT_TYPE,
   COMMAND_MANAGE_ACCOUNT: {
      MESSAGES: { ACCOUNT_INFO },
      QUESTIONS_CHOICES,
   },
} = require("./TranslationKeys");

const SANDBOX_ACCOUNT_ID_REGEX_PATTERN = ".+_SB\\d*$";
const RELEASE_PREVIEW_ACCOUNT_ID_REGEX_PATTERN = ".+_RP\\d*$";

module.exports = class AccountCredentialsService {
   constructor() {}

   buildAccountCredentialsInfo(accountCredentials) {
      const accountInfo = accountCredentials.accountInfo;
      return (
         NodeTranslationService.getMessage(ACCOUNT_INFO.AUTHID, accountCredentials.authId) +
         os.EOL +
         NodeTranslationService.getMessage(ACCOUNT_INFO.ACCOUNT_NAME, accountInfo.companyName) +
         os.EOL +
         NodeTranslationService.getMessage(ACCOUNT_INFO.ACCOUNT_ID, accountInfo.companyId) +
         os.EOL +
         NodeTranslationService.getMessage(ACCOUNT_INFO.ROLE, accountInfo.roleName) +
         os.EOL +
         NodeTranslationService.getMessage(ACCOUNT_INFO.DOMAIN, accountCredentials.domain) +
         os.EOL +
         NodeTranslationService.getMessage(ACCOUNT_INFO.ACCOUNT_TYPE, this._getAccountType(accountInfo.companyId))
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
};
