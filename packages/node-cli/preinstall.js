'use strict';
const readline = require('readline');
const os = require('os');
const RED_COLOR = '\x1b[31m';
const COLOR_RESET = '\x1b[0m';
const question = 'Do you want to continue? (y/n) ';
const installationMessage = 'The installation will download the SuiteCloud SDK runtime dependency\n' +
	'for this package. By downloading the SuiteCloud SDK dependency,\n' +
	'you are accepting the Oracle Free Use Terms and Conditions license\n' +
	'displayed above.';
const quitMessage = 'To continue with the installation, the previously displayed license must be accepted.';
const abortMessage = 'Installation aborted by user.';
const REJECT_EXIT_CODE = 1;

function showLicense() {

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	rl.on('close',  () => {
		console.log(os.EOL + RED_COLOR + abortMessage + COLOR_RESET + os.EOL);
		process.exit(REJECT_EXIT_CODE);
	});

	console.log(os.EOL + RED_COLOR + installationMessage + COLOR_RESET + os.EOL);

	function promptQuestion() {

		rl.question(question, (answer) => {

			if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
				rl.removeAllListeners();
				rl.close();
				process.exit();
			}
			if (answer.toLowerCase() === 'n' || answer.toLowerCase() === 'no') {
				rl.removeAllListeners();
				rl.close();
				console.log(os.EOL + RED_COLOR + quitMessage + COLOR_RESET + os.EOL);
				process.exit(REJECT_EXIT_CODE);
			}

			return promptQuestion();
		});
	}

	promptQuestion();
}

showLicense();
