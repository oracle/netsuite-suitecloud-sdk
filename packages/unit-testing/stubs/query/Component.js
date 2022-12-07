define(['./Column'], function (Column) {
    /**
     * @class Component
     * @classDescription Encapsulates one component of the query definition. Each new component is created as a child to the previous component. All components exist as children to the query definition (query.Query).
     * @constructor
     * @protected
     *
     * @since 2018.1
     */
    function Component() {

        /**
         * Describes the query type of this component.
         * @name Component#type
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2018.1
         */
        this.type = undefined;
        /**
         * Describes the query type of the component joined to this component. This property can also be described as the inverse relationship of this component.
         * @name Component#source
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2018.1
         */
        this.source = undefined;
        /**
         * Describes the query type of this component. This property can also be described as the polymorphic relationship of this component.
         * @name Component#target
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2018.1
         */
        this.target = undefined;
        /**
         * Holds a references to the parent query.Component object of this component.
         * @name Component#parent
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2018.1
         */
        this.parent = undefined;
        /**
         * Holds a references to children of this component. The value of this property is an object of key/value pairs. Each key is the name of a child component. Each respective value refers to the corresponding query.Component object.
         * @name Component#child
         * @type {Object}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2018.1
         */
        this.child = undefined;
        /**
         * Creates a join relationship.
         * @governance none
         * @param {Object} options The options object.
         * @param {string} options.fieldId The column type (field type) that joins the parent component to the new component.
         * @throws {SuiteScriptError} MISSING_REQD_ARGUMENT if fieldId is undefined
         * @throws {SuiteScriptError} RELATIONSHIP_ALREADY_USED if relationship is already used
         * @return {Component}
         *
         * @since 2018.2
         */
        this.autoJoin = function (options) { };

        /**
         * Creates a join relationship. This method is an alias to Component.autoJoin(options).
         * @governance none
         * @param {Object} options
         * @param {string} options.fieldId The column type (field type) that joins the parent component to the new component. This value determines the columns on which the components are joined and the type of the newly joined component.
         * @throws {SuiteScriptError} MISSING_REQD_ARGUMENT If fieldId is undefined.
         * @throws {SuiteScriptError} RELATIONSHIP_ALREADY_USED The specified join relationship already exists.
         * @return {Component}
         *
         * @since 2018.2
         */
        this.join = function (options) { };

        /**
         * Creates an explicit directional join relationship to another component from this component (a polymorphic join). This method sets the Component.target property on the returned query.Component object.
         * @governance none
         * @param {Object} options
         * @param {string} options.fieldId The column type (field type) that joins the parent component to the new component.
         * @param {string} options.target The query type of the component joined to this component. This value sets the Component.target property.
         * @throws {SuiteScriptError} MISSING_REQD_ARGUMENT If fieldId is undefined.
         * @throws {SuiteScriptError} RELATIONSHIP_ALREADY_USED The specified join relationship already exists.
         * @return {Component}
         *
         * @since 2018.2
         */
        this.joinTo = function (options) { };

        /**
         * Creates an explicit directional join relationship from another component to this component (an inverse join). This method sets the Component.source property on the returned query.Component object.
         * @governance none
         * @param {Object} options
         * @param {string} options.fieldId The column type (field type) that joins the parent component to the new component.
         * @param {string} options.source The query type of the component joined to this component.
         * @throws {SuiteScriptError} MISSING_REQD_ARGUMENT If relationship is undefined
         * @throws {SuiteScriptError} RELATIONSHIP_ALREADY_USED The specified join relationship already exists.
         * @return {Component}
         *
         * @since 2018.1
         */
        this.joinFrom = function (options) { };

        /**
         * Creates a condition (query filter) based on the query.Component object.
         * @governance none
         * @param {Object} options The options object.
         * @param {string} options.fieldId The name of the condition. This value sets the Condition.fieldId property.
         * @param {string} options.operator The operator used by the condition. This value sets the Condition.operator parameter.
         * @param {Array<string>|Array<Date>} options.values An array of values to use for the condition. This value sets the Condition.values property.
         * @param {string} options.formula The formula used to create the condition. This value sets the Condition.formula property.
         * @param {string} options.type If you use the options.formula parameter, use this parameter to explicitly define the formula’s return type. Defining the formula’s return type might be required if the return type cannot be determined correctly based on the specified formula. This value sets the Condition.type property.
         * @param {string} [options.aggregate] Use this parameter to run an aggregate function on a condition. An aggregate function performs a calculation on the condition values and returns a single value. This value sets the Condition.aggregate property.
         * @throws {SuiteScriptError} MISSING_REQD_ARGUMENT If options are undefined.
         * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE If options isn't object.
         * @throws {SuiteScriptError} OPERATOR_ARITY_MISMATCH If requested operator cannot work with specified number of.
         * @throws {SuiteScriptError} INVALID_SEARCH_OPERATOR If wrong query operator is used.
         * @return {Condition}
         *
         * @since 2018.1
         */
        this.createCondition = function (options) { };

        /**
         * Creates a query result column based on the query.Component object.
         * @governance none
         * @param {Object} options The options object.
         * @param {string} options.fieldId The name of the query result column. This value sets the Column.fieldId property.
         * @param {string} options.formula The formula used to create the query result column. This value sets the Column.formula property.
         * @param {string} options.type If you use the options.formula parameter, use this parameter to explicitly define the formula’s return type. Defining the formula’s return type might be required if the return type cannot be determined correctly based on the specified formula. This value sets the Column.type property.
         * @param {string} options.label Field (column) label
         * @param {string} [options.aggregate] Use this parameter to run an aggregate function on your query result column. An aggregate function performs a calculation on the column values and returns a single value. This value sets the Column.aggregate property.
         * @param {boolean} [options.groupBy] Indicates whether the query results are grouped by this query result column. This value sets the Column.groupBy property.
         * @param {Object} [options.context] The field context for values in the query result column. This value sets the Column.context property.
         * @param {Object} [options.alias] The alternate name for the query result column; the alias is used in mapped results.
         * @throws {SuiteScriptError} MISSING_REQD_ARGUMENT If options are undefined
         * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE If options isn't object
         * @throws {SuiteScriptError} MUTUALLY_EXCLUSIVE_ARGUMENTS When two mutually arguments are defined
         * @throws {SuiteScriptError} NEITHER_ARGUMENT_DEFINED When neither of two mandatory arguments is defined
         * @return {Column}
         *
         * @since 2018.1
         */
        this.createColumn = function (options) { };

        /**
         * Creates a sort based on the query.Component object. The query.Sort object describes a sort that is placed on a particular query result column or condition.
         * @governance none
         * @param {Object} options The options object.
         * @param {Column} options.column The query result column that you want to sort by. This value sets the Sort.column property.
         * @param {boolean} [options.ascending] Indicates whether the sort direction is ascending. This value sets the Sort.ascending property.
         * @param {boolean} [options.nullsLast] Where to put results with null value. Defaults to value of ascending flag
         * @param {boolean} [options.caseSensitive] Indicates whether query results with null values are listed at the end of the query results. This value sets the Sort.nullsLast property.
         * @param {string} [options.locale] The locale to use for the sort. This value sets the Sort.locale property.
         * @throws {SuiteScriptError} MISSING_REQD_ARGUMENT If options are undefined
         * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE If options isn't object
         * @return {Sort}
         *
         * @since 2018.1
         */
        this.createSort = function (options) { };

        /**
         * Returns the object type name (query.Component)
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

    return new Component();
});