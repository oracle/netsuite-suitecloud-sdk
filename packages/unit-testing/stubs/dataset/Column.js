define(['../workbook/Expression'], function (Expression) {
    /**
     * @class Column
     * @classDescription Object representing dataset column
     * @constructor
     * @protected
     *
     * @since 2020.2
     */
    function Column() {

        /**
         * formula of the column
         * @name Column#formula
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2020.2
         */
        this.formula = undefined;
        /**
         * label of the column
         * @name Column#label
         * @type {string|Expression}
         * @readonly
         * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
         *
         * @since 2020.2
         */
        this.label = undefined;
        /**
         * alias of the column
         * @name Column#alias
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting value of different type than string
         *
         * @since 2020.2
         */
        this.alias = undefined;
        /**
         * internal id of the column, populated only in loaded datasets
         * @name Column#id
         * @type {number}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting value of different type than string
         *
         * @since 2021.2
         */
        this.id = undefined;
        /**
         * return type of the formula
         * @name Column#type
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2020.2
         */
        this.type = undefined;
        /**
         * Join for the column, polulated only if the column is not on a base record
         * @name Column#join
         * @type {Join}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2020.2
         */
        this.join = undefined;
        /**
         * id of the field of the column
         * @name Column#fieldId
         * @type {string}
         * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
         *
         * @since 2020.2
         */
        this.fieldId = undefined;
        /**
         * Returns the object type name (dataset.Column)
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

    return new Column();
});
