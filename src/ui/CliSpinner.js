'use strict';

const Spinner = require('cli-spinner').Spinner;

const SPINNER_STRING = '⠋⠙⠹⠸⠼⠴⠦⠧⠏';

module.exports = class CliSpinner extends Spinner {

	constructor(message) {
		super(message);
		super.setSpinnerString(SPINNER_STRING);
	}

	stop() {
		// always clear console
		super.stop(true);
	}

};
