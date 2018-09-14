'use strict';

const Command = require('./Command');
const SDKExecutor = require('../SDKExecutor').SDKExecutor;
const SDKExecutionContext = require('../SDKExecutor').SDKExecutionContext;

const COMMAND_NAME = 'listbundles';
const COMMAND_ALIAS = 'lb';
const COMMAND_DESCRIPTION = 'List bundles description';

module.exports = class ListBundlesCommandGenerator {
    
    constructor(){
        this._sdkExecutor = new SDKExecutor();
    }

    _executeAction(){
        let executionContext = new SDKExecutionContext(COMMAND_NAME);
        this._sdkExecutor.execute(executionContext);
    }

    create(){
        return new Command(COMMAND_NAME, COMMAND_ALIAS, COMMAND_DESCRIPTION, false, this._executeAction.bind(this))
    }
};