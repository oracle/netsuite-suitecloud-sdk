/*
** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

/**
 * @deprecated use CliException interface instead the class
 */
export class CLIException {

	readonly defaultMessage: string;
	readonly infoMessage?: string;

	constructor(defaultMessage: string, infoMessage?: string) {
		this.defaultMessage = defaultMessage;
		this.infoMessage = infoMessage;
	}
};

export interface CliException {
	defaultMessage: string;
	infoMessage?: string;
}

export function isCliException(exception: CliException | string): exception is CliException {
	return typeof (exception as CLIException).defaultMessage === 'string';
}