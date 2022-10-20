define([], function () {
    /**
     * @class Condition
     * @classDescription Object dataset condition
     * @constructor
     * @protected
     *
     * @since 2020.2
     */
    function Condition() {

        /**
         * column on which the condition is placed
         * @name Condition#column
         * @type {Column}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2020.2
         */
        this.column = undefined;
        /**
         * children of this condition (e. g. subconditions ANDed or ORed)
         * @name Condition#children
         * @type {Array<Condition>}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2020.2
         */
        this.children = undefined;
        /**
         * operator of the condition
         * @name Condition#operator
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         */
        this.operator = undefined;
        /**
         * values for this condition
         * @name Condition#values
         * @type {Array<Date | number | string | boolean | Object>}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         */
        this.values = undefined;
        /**
         * Indicates whether the sort is case sensitive.
         * @name Condition#caseSensitive
         * @type {Boolean}
         * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when setting non-boolean parameter
         *
         * @since 2018.2
         */
        this.caseSensitive = undefined;
        /**
         * Returns the object type name (dataset.Condition)
         * @restriction Server SuiteScript only
         * @governance none
         * @return {string}
         *
         * @since 2020.2
         */
        this.toString = function () { };

        /**
         * get JSON format of the object
         * @restriction Server SuiteScript only
         * @governance none
         * @return {Object}
         *
         * @since 2020.2
         */
        this.toJSON = function () { };
    }

    return new Condition();
});