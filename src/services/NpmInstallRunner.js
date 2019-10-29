// const npm = require("global-npm");
const childProcess = require('child_process');

module.exports = {
	run: async function(projectAbsolutePath) {
		let promise = new Promise((resolve, reject) => {
			let npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

			// let path = 'C:\\Users\\kcng\\git\\netsuite-suitecloud-nodejs-cli\\projects\\com.netsuite.acp133';
			const result = childProcess.spawn( npm, ['install'], {
				cwd: projectAbsolutePath,
				stdio: [process.stdin, process.stdout, process.stderr]
			});

			// result.stdout.on( 'data', data => {
			// 	data = data.toString();
			// 	console.log(data.toString());
			// });
			result.on('exit', function(code) {
				resolve(code);
			});
			result.on('error', function(err) {
				reject(err);
			});
		});

		return await promise;
	}
}
