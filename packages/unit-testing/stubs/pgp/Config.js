define([], function () {
    /**
     * Returns a new instance of pgp.Config used to configure PGP operations.
     *
	 * @class Config
	 * @classdesc General configuration options that can be used for message decryption.
	 * @constructor
     * @protected
     *
     * @since 2022.2
     */
    function Config() {
        /**
         * Allows messages that do not include integrity protection.
         * @name Config#allowMessagesWithoutIntegrityProtection
         * @type {boolean}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2022.2
         */
        this.allowMessagesWithoutIntegrityProtection = undefined;

        /**
         * Enables decryption that is not secured with signing keys.
         * @name Config#allowInsecureDecryptionWithSigningKeys
         * @type {boolean}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2022.2
         */
        this.allowInsecureDecryptionWithSigningKeys = undefined;

        /**
         * Allows relaxed signature parsing for configuration objects.
         * @name Config#useRelaxedSignatureParsing
         * @type {boolean}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2022.2
         */
        this.useRelaxedSignatureParsing = undefined;

    }

    return new Config();
});
