/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
 'use strict';
 
const ENCODING = {
	BINARY: 'binary'
}

const EVENT = {
	CLOSE: 'close',
	CONNECT: 'connect',
	DATA: 'data',
	END: 'end',
	ERROR: 'error',
	TIMEOUT: 'timeout',
};

const HEADER = {
	CONTENT_TYPE: 'content-type'
}

const PROTOCOL = {
	HTTP: 'http:',
	HTTPS: 'https:',
};

const METHOD = {
	CONNECT: 'CONNECT',
};

module.exports = {
	ENCODING,
	EVENT,
	HEADER,
	PROTOCOL,
	METHOD
}
