/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

// SDK setup has already displayed this error, so consumers must not notify again.
export default class ReportedSdkError extends Error {
	constructor(readonly cause: unknown) {
		super(cause instanceof Error ? cause.message : String(cause));
	}
}
