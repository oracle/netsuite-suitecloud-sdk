define(['./SecretKey', './Hash', './Hmac', './Cipher', './Decipher'], function (SecretKey, Hash, Hmac, Cipher, Decipher) {
    /**
     * SuiteScript crypto module
     * The N/crypto module encapsulates hashing, hash-based message authentication (hmac), and symmetrical encryption.
     *
     * @module N/crypto
     * @suiteScriptVersion 2.x
     *
     */
    var crypto = function () { };

    /**
     * Method used to create a new crypto.SecretKey object.
     * @param {Object} options The options object.
     * @param {string} options.guid A GUID used to generate a secret key.
     * @param {string} options.secret Secret for the key
     * @param {string} options.encoding Specifies the encoding for the SecureKey.
     * @return {SecretKey}
     * @throws {SuiteScriptError} MISSING_REQD_ARGUMENT If options or mandatory parameter are undefined.
     * @since 2015.1
     */
    crypto.prototype.createSecretKey = function (options) { };

    /**
     * Method used to create a crypto.Hash object.
     * @param {Object} options
     * @param {string} options.algorithm The hash algorithm. Set using the crypto.HashAlg enum.
     * @return {Hash}
     * @throws {SuiteScriptError} MISSING_REQD_ARGUMENT If options or mandatory parameter are undefined.
     * @since 2015.1
     */
    crypto.prototype.createHash = function (options) { };

    /**
     * Method used to create a crypto.Hmac object.
     * @param {Object} options The options object.
     * @param {string} options.algorithm The hash algorithm. Use the crypto.HashAlg enum to set this value.
     * @param {SecretKey} options.key The crypto.SecretKey object.
     * @return {Hmac}
     * @throws {SuiteScriptError} MISSING_REQD_ARGUMENT If options or mandatory parameter are undefined.
     * @since 2015.1
     */
    crypto.prototype.createHmac = function (options) { };

    /**
     * Method used to create and return a crypto.EncryptionAlg object.
     * @governance none
     * @param {object} options The options object.
     * @param {string} options.algorithm The hash algorithm. Set the value using the crypto.EncryptionAlg enum.
     * @param {SecretKey} options.key The crypto.SecretKey object.
     * @param {string} options.blockCipherMode
     * @param {string} [options.padding] The padding for the cipher text.
     * @return {Cipher}
     * @throws {SuiteScriptError} MISSING_REQD_ARGUMENT If options or mandatory parameter are undefined.
     * @since 2015.1
     */
    crypto.prototype.createCipher = function (options) { };

    /**
     * Method used to create a crypto.Decipher object.
     * @param {object} options The options object.
     * @param {string} options.algorithm The hash algorithm. Set by the crypto.EncryptionAlg enum.
     * @param {SecretKey} options.key The crypto.SecretKey object used for encryption.
     * @param {string} options.blockCipherMode
     * @param {Object} [options.padding] The padding for the cipher. Set the value using the crypto.Padding enum.
     * @param {string} options.iv The initialization vector that was used for encryption.
     * @return {Decipher}
     * @throws {SuiteScriptError} MISSING_REQD_ARGUMENT If options or mandatory parameter are undefined.
     * @since 2015.1
     */
    crypto.prototype.createDecipher = function (options) { };

    /**
     * Method to check whether a password in a record corresponds to the input value
     * @param {object} options The options object.
     * @param {string} options.recordType Type of the record with a password field
     * @param {number} options.recordId Id of the record with password field
     * @param {string} options.value Input value to be checked against the password stored in the record
     * @param {string} options.fieldId Id of the password field
     * @param {string} [options.sublistId] Id of the sublist if password field is on a line
     * @param {number} [options.line] Zero based line index of a password field if on a line
     * @return {boolean}
     * @since 2021.1
     */
    crypto.prototype.checkPasswordField = function (options) { };

    /**
     * Holds the string values for supported hashing algorithms. Sets the value of the options.algorithm parameter for crypto.createHash(options) and crypto.createHmac(options).
     * @enum {string}
     * @readonly
     */
    function cryptoHashAlg() {
        this.SHA1 = 'SHA1';
        this.SHA256 = 'SHA256';
        this.SHA512 = 'SHA512';
        this.MD5 = 'MD5';
    }

    crypto.prototype.HashAlg = new cryptoHashAlg();

    /**
     * Holds the string values for supported encryption algorithms. Sets the options.algorithm parameter for crypto.createCipher(options).
     * @enum {string}
     * @readonly
     */
    function cryptoEncryptionAlg() {
        this.AES = 'AES';
    }

    crypto.prototype.EncryptionAlg = new cryptoEncryptionAlg();

    /**
     * Holds the string values for supported encodings algorithms. Sets the options.encoding parameter for crypto.createSecretKey(options).
     * @enum {string}
     * @readonly
     */
    function cryptoEncoding() {
        this.UTF_8 = 'UTF_8';
        this.BASE_16 = 'BASE_16';
        this.BASE_32 = 'BASE_32';
        this.BASE_64 = 'BASE_64';
        this.BASE_64_URL_SAFE = 'BASE_64_URL_SAFE';
        this.HEX = 'HEX';
    }

    crypto.prototype.Encoding = new cryptoEncoding();

    /**
     * Holds the string values for supported cipher padding. Sets the options.padding parameter for crypto.createCipher(options) and crypto.createDecipher(options).
     * @enum {string}
     * @readonly
     */
    function cryptoPadding() {
        this.NoPadding = 'NoPadding';
        this.PKCS5Padding = 'PKCS5Padding';
    }

    crypto.prototype.Padding = new cryptoPadding();

    /**
     * @exports N/crypto
     * @namespace crypto
     */
    return new crypto();
});