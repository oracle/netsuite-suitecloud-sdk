define([], function () {
    /**
     * Return a new instance of Message, used to show/hide messages
     * @class
     * @classdesc Encapsulates the Message object that gets created when calling the create method.
     * @constructor
     * @protected
     *
     * @since 2016.1
     */
    function Message() {

        /**
         * Shows the message.
         * @restriction Client SuiteScript only
         * @governance none
         * @param {Object} [options] The options object.
         * @param {number} [options.duration] The amount of time, in milliseconds, to show the message. The default is 0, which shows the message until Message.hide() is called.
         * @return {void}
         * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE If options.duration is specified with a non-numerical value.
         *
         * @since 2016.1
         */
        this.show = function (options) { };

        /**
         * Hides the message
         * @restriction Client SuiteScript only
         * @governance none
         * @return {void}
         *
         * @since 2016.1
         */
        this.hide = function () { };

        /**
         * Returns the object type name (message.Message)
         * @restriction Client SuiteScript only
         * @governance none
         * @return {string}
         *
         * @since 2016.1
         */
        this.toString = function () { };

        /**
         * get JSON format of the object
         * @restriction Client SuiteScript only
         * @governance none
         * @return {Object}
         *
         * @since 2016.1
         */
        this.toJSON = function () { };
    }

    return new Message();
});