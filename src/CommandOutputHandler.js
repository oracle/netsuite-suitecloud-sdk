const NodeUtils = require('./utils/NodeUtils');
const unwrapExceptionMessage = require('./utils/ExceptionUtils').unwrapExceptionMessage;

module.exports = class CommandOutputHandler {

	handle(action) {
		return action.then(response => {
			NodeUtils.println(response, NodeUtils.COLORS.RESULT);
		}).catch(error => {
			NodeUtils.println(unwrapExceptionMessage(error), NodeUtils.COLORS.ERROR);
		});
	}

};