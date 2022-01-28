'use strict';
const os = require('os');
const path = require('path');
const readline = require('readline');
const { spawn } = require('child_process');

const LICENSE_PATH = path.normalize('./resources/FUTC-LICENSE.txt');
const WINDOWS_PLATFORM = 'win32';
const WINDOWS_SHELL = 'cmd';
const WINDOWS_SHELL_PARAMS = ['/c', 'more', LICENSE_PATH];
const UNIX_SHELL = 'sh';
const UNIX_SHELL_PARAMS = ['-c', `less -meX ${LICENSE_PATH}`];

const RED_COLOR = '\x1b[31m';
const COLOR_RESET = '\x1b[0m';
const QUESTION = 'Do you want to continue? (yes/no) ';
const INSTALLATION_MESSAGE = 'The installation will download the SuiteCloud SDK runtime dependency\n' +
	'for this package. By downloading the SuiteCloud SDK dependency,\n' +
	'you are accepting the Oracle Free Use Terms and Conditions license\n' +
	'displayed above.';
const QUIT_MESSAGE = 'To continue with the installation, the previously displayed license must be accepted.';
const ABORT_MESSAGE = 'Installation aborted by user.';
const NEGATIVE_ANSWERS = ['n', 'no'];
const AFFIRMATIVE_ANSWERS = ['y', 'yes'];
const REJECT_EXIT_CODE = 1;


(() => {
	//TODO: define how to skip license to be accepted when running in CI
	// if (process.env.ACCEPT_SUITECLOUD_SDK_LICENSE) {
	// 	process.exit();
	// }
	return showLicense();
})();

function showLicense() {
	let shell;
	if (os.platform() === WINDOWS_PLATFORM) {
		shell = spawn(WINDOWS_SHELL, WINDOWS_SHELL_PARAMS, { stdio: 'inherit' });
	} else {
		shell = spawn(UNIX_SHELL, UNIX_SHELL_PARAMS, { stdio: 'inherit' });
	}
	shell.on('close', (code) => {
		if(code === 0) {
			return promptQuestion();
		}
		return process.exit(code);
	});
	shell.on('error', () => {
		return process.exit(REJECT_EXIT_CODE);
	});
}


function promptQuestion() {

	function printMessage(message) {
		console.log(os.EOL + RED_COLOR + message + COLOR_RESET + os.EOL);
	}

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
				printMessage(QUIT_MESSAGE);
				process.exit(REJECT_EXIT_CODE);
			}

			return askQuestion();
		});
	})();
}
