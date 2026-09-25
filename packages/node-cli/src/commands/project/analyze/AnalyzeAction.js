/*
 ** Copyright (c) 2026 Oracle and/or its affiliates. All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const ValidateAction = require('../validate/ValidateAction');
const { PROJECT_COMMAND } = require('@oracle/suitecloud-sdk-core').commands;
// Reuse authentication, packaging, transport, JSON/log output and result plumbing.
module.exports = class AnalyzeAction extends ValidateAction {
	_getProjectCommand() { return PROJECT_COMMAND.ANALYZE; }
};
