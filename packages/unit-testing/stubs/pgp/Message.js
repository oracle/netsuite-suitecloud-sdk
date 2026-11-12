define(['./Config', './Key', './MessageData', './Verification'], function (Config, Key, MessageData, Verification) {
    /**
     * Returns a new instance of pgp.Message used to store processed PGP data.
     *
     * @class Message
     * @classdesc Encapsulation of processed PGP data responsible for enabling message serialization and providing a set of single-step processors to covert to a readable message.
     * @constructor
	 * @protected
     *
     * @since 2022.2
     */
    function Message() {
        /**
         * Message type that specifies how the PGP message is processed.
         * @name Message#type
         * @type {boolean}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2022.2
         */
        this.type = undefined;

        /**
         * Converts a message to ASCII armored format.
         * @restriction Server SuiteScript only
         * @governance none
         * @return {string}
         *
         * @since 2022.2
         */
        this.asArmored = function () { };

        /**
         * Decrypts a message and optionally verifies the signatures.
         * @restriction Server SuiteScript only
         * @governance none
         *
         * @param {Object} options
         * @param {Key|Key[]} options.decryptionKeys One or more keys used to attempt message decryption.
         * @param {Key|Key[]} [options.verificationKeys] Zero or more keys used to attempt message signature verification.
         * @param {Verification} [options.verification] An empty verification object. If you provide a value for this parameter, the verification results will be flushed instead of throwing an error for invalid signature. Default value = null.
         * @param {boolean} [options.supressVerificationErrors] If set to true, the verification errors will not be thrown. This value is implicitly set to true when the verification parameter is provided. Default value = false.
         * @param {Config} [options.config] PGP configuration options used during decryption.
         * @return {MessageData}
         *
		 * @throws {SuiteScriptError} PGP_EXPECTED_ENCRYPTED_MESSAGE if the message is not encrypted.
		 * @throws {SuiteScriptError} PGP_NO_MATCHING_DECRYPTION_KEY_ANALYSIS_1 if no matching decryption key was found.
		 * @throws {SuiteScriptError} PGP_MESSAGE_IS_NOT_INTEGRITY_PROTECTED if the message is not integrity protected.
		 * @throws {SuiteScriptError} PGP_INTEGRITY_VERIFICATION_FAILED if the message is corrupted.
		 * @throws {SuiteScriptError} PGP_VERIFICATION_FAILED_NO_SIGNATURE if the message is not signed, but verification keys were provided.
		 * @throws {SuiteScriptError} PGP_VERIFICATION_FAILED_1 if none of the signatures could be verified using the provided verification keys.
		 *
         * @since 2022.2
         */
        this.decrypt = function (options) { };

        /**
         * Converts the PGP message to message data without processing. Works only if the message is not encrypted.
         * @restriction Server SuiteScript only
         * @governance none
         * @return {MessageData}
		 *
		 * @throws {SuiteScriptError} PGP_EXPECTED_UNENCRYPTED_MESSAGE The message is encrypted.
         *
         * @since 2022.2
         */
        this.toMessageData = function () { };
    }

    return new Message();
});
