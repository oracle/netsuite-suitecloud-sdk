const NodeUtils = require('./../utils/NodeUtils');
const unwrapExceptionMessage = require('./../utils/ExceptionUtils').unwrapExceptionMessage;

module.exports = class CommandOutputHandler {
	showSuccessResult(actionResult, formatOutputFunction) {
		if (!formatOutputFunction) {
			this._defaultSuccessOutputFormat(actionResult);
		} else {
			formatOutputFunction(actionResult);
		}
	}

	showErrorResult(error) {
		NodeUtils.println(unwrapExceptionMessage(error), NodeUtils.COLORS.ERROR);
	}

	_defaultSuccessOutputFormat(actionResult) {
		NodeUtils.println(actionResult, NodeUtils.COLORS.RESULT);
	}
};
