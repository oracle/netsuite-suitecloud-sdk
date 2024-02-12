/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { SDK_CLIENT_PLATFORM } = require('./ApplicationConstants');

module.exports = class ExecutionEnvironmentContext {

    constructor(params) {
        this._platform = SDK_CLIENT_PLATFORM;
        this._platformVersion = process.version;

        if (!params) {
            params = {
                platform: SDK_CLIENT_PLATFORM,
                platformVersion: process.version,
            };
        }

        if (params.platform) {
            this._platform = params.platform;
        }

        if (params.platformVersion) {
            this._platformVersion = params.platformVersion;
        }
    }

    getPlatform() {
        return this._platform;
    }

    getPlatformVersion() {
        return this._platformVersion;
    }

}
