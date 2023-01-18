define([], function () {
    /**
     * SuiteScript record context module
     *
     * @module N/recordContext
     * @suiteScriptVersion 2.x
     *
     */
    var recordContext = function () { };

    /**
     * Returns Record Context object for given record instance. Instance can be defined by
     * type and id for not loaded records or by record object for already loaded records.
     *
     * @param {Object} options
     * @param {String=} options.recordType Type of not loaded record
     * @param {Number|String=} options.recordId Id of not loaded record
     * @param {Record=} options.record Already loaded record object
     * @param {Array<String>=} options.contextTypes Required context types (optional, defaults to array of all available contexts)
     * @returns {Object} Name-value pairs containing contexts of the record. More values can be return in array e.g. {"localization":["US", "CA"]} for localization context type.
     *
     * @throws {SuiteScriptError} MUTUALY_EXCLUSIVE_ARGUMENT if record is present alongside recordId or recordType
     * @throws {SuiteScriptError} MISSING_REQD_ARGUMENT if recordId parameter is missing and recordType is present or vice versa
     * @throws {SuiteScriptError} SSS_INVALID_TYPE_ARG in case of wrong parameter type
     * @throws {SuiteScriptError} UNKNOWN_CONTEXT_TYPE in case of unknown context type selection
     * @throws {SuiteScriptError} INVALID_UNSUPRTD_RCRD_TYP in case of invalid or unsupported record type
     *
     * @since 2020.2
     **/
    recordContext.prototype.getContext = function (options) { }

    /**
     * @exports N/recordContext
     * @namespace recordContext
     */
    return new recordContext();
});