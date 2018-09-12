const Command = require('./Command');
const SDKExecutor = require('../SDKExecutor');
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
                message : 'Please specify the FileCabinet folder',
                default: '/SuiteScripts'
            }
        ]
    }

    _executeAction(){
        inquirer.prompt(this._getCommandQuestions()).then(answers => {
            this._sdkExecutor.execute(COMMAND_NAME, {
                '-folder' : answers.folder
            });
        });
    }

    create(){
        return new Command(COMMAND_NAME, COMMAND_ALIAS, COMMAND_DESCRIPTION, false, this._executeAction.bind(this))
    }
}