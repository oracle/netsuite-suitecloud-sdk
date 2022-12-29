define([], function () {
    /**
     * SuiteScript module
     *
     * @module N/url
     * @NApiVersion 2.x
     *
     */
    var url = function () { };

    /**
     * @restriction Server SuiteScript only
     * @governance none
     * @param {Object} options
     * @param {string} options.recordType
     * @param {string} [options.recordId]
     * @param {boolean} [options.isEditMode]
     * @param {Object} [options.params] url parameters
     * @return {String} url
     *
     * @since 2015.1
     */
    url.prototype.resolveRecord = function (options) { };

    /**
     * @restriction Server SuiteScript only
     * @governance none
     * @param {Object} options
     * @param {string} options.id
     * @param {Object} [options.params] url parameters
     * @return {String} url
     *
     * @since 2015.1
     */
    url.prototype.resolveTaskLink = function (options) { };

    /**
     * @restriction Server SuiteScript only
     * @governance none
     * @param {Object} options
     * @param {string} options.scriptId
     * @param {string} options.deploymentId
     * @param {boolean} [options.returnExternalUrl]
     * @param {Object} [options.params] url parameters
     * @return {String} url
     *
     * @since 2015.1
     */
    url.prototype.resolveScript = function (options) { };

    /**
     * @restriction Server SuiteScript only
     * @governance none
     * @param {Object} options
     * @param {string} options.hostType
     * @param {string} [options.accountId]
     * @return {String} domain
     *
     * @since 2017.1
     */
    url.prototype.resolveDomain = function (options) { };

    /**
     * @restriction Server SuiteScript only
     * @governance none
     * @param {Object} options
     * @param {string} options.domain
     * @param {Object} options.params query string data parameters as an object
     * @return {String} url
     *
     * @since 2015.1
     */
    url.prototype.format = function (options) { };

    /**
     * @enum {string}
     * @readonly
     */
    function urlHostType() {
        this.APPLICATION = 'APPLICATION';
        this.CUSTOMER_CENTER = 'CUSTOMERCENTER';
        this.RESTLET = 'RESTLETS';
        this.SUITETALK = 'SUITETALK';
        this.FORM = 'FORMS';
    }

    url.prototype.HostType = new urlHostType();

    /**
     * @exports N/url
     * @namespace url
     */
    return new url();
});