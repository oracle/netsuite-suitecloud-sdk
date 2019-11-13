/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
const childProcess = require('child_process');

module.exports = {
	run: function(projectAbsolutePath) {
		return new Promise((resolve, reject) => {
			let npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

			const result = childProcess.spawn( npm, ['install'], {
				cwd: projectAbsolutePath,
				stdio: [process.stdin, process.stdout, process.stderr]
			});

			result.on('close', code => {
				if (code === 0) {
					resolve(code);
				} else if (code !== 0) {
					reject(code);
				}
			});
		});
	}
};
