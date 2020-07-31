/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import assert from 'assert';

export class SdkExecutionContext {
	private _command: string;
	private _integrationMode: boolean;
	private _developmentMode: boolean;
	private _params: {[x: string]: any};
	private _flags: string[];

	constructor(builder: SdkExecutionContextBuilder) {
		this._command = builder.command;
		this._integrationMode = builder.integrationMode;
		this._developmentMode = builder.developmentMode;
		this._params = builder.params;
		this._flags = builder.flags;
	}

	getCommand() {
		return this._command;
	}

	getParams() {
		return this._params;
	}

	getFlags() {
		return this._flags;
	}

	isIntegrationMode() {
		return this._integrationMode;
	}

	static get Builder() {
		return new SdkExecutionContextBuilder();
	}
}

class SdkExecutionContextBuilder {
	command!: string;
	params: {[x: string]: any} = {};
	flags: string[] = [];
	integrationMode: boolean = false;
	developmentMode: boolean = false;
	constructor() {
	}

	forCommand(command: string) {
		this.command = command;
		return this;
	}

	integration() {
		this.integrationMode = true;
		return this;
	}

	devMode() {
		this.developmentMode = true;
		return this;
	}

	addParams(params: {[x: string]: any}) {
		Object.keys(params).forEach((key) => {
			this.addParam(key, params[key]);
		});
		return this;
	}

	addParam(param: string, value: any) {
		this.params[`-${param}`] = value;
		return this;
	}

	addFlags(flags: string[]) {
		flags.forEach((flag) => {
			this.addFlag(flag);
		});
		return this;
	}

	addFlag(flag: string) {
		this.flags.push(`-${flag}`);
		return this;
	}

	validate() {
		assert(this.command, 'Command is mandatory option');
	}

	build() {
		this.validate();
		return new SdkExecutionContext(this);
	}
}
