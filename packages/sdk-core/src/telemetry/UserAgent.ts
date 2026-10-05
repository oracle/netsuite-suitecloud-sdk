/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

export type UserAgentEnvironment = {
	platformName: string;
	platformVersion: string;
	osName: string;
	sdkName: string;
	sdkVersion: string;
	runtimeName: string;
	runtimeVersion: string;
	runtimeArchitecture: string;
};

// Keep the Java SDK wire format: Elastic parses this value by spaces and semicolon.
const USER_AGENT_FORMAT = '%s/%s %s %s/%s %s/%s;%s';

export function createUserAgent(environment: UserAgentEnvironment): string | undefined {
	const values = [
		environment.platformName,
		environment.platformVersion,
		environment.osName,
		environment.sdkName,
		environment.sdkVersion,
		environment.runtimeName,
		environment.runtimeVersion,
		environment.runtimeArchitecture,
	];
	if (values.some((value) => !value)) {
		return undefined;
	}
	let valueIndex = 0;
	return USER_AGENT_FORMAT.replace(/%s/g, () => removeSpaces(values[valueIndex++]));
}

function removeSpaces(value: string): string {
	return value.replace(/\s+/g, '');
}
