/*
** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

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

/* TODO: this doesn't need to be a class. It could be as easy as:
export interface CLIException {
	defaultMessage: string;
	infoMessage?: string;
};
to remember:
- interfaces aren't even compiled.
- classes are compiled (into a function with it's prototype) and executed at runtime, increasing execution time

having a class to have only the constructor and then do nothing with its properties is technically the same as having an
object with those properties (that respects an interface).
*/
