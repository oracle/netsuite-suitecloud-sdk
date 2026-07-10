/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

// Compatibility facade. Command consumers keep their existing import path while
// the implementation lives behind the service boundary.
export * from '../../services/file/FileCommandService';
