/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const spawn = require('child_process').spawnSync;
const { SDK_COMPATIBLE_JAVA_VERSIONS } = require('../ApplicationConstants');

module.exports = class EnvironmentInformationService {
	isInstalledJavaVersionValid() {
		return this.isJavaVersionSupported(this.getInstalledJavaVersionString());
	}

	isJavaVersionSupported(javaVersion) {
		return /^\d+(?:\.\d+)*$/.test(javaVersion) &&
			SDK_COMPATIBLE_JAVA_VERSIONS.includes(javaVersion.split('.')[0]);
	}

	getInstalledJavaVersionString() {
		const childProcess = spawn('java', ['-version'], { shell: false });
		if (childProcess.error || (childProcess.status != null && childProcess.status !== 0)) {
			return '';
		}
		const javaVersionOutput = `${childProcess.stderr || ''}\n${childProcess.stdout || ''}`;
		// The output should be similar to: java version "17.0.4" 2022-07-19 LTS
		// It's expected to have the version surrounded by double quotes and only contain numbers and dots
		const regex = /(?:\bjava version\b|\bopenjdk version\b) "([\d.]+)"/;
		const matchResult = javaVersionOutput.match(regex);
		return matchResult ? matchResult[1] : '';
	}
};
