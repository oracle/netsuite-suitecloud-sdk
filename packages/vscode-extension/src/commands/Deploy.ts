/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import DeployValidateCommon from './DeployValidateCommon';

const COMMAND_NAME = 'deploy';
export default class Deploy extends DeployValidateCommon {
	constructor() {
		super(COMMAND_NAME);
	}
}
