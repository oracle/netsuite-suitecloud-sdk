define([], function () {
    /**
     * Returns a new instance of SecretKey used for hmac, cipher and decipher;
     * Use createSecretKey to create an instance;
     *
     * @class
     * @classdesc Encapsulates the handle to the key. The handler does not store the key value. It points to the key stored within the NetSuite system. The GUID or secret is also required to find the key.
     * @param {String} guid
     * @param {String} secret
     * @param {String} encoding
     * @constructor
     * @protected
     *
     * @since 2015.2
     */
    function SecretKey() {

        /**
         * The GUID associated with the secret key.
         * @name SecretKey#guid
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.guid = undefined;
        /**
         * The secret for the key
         * @name SecretKey#secret
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.secret = undefined;
        /**
         * The encoding used for the clear text value of the secret key.
         * @name SecretKey#encoding
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.encoding = undefined;
        /**
         * Returns the object type name (crypto.SecretKey)
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

    return new SecretKey();
});