define([], function () {
    /**
     * @class CipherPayload
     * @classdesc Encapsulates a cipher payload.
     * @protected
     * @constructor
     *
     * @since 2015.2
     */
    function CipherPayload() {

        /**
         * Initialization vector for the cipher payload.
         * @name CipherPayload#iv
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         * @since 2015.2
         */
        this.iv = undefined;
        /**
         * Initialization vector for the cipher payload.
         * @name CipherPayload#ciphertext
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.ciphertext = undefined;
        /**
         * Returns the object type name (crypto.CipherPayload)
         * @restriction Server SuiteScript only
         * @governance none
         * @return {string}
         *
         * @since 2015.2
         */
        this.toString = function () { };

        /**
         * get JSON format of the object
         * @restriction Server SuiteScript only
         * @governance none
         * @return {Object}
         *
         * @since 2020.1
         */
        this.toJSON = function () { };
    }

    return new CipherPayload();
});