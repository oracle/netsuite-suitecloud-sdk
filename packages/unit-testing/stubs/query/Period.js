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
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2020.1
         */
        this.code = undefined;
        /**
         * Type of the Period
         * @name Period#type
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2020.1
         */
        this.type = undefined;
        /**
         * Adjustment of the Period
         * @name Period#adjustment
         * @type {string}
         * @readonly
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

    return new Period();
});