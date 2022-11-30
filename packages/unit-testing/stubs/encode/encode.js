define([], function () {
	/**
	 * SuiteScript encode module
	 *
	 * @module N/encode
	 * @NApiVersion 2.x
	 *
	 */
	var encode = function () {};

	/**
	 * Converts string in one encoding to string in another encoding
	 * @restriction Server SuiteScript only
	 * @governance none
	 * @param {Object} options
	 * @param {string} options.string String to encode
	 * @param {string} options.inputEncoding Encoding of the input string.
	 * @param {string} options.outputEncoding Encoding to apply to the output string. If set to UTF-8 and input does not
	 *                                        contain a valid UTF-8 encoded string, the operation will continue but
	 *                                        the resulting string will contain Replacement Character U+FFFD.
	 * @throws {SuiteScriptError} FAILED_TO_DECODE_STRING_ENCODED_BINARY_DATA_USING_1_ENCODING when the input is not a valid encoded string according to the 'inputEncoding' Encoding.
	 * @return {string} Reencoded string
	 *
	 * @since 2015.1
	 */
	encode.prototype.convert = function (options) {};

	/**
	 * @enum {string}
	 * @readonly
	 */
	function encodeEncoding() {
		this.UTF_8 = 'UTF_8';
		this.BASE_16 = 'BASE_16';
		this.BASE_32 = 'BASE_32';
		this.BASE_64 = 'BASE_64';
		this.BASE_64_URL_SAFE = 'BASE_64_URL_SAFE';
		this.HEX = 'HEX';
	}

	encode.prototype.Encoding = new encodeEncoding();

	/**
	 * @exports N/encode
	 * @namespace encode
	 */
	return new encode();
});
