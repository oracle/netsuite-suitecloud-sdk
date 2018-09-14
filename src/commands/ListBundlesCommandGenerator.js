'use strict';

const BaseCommandGenerator = require('./BaseCommandGenerator');
const SDKExecutionContext = require('../SDKExecutor').SDKExecutionContext;

const COMMAND_NAME = 'listbundles';
const COMMAND_ALIAS = 'lb';
const COMMAND_DESCRIPTION = 'List bundles description';

module.exports = class ListBundlesCommandGenerator extends BaseCommandGenerator {
    
    constructor(){
        super(COMMAND_NAME, COMMAND_ALIAS, COMMAND_DESCRIPTION);
    }

    _executeAction(){
        let executionContext = new SDKExecutionContext(COMMAND_NAME);
        this._sdkExecutor.execute(executionContext);
    }
};