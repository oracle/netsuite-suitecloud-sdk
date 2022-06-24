/*
 ** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { ActionResult } from "../types/ActionResult";
import BaseAction from "./BaseAction";

export default class CompareFile extends BaseAction {
	private static readonly COMMAND_NAME = 'comparefile';

	constructor() {
		super(CompareFile.COMMAND_NAME);
	}

    protected execute(): Promise<void | ActionResult<any>> {
        throw new Error("Method not implemented.");
    }
}