/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

module.exports = class TestFrameworkException {

	constructor(code, defaultMessage, infoMessage) {
		this._code = code;
		this._defaultMessage = defaultMessage;
		this._infoMessage = infoMessage;
	}

	getInfoMessage() {
		return this._infoMessage;
	}

	getErrorMessage() {
		return this._defaultMessage;
	}

};
