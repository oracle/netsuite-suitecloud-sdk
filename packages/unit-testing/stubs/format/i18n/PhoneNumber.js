define([], function () {
    /**
     * @class PhoneNumber
     * @classdesc This object holds all necessary information about phone number.
     * @constructor
     * @protected
     *
     * @since 2020.2
     *
     * Here must be different version for client side. API is the same but internal reperesentation is different
     * because libphonenumber-js uses different approach to formatting. It calls PN.format('INTERNATIONAL')
     * instead of our PNFormatter.format(PN) where PN is object of type PhoneNumber
     */
    function PhoneNumber() {

        /**
         * Valid - it means legacyPhoneNumber was successfuly parsed and contains correct phone number object
         * @name PhoneNumber#valid
         * @type {boolean}
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2020.2
         */
        this.valid = undefined;
        /**
         * Country code
         * @name PhoneNumber#countryCode
         * @type {string}
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2020.2
         */
        this.countryCode = undefined;
        /**
         * Extension
         * @name PhoneNumber#extension
         * @type {string}
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2020.2
         */
        this.extension = undefined;
        /**
         * National number
         * @name PhoneNumber#nationalNumber
         * @type {string}
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2020.2
         */
        this.nationalNumber = undefined;
        /**
         * Number of leading zeros
         * @name PhoneNumber#numberOfLeadingZeros
         * @type {string}
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2020.2
         */
        this.numberOfLeadingZeros = undefined;
        /**
         * Carrier code
         * @name PhoneNumber#carrierCode
         * @type {string}
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2020.2
         */
        this.carrierCode = undefined;
        /**
         * Raw input
         * @name PhoneNumber#rawInput
         * @type {string}
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2020.2
         */
        this.rawInput = undefined;
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

    return new PhoneNumber();
});