/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

export default interface ActionResult {
	status: string;
	resultMessage: string;
	errorMessages: string[];
	data: any;
}
