/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { cpSync, mkdirSync, rmSync } = require('node:fs');
const { join } = require('node:path');

const packageRoot = join(__dirname, '..');
const source = join(packageRoot, 'resources');
const destination = join(packageRoot, 'build', 'resources');

rmSync(destination, { recursive: true, force: true });
mkdirSync(destination, { recursive: true });
cpSync(source, destination, { recursive: true });
