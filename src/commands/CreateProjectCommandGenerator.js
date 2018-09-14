'use strict';

const ApplicationConstants = require('../ApplicationConstants');
const SDKExecutor = require('../SDKExecutor').SDKExecutor;
const SDKExecutionContext = require('../SDKExecutor').SDKExecutionContext;
const NodeUtils = require('../NodeUtils');
const FileUtils = require('../FileUtils');
const Context = require('../Context');
const Command = require('./Command');
const inquirer = require('inquirer');

const COMMAND_NAME = 'createproject';
const COMMAND_ALIAS = 'cp';
const COMMAND_DESCRIPTION = 'Create new Account Customization or SuiteApp project';

const ACP_PROJECT_TYPE = 'ACCOUNTCUSTOMIZATION';
const SUITEAPP_PROJECT_TYPE = 'SUITEAPP';

module.exports = class CreateProjectCommandGenerator {

    constructor() {
        this._sdkExecutor = new SDKExecutor();
    }

    _getCommandQuestions() {
        return [
            {
                type : 'list',
                name : 'type',
                message : 'Choose project type',
                default: 0,
                choices: [{ name: 'Account Customization Project', value: ACP_PROJECT_TYPE}, {name: 'SuiteApp', value: SUITEAPP_PROJECT_TYPE}]
            },
            {
                type : 'input',
                name : 'parentdirectory',
                default: './',
                message : 'Please specify parent directory where the project will be created'
            },
            {
                type : 'input',
                name : 'projectname',
                message : 'Please enter the name of your project'
            },
            {
                type : 'list',
                name : 'overwrite',
                message : 'Would you like to overwrite the project if found in the same location?',
                default: 0,
                choices: [{name: 'No', value: false}, { name: 'Yes', value: true}]
            },
            {
                when: function (response) {
                    return response.type === SUITEAPP_PROJECT_TYPE;
                },
                type : 'input',
                name : 'publisherid',
                message : 'Please enter your NetSuite publisher ID'
            },
            {
                when: function (response) {
                    return response.type === SUITEAPP_PROJECT_TYPE;
                },
                type : 'input',
                name : 'projectid',
                message : 'Please enter project ID'
            },
            {
                when: function (response) {
                    return response.type === SUITEAPP_PROJECT_TYPE;
                },
                type : 'input',
                name : 'projectversion',
                message : 'Please enter project version'
            }
        ]
    }

    _executeAction(){
        let self = this;
        inquirer.prompt(this._getCommandQuestions()).then(answers => {
            let params = {
                '-type' : answers.type,
                '-parentdirectory' : answers.parentdirectory,
                '-projectname' : answers.projectname,
                ...(answers.overwrite && {'-overwrite': ''}),
                ...(answers.type === SUITEAPP_PROJECT_TYPE && {'-publisherid': answers.publisherid}),
                ...(answers.type === SUITEAPP_PROJECT_TYPE && {'-projectid': answers.projectid}),
                ...(answers.type === SUITEAPP_PROJECT_TYPE && {'-projectversion': answers.projectversion}),
            };
            let executionContext = new SDKExecutionContext(COMMAND_NAME, params, false);
            this._sdkExecutor.execute(executionContext);
        });
    }

    create(){
        return new Command(COMMAND_NAME, COMMAND_ALIAS, COMMAND_DESCRIPTION, true, this._executeAction.bind(this));
    }
};