const NodeUtils = require('./utils/NodeUtils');
const unwrapExceptionMessage = require('./utils/ExceptionUtils').unwrapExceptionMessage;

module.exports = class CommandOutputHandler {

	handle(action, formatOutput) {
		return action
			.then(formatOutput)
			.catch(error => {
				NodeUtils.println(unwrapExceptionMessage(error), NodeUtils.COLORS.ERROR);
			});
	}
};