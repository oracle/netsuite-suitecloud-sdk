define(['./MessageInstance'], function (Message) {
    /**
     * SuiteScript Message Module (Client Side)
     * Load the message module to display a message at the top of the screen under the menu bar.
     *
     * @module N/ui/message
     * @suiteScriptVersion 2.x
     *
     */
    var message = function () { };

    /**
     * Creates a message that can be displayed or hidden near the top of the page.
     *
     * @restriction Client SuiteScript only
     * @governance none
     * @param {Object} options The options object.
     * @param {string} options.type The type of message, see message.Type
     * @param {string} [options.title] The title of the message. Defaults to empty string.
     * @param {string} [options.message] The content of the message. Defaults to empty string.
     * @param {number} [options.duration] The amount of time, in milliseconds, to show the message. The default is 0, which shows the message until Message.hide() is called.
     *
     * @return {Message} A message object which can be shown or hidden.
     * @throws {SuiteScriptError} MISSING_REQD_ARGUMENT If options or type are undefined
     *
     * @since 2016.1
     */
    message.prototype.create = function (options) { };

    /**
     * Enum for message types
     * @enum {string}
     * @readonly
     */
    function messageType() {
        this.CONFIRMATION = 0.0;
        this.INFORMATION = 1.0;
        this.WARNING = 2.0;
        this.ERROR = 3.0;
    }

    message.prototype.Type = new messageType();

    /**
     * @exports N/ui/message
     * @namespace message
     */
    return new message();
});