const ApplicationConstants = require('../ApplicationConstants');
const SDKExecutor = require('../SDKExecutor');
const NodeUtils = require('../NodeUtils');
const FileUtils = require('../FileUtils');
const Context = require('../Context');
const Command = require('./Command');
const inquirer = require('inquirer');

const COMMAND_NAME = 'setup';
const COMMAND_ALIAS = 's';
const COMMAND_DESCRIPTION = 'Setup CLI';

module.exports = class SetupCommandGenerator {

    constructor(){
        this._sdkExecutor = new SDKExecutor();
    }

    _getCommandQuestions(){
        return [
            {
                type : 'list',
                name : 'environmentUrl',
                message : 'Choose the NS environment',
                default: 0,
                choices: [{ name: 'Production', value: 'system.netsuite.com'}, {name: 'Sandbox', value:'system.sandbox.netsuite.com'}]
            },
            {
                type : 'list',
                name : 'authenticationMode',
                message : 'Choose the NS authentication',
                default: ApplicationConstants.AUTHENTICATION_MODE_TBA,
                choices: [{ name: 'Basic', value: ApplicationConstants.AUTHENTICATION_MODE_BASIC}, {name: 'Token-based Authentication', value: ApplicationConstants.AUTHENTICATION_MODE_TBA}]
            },
            {
                type : 'input',
                name : 'email',
                message : 'Please enter your email'
            },
            {
                type : 'password',
                name : 'password',
                message : 'Please enter your account password'
            },
            {
                type : 'input',
                name : 'role',
                default: 3,
                message : 'Please enter your role'
            },
            {
                type : 'input',
                name : 'company',
                message : 'Please enter your company identifier'
            }
        ];
    }

    _executeAction(){
        var self = this;
        inquirer.prompt(this._getCommandQuestions()).then(answers => {
            var contextValues = {
                netsuiteUrl : answers.environmentUrl,
                compId : answers.company,
                email : answers.email,
                password : answers.password,
                roleId : answers.role,
                authenticationMode: answers.authenticationMode
            }
            Context.CurrentAccountDetails.initializeFromObj(contextValues);

            if(contextValues.authenticationMode === ApplicationConstants.AUTHENTICATION_MODE_TBA){
                self._sdkExecutor.execute("issuetoken");
                delete contextValues.password;
            }

            FileUtils.create(ApplicationConstants.ACCOUNT_DETAILS_FILENAME, contextValues);
            NodeUtils.println("Context setup correctly", NodeUtils.COLORS.GREEN);
          });
    }

    create(){
        return new Command(COMMAND_NAME, COMMAND_ALIAS, COMMAND_DESCRIPTION, true, this._executeAction.bind(this));
    }
}