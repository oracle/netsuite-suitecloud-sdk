"use strict";
const Context = require('../Context');
const NodeUtils = require('../NodeUtils');

module.exports = class Command {

    constructor(name, alias, description, action, isSetupRequired) {
        this._name = name;
        this._alias = alias;
        this._description = description;
        this._action = action;
        this._isSetupRequired = (typeof isSetupRequired === 'undefined') ? true : isSetupRequired;
    }

    attachToProgram(program) {
        const self = this;
        program
            .command(this._name)
            .alias(this._alias)
            .description(this._description)
            .action(() => {
                if (self._isSetupRequired && !Context.CurrentAccountDetails.isAccountSetup()) {
                    NodeUtils.println('The SuiteCloud CLI requires setup first to connect to NetSuite. Please run "sdf setup"', NodeUtils.COLORS.RED);
                    return;
                }
                self._action();
            });
    }
};