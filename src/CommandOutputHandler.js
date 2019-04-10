const NodeUtils = require('./utils/NodeUtils');
const unwrapExceptionMessage = require('./utils/ExceptionUtils').unwrapExceptionMessage;

module.exports = class CommandOutputHandler {

	handle(action, commandName) {
		return action.then(response => {
			NodeUtils.println(`Command: ${commandName}`, NodeUtils.COLORS.INFO);
			NodeUtils.println(response, NodeUtils.COLORS.INFO);

			const operationResult = JSON.parse(response);
			if (!this._showOperationResult(operationResult, commandName)) {
				NodeUtils.println(response, NodeUtils.COLORS.RESULT);
			}

		}).catch(error => {
			NodeUtils.println(unwrapExceptionMessage(error), NodeUtils.COLORS.ERROR);
		});
	}

	_showOperationResult({status, message, data}, commandName) {
		if (status == 'ERROR') {
			NodeUtils.println(message, NodeUtils.COLORS.ERROR);
			return true;
		}

		if (commandName == 'listfiles') {
			if (message) {
				NodeUtils.println(message, NodeUtils.COLORS.RESULT);
			}
			if (data) {
				data.forEach(el => {
					NodeUtils.println(el, NodeUtils.COLORS.RESULT)
				});
			}
			return true;
		}

		else if (commandName == 'importobjects') {
			const importedObjects = data.customObjects.filter(el => el.result.code === 'SUCCESS');
			const unImportedObjects = data.customObjects.filter(el => el.result.code === 'FAILED');
			
			if (importedObjects.length) {
				NodeUtils.println('The following object(s) were imported successfully:', NodeUtils.COLORS.RESULT);
				importedObjects.forEach(el => NodeUtils.println(`${el.type}:${el.id}`, NodeUtils.COLORS.RESULT))
			}
			if (unImportedObjects.length) {
				NodeUtils.println('The following object(s) were not imported:', NodeUtils.COLORS.WARNING);
				unImportedObjects.forEach((el, index, arr) => 
					NodeUtils.println(`${el.type}:${el.id}:${el.result.message}`, NodeUtils.COLORS.WARNING)
					);
			}
			return true;
		}

		return false;
	}

};