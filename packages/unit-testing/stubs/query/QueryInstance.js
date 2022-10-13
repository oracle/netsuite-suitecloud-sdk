define(['./SuiteQL', './Component', './Column', './PagedData'], function (SuiteQL, Component, Column, PagedData) {
    /**
     * @class Query
     * @classDescription Encapsulates the query definition. Use query.create(options) or query.load(options) to create this object. The creation of this object is the first step in creating a query with the N/query Module.
     * @constructor
     * @protected
     *
     * @since 2018.1
     */
    function Query() {

        /**
         * Describes the initial query type of the query definition.
         * @name Query#type
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2018.1
         */
        this.type = undefined;
        /**
         * References the simple or nested condition (a query.Condition object) that narrows the query results.
         * @name Query#condition
         * @type {Condition}
         * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when setting value of different type than Query.Condition
         *
         * @since 2018.1
         */
        this.condition = undefined;
        /**
         * Holds an array of result columns (query.Column objects) returned from the query.
         * @name Query#columns
         * @type {Array<Column>}
         * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when setting value of different type than Query.Column array
         *
         * @since 2018.1
         */
        this.columns = undefined;
        /**
         * Holds an array of query result columns (query.Column objects) used for sorting.
         * @name Query#sort
         * @type {Array<Sort>}
         * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when setting value of different type than Query.Sort array
         *
         * @since 2018.1
         */
        this.sort = undefined;
        /**
         * Holds a references to children of this component. The value of this property is an object of key/value pairs. Each key is the name of a child component. Each respective value is the corresponding query.Component object.
         * @name Query#child
         * @type {Object}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2018.1
         */
        this.child = undefined;
        /**
         * Holds the ID of the query definition.
         * @name Query#id
         * @type {Number}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2018.2
         */
        this.id = undefined;
        /**
         * Holds the name of the query definition.
         * @name Query#name
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2018.1
         */
        this.name = undefined;
        /**
         * References the root component of the query definition.
         * @name Query#root
         * @type {Component}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2018.1
         */
        this.root = undefined;
        /**
         * Executes the query and returns the query result set.
         * @governance 10 units
         * @param {Object} options the options object
         * @param {string} options.metadataProvider
         * @return {ResultSet} the result set object
         *
         * @since 2018.1
         */
        this.run = function (options) { };
        this.run.promise = function (options) { };

        /**
         * Executes the query and returns a set of paged results.
         * @governance 10 units
         * @param {Object} options the options object
         * @param {Number} options.pageSize
         * @param {string} options.metadataProvider
         * @return {PagedData} the paged query object
         *
         * @since 2018.1
         */
        this.runPaged = function (options) { };
        this.runPaged.promise = function (options) { };

        /**
         * Creates a join relationship.
         * @link Component.autoJoin
         */
        this.autoJoin = function () { };

        /**
         * Creates a join relationship.
         * @link Component.join
         */
        this.join = function () { };

        /**
         * Creates an explicit directional join relationship to another component from this component (a polymorphic join). This method sets the Component.target property on the returned query.Component object.
         * @link Component.joinTo
         */
        this.joinTo = function () { };

        /**
         * Creates an explicit directional join relationship from another component to this component (an inverse join). This method sets the Component.source property on the returned query.Component object.
         * @link Component.joinFrom
         */
        this.joinFrom = function () { };

        /**
         * This method creates a condition (query filter) based on the query.Query object.
         * @link Component.createCondition
         */
        this.createCondition = function () { };

        /**
         * This method creates a query result column based on the query.Query object.
         * @link Component.createColumn
         */
        this.createColumn = function () { };

        /**
         * This method creates a sort based on the query.Query object. The query.Sort object describes a sort that is placed on a particular query result column.
         * @link Component.createSort
         */
        this.createSort = function () { };

        /**
         * Creates a new condition (a query.Condition object) that corresponds to a logical conjunction (AND) of the arguments passed to the method. The arguments must be one or more query.Condition objects.
         * @governance none
         * @param {Object} options The options object
         * @param {Array<Condition>} options.condition One or more condition objects. There is no limit on the number of conditions you can specify.
         * @return {Condition}
         *
         * @since 2018.1
         */
        this.and = function (options) { };

        /**
         * Creates a new condition (a query.Condition object) that corresponds to a logical disjunction (OR) of the arguments passed to the method. The arguments must be one or more query.Condition objects.
         * @governance none
         * @param {Object} options The options object
         * @param {Array<Condition>} options.condition One or more condition objects. There is no limit on the number of conditions you can specify.
         * @return {Condition}
         *
         * @since 2018.1
         */
        this.or = function (options) { };

        /**
         * Creates a new condition (a query.Condition object) that corresponds to a logical negation (NOT) of the argument passed to the method. The argument must be a query.Condition object.
         * @governance 0 units
         * @param {Condition} One condition object.
         * @return {Condition}
         *
         * @since 2018.1
         */
        this.not = function (options) { };

        /**
         * Converts a Query object to corresponding SuiteQL representation
         * @governance none
         * @return {SuiteQL}
         *
         * @since 2018.1
         */
        this.toSuiteQL = function (options) { };
        this.toSuiteQL.promise = function (options) { };

        /**
         * Returns the object type name (query)
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
    return new Query();
});