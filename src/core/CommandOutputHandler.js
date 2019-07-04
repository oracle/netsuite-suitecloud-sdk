const NodeUtils = require('./../utils/NodeUtils');
const {unwrapExceptionMessage, unwrapInformationMessage} = require('./../utils/ExceptionUtils');

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

		const informativeMessage = unwrapInformationMessage(error);

		if(informativeMessage){
			NodeUtils.println();
			NodeUtils.println(informativeMessage, NodeUtils.COLORS.INFO);
		}
	}

	_defaultSuccessOutputFormat(actionResult) {
		NodeUtils.println(actionResult, NodeUtils.COLORS.RESULT);
	}
};
