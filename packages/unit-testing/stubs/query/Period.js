define([], function () {
    /**
     * @class Period
     * @classDescription Special object which can be used as a condition while querying periods
     * @constructor
     *
     * @since 2020.1
     */
    function Period() {

        /**
         * Code of the Period
         * @name Period#code
         * @type {string}
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2020.1
         */
        this.code = undefined;
        /**
         * Type of the Period
         * @name Period#type
         * @type {string}
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2020.1
         */
        this.type = undefined;
        /**
         * Adjustment of the Period
         * @name Period#adjustment
         * @type {string}
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2020.1
         */
        this.adjustment = undefined;
        /**
         * Returns the object type name (query.Period)
         * @governance none
         * @return {string}
         *
         * @since 2020.1
         */
        this.toString = function () { };

        /**
         * get JSON format of the object
         * @governance none
         * @return {Object}
         *
         * @since 2020.1
         */
        this.toJSON = function () { };
    }

    /**
     * @class RelativeDate
     * @classDescription Special object which can be used as a condition while querying dates
     * @constructor
     * @protected
     *
     * @since 2019.1
     */
    function RelativeDate() {

        /**
         * Start of relative date
         * @name RelativeDate#start
         * @type {Object}
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2019.1
         */
        this.start = undefined;
        /**
         * End of relative date
         * @name RelativeDate#end
         * @type {Object}
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2019.1
         */
        this.end = undefined;
        /**
         * Interval of relative date
         * @name RelativeDate#interval
         * @type {Object}
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2019.1
         */
        this.interval = undefined;
        /**
         * Value of relative date
         * @name RelativeDate#value
         * @type {Object}
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2019.1
         */
        this.value = undefined;
        /**
         * Flag if this relative date represents range
         * @name RelativeDate#isRange
         * @type {Boolean}
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2019.1
         */
        this.isRange = undefined;
        /**
         * Id of relative date
         * @name RelativeDate#dateId
         * @type {Object}
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2019.1
         */
        this.dateId = undefined;
        /**
         * Returns the object type name (query.RelativeDate)
         * @governance none
         * @return {string}
         *
         * @since 2019.1
         */
        this.toString = function () { };

        /**
         * get JSON format of the object
         * @governance none
         * @return {Object}
         *
         * @since 2019.1
         */
        this.toJSON = function () { };
    }

    return new Period();
});