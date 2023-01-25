define([], function () {
    function NumberFormatter() {
        /**
         * @name NumberFormatter#groupSeparator
         * @type {string}
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         */
        this.groupSeparator = undefined;
        /**
         * @name NumberFormatter#decimalSeparator
         * @type {string}
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         */
        this.decimalSeparator = undefined;
        /**
         * @name NumberFormatter#locale
         * @type {string}
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         */
        this.locale = undefined;
        /**
         * @name NumberFormatter#presicion
         * @type {number}
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         */
        this.precision = undefined;

        this.negativeNumberFormat = undefined;

        /**
         * @param {Object} options
         * @param {Object} options.number The number to be formatted
         *
         * @return {string}
         */
        this.format = function (options) { };

        /**
         * get JSON format of the object
         * @governance none
         * @return {Object}
         */
        this.toJSON = function () { };

        /**
         * Returns the object type name
         * @governance none
         * @return {string}
         */
        this.toString = function () { };
    }

    return new NumberFormatter();
});