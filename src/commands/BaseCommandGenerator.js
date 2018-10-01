'use strict';

const SDKExecutor = require('../SDKExecutor').SDKExecutor;
const Command = require('./Command');

module.exports = class BaseCommandGenerator {

    constructor(commandName, commandAlias, commandDescription, isSetupRequired) {
        this._sdkExecutor = new SDKExecutor();
        this._commandName = commandName;
        this._commandAlias = commandAlias;
        this._commandDescription = commandDescription;
        this._isSetupRequired = isSetupRequired;
    }

    _executeAction() {
    }

    create() {
        return new Command(this._commandName, this._commandAlias, this._commandDescription, this._executeAction.bind(this), this._isSetupRequired);
    }

};