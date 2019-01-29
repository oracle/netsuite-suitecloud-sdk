'use strict';

const BaseCommandGenerator = require('./BaseCommandGenerator');
const SDKExecutionContext = require('../SDKExecutor').SDKExecutionContext;
const inquirer = require('inquirer');

const COMMAND_NAME = 'createproject';
const COMMAND_ALIAS = 'cp';
const COMMAND_DESCRIPTION = 'Create a SuiteCloud project.';
const IS_SETUP_REQUIRED = false;

const ACP_PROJECT_TYPE = 'ACCOUNTCUSTOMIZATION';
const SUITEAPP_PROJECT_TYPE = 'SUITEAPP';

module.exports = class CreateProjectCommandGenerator extends BaseCommandGenerator {

    constructor() {
        super(COMMAND_NAME, COMMAND_ALIAS, COMMAND_DESCRIPTION, IS_SETUP_REQUIRED); 
    }

    _getCommandQuestions() {
        return [
            {
                type: 'list',
                name: 'type',
                message: 'Choose project type',
                default: 0,
                choices: [{name: 'Account Customization Project', value: ACP_PROJECT_TYPE}, {
                    name: 'SuiteApp',
                    value: SUITEAPP_PROJECT_TYPE
                }]
            },
         /*   {
                type: 'input',
                name: 'parentdirectory',
                default: './',
                message: 'Please specify parent directory where the project will be created'
            }, */
            {
                type: 'input',
                name: 'projectname',
                message: 'Please enter the name of your project'
            },
            {
                type: 'list',
                name: 'overwrite',
                message: 'Would you like to overwrite the project if found in the same location?',
                default: 0,
                choices: [{name: 'No', value: false}, {name: 'Yes', value: true}]
            }, 
            {
                when: function (response) {
                    return response.type === SUITEAPP_PROJECT_TYPE;
                },
                type: 'input',
                name: 'publisherid',
                message: 'Please enter your NetSuite publisher ID'
            },
            {
                when: function (response) {
                    return response.type === SUITEAPP_PROJECT_TYPE;
                },
                type: 'input',
                name: 'projectid',
                message: 'Please enter project ID'
            },
            {
                when: function (response) {
                    return response.type === SUITEAPP_PROJECT_TYPE;
                },
                type: 'input',
                name: 'projectversion',
                message: 'Please enter project version'
            }
        ]
    }

    _executeAction() {
        let self = this;
        return inquirer.prompt(this._getCommandQuestions()).then(answers => {
            let params = {
                '-type': answers.type,
                '-parentdirectory': process.cwd() + '/',
                '-projectname': answers.projectname,
                ...(answers.overwrite && {'-overwrite': ''}),
                ...(answers.type === SUITEAPP_PROJECT_TYPE && {'-publisherid': answers.publisherid}),
                ...(answers.type === SUITEAPP_PROJECT_TYPE && {'-projectid': answers.projectid}),
                ...(answers.type === SUITEAPP_PROJECT_TYPE && {'-projectversion': answers.projectversion}),
            };
            let executionContext = new SDKExecutionContext(COMMAND_NAME, params, false);
            self._sdkExecutor.execute(executionContext);
        });
    }

};