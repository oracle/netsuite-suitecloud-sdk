/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

class Translation {
	start(service, keys) {
		this.service = service;
		this.keys = keys;
	}

	getMessage(key, params = []) {
		return (this.keys && this.service.getMessage(this.keys[key], ...params)) || '';
	}
}

module.exports = new Translation();
