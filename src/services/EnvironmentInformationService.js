/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';
const spawn = require('child_process').spawnSync;
const { SDK_REQUIRED_JAVA_VERSION } = require('../ApplicationConstants');

module.exports = class EnvironmentInformationService {

	isInstalledJavaVersionValid() {
		const installedJavaVersion = this.getInstalledJavaVersion();
		return installedJavaVersion.startsWith(`"${SDK_REQUIRED_JAVA_VERSION}`);
	}

	getInstalledJavaVersion() {
		const cmd = 'java -fullversion';
		const childProcess = spawn(cmd, [], { shell: true });
		const fullVersionOutput = childProcess.stderr.toString();
		const segments = fullVersionOutput.split(' ');
		return segments[3]; //The actual version is in the 4th segment of the output (i.e. java full version "11.1.0_201-b09")
	}
};
