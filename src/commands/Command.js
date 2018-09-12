"use strict";
const Context = require('../Context');
const NodeUtils = require('../NodeUtils');

module.exports = class Command {
    
    constructor(name, alias, description, canRunWithoutSetup, action){
        this._name = name;
        this._alias = alias;
        this._description = description;
        this._canRunWithoutSetup = canRunWithoutSetup;
        this._action = action;
    }

    attachToProgram(program){
        var self = this;
        program
            .command(this._name)
            .alias(this._alias)
            .description(this._description)
            .action(() => {
                if(!self._canRunWithoutSetup && !Context.CurrentAccountDetails.isAccountSetup()){
                    NodeUtils.println('The SuiteCluod CLI requires setup first to connect to NetSuite. Please run "sdfcli setup"', NodeUtils.COLORS.RED);
                    return;
                }
                self._action();
            });
    }
}