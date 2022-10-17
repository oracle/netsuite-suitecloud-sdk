define([], function () {
    /**
     * @class Shopper
     * @classdesc Class for retrieving information about current shopper
     * @protected
     * @constructor
     *
     * @since 2020.2
     */
    function Shopper() {

        /**
         * CurrencyId of the current shopper.
         * @name Shopper#currencyId
         * @type {number}
         *
         * @throws {SuiteScriptError} SSS_INVALID_TYPE_ARG if currencyId is not a number
         * @throws {SuiteScriptError} _1_IS_NOT_A_VALID_KEY_FOR_2 if value is not valid
         * @since 2020.2
         */
        this.currencyId = undefined;
        /**
         * LanguageLocale of the current shopper.
         * @name Shopper#languageLocale
         * @type {string}
         *
         * @throws {SuiteScriptError} SSS_INVALID_TYPE_ARG if languageLocale is not a string
         * @throws {SuiteScriptError} _1_IS_NOT_A_VALID_KEY_FOR_2 if value is not valid
         * @since 2020.2
         */
        this.languageLocale = undefined;
        /**
         * SubsidiaryId of the current shopper.
         * @name Shopper#subsidiaryId
         * @type {number}
         *
         * @throws {SuiteScriptError} SSS_INVALID_TYPE_ARG if subsidiaryId is not a number
         * @throws {SuiteScriptError} _1_IS_NOT_A_VALID_KEY_FOR_2 if value is not valid
         * @since 2020.2
         */
        this.subsidiaryId = undefined;
        /**
         * Details of the recognized shopper. Returned object is empty if shopper is anonymous.
         * @name Shopper#details
         * @type {object}
         * @readonly
         *
         * @since 2020.2
         */
        this.details = undefined;
        /**
         * PriceLevelId of the current shopper.
         * @name Shopper#priceLevelId
         * @type {number}
         * @readonly
         *
         * @since 2020.2
         */
        this.priceLevelId = undefined;
        /**
         * Returns true if current shopper is recognized, false if anonymous.
         * @name Shopper#isRecognized
         * @type {boolean}
         * @readonly
         *
         * @since 2020.2
         */
        this.isRecognized = undefined;
        /**
         * Returns true if current shopper is guest, false if it's not a guest.
         * @name Shopper#isGuest
         * @type {boolean}
         * @readonly
         *
         * @since 2021.1
         */
        this.isGuest = undefined;
        /**
         * Id of site the script is currently executed from.
         * @name Shopper#siteId
         * @type {number}
         * @readonly
         *
         * @since 2020.2
         */
        this.siteId = undefined;
    }

    return new Shopper();
});