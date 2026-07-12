/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

export * from '../../api/object/ObjectCommand';
export {
	executeImportObjects,
	executeListObjects,
} from '../../services/object/ObjectCommandService';
export {
	executeUpdateCustomRecordWithInstances,
	executeUpdateObjects,
} from '../../services/object/ObjectUpdateService';
