/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const BaseCommand = require('../basecommand/BaseCommand');
const ProxyAction = require('./ProxyAction');
const BaseInputHandler = require('../basecommand/BaseInputHandler');
const ProxyOutputHandler = require('./ProxyOutputHandler');

module.exports = class ListFilesCommand extends BaseCommand {
	constructor(options) {
        super(options);
        this._action = new ProxyAction(options);
        this._inputHandler = new BaseInputHandler(options);
        this._outputHandler = new ProxyOutputHandler(options);
}
};
