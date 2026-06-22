define(['./Message'], function (Message) {
    /**
     * Returns a new instance of pgp.MessageData used to hold PGP message data.
     *
     * @class MessageData
     * @classdesc Stores message data with metadata, provides a set of single-step processors for various PGP use cases.
     * @constructor
     * @protected
     *
     * @since 2022.2
     */
    function MessageData() {
        /**
         * The file name associated with the message data.
         * @name MessageData#filename
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2022.2
         */
        this.filename = undefined;

        /**
         * The date of a message or modification date of the file.
         * @name MessageData#date
         * @type {Date}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2022.2
         */
        this.date = undefined;

        /**
         * Literal data packet type.
         * @name MessageData#format
         * @type {string} Use values from the pgp.Format enum
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2022.2
         */
        this.format = undefined;

        /**
         * Creates an encrypted message that is optionally signed.
         * @restriction Server SuiteScript only
         * @governance none
         *
         * @param {Object} options
         * @param {Key|Key[]} options.encryptionKeys One or more keys used to encrypt a message. If a key contains multiple valid encryption (sub)keys, the most recent key added will be used.
         * @param {Key|Key[]} [options.signingKeys] Zero or more keys used for signing. If a key contains multiple valid signing (sub)keys, the most recent key added will be used.
         * @param {string} [options.compressionAlgorithm] Compression algorithm to use. Use values from the pgp.CompressionAlgorithm enum.
         * @return {Message}
		 *
		 * @throws {SuiteScriptError} PGP_NO_ENCRYPTION_KEY_FOUND_IN_KEY_PARAM_1 when no valid encryption (sub)key was found in one of the provided keys.
		 * @throws {SuiteScriptError} PGP_NO_SIGNING_KEY_FOUND_IN_KEY_PARAM_1 when no valid signing (sub)key was found in one of the provided keys.
         *
         * @since 2022.2
         */
        this.encrypt = function (options) { };

        /**
         * Extracts the contents of the message as text.
         * @restriction Server SuiteScript only
         * @governance none
         * @return {string}
         *
         * @since 2022.2
         */
        this.getText = function () { };

        /**
         * Creates a message with no signature, compression, or encryption.
         * @restriction Server SuiteScript only
         * @governance none
         * @return {Message}
         *
         * @since 2022.2
         */
        this.toMessage = function () { };
    }

    return new MessageData();
});
