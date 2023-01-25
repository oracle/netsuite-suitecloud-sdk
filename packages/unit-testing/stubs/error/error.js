define(['./SuiteScriptError'], function (SuiteScriptError) {
    /**
     * SuiteScript error module
     *
     * @module N/error
     * @suiteScriptVersion 2.x
     *
     */
    var error = function () { };

    /**
     * Create a new custom SuiteScript Error object
     * @governance none
     * @param {Object} options
     * @param {string} options.name A user-defined error code. Sets the value for the SuiteSriptError.name property.
     * @param {string} options.message The error message displayed in the Execution Log Details column. The default
     *     value is null. Sets the value for the SuiteScriptError.message property.
     * @param {boolean} [options.notifyOff=false] Sets whether email notification is suppressed. If set to false, the system
     *     emails the users identified on the applicable script record's Unhandled Errors subtab (when the error is
     *     thrown). If set to true, users will not be notified. The default value is false.
     * @return {SuiteScriptError}
     * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when some mandatory argument is missing
     * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when some argument has incorrect type
     *
     * @since 2015.2
     */
    error.prototype.create = function (options) { };

    /**
     * @enum {string}
     * @readonly
     */
    error.prototype.Type = function () { };

    /**
     * @exports N/error
     * @namespace error
     */
    return new error();
});