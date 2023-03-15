define([], function () {
    /**
     * Object for formatting phone numbers.
     * @class
     * @classdesc Method format takes object of type PhoneNumber and returns string.
     * @constructor
     * @protected
     *
     * @param {*} formatType enum, to specify required format (e.g. INTERNATIONAL)
     *
     * @since 2020.2
     */
    function PhoneNumberFormatter() {

        /**
         * Format Type
         * @name PhoneNumberFormatter#formatType
         * @type {string}
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2020.2
         */
        this.formatType = undefined;
        /**
         * Returns the formatted phone number.
         * @governance none
         *
         * @param {Object} options
         * @param {Object} options.number Phone number to be formatted
         *
         * @return {string}
         *
         * @since 2020.2
         */
        this.format = function (options) { };

        /**
         * get JSON format of the object
         * @governance none
         * @return {Object}
         *
         * @since 2020.2
         */
        this.toJSON = function () { };

        /**
         * Returns the object type name
         * @governance none
         * @return {string}
         *
         * @since 2020.2
         */
        this.toString = function () { };
    }

    return new PhoneNumberFormatter();
});