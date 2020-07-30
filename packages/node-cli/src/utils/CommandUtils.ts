/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import assert from 'assert';

export const INQUIRER_TYPES = {
	CHECKBOX: 'checkbox',
	INPUT: 'input',
	LIST: 'list',
	PASSWORD: 'password',
	PASSWORD_MASK: '*',
};

function extractKeysFromObject(object: { [x: string]: any }, keys: string[]) {
	return keys.reduce((obj: { [x: string]: any }, key) => {
		if (object[key]) {
			obj[key] = object[key];
		}
		return obj;
	}, {});
}

export function extractCommandOptions(answers: { [x: string]: any }, commandMetadata: { options: { [x: string]: any }[] }) {
	assert(answers);
	assert(commandMetadata);
	assert(commandMetadata.options);

	const commandOptions = Object.keys(commandMetadata.options);
	return extractKeysFromObject(answers, commandOptions);
}

export function quoteString(string: string) {
	return `"${string}"`;
}
