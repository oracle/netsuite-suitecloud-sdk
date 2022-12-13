define(['../ClientResponse'], function (ClientResponse) {
    /**
     * SuiteScript module
     *
     * @module N/https/clientCertificate
     * @NApiVersion 2.x
     *
     */
    var clientCertificate = function() {};

    /**
     * Sends ssl secured post to remote server
     * @restriction Server SuiteScript only
     * @governance 10 units
     * @param {Object} options
     * @param {string} options.url address of remote server
     * @param {string} options.certId id of client certificate
     * @param {string} options.body data to be sent to remote server
     * @param {Object} options.headers headers associated with the request
     *
     * @return {ClientResponse} response from remote server
     */
    clientCertificate.prototype.post = function(options) {
    }

    /**
     * Sends ssl secured get to remote server
     * @restriction Server SuiteScript only
     * @governance 10 units
     * @param {Object} options
     * @param {string} options.url address of remote server
     * @param {string} options.certId id of client certificate
     * @param {Object} options.headers headers associated with the request
     *
     * @return {ClientResponse} response from remote server
     */
     clientCertificate.prototype.get = function(options) {
    }

    /**
     * Sends ssl secured put to remote server
     * @restriction Server SuiteScript only
     * @governance 10 units
     * @param {Object} options
     * @param {string} options.url address of remote server
     * @param {string} options.certId id of client certificate
     * @param {string} options.body data to be sent to remote server
     * @param {Object} options.headers headers associated with the request
     *
     * @return {ClientResponse} response from remote server
     */
     clientCertificate.prototype.put = function(options) {
    }

    /**
     * Sends ssl secured delete to remote server
     * @restriction Server SuiteScript only
     * @governance 10 units
     * @param {Object} options
     * @param {string} options.url address of remote server
     * @param {string} options.certId id of client certificate
     * @param {Object} options.headers headers associated with the request
     *
     * @return {ClientResponse} response from remote server
     */
     clientCertificate.prototype.delete = function(options) {
    }

    /**
     * Sends ssl secured request to remote server
     * @restriction Server SuiteScript only
     * @governance 10 units
     * @param {Object} options
     * @param {string|SecureString} options.url address of remote server
     * @param {string} options.certId id of client certificate
     * @param {string|Object|SecureString} options.body data to be sent to remote server
     * @param {string} options.method http method to be used
     * @param {Array<string>} [options.credentials] secure string credentials
     * @param {Object} options.headers headers associated with the request
     *
     * @returns {ClientResponse} response from remote server
     */
     clientCertificate.prototype.request = function(options) {
    }

    /**
     * @exports N/https/clientCertificate
     * @namespace clientCertificate
     */
    return new clientCertificate();
});