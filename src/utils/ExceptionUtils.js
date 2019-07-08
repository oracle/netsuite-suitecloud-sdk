module.exports = {
	unwrapExceptionMessage(exception) {
		return exception.getErrorMessage ? exception.getErrorMessage() : exception;
	},

	unwrapInformationMessage(exception) {
		return exception.getInfoMessage ? exception.getInfoMessage() : '';
	},
};
