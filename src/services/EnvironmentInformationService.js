/*
 ** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';
const spawn = require('child_process').spawnSync;
const { SDK_REQUIRED_JAVA_VERSION } = require('../ApplicationConstants');

module.exports = class EnvironmentInformationService {
	isInstalledJavaVersionValid() {
		const installedJavaVersion = this.getInstalledJavaVersionString();
		if (installedJavaVersion) {
			return installedJavaVersion.startsWith(SDK_REQUIRED_JAVA_VERSION);
		}
		// in case there is no java installed or not available from path
		return false;
	}

	getInstalledJavaVersionString() {
		const childProcess = spawn('java', ['-fullversion'], { shell: true });
		const fullVersionOutput = childProcess.stderr.toString(); //The output should be: java full version "11.1.0_201-b09"
		const javaVersion = new RegExp('java full version').test(fullVersionOutput)
			? fullVersionOutput.split(' ')[3].replace(/"|\r\n|\n|\r/g, '')
			: '';
		return javaVersion; 
	}
};
