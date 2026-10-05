/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { SUITESCRIPT_TEMPLATES } = require('@oracle/suitecloud-sdk-core').metadata;

module.exports = SUITESCRIPT_TEMPLATES.map(({ id, name }) => ({ id, name }));
