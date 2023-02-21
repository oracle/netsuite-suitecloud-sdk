define(['./SignedXml', './Signer', './Verifier'], function (SignedXml, Signer, Verifier) {
    /**
     * SuiteScript module
     *
     * @module N/crypto/certificate
     * @NApiVersion 2.x
     *
     */
    var certificate = function () { };

    /**
     * Signs inputXml string using certId.
     * @restriction Server SuiteScript only
     * @governance 10 units
     *
     * @param {Object} options
     * @param {string} options.xmlString input xml string
     * @param {string} options.certId certificate id
     * @param {string} options.algorithm hash algorithm
     * @param {string} options.rootTag root xml tag to sign
     * @param {string} [options.insertionTag] where to put signature
     * @return {SignedXml} signed xml string
     *
     * @since 2019.2
     */
    certificate.prototype.signXml = function (options) { }

    /**
     * Verifies signature in the signedXml file.
     * @restriction Server SuiteScript only
     * @governance 10 units
     *
     * @param {Object} options
     * @param {string|SignedXml} options.signedXml signed xml
     * @param {string} options.rootTag signed root xml tag
     * @param {string} [options.certId] certificate id
     * @return {void}
     * @throws {SuiteScriptError} INVALID_SIGNATURE when signature is not valid
     *
     * @since 2019.2
     */
    certificate.prototype.verifyXmlSignature = function (options) { }

    /**
     * Creates signer object for signing plain strings
     * @restriction Server SuiteScript only
     * @governance 10 units
     *
     * @param {object} options
     * @param {String} options.certId certificate identification
     * @param {String} options.algorithm hash algorithm
     * @return {Signer} object for string signing
     *
     * @since 2019.2
     */
    certificate.prototype.createSigner = function (options) { }

    /**
     * Creates verifier object for verifying signatures of plain strings
     * @restriction Server SuiteScript only
     * @governance 10 units
     *
     * @param {Object} options
     * @param {string} options.certId certificate identification
     * @param {string} options.algorithm hash algorithm
     * @return {Verifier} object for string verification
     *
     * @since 2019.2
     */
    certificate.prototype.createVerifier = function (options) { }

    /**
     * @exports N/crypto/certificate
     * @namespace certificate
     */
    return new certificate();
});