/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const Command = require('../../Command');
const CreateFileAction = require('./CreateFileAction');
const CreateFileInputHandler = require('./CreateFileInputHandler');
const CreateFileOutputHandler = require('./CreateFileOutputHandler');

module.exports = {
    create(options) {
        return Command.Builder.withOptions(options)
            .withAction(CreateFileAction)
            .withInput(CreateFileInputHandler)
            .withOutput(CreateFileOutputHandler)
            .build();
    }
};
