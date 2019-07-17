module.exports = class CLIException {
	constructor(code, defaultMessage, infoMessage, translationKey) {
		this._code = code;
		this._defaultMessage = defaultMessage;
		this._infoMessage = infoMessage;
		this._translationKey = translationKey;
	}

	getInfoMessage() {
		return this._infoMessage;
	}

	getErrorMessage() {
		return this._defaultMessage;
	}
};
