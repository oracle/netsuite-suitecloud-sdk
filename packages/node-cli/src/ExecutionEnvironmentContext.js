/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const { SDK_CLIENT_PLATFORM } = require('./ApplicationConstants');
const { telemetry } = require('@oracle/suitecloud-sdk-core');
const os = require('os');
const { spawnSync } = require('child_process');
const EnvironmentInformationService = require('./services/EnvironmentInformationService');
const { nsCompatibleVersion, sdkFilename } = require('../package.json');

const SDK_NAME = 'SuiteCloudSDK';
const JAVA_RUNTIME_NAME = 'Java';
const UNKNOWN_JAVA_VERSION = 'unknown';
let javaVersion;
let windowsName;

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

    /**
     * Returns the legacy SuiteCloud telemetry format used by the Java SDK.
     * Keep the Java runtime token because Elastic relies on the legacy header layout.
     */
    toUserAgentString() {
        return telemetry.createUserAgent({
            platformName: this._platform,
            platformVersion: this._platformVersion,
            osName: getLegacyOsName(),
            sdkName: SDK_NAME,
            sdkVersion: getSdkVersion(),
            runtimeName: JAVA_RUNTIME_NAME,
            runtimeVersion: getJavaVersion(),
            runtimeArchitecture: getLegacyArchitecture(),
        });
    }

}

function getLegacyOsName() {
    switch (os.type()) {
        case 'Darwin':
            return 'Mac OS X';
        case 'Windows_NT':
            return getWindowsName();
        default:
            return os.type();
    }
}

function getWindowsName() {
    if (windowsName !== undefined) {
        return windowsName;
    }

    // Java's os.name distinguishes Windows workstation and Server releases.
    // Node exposes only the kernel version, so obtain the equivalent product
    // caption directly from Windows. This deliberately does not use a shell.
    const windowsCaption = getWindowsCaption();
    const knownWindowsNames = [
        'Windows Server 2025',
        'Windows Server 2022',
        'Windows Server 2019',
        'Windows Server 2016',
        'Windows 11',
        'Windows 10',
    ];
    const matchedName = knownWindowsNames.find((name) => windowsCaption.includes(name));
    if (matchedName) {
        windowsName = matchedName;
        return windowsName;
    }

    // Windows 11 has build 22000 or newer. This fallback cannot identify
    // Server editions, but keeps workstation telemetry correct if PowerShell
    // is unavailable or constrained by a customer's environment.
    const buildNumber = Number((os.release().match(/\d+$/) || [])[0]);
    windowsName = buildNumber >= 22000 ? 'Windows 11' : 'Windows 10';
    return windowsName;
}

function getWindowsCaption() {
    try {
        const result = spawnSync(
            'powershell.exe',
            ['-NoProfile', '-NonInteractive', '-Command', '(Get-CimInstance Win32_OperatingSystem).Caption'],
            { shell: false, encoding: 'utf8', windowsHide: true }
        );
        return result.status === 0 ? String(result.stdout || '') : '';
    } catch (_error) {
        return '';
    }
}

function getSdkVersion() {
    const match = /^cli-(.+)\.jar$/.exec(sdkFilename || '');
    return match ? match[1] : nsCompatibleVersion;
}

function getJavaVersion() {
    if (javaVersion === undefined) {
        javaVersion = new EnvironmentInformationService().getInstalledJavaVersionString() || UNKNOWN_JAVA_VERSION;
    }
    return javaVersion;
}

function getLegacyArchitecture() {
    switch (process.arch) {
        case 'x64':
            return 'amd64';
        case 'arm64':
            return 'aarch64';
        case 'ia32':
            return 'x86';
        default:
            return process.arch;
    }
}
