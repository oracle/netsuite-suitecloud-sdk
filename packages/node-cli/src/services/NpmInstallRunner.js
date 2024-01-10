/*
** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
const childProcess = require('child_process');

const PLATFORM_WIN = 'win32';
const COMMAND_NPM_WIN = 'npm.cmd';
const COMMAND_NPM_UNIX = 'npm';
const NPM_ARG_INSTALL = 'install';
const NPM_RESULT_CLOSE = 'close';

module.exports = {
	run: function(projectAbsolutePath) {
		return new Promise((resolve, reject) => {
			let npm = process.platform === PLATFORM_WIN ? COMMAND_NPM_WIN : COMMAND_NPM_UNIX;

			const result = childProcess.spawn(npm, [NPM_ARG_INSTALL], {
				cwd: projectAbsolutePath,
				stdio: 'inherit',
				windowsHide: true
			});

			result.on(NPM_RESULT_CLOSE, code => {
				if (code === 0) {
					resolve();
				} else if (code !== 0) {
					reject();
				}
			});
		});
	}
};
