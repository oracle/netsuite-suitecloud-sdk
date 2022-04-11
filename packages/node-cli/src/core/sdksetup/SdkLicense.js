'use strict';
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const LICENSE_PATH = path.normalize('./resources/FUTC-LICENSE.txt');
const WINDOWS_PLATFORM = 'win32';
const LINUX_PLATFORM = 'linux';
const OSX_PLATFORM = 'darwin';
const WINDOWS_CMD = 'start';
const LINUX_CMD = 'xdg-open';
const OSX_CMD = 'open';
const ERROR_MESSAGE = 'Something went wrong.';
const LICENSE_MESSAGE = 'Use the --acceptsuitecloudsdklicense flag to accept the FUTC license:' +
	' https://www.oracle.com/downloads/licenses/oracle-free-license.html';
const supportedPlatformsCommands = {
	[WINDOWS_PLATFORM]: WINDOWS_CMD,
	[LINUX_PLATFORM]: LINUX_CMD,
	[OSX_PLATFORM]: OSX_CMD,
};

class SdkLicense {

	show() {
		if (process.env.npm_config_acceptsuitecloudsdklicense || process.env.npm_config_acceptSuiteCloudSDKLicense) {
			return;
		}
		const currentPlatform = os.platform();
		const command = supportedPlatformsCommands[currentPlatform];
		const execution = spawnSync(command, [LICENSE_PATH], { stdio: 'ignore', detached: true, shell: true });
		if (execution.error || execution.status !== 0) {
			console.error(ERROR_MESSAGE);
			console.error(LICENSE_MESSAGE);
			return process.exit(execution.error?.errno || execution.status);
		}
	}
}

module.exports = new SdkLicense();
