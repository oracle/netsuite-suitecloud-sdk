/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

module.exports = class Base64 {
	static encode(string) {
		const buff = Buffer.from(string);
		return buff.toString('base64');
	}

	static decode(string) {
		const buff = Buffer.from(string, 'base64');
		return buff.toString('utf8');
	}
};
