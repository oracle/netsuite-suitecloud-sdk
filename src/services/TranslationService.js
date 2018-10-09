'use strict';

const ApplicationConstants = require('../ApplicationConstants');
const FileUtils = require('../FileUtils');
const path = require('path');
let messages;

(function readMessagesFromFile() {
    const filePath = path.join(__dirname, ApplicationConstants.DEFAULT_MESSAGES_FILE);
    messages = FileUtils.read(filePath);
})();

module.exports = {

    getMessage: function (key, params) {
        let message = messages[key];
        if (params && params.length > 0) {
            return this._injectParameters(message, params);
        }

        return message;
    },

    _injectParameters(message, params) {
        return message.replace(/{(\d+)}/g, function (match, number) {
            return typeof params[number] !== 'undefined' ? params[number] : match;
        });
    }

};
