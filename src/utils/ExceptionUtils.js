module.exports = {

	unwrapExceptionMessage(exception) {
		if (exception.getErrorMessage) {
			return exception.getErrorMessage();
		} else {
			return exception;
		}
	}

};