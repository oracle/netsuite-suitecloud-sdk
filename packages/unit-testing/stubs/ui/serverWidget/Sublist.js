define(['./Button', './Field'], function (Button, Field) {
    /**
     * To add a sublist, use Assistant.addSublist(options) or Form.addSublist(options).
     *
     * @class Sublist
     * @classdesc Encalsulates a Sublist in a Form or a serverWidget.Assistant
     * @protected
     * @constructor
     *
     * @since 2015.2
     */
    function Sublist() {

        /**
         * The label of the sublist
         * @name Sublist#label
         * @type {string}
         *
         * @since 2015.2
         */
        this.label = undefined;
        /**
         * The number of lines in the Sublist.
         * @name Sublist#lineCount
         * @type {number}
         * @readonly
         *
         * @since 2015.2
         */
        this.lineCount = undefined;
        /**
         * Set an id of a field that is to have unique values accross the rows in the sublist
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.id The id of the field to use as a unique field
         * @return {Sublist}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when id parameter is missing
         *
         * @since 2015.2
         */
        this.updateUniqueFieldId = function (options) { };

        /**
         * Id of a field designated as a totalling column, which is used to calculate and display a running total for the sublist
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.id The id of the field to use as a total field
         * @return {Sublist}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when id parameter is missing
         *
         * @since 2015.2
         */
        this.updateTotallingFieldId = function (options) { };

        /**
         * Display type of the sublist.  Possible values are in serverWidget.SublistDisplayType enum
         * @name Sublist#displayType
         * @type {string}
         *
         * @since 2015.2
         */
        this.displayType = undefined;
        /**
         * Inline help text to this sublist.
         * @name Sublist#helpText
         * @type {string}
         *
         * @since 2015.2
         */
        this.helpText = undefined;
        /**
         * Adds a button to the sublist
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.id the script id of button
         * @param {string} options.label the label of button
         * @param {string} [options.functionName] The function name to be triggered on a button click.
         * @return {Button}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when id or label parameter is missing
         *
         * @since 2015.2
         */
        this.addButton = function (options) { };

        /**
         * Gets a field value on a sublist.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.id The internal ID of the field.
         * @param {number} options.line The line number for this field.
         * @throws {SuiteScriptError} YOU_CANNOT_CALL_1_METHOD_ON_SUBRECORD_FIELD_SUBLIST_2_FIELD_3 When trying to access a subrecord field
         * @return {string}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when id or line parameter is missing
         *
         * @since 2015.2
         */
        this.getSublistValue = function (options) { };

        /**
         * Set the value of a field on the list
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.id   id of the field to set
         * @param {number} options.line line number
         * @param {string} options.value value to set on the field
         * @return {void}
         * @throws {SuiteScriptError} YOU_CANNOT_CALL_1_METHOD_ON_SUBRECORD_FIELD_SUBLIST_2_FIELD_3 When trying to access a subrecord field
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when id parameter is missing
         *
         * @since 2015.2
         */
        this.setSublistValue = function (options) { };

        /**
         * Adds a Refresh button to the sublist.
         * @restriction Server SuiteScript only
         * @governance none
         * @return {Button}
         *
         * @since 2015.2
         */
        this.addRefreshButton = function () { };

        /**
         * Adds a "Mark All" and an "Unmark All" button to a sublist.
         * @restriction Server SuiteScript only
         * @governance none
         * @return {Array<Button>}
         *
         * @since 2015.2
         */
        this.addMarkAllButtons = function () { };

        /**
         * Add a field, column, to the Sublist
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.id    id of the field to add
         * @param {string} options.label the UI label for the field
         * @param {string} options.type  the type for this field. Use the serverWidget.FieldType enum to set this value. The INLINEHTML and RICHTEXT values are not supported with this method. The MULTISELECT value is not supported for SuiteScript 2.0 Suitelets.
         * @param {string} [options.source] The internalId or scriptId of the source list for this field. Use this parameter if you are adding a select (List/Record) type of field.
         * @param {string} [options.container] Used to specify either a tab or a field group
         * @return {Field}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when id, label or type parameter is missing
         *
         * @since 2015.2
         */
        this.addField = function (options) { };

        /**
         * Gets field from sublist
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.id    id of the field to get
         * @return {Field}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when id parameter is missing
         *
         * @since 2015.2
         */
        this.getField = function (options) { };

        /**
         * Returns the object type name
         * @restriction Server SuiteScript only
         * @governance none
         * @return {string}
         *
         * @since 2015.2
         */
        this.toString = function () { };

        /**
         * get JSON format of the object
         * @restriction Server SuiteScript only
         * @governance none
         * @return {Object}
         *
         * @since 2015.2
         */
        this.toJSON = function () { };
    }

    return new Sublist();
});