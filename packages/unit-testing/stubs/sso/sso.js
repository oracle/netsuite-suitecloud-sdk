define([], function () {
    /**
     * SuiteScript module
     *
     * @module N/sso
     * @NApiVersion 2.x
     *
     */
    var sso = function () { };

    /**
     * Generate a new SuiteSignOn token for a user
     *
     * @governance 20 units
     * @restriction Server SuiteScript only
     *
     * @param {Object} options
     * @param {string} options.suiteSignOnId
     * @return {string}
     * @throws {SuiteScriptError} SSS_SSO_CONFIG_REQD Thrown when the SuiteSignOn record is not configured for use with this script
     * @throws {SuiteScriptError} INVALID_SSO Thrown when the provided SuiteSignOn record ID is not valid.
     *
     * @since 2015.2
     */
    sso.prototype.generateSuiteSignOnToken = function (options) { };

    /**
     * @exports N/sso
     * @namespace sso
     */
    return new sso();
});