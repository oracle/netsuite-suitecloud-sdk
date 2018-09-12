module.exports = class CLIException {
    constructor(code, defaultMessage, translationKey){
        this._code = code;
        this._defaultMessage = defaultMessage;
        this._translationKey = translationKey;
    }
}