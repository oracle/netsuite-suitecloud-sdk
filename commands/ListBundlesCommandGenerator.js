const Command = require('./Command');
const SDKExecutor = require('./../SDKExecutor');

const COMMAND_NAME = 'listbundles';
const COMMAND_ALIAS = 'lb';
const COMMAND_DESCRIPTION = 'List bundles description';

module.exports = class ListBundlesCommandGenerator {
    
    constructor(){
        this._sdkExecutor = new SDKExecutor();
    }

    _executeAction(){
        this._sdkExecutor.execute(COMMAND_NAME);
    }

    create(){
        return new Command(COMMAND_NAME, COMMAND_ALIAS, COMMAND_DESCRIPTION, false, this._executeAction.bind(this))
    }
}