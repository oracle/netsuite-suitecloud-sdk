/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
export type CommandMetadata = {
	name: string;
	sdkCommand: string;
	usage: string;
	description: string;
	isSetupRequired: boolean;
	options: {
		[key: string]: CommandOption;
	};
};

export type CommandOption = {
	name: string;
	option: string;
	description: string;
	mandatory: boolean;
	type: string;
	usage: string;
	defaultOption: boolean;
	disableInIntegrationMode: boolean;
};
