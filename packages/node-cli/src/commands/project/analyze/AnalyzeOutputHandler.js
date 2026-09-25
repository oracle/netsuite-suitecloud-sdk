/*
 ** Copyright (c) 2026 Oracle and/or its affiliates. All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const ValidateOutputHandler = require('../validate/ValidateOutputHandler');
module.exports = class AnalyzeOutputHandler extends ValidateOutputHandler {
	_showInstallationPreferencesMessage() {
		// Analysis reads packaged preferences; it does not apply them to an account.
	}
};
