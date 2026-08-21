define(['./Config', './Key', './Message', './MessageData', './Verification', '../crypto/certificate/Signer'], function (Config, Key, Message, MessageData, Verification, Signer) {
    /**
     * SuiteScript PGP module
	 * Used for secure messaging, file encryption, and document signing. Based on OpenPGP encryption standards.
     *
     * @module N/pgp
     * @NApiVersion 2.1
     *
     */
    var pgp = function () { };

    /**
     * Creates a new pgp.Config object. A configuration object stores general configuration options that can be used for message decryption.
     * @restriction Server SuiteScript only
     * @governance none
     *
     * @param {Object} [options]
     * @param {boolean} [options.allowMessagesWithoutIntegrityProtection] Allows messages without integrity protection on configuration objects. Default value is false.
     * @param {boolean} [options.allowInsecureDecryptionWithSigningKeys] Enables decryption that is not secured with signing keys on configuration objects. Default value is false.
     * @param {boolean} [options.useRelaxedSignatureParsing] Allows relaxed signature parsing for configuration objects. Default value is false.
     * @return {Config}
     *
     * @since 2022.2
     */
    pgp.prototype.createConfig = function (options) { };

    /**
     * Creates a new pgp.MessageData object. A message data object stores message content with metadata.
     * @restriction Server SuiteScript only
     * @governance none
     *
     * @param {Object} options
     * @param {string} options.content Content of the message.
     * @param {string} [options.filename] File name if the message represents a file, empty string otherwise.
     * @param {Date} [options.date] Date of the message or modification date of the file. Default value = new Date().
     * @param {string} [options.format] Literal data packet type. Default value = Format.UTF8, if content is a string. Format.BINARY otherwise.
     * @return {MessageData}
     *
     * @since 2022.2
     */
    pgp.prototype.createMessageData = function (options) { };

    /**
     * Creates a certificate.Signer object for signing plain strings.
	 * If the given PGP key contains multiple valid signing sub keys, the most recently added will be used. This behavior is consistent with MessageData.encrypt(options) method.
     * @restriction Server SuiteScript only
     * @governance 10 units
     *
     * @param {Object} options
     * @param {Key} options.key The PGP key.
     * @param {string} options.algorithm Hash algorithm.
     * @return {Signer}
     *
     * @throws {SuiteScriptError} UNSUPPORTED_COMBINATION_OF_KEY_AND_HASH_ALGORITHMS the given key's encryption algorithm is not compatible with the given hash algorithm.
	 * @throws {SuiteScriptError} PGP_NO_SIGNING_KEY_FOUND_IN_KEY_PARAM_1 no valid signing (sub)keys are found in the given key.
     *
     * @since 2022.2
     */
    pgp.prototype.createSigner = function (options) { };

    /**
     * Creates an empty verification object.
     * @restriction Server SuiteScript only
     * @governance none
     *
     * @return {Verification}
     *
     * @since 2022.2
     */
    pgp.prototype.createVerification = function () { };

	/**
	 * @typedef {Object} Secret
	 * @property {string} scriptId
	 */

    /**
     * Loads a PGP key from a secret.
     * @restriction Server SuiteScript only
     * @governance none
     *
     * @param {Object} options
     * @param {Secret} options.secret Secret that contains a PGP key in ASCII-armored format.
     * @param {Secret} [options.password] Secret that contains a password to unlock the key. Applicable for private keys.
     * @return {Key}
     *
     * @throws {SuiteScriptError} REFERENCED_SECRET_IS_NOT_AVAILABLE if the secret/password parameter references a non-existing secret, or you lack permission.
	 * @throws {SuiteScriptError} PGP_NONSTANDARD_KEY_DOES_NOT_COMPLY_WITH_PGP_KEY_FORMAT if parsing of the key fails.
	 * @throws {SuiteScriptError} PGP_YOU_CANNOT_PROVIDE_PASSWORD_FOR_A_PUBLIC_KEY if you provide a password, but the key is public.
	 * @throws {SuiteScriptError} PGP_INVALID_KEY_PASSWORD if you provide a password, but it is wrong or the private key is not password protected.
	 * @throws {SuiteScriptError} PGP_THIS_KEY_IS_PASSWORD_PROTECTED if you do not provide any password, but the private key is password protected.
     *
     * @since 2022.2
     */
    pgp.prototype.loadKeyFromSecret = function (options) { };

    /**
     * Parses a PGP message.
     * @restriction Server SuiteScript only
     * @governance none
     *
     * @param {Object} options
     * @param {string} options.value ASCII armored representation of the message.
     * @return {Message}
     *
     * @since 2022.2
     */
    pgp.prototype.parseMessage = function (options) { };

    /**
     * Parses an existing PGP key.
     * @restriction Server SuiteScript only
     * @governance none
     *
     * @param {Object} options
     * @param {string} options.value PGP key value to parse.
     * @param {string} [options.password] Password used to unlock an encrypted PGP private key.
     * @return {Key}
     *
     * @throws {SuiteScriptError} PGP_NONSTANDARD_KEY_DOES_NOT_COMPLY_WITH_PGP_KEY_FORMAT if parsing of the key fails.
	 * @throws {SuiteScriptError} PGP_YOU_CANNOT_PROVIDE_PASSWORD_FOR_A_PUBLIC_KEY if you provide a password when the key is public.
	 * @throws {SuiteScriptError} PGP_INVALID_KEY_PASSWORD if you provide a wrong password or the private key is not password protected.
	 * @throws {SuiteScriptError} PGP_THIS_KEY_IS_PASSWORD_PROTECTED if you don't provide any password, but the private key is password protected.
     *
     * @since 2022.2
     */
    pgp.prototype.parseKey = function (options) { };

    /**
     * Holds the values for available compression algorithms.
	 * Use this enum to set the value of the options.compressionAlgorithm parameter of the MessageData.encrypt(options) method.
     * @readonly
     * @enum {string}
     */
    function pgpCompressionAlgorithm() {
        this.ZLIB = 'ZLIB';
    }

    pgp.prototype.CompressionAlgorithm = new pgpCompressionAlgorithm();

    /**
     * Literal data packet type.
	 * Use this enum to set the value for the options.format parameter of the pgp.createMessageData(options) method.
     * @readonly
     * @enum {string}
     */
    function pgpFormat() {
        this.UTF8 = 'UTF8';
        this.BINARY = 'BINARY';
    }

    pgp.prototype.Format = new pgpFormat();

    /**
     * @exports N/pgp
     * @namespace pgp
     */
    return new pgp();
});
