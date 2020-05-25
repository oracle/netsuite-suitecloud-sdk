/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
"use strict";

const BaseCommandGenerator = require("./BaseCommandGenerator");
const SdkExecutionContext = require("../SdkExecutionContext");
const { executeWithSpinner } = require("../ui/CliSpinner");
const SdkOperationResultUtils = require("../utils/SdkOperationResultUtils");
const CommandUtils = require("../utils/CommandUtils");
const NodeTranslationService = require("../services/NodeTranslationService");
const ManageAccountOutputFormatter = require("./outputFormatters/ManageAccountOutputFormatter");
const AuthenticationService = require("../core/authentication/AuthenticationService");
const { ManageAccountActionResult } = require("./actionresult/ManageAccountActionResult");
const assert = require("assert");

const inquirer = require("inquirer");

const {
   COMMAND_MANAGE_ACCOUNT: { ERRORS, QUESTIONS, QUESTIONS_CHOICES, MESSAGES },
   YES,
   NO,
} = require("../services/TranslationKeys");

const ACTION = {
   EXIT: "exit",
   RENAME: "rename",
   REMOVE: "remove",
   REVOKE: "revoke",
};

const COMMAND = {
   OPTIONS: {
      INFO: "info",
      LIST: "list",
      REMOVE: "remove",
      RENAME: "rename",
      RENAMETO: "renameto",
   },
   FLAGS: {
      NO_PREVIEW: "no_preview",
      SKIP_WARNING: "skip_warning",
      VALIDATE: "validate",
   },
};

const ANSWERS_NAMES = {
   SELECTED_AUTH_ID: "selected_auth_id",
   ACTION: "action",
   AUTHID: "authId",
   RENAMETO: "renameto",
   REMOVE: "remove",
};

const {
   showValidationResults,
   validateAuthIDNotInList,
   validateAlphanumericHyphenUnderscore,
   validateFieldHasNoSpaces,
   validateFieldIsNotEmpty,
   validateMaximumLength,
   validateSameAuthID,
} = require("../validation/InteractiveAnswersValidator");

const PROPERTIES = {
   INFO: "info",
   ACCOUNT_INFO: "accountInfo",
   URLS: "urls",
};

