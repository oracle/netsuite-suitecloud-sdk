'use strict';
const os = require('os');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { spawn } = require('child_process');

const LICENSE_PATH = path.normalize('./resources/FUTC-LICENSE.txt');
const LICENSE_FILE_ENCODING = 'utf8';
const WINDOWS_PLATFORM = 'win32';
const WINDOWS_SHELL = 'cmd';
const WINDOWS_SHELL_PARAMS = ['/c', 'more', LICENSE_PATH];
const UNIX_SHELL = 'sh';
const UNIX_SHELL_PARAMS = ['-c', `more ${LICENSE_PATH}`];
const REJECT_EXIT_CODE = 1;

const RED_COLOR = '\x1b[31m';
const COLOR_RESET = '\x1b[0m';
const INSTALLATION_MESSAGE = 'The installation of this package will download the SuiteCloud SDK runtime dependency\n' +
	'released under the Oracle Free Use Terms and Conditions license displayed above.';
const QUESTION = 'Do you want to continue? (yes/no) ';
const ABORT_MESSAGE = 'Installation aborted by user.';
const NEGATIVE_ANSWERS = ['n', 'no'];
const AFFIRMATIVE_ANSWERS = ['y', 'yes'];
const LICENSE_NOT_FOUND_ERROR = 'The FUTC-LICENSE.txt file is missing and cannot be displayed. Try again.';

(() => {
	if (process.env.npm_config_supressSuiteCloudSDKLicensePrompt) {
		return showLicenseWithoutPrompt();
	}
	return showLicenseAndPrompt();
})();

function showLicenseWithoutPrompt() {

	try {
		const license = fs.readFileSync(LICENSE_PATH, LICENSE_FILE_ENCODING);
		console.log(license);
		printMessage(INSTALLATION_MESSAGE);
	} catch (err) {
		printMessage(LICENSE_NOT_FOUND_ERROR);
		process.exit(REJECT_EXIT_CODE);
	}
}

function showLicenseAndPrompt() {

	let shell;
	if (os.platform() === WINDOWS_PLATFORM) {
		shell = spawn(WINDOWS_SHELL, WINDOWS_SHELL_PARAMS, { stdio: 'inherit' });
	} else {
		shell = spawn(UNIX_SHELL, UNIX_SHELL_PARAMS, { stdio: 'inherit' });
	}

	shell.on('close', (code) => {
		if (code === 0) {
			return promptQuestion();
		}
		return process.exit(code);
	});
	shell.on('error', () => {
		return process.exit(1);
	});
}

function promptQuestion() {

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	rl.on('close', () => {
		printMessage(ABORT_MESSAGE);
		return process.exit(REJECT_EXIT_CODE);
	});

	printMessage(INSTALLATION_MESSAGE);

	(function askQuestion() {

		rl.question(QUESTION, (answer) => {
			answer = answer.trim().toLowerCase();

			if (AFFIRMATIVE_ANSWERS.includes(answer)) {
				rl.removeAllListeners();
				rl.close();
				process.exit();
			}
			if (NEGATIVE_ANSWERS.includes(answer)) {
				rl.removeAllListeners();
				rl.close();
				printMessage(ABORT_MESSAGE);
				process.exit(REJECT_EXIT_CODE);
			}

			return askQuestion();
		});
	})();
}

function printMessage(message) {
	console.log(os.EOL + RED_COLOR + message + COLOR_RESET + os.EOL);
}
