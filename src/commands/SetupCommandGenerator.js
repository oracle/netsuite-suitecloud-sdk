'use strict';

const BaseCommandGenerator = require('./BaseCommandGenerator');
const ApplicationConstants = require('../ApplicationConstants');
const SDKExecutionContext = require('../SDKExecutor').SDKExecutionContext;
const NodeUtils = require('../NodeUtils');
const FileUtils = require('../FileUtils');
const CryptoUtils = require('../CryptoUtils');
const Context = require('../Context');
const inquirer = require('inquirer');
const CLIException = require('../CLIException');

const COMMAND_NAME = 'setupaccount';
const COMMAND_ALIAS = 's';
const COMMAND_DESCRIPTION = 'Setup CLI';
const IS_SETUP_REQUIRED = false;

const ISSUE_TOKEN_COMMAND = 'issuetoken';
const REVOKE_TOKEN_COMMAND = 'revoketoken';

const MANIFEST_XML = 'manifest.xml'

module.exports = class SetupCommandGenerator extends BaseCommandGenerator {

    constructor() {
        super(COMMAND_NAME, COMMAND_ALIAS, COMMAND_DESCRIPTION, IS_SETUP_REQUIRED);
    }

    _getCommandQuestions() {
        return [
            {
                type: 'list',
                name: 'environmentUrl',
                message: 'Choose the NS environment',
                default: 0,
                choices: [
                    {
                        name: 'Production',
                        value: 'system.netsuite.com'
                    },
                    {
                        name: 'Sandbox',
                        value: 'system.sandbox.netsuite.com'
                    }
                ]
            },
            {
                type: 'input',
                name: 'email',
                message: 'Please enter your email'
            },
            {
                type: 'password',
                name: 'password',
                message: 'Please enter your account password'
            },
            {
                type: 'list',
                name: 'authenticationMode',
                message: 'Choose the NS authentication',
                default: ApplicationConstants.AUTHENTICATION_MODE_TBA,
                choices: [
                    {
                        name: 'Basic',
                        value: ApplicationConstants.AUTHENTICATION_MODE_BASIC
                    },
                    {
                        name: 'Token-based Authentication',
                        value: ApplicationConstants.AUTHENTICATION_MODE_TBA
                    }
                ]
            },
            {
                type: 'input',
                name: 'role',
                default: 3,
                message: 'Please enter your role'
            },
            {
                type: 'input',
                name: 'company',
                message: 'Please enter your company identifier'
            },
            /*{ 
                type: 'list',
                name: 'account',
                message: 'Choose the account and role',
                default: ApplicationConstants.AUTHENTICATION_MODE_TBA,
                choices: [
                    {
                        name: 'Commerce NCube8 - Administrator',
                        value: { account : 'TSTDRV1853147', role: 3, reqiures2FA: true }
                    },
                ]
            }*/
        ];
    }

    _executeAction() {
        const self = this;
        if(!FileUtils.exists(MANIFEST_XML)){
            throw new CLIException(0, "Please run setupaccount in a project folder");
        }

        inquirer.prompt(this._getCommandQuestions()).then(answers => {
            const encryptionKey = CryptoUtils.generateRandomKey();
            const contextValues = {
                netsuiteUrl: answers.environmentUrl,
                compId: answers.company,
                email: answers.email,
                password: CryptoUtils.encrypt(answers.password, encryptionKey),
                roleId: answers.role,
                authenticationMode: answers.authenticationMode,
                encryptionKey: encryptionKey
            };
            Context.CurrentAccountDetails.initializeFromObj(contextValues);

            if (contextValues.authenticationMode === ApplicationConstants.AUTHENTICATION_MODE_TBA) {
                let executionContext = new SDKExecutionContext(ISSUE_TOKEN_COMMAND);
                self._sdkExecutor.execute(executionContext);
            }

            if (contextValues.authenticationMode === ApplicationConstants.AUTHENTICATION_MODE_BASIC &&
                FileUtils.exists(ApplicationConstants.ACCOUNT_DETAILS_FILENAME)) {
                const accountContext = FileUtils.read(ApplicationConstants.ACCOUNT_DETAILS_FILENAME);
                if (accountContext.authenticationMode === ApplicationConstants.AUTHENTICATION_MODE_TBA) {
                    let executionContext = new SDKExecutionContext(REVOKE_TOKEN_COMMAND);
                    self._sdkExecutor.execute(executionContext);
                }
            }

            FileUtils.create(ApplicationConstants.ACCOUNT_DETAILS_FILENAME, contextValues);
            NodeUtils.println("Context setup correctly", NodeUtils.COLORS.GREEN);
        });
    }

};