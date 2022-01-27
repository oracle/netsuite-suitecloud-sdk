'use strict';
const readline = require('readline');
const os = require('os');
const RED_COLOR = '\x1b[31m';
const COLOR_RESET = '\x1b[0m';
const message = 'The installation will download the SuiteCloud SDK runtime dependency\n' +
	'for this package. By downloading the SuiteCloud SDK dependency,\n' +
	'you are accepting the Oracle Free Use Terms and Conditions license\n' +
	'displayed above.';
const REJECT_EXIT_CODE = 1;

function showLicense() {

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	rl.on('close', () => {
		console.log(`${os.EOL}Installation aborted by user.`);
		process.exit(REJECT_EXIT_CODE);
	});

	console.log(RED_COLOR);
	console.log(message);
	console.log(COLOR_RESET);

	function promptQuestion() {

		rl.question('Do you want to continue? (y/n) ', (answer) => {

			if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
				rl.removeAllListeners();
				rl.close();
				process.exit();
			}
			if (answer.toLowerCase() === 'n' || answer.toLowerCase() === 'no') {
				rl.removeAllListeners();
				rl.close();
				process.exit(REJECT_EXIT_CODE);
			}

			return promptQuestion();
		});
	}

	promptQuestion();
}

showLicense();
