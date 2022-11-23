define(['../record/RecordInstance'], function (Record) {
    /**
     * SuiteScript module
     *
     * @module N/config
     * @NApiVersion 2.x
     */
    var config = function () { };

    /**
     * Load a configuration object with a specific type
     * @governance 10 units
     * @restriction Server SuiteScript only
     *
     * @param {Object} options
     * @param {string} options.type one of the Type values
     * @param {boolean} options.isDynamic load record in dynamic or deferred dynamic mode
     * @return {Record}
     *
     * @throws {SuiteScriptError} INVALID_RCRD_TYPE Thrown if an invalid record type was provided.
     *
     * @since 2015.2
     */
    config.load = function (options) { };

    /**
     * Enum configuration type values.
     * @readonly
     * @enum {string}
     * @since 2015.2
     */
    function configType() {
        this.USER_PREFERENCES = 'userpreferences';
        this.COMPANY_INFORMATION = 'companyinformation';
        this.COMPANY_PREFERENCES = 'companypreferences';
        this.ACCOUNTING_PREFERENCES = 'accountingpreferences';
        this.MANUFACTURING_PREFERENCES = 'manufacturingpreferences';
        this.ACCOUNTING_PERIODS = 'accountingperiods';
        this.TAX_PERIODS = 'taxperiods';
        this.FEATURES = 'companyfeatures';
        this.TIME_POST = 'timepost';
        this.TIME_VOID = 'timevoid';
    }

    config.prototype.Type = new configType();

    /**
     * @exports N/config
     * @namespace config
     */
    return config;
});