define(['./Column'], function (Column) {
    /**
     * @class Sort
     * @classDescription Encapsulates a sort based on the query.Query or query.Component object. The query.Sort object describes a sort that is placed on a particular query result column.
     * @constructor
     * @protected
     *
     * @since 2018.1
     */
    function Sort() {

        /**
         * Describes the query result column that the query results are sorted by.
         * @name Sort#column
         * @type {Column}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2018.1
         */
        this.column = undefined;
        /**
         * Indicates whether the sort direction is ascending.
         * @name Sort#ascending
         * @type {Boolean}
         * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when setting wrong sort order is attempted
         *
         * @since 2018.2
         */
        this.ascending = undefined;
        /**
         * Indicates whether the sort is case sensitive.
         * @name Sort#caseSensitive
         * @type {Boolean}
         * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when setting non-boolean parameter
         *
         * @since 2018.2
         */
        this.caseSensitive = undefined;
        /**
         * Indicates whether query results with null values are listed at the end of the query results.
         * @name Sort#nullsLast
         * @type {Boolean}
         * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when setting non-boolean parameter
         *
         * @since 2018.2
         */
        this.nullsLast = undefined;
        /**
         * Sort locale
         * @name Sort#locale
         * @type {string}
         * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when setting non-boolean parameter
         *
         * @since 2018.2
         */
        this.locale = undefined;
        /**
         * Returns the object type name (query.Sort)
         * @governance none
         * @return {string}
         *
         * @since 2018.1
         */
        this.toString = function () { };

        /**
         * get JSON format of the object
         * @governance none
         * @return {Object}
         *
         * @since 2018.1
         */
        this.toJSON = function () { };
    }

    /**
     * Specifies the condition used to filter the results. It can consist of other Condition objects.
     * @class Condition
     * @classDescription A condition narrows the query results. The query.Condition object acts in the same capacity as the search.Filter object in the N/search Module. The primary difference is that query.Condition objects can contain other query.Condition objects.
     * @constructor
     * @protected
     *
     * @since 2018.1
     */
    function Condition() {

        /**
         * Holds an array of child conditions used to create the parent condition.
         * @name Condition#children
         * @type {Array<Condition>}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2018.1
         */
        this.children = undefined;
        /**
         * Holds the name of the condition.
         * @name Condition#fieldId
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2018.1
         */
        this.fieldId = undefined;
        /**
         * Holds the name of the operator used to create the condition.
         * @name Condition#operator
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2018.1
         */
        this.operator = undefined;
        /**
         * Holds an array of values used by an operator to create the condition.
         * @name Condition#values
         * @type {Array<string>}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2018.1
         */
        this.values = undefined;
        /**
         * Describes the formula used to create the condition.
         * @name Condition#formula
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2018.1
         */
        this.formula = undefined;
        /**
         * Describes the return type of the formula used to create the condition.
         * @name Condition#type
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2018.1
         */
        this.type = undefined;
        /**
         * Describes an aggregate function that is performed on the condition. An aggregate function performs a calculation on the condition values and returns a single value.
         * @name Condition#aggregate
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2018.1
         */
        this.aggregate = undefined;
        /**
         * Describes the field context affiliated with the condition
         * @name Condition#context
         * @type {Object}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2022.1
         */
        this.context = undefined;
        /**
         * Describes the component used to created the condition
         * @name Condition#component
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2018.1
         */
        this.component = undefined;
        /**
         * Indicates whether the filter in condition is case sensitive.
         * @name Condition#caseSensitive
         * @type {Boolean}
         * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when setting non-boolean parameter
         *
         * @since 2018.2
         */
        this.caseSensitive = undefined;
        /**
         * Returns the object type name (query.Condition)
         * @governance none
         * @return {string}
         *
         * @since 2018.1
         */
        this.toString = function () { };

        /**
         * get JSON format of the object
         * @governance none
         * @return {Object}
         *
         * @since 2018.1
         */
        this.toJSON = function () { };
    }

    return new Sort();
});