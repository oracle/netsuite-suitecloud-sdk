define(['./Component'], function (Component) {
    /**
     * Specifies a return column.
     *
     * @class Column
     * @classDescription Encapsulates a query result column.
     * @constructor
     * @protected
     *
     * @since 2018.1
     */
    function Column() {

        /**
         * Holds the name of the query result column.
         * @name Column#fieldId
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2018.1
         */
        this.fieldId = undefined;
        /**
         * Represents an alias for this column. An alias is an alternate name for a column, and the alias is used in mapped results.
         * @name Column#alias
         * @type {string}
         * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when setting non-string is attempted
         *
         * @since 2018.1
         */
        this.alias = undefined;
        /**
         * Holds a reference to the query.Component object to which this query result column belongs.
         * @name Column#component
         * @type {Component}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2018.1
         */
        this.component = undefined;
        /**
         * Describes a formula used to create the query result column.
         * @name Column#formula
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2018.1
         */
        this.formula = undefined;
        /**
         * Describes the return type of the formula used to create the query result column.
         * @name Column#type
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2018.1
         */
        this.type = undefined;
        /**
         * Describes an aggregate function that is performed on the query result column. An aggregate function performs a calculation on the column values and returns a single value.
         * @name Column#aggregate
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2018.1
         */
        this.aggregate = undefined;
        /**
         * Indicates whether the query results are grouped by this query result column.
         * @name Column#groupBy
         * @type {Boolean}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2018.1
         */
        this.groupBy = undefined;
        /**
         * Describes the field context for values in the query result column.
         * @name Column#context
         * @type {Object}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2019.1
         */
        this.context = undefined;
        /**
         * Label.
         * @name Column#label
         * @type {string}
         * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when setting non-string is attempted
         *
         * @since 2019.2
         */
        this.label = undefined;
        /**
         * Returns the object type name (query.Column)
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

    return new Column();
});
