/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

function toErrorMessages(error) {
	if (Array.isArray(error)) {
		return error.map((item) => (item instanceof Error ? item.message : String(item)));
	}
	return [error instanceof Error ? error.message : String(error)];
}

module.exports = {
	toErrorMessages,
};
