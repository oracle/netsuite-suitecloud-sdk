/*
** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

module.exports = class TestFrameworkException {
	constructor(code, defaultMessage, infoMessage, translationKey) {
		this._code = code;
		this._defaultMessage = defaultMessage;
		this._infoMessage = infoMessage;
		this._translationKey = translationKey;
	}

	getInfoMessage() {
		return this._infoMessage;
	}

	getErrorMessage() {
		return this._defaultMessage;
	}
};