const DOMAIN = "domain";
module.exports = class ManageAccountCommandGenerator extends BaseCommandGenerator {
   constructor(options) {
      super(options);
      this._authenticationService = new AuthenticationService(options.executionPath);
      this._outputFormatter = new ManageAccountOutputFormatter(options.consoleLogger);
   }

   async _getCommandQuestions(prompt) {
      const authIDList = await this._authenticationService.getAuthIds(this._sdkExecutor);
      let answers = await this._selectAuthID(authIDList, prompt);
      this._outputFormatter.logAccountInfo(answers[ANSWERS_NAMES.SELECTED_AUTH_ID]);
      const selectedAuthID = answers[ANSWERS_NAMES.SELECTED_AUTH_ID].authId;
      answers[ANSWERS_NAMES.ACTION] = await this._selectAction(prompt);
      if (answers[ANSWERS_NAMES.ACTION] == ACTION.RENAME) {
         answers[ANSWERS_NAMES.RENAMETO] = await this._introduceNewName(prompt, authIDList, selectedAuthID);
      } else if (answers[ANSWERS_NAMES.ACTION] == ACTION.REMOVE) {
         answers[ANSWERS_NAMES.REMOVE] = await this._confirmRemove(prompt);
      }

      return this._extractAnswers(answers);
   }

   async _selectAuthID(authIDList, prompt) {
      var authIDs = Object.entries(authIDList).sort();
      if (authIDs.length <= 0) {
         throw Error(NodeTranslationService.getMessage(ERRORS.CREDENTIALS_EMPTY));
      }
      const choices = [];
      authIDs.forEach((authIDArray) => {
         const authID = authIDArray[0];
         const authIDProperties = authIDArray[1];
         const isDevLabel = authIDProperties.developmentMode
            ? NodeTranslationService.getMessage(
                 QUESTIONS_CHOICES.SELECT_AUTHID.EXISTING_AUTH_ID_DEV_URL,
                 authIDProperties.urls.app
              )
            : "";
         const accountInfo = `${authIDProperties.accountInfo.roleName} @ ${authIDProperties.accountInfo.companyName}`;
         choices.push({
            name: NodeTranslationService.getMessage(
               QUESTIONS_CHOICES.SELECT_AUTHID.EXISTING_AUTH_ID,
               authID,
               accountInfo,
               isDevLabel
            ),
            value: { authId: authID, accountInfo: authIDProperties.accountInfo, domain: authIDProperties.urls.app },
         });
      });
      choices.push(new inquirer.Separator());
      let answers = await prompt([
         {
            type: CommandUtils.INQUIRER_TYPES.LIST,
            name: ANSWERS_NAMES.SELECTED_AUTH_ID,
            message: NodeTranslationService.getMessage(MESSAGES.SELECT_CONFIGURED_AUTHID),
            choices: choices,
         },
      ]);
      return answers;
   }

   async _selectAction(prompt) {
      let answer = await prompt({
         type: CommandUtils.INQUIRER_TYPES.LIST,
         name: ANSWERS_NAMES.ACTION,
         message: NodeTranslationService.getMessage(QUESTIONS.SELECT_ACTION),
         choices: [
            {
               name: NodeTranslationService.getMessage(QUESTIONS_CHOICES.ACTIONS.RENAME),
               value: ACTION.RENAME,
            },
            {
               name: NodeTranslationService.getMessage(QUESTIONS_CHOICES.ACTIONS.REMOVE),
               value: ACTION.REMOVE,
            },
            // {
            //    name: NodeTranslationService.getMessage(QUESTIONS_CHOICES.ACTIONS.REVOKE),
            //    value: ACTION.REVOKE,
            // },
            {
               name: NodeTranslationService.getMessage(QUESTIONS_CHOICES.ACTIONS.EXIT),
               value: ACTION.EXIT,
            },
         ],
      });

      if (answer[ANSWERS_NAMES.ACTION] == ACTION.EXIT) {
         throw NodeTranslationService.getMessage(MESSAGES.CANCEL);
      }

      return answer[ANSWERS_NAMES.ACTION];
   }

   async _introduceNewName(prompt, authIDList, originalAuthId) {
      let answer = await prompt({
         type: CommandUtils.INQUIRER_TYPES.INPUT,
         name: ANSWERS_NAMES.RENAMETO,
         message: NodeTranslationService.getMessage(QUESTIONS.NEW_NAME),
         filter: (fieldValue) => fieldValue.trim(),
         validate: (fieldValue) =>
            showValidationResults(
               fieldValue,
               validateFieldIsNotEmpty,
               validateFieldHasNoSpaces,
               (fieldValue) => validateSameAuthID(fieldValue, originalAuthId),
               (fieldValue) => validateAuthIDNotInList(fieldValue, Object.keys(authIDList)),
               validateAlphanumericHyphenUnderscore,
               validateMaximumLength
            ),
      });
      return answer[ANSWERS_NAMES.RENAMETO];
   }

   async _confirmRemove(prompt) {
      let answer = await prompt([
         {
            type: CommandUtils.INQUIRER_TYPES.LIST,
            name: ANSWERS_NAMES.REMOVE,
            message: NodeTranslationService.getMessage(QUESTIONS.VERIFY_REMOVE),
            default: false,
            choices: [
               { name: NodeTranslationService.getMessage(YES), value: true },
               { name: NodeTranslationService.getMessage(NO), value: false },
            ],
         },
      ]);
      if (!answer[ANSWERS_NAMES.REMOVE]) {
         throw NodeTranslationService.getMessage(MESSAGES.CANCEL);
      }
      return answer[ANSWERS_NAMES.REMOVE];
   }

   _extractAnswers(answers) {
      var commandAnswers = new Object();
      if (answers[ANSWERS_NAMES.ACTION] == ACTION.RENAME) {
         commandAnswers[COMMAND.OPTIONS.RENAME] = answers[ANSWERS_NAMES.SELECTED_AUTH_ID].authId;
         commandAnswers[COMMAND.OPTIONS.RENAMETO] = answers[ANSWERS_NAMES.RENAMETO];
      } else if (answers[ANSWERS_NAMES.ACTION] == ACTION.REMOVE) {
         commandAnswers[COMMAND.OPTIONS.REMOVE] = answers[ANSWERS_NAMES.SELECTED_AUTH_ID].authId;
         // } else if (answers[ANSWERS_NAMES.ACTION] == ACTION.REVOKE) {
         //    commandAnswers[COMMAND.OPTIONS.REVOKE] = answers[ANSWERS_NAMES.SELECTED_AUTH_ID].authId;
      }
      return commandAnswers;
   }

   async _executeAction(answers) {
      const sdkParams = CommandUtils.extractCommandOptions(answers, this._commandMetadata);
      const flags = [];
      const executionContext = new SdkExecutionContext({
         command: this._commandMetadata.sdkCommand,
         params: sdkParams,
         flags,
      });

      let message = this._getSpinnerMessage(answers);

      const operationResult = await executeWithSpinner({
         action: this._sdkExecutor.execute(executionContext),
         message: message,
      });

      return operationResult.status === SdkOperationResultUtils.STATUS.SUCCESS
         ? ManageAccountActionResult.Builder.withData(this.prepareData(answers, operationResult.data))
              .withResultMessage(operationResult.resultMessage)
              .build()
         : ManageAccountActionResult.Builder.withErrors(
              SdkOperationResultUtils.collectErrorMessages(operationResult)
           ).build();
   }

   _getSpinnerMessage(answers) {
      let message = "";
      if (answers[COMMAND.OPTIONS.REMOVE]) {
         message = NodeTranslationService.getMessage(MESSAGES.REMOVING);
      } else if (answers[COMMAND.OPTIONS.RENAME]) {
         message = NodeTranslationService.getMessage(MESSAGES.RENAMING);
      } else if (answers[COMMAND.OPTIONS.LIST]) {
         message = NodeTranslationService.getMessage(MESSAGES.REMOVING);
      // } else if (answers[COMMAND.OPTIONS.REVOKE]) {
      //    message = NodeTranslationService.getMessage(MESSAGES.REVOKING);
      } else if (answers[COMMAND.OPTIONS.INFO]) {
         message = NodeTranslationService.getMessage(MESSAGES.INFO, answers.info);
      }
      return message;
   }

   prepareData(answers, data) {
      let actionResultData;
      if (!answers.hasOwnProperty(PROPERTIES.INFO)) {
         return data;
      }

      assert(data.hasOwnProperty(PROPERTIES.ACCOUNT_INFO));
      actionResultData = { authId: answers.info, accountInfo: data.accountInfo };
      if (data.hasOwnProperty(PROPERTIES.URLS)) {
         actionResultData[DOMAIN] = data.urls.app;
      }
      return actionResultData;
   }
};
