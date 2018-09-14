'use strict';

const Command = require('./Command');
const SDKExecutor = require('../SDKExecutor').SDKExecutor;
const SDKExecutionContext = require('../SDKExecutor').SDKExecutionContext;
const inquirer = require('inquirer');

const COMMAND_NAME = 'listfiles';
const COMMAND_ALIAS = 'lf';
const COMMAND_DESCRIPTION = 'List files description';

module.exports = class ListBundlesCommandGenerator {
    
    constructor(){
        this._sdkExecutor = new SDKExecutor();
    }

    _getCommandQuestions(){
        return [
            {
                type : 'input',
                name : 'folder',
                message : 'Please specify FileCabinet folder',
                default: '/SuiteScripts'
            }
        ]
    }

    _executeAction(){
        inquirer.prompt(this._getCommandQuestions()).then(answers => {
            let executionContext = new SDKExecutionContext(COMMAND_NAME, {
                '-folder' : answers.folder
            });

            this._sdkExecutor.execute(executionContext);
        });
    }

    create(){
        return new Command(COMMAND_NAME, COMMAND_ALIAS, COMMAND_DESCRIPTION, false, this._executeAction.bind(this))
    }
};