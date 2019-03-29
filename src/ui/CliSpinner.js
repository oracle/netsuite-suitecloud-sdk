'use strict';

const assert = require('assert');
const Spinner = require('cli-spinner').Spinner;

const SPINNER_STRING = '⠋⠙⠹⠸⠼⠴⠦⠧⠏';

module.exports = {

	executeWithSpinner(context) {
		assert(context.action instanceof Promise, 'Promise is expected');
		assert(context.message, 'Message is mandatory when spinner is enabled');

		const promise = context.action;
		const message = context.message;

		const spinner = new Spinner(message);
		// TODO: set spinner string conditionally based on the terminal cli is executed in
		// spinner.setSpinnerString(SPINNER_STRING);

		return new Promise((resolve, reject) => {
			spinner.start();
			promise.then((result) => {
				spinner.stop(true);
				resolve(result);
			}).catch((error) => {
				spinner.stop(true);
				reject(error);
			});
		});
	}

};
