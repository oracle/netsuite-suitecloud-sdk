define(['./Period', './QueryInstance', './ResultSet', './PagedData', './RelativeDate'], function (Period, Query, ResultSet, PagedData, RelativeDate) {
    /**
     * SuiteScript new-generation query common module
     * Load the N/query module to create and run queries using the SuiteAnalytics Workbook query engine.
     *
     * @module N/query
     * @suiteScriptVersion 2.x
     */
    var query = function() {};

    /**
     * Creates a query.Query object.
     * @governance none
     * @param {Object} options The options object.
     * @param {string} options.type The query type that you want to use for the initial query definition.
     * @param {Array<Object>} [options.columns] Array of objects to be used as query columns (createColumn method will be called on all of them).
     * @param {Array<Object>} [options.sort] Array of objects representing sort options (createColumn and createSort methods will be called on all of them).
     * @param {Object} [options.condition] Condition of query (createCondition method will be called on supplied object).
     * @return {Query}
     * @throws {SuiteScriptError} MISSING_REQD_ARGUMENT If options or type are undefined.
     * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE If options isn't object or id isn't string.
     * @throws {SuiteScriptError} INVALID_RCRD_TYPE The specified query type is invalid.
     *
     * @since 2018.1
     */
    query.prototype.create = function (options) { };

    /**
     * Runs suiteQL query, parameter can be string, suiteQL object or object containing properties query and (optionally) params
     * @governance 10 units
     * @param {Object} options
     * @param {String} options.query String representation of SuiteQL query
     * @param {Array<string|number|boolean>=} options.params
     * @return {ResultSet}
     * @throws {SuiteScriptError} MISSING_REQD_ARGUMENT if options or query are undefined
     * @throws {SuiteScriptError} SSS_INVALID_TYPE_ARG if there's parameter of different type than string/number/boolean in params array
     *
     * @since 2018.2
     */
    query.prototype.runSuiteQL = function (options) { };
    query.prototype.runSuiteQL.promise = function (options) { };

    /**
     * Execute the suiteQL query and return paged results.
     * @governance 10 units
     * @param {Object} options
     * @param {String} options.query String representation of SuiteQL query
     * @param {Array<string|number|boolean>=} options.params
     * @return {PagedData}
     * @throws {SuiteScriptError} MISSING_REQD_ARGUMENT if options or query are undefined
     * @throws {SuiteScriptError} SSS_INVALID_TYPE_ARG if there's parameter of different type than string/number/boolean in params array
     *
     * @since 2020.1
     */
    query.prototype.runSuiteQLPaged = function (options) { };
    query.prototype.runSuiteQLPaged.promise = function (options) { };

    /**
     * Loads an existing query as a query.Query object.
     * @governance 5 units
     * @param {Object} options The options object.
     * @param {string} options.id The script ID of the query to load.
     * @return {Query}
     * @throws {SuiteScriptError} MISSING_REQD_ARGUMENT If options or id are undefined.
     * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE If options isn't object or id isn't string.
     * @throws {SuiteScriptError} A query with the specified ID cannot be loaded because the query does not exist or you do not have permission to load it.
     *
     * @since 2018.1
     */
    query.prototype.load = function (options) { };
    query.prototype.load.promise = function (options) { };

    /**
     * Lists table views for specified workbook
     * @governance 5 units
     * @param {string} workbookId Script id of a workbook
     * @return {Array<TableViewHeader>} Array of table views present in workbook with given script id
     * @throws {SuiteScriptError} MISSING_REQD_ARGUMENT If workbookId parameter is missing
     * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE If workbookId parameter isn't string
     *
     * @since 2020.1
     */
    query.prototype.listTables = function (options) { };
    query.prototype.listTables.promise = function (options) { };

    /**
     * Deletes query by id
     * @governance 5 units
     * @param {Object} options
     * @param {string} options.id Id of query to be delete
     * @return {void}
     * @throws {SuiteScriptError} MISSING_REQD_ARGUMENT If options or id are undefined.
     * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE If options isn't object or id isn't string.
     * @throws {SuiteScriptError} UNABLE_TO_DELETE_QUERY A query with the specified ID cannot be deleted because the query does not exist or you do not have permission to delete it.
     *
     * @since 2018.2
     */
    query.prototype['delete'] = function (options) { };
    query.prototype['delete'].promise = function (options) { };

    /**
     * Creates a query.RelativeDate object that represents a date relative to the current date.
     * @governance none
     * @param {Object} options
     * @param {string} options.dateId The ID of the relative date to create.
     * @param {number} options.value The value to use to create the relative date.
     * @return {RelativeDate}
     * @throws {SuiteScriptError} MISSING_REQD_ARGUMENT If options or id are undefined.
     * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE If options isn't object or id isn't string.
     *
     * @since 2019.2
     */
    query.prototype.createRelativeDate = function (options) { };

    /**
     * Creates a query.Period object, which can be used as a filter value
     * @governance none
     * @param {Object} options
     * @param {string} options.code code of the period
     * @param {string} [options.type] type of the period
     * @param {string} [options.adjustment] adjustment of the period
     * @return {Period}
     * @throws {SuiteScriptError} MISSING_REQD_ARGUMENT If options or code are undefined.
     * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE If any of the parameters is not string
     * @throws {SuiteScriptError} INVALID_PERIOD_TYPE If type is a value outside of PeriodType enum
     * @throws {SuiteScriptError} INVALID_PERIOD_ADJUSTMENT If adjustment is a value outside of PeriodAdjustment enum
     * @throws {SuiteScriptError} INVALID_PERIOD_CODE If code is a value outside of PediodCode enum
     *
     * @since 2020.1
     */
    query.prototype.createPeriod = function (options) { };

    /**
     * Holds the string values for operators supported with the N/query Module. This enum is used to pass the operator argument to Query.createCondition(options) and Component.createCondition(options).
     * @enum {string}
     * @readonly
     */
    query.prototype.Operator = function () { };

    /**
     * Holds the string values for aggregate functions supported with the N/query Module. An aggregate function performs a calculation on the column or condition values and returns a single value.
     * @enum {string}
     * @readonly
     */
    function queryAggregate() {
        this.AVERAGE = 'AVERAGE';
        this.AVERAGE_DISTINCT = 'AVERAGE_DISTINCT';
        this.COUNT = 'COUNT';
        this.COUNT_DISTINCT = 'COUNT_DISTINCT';
        this.MEDIAN = 'MEDIAN';
        this.MAXIMUM = 'MAXIMUM';
        this.MAXIMUM_DISTINCT = 'MAXIMUM_DISTINCT';
        this.MINIMUM = 'MINIMUM';
        this.MINIMUM_DISTINCT = 'MINIMUM_DISTINCT';
        this.SUM = 'SUM';
        this.SUM_DISTINCT = 'SUM_DISTINCT';
    }

    query.prototype.Aggregate = new queryAggregate();

    /**
     * Holds the string values for the formula return types supported with the N/query Module.
     * @enum {string}
     * @readonly
     */
    function queryReturnType() {
        this.BOOLEAN = 'BOOLEAN';
        this.DATE = 'DATE';
        this.DATETIME = 'DATETIME';
        this.FLOAT = 'FLOAT';
        this.INTEGER = 'INTEGER';
        this.STRING = 'STRING';
        this.DURATION = 'DURATION';
        this.CURRENCY = 'CURRENCY';
        this.KEY = 'KEY';
        this.RELATIONSHIP = 'RELATIONSHIP';
        this.ANY = 'ANY';
        this.CLOBTEXT = 'CLOBTEXT';
        this.PERCENT = 'PERCENT';
        this.UNKNOWN = 'UNKNOWN';
    }

    query.prototype.ReturnType = new queryReturnType();

    /**
     * Holds query.RelativeDate object values for supported date ranges in relative dates.
     * @enum {string}
     * @readonly
     */
    query.prototype.RelativeDateRange = function () { };

    /**
     * Holds the string values for supported date codes in relative dates.
     * @enum {string}
     * @readonly
     */
    function queryDateId() {
        this.SECONDS_AGO = 'sago';
        this.MINUTES_AGO = 'nago';
        this.HOURS_AGO = 'hago';
        this.DAYS_AGO = 'dago';
        this.WEEKS_AGO = 'wago';
        this.MONTHS_AGO = 'mago';
        this.QUARTERS_AGO = 'qago';
        this.YEARS_AGO = 'yago';
        this.SECONDS_FROM_NOW = 'sfn';
        this.MINUTES_FROM_NOW = 'nfn';
        this.HOURS_FROM_NOW = 'hfn';
        this.DAYS_FROM_NOW = 'dfn';
        this.WEEKS_FROM_NOW = 'wfn';
        this.MONTHS_FROM_NOW = 'mfn';
        this.QUARTERS_FROM_NOW = 'qfn';
        this.YEARS_FROM_NOW = 'yfn';
    }

    query.prototype.DateId = new queryDateId();

    /**
     * Holds the string values for the field context to use when creating a column using Query.createColumn(options) or Component.createColumn(options).
     * @enum {string}
     * @readonly
     */
    function queryFieldContext() {
        this.RAW = 'RAW';
        this.DISPLAY = 'DISPLAY';
        this.HIERARCHY = 'HIERARCHY';
        this.HIERARCHY_IDENTIFIER = 'HIERARCHY_IDENTIFIER';
        this.SIGN_CONSOLIDATED = 'SIGN_CONSOLIDATED';
        this.CURRENCY_CONSOLIDATED = 'CURRENCY_CONSOLIDATED';
        this.CONVERTED = 'CONVERTED';
    }

    query.prototype.FieldContext = new queryFieldContext();

    /**
     * Holds the string values for possible period types (START, END)
     * @enum {string}
     * @readonly
     */
    function queryPeriodType() {
        this.START = 'START';
        this.END = 'END';
    }

    query.prototype.PeriodType = new queryPeriodType();

    /**
     * Holds the string values for possible period adjustments (NOT_LAST, ALL)
     * @enum {string}
     * @readonly
     */
    function queryPeriodAdjustment() {
        this.NOT_LAST = 'NOT_LAST';
        this.ALL = 'ALL';
    }

    query.prototype.PeriodAdjustment = new queryPeriodAdjustment();

    /**
     * Holds the string values for possible period codes
     * @enum {string}
     * @readonly
     */
    function queryPeriodCode() {
        this.FIRST_FISCAL_QUARTER_LAST_FY = 'Q1LFY';
        this.FIRST_FISCAL_QUARTER_THIS_FY = 'Q1TFY';
        this.FISCAL_QUARTER_BEFORE_LAST = 'QBL';
        this.FISCAL_YEAR_BEFORE_LAST = 'FYBL';
        this.FOURTH_FISCAL_QUARTER_LAST_FY = 'Q4LFY';
        this.FOURTH_FISCAL_QUARTER_THIS_FY = 'Q4TFY';
        this.LAST_FISCAL_QUARTER = 'LQ';
        this.LAST_FISCAL_QUARTER_ONE_FISCAL_YEAR_AGO = 'LQOLFY';
        this.LAST_FISCAL_QUARTER_TO_PERIOD = 'LFQTP';
        this.LAST_FISCAL_YEAR = 'LFY';
        this.LAST_FISCAL_YEAR_TO_PERIOD = 'LFYTP';
        this.LAST_PERIOD = 'LP';
        this.LAST_PERIOD_ONE_FISCAL_QUARTER_AGO = 'LPOLQ';
        this.LAST_PERIOD_ONE_FISCAL_YEAR_AGO = 'LPOLFY';
        this.LAST_ROLLING_18_PERIODS = 'LR18FP';
        this.LAST_ROLLING_6_FISCAL_QUARTERS = 'LR6FQ';
        this.PERIOD_BEFORE_LAST = 'PBL';
        this.SAME_FISCAL_QUARTER_LAST_FY = 'TQOLFY';
        this.SAME_FISCAL_QUARTER_LAST_FY_TO_PERIOD = 'TFQOLFYTP';
        this.SAME_PERIOD_LAST_FY = 'TPOLFY';
        this.SAME_PERIOD_LAST_FISCAL_QUARTER = 'TPOLQ';
        this.SECOND_FISCAL_QUARTER_LAST_FY = 'Q2LFY';
        this.SECOND_FISCAL_QUARTER_THIS_FY = 'Q2TFY';
        this.THIRD_FISCAL_QUARTER_LAST_FY = 'Q3LFY';
        this.THIRD_FISCAL_QUARTER_THIS_FY = 'Q3TFY';
        this.THIS_FISCAL_QUARTER = 'TQ';
        this.THIS_FISCAL_QUARTER_TO_PERIOD = 'TFQTP';
        this.THIS_FISCAL_YEAR = 'TFY';
        this.THIS_FISCAL_YEAR_TO_PERIOD = 'TFYTP';
        this.THIS_PERIOD = 'TP';
    }

    query.prototype.PeriodCode = new queryPeriodCode();

    /**
     * Holds the string values for sort locales supported with the N/query Module. This enum is used to pass the locale argument to Query.createSort(options) and Component.createSort(options).
     * @enum {string}
     * @readonly
     */
    query.prototype.SortLocale = function () { };

    /**
     * Holds the string values for query types used in the query definition. This enum is used to pass the initial query type argument to query.create(options).
     * @enum {string}
     * @readonly
     */
    query.prototype.Type = function () { };

    /**
     * Holds the string values for possible metadata provider types
     * @enum {string}
     * @readonly
     */
    query.prototype.MetadataProvider = function () { };

    /**
     * @exports N/query
     * @namespace query
     */
    return new query();
});