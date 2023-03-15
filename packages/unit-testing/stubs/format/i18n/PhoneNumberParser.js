define(['./PhoneNumber'], function (PhoneNumber) {
    /**
     * Object for parsing phone numbers.
     * @class
     * @classdesc Method 'parse' takes string and returns object of PhoneNumber type.
     * @constructor
     * @protected
     *
     * @param {string} defaultCountry Default country for parsing (e.g. UNITEDSTATES)
     * @param {string} defaultCountryCode Code of default country (e.g. US)
     * @since 2020.2
     */
    function PhoneNumberParser() {

        /**
         * Default country
         * @name PhoneNumberParser#defaultCountry
         * @type {string}
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2020.2
         */
        this.defaultCountry = undefined;
        /**
         * Default country code
         * @name PhoneNumberParser#defaultCountryCode
         * @type {string}
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2020.2
         */
        this.defaultCountryCode = undefined;
        /**
         * Returns parsed phone number.
         * @governance none
         *
         * @param {Object} options
         * @param {string} options.number Phone number to be parsed
         *
         * @return {PhoneNumber}
         *
         * @since 2020.2
         */
        this.parse = function (options) { };

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

    return new PhoneNumberParser();
});