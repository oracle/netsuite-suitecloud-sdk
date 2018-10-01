'use strict';

const BaseCommandGenerator = require('./BaseCommandGenerator');
const SDKExecutionContext = require('../SDKExecutor').SDKExecutionContext;
const inquirer = require('inquirer');

const COMMAND_NAME = 'listfiles';
const COMMAND_ALIAS = 'lf';
const COMMAND_DESCRIPTION = 'List files from a NetSuite account.';
const IS_SETUP_REQUIRED = true;

module.exports = class ListFilesCommandGenerator extends BaseCommandGenerator {

    constructor() {
        super(COMMAND_NAME, COMMAND_ALIAS, COMMAND_DESCRIPTION, IS_SETUP_REQUIRED);
    }

    _getCommandQuestions() {
        return [
            {
                type: 'input',
                name: 'folder',
                message: 'Please specify FileCabinet folder',
                default: '/SuiteScripts'
            }
        ]
    }

    _executeAction() {
        inquirer.prompt(this._getCommandQuestions()).then(answers => {
            let executionContext = new SDKExecutionContext(COMMAND_NAME, {
                '-folder': answers.folder
            });

            this._sdkExecutor.execute(executionContext);
        });
    }

};