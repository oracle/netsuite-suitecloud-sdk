define([], function () {
    /**
     * @class Join
     * @classDescription object for joining fields from other record types
     * @constructor
     * @protected
     *
     * @since 2020.2
     */
    function Join() {

        /**
         * id of the field on which the join was performed
         * @name Join#fieldId
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2020.2
         */
        this.fieldId = undefined;
        /**
         * source record type of the join
         * @name Join#source
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2020.2
         */
        this.source = undefined;
        /**
         * polymorphic target of the join
         * @name Join#target
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2020.2
         */
        this.target = undefined;
        /**
         * child join if this is a multilevel join
         * @name Join#join
         * @type {Join}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2020.2
         */
        this.join = undefined;
        /**
         * Returns the object type name (dataset.Join)
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

    return new Join();
});