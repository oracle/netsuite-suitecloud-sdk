const childProcess = require('child_process');

module.exports = {
	run: async function(projectAbsolutePath) {
		return await new Promise((resolve, reject) => {
			let npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

			const result = childProcess.spawn( npm, ['install'], {
				cwd: projectAbsolutePath,
				stdio: [process.stdin, process.stdout, process.stderr]
			});

			result.on('exit', function(code) {
				resolve(code);
			});

			result.on('error', function(error) {
				reject(error);
			});
		});
	}

};
