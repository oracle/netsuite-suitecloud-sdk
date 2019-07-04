module.exports = {

	unwrapExceptionMessage(exception) {
		if (exception.getErrorMessage) {
			return exception.getErrorMessage();
		} else {
			return exception;
		}
	},

	unwrapInformationMessage(exception) {
		if (exception.getInfoMessage) {
			return exception.getInfoMessage();
		} else {
			return '';
		}
	}

};