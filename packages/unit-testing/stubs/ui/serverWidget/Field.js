define([], function () {
    /**
     * To add a Field object, use Assistant.addField(options), Form.addField(options), or Sublist.addField(options).
     *
     *
     * @class Field
     * @classdesc Encapsulates a body or sublist field. Use fields to record or display information specific to your needs.
     * @protected
     * @constructor
     *
     * @since 2015.2
     */
    function Field() {

        /**
         * The internal id of the field.
         * @name Field#id
         * @type {string}
         * @readonly
         *
         * @since 2015.2
         */
        this.id = undefined;
        /**
         * The type of the field.
         * @name Field#FieldType
         * @type {string}
         * @readonly
         *
         * @since 2015.2
         */
        this.type = undefined;
        /**
         * Updates the break type of the field. Set this value using the FieldBreakType enum.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.breakType The new break type of the field.
         * @return {Field}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when breakType parameter is missing
         *
         * @since 2015.2
         */
        this.updateBreakType = function (options) { };

        /**
         * Updates the layout type for the field.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {FieldLayoutType} options.layoutType The new layout type of the field. Set this value using the FieldLayoutType enum.
         * @return {Field}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when layoutType parameter is missing
         * @since 2015.2
         */
        this.updateLayoutType = function (options) { };

        /**
         * The text displayed for a link in place of the URL.
         * This property is only supported on scripted fields created using the N/ui/serverWidget Module.
         * @name Field#linkText
         * @type {string}
         *
         * @since 2015.2
         */
        this.linkText = undefined;
        /**
         * The maximum length, in characters, of the field (only valid for text, rich text, long text, and textarea fields).
         * This property is only supported on scripted fields created using the N/ui/serverWidget Module.
         * @name Field#maxLength
         * @type {number}
         *
         * @since 2015.2
         */
        this.maxLength = undefined;
        /**
         * Indicates whether the field is mandatory or optional.
         * If set to true, then the field is defined as mandatory.
         * The default value is false.
         * This property is only supported on scripted fields created using the N/ui/serverWidget Module.
         * @name Field#isMandatory
         * @type {boolean}
         *
         * @since 2015.2
         */
        this.isMandatory = undefined;
        /**
         * The alias for the field. By default the alias is the field id
         * This property is only supported on scripted fields created using the N/ui/serverWidget Module.
         * @name Field#alias
         * @type {string}
         *
         * @since 2015.2
         */
        this.alias = undefined;
        /**
         * The default value of the field
         * @name Field#defaultValue
         * @type {string}
         *
         * @since 2015.2
         */
        this.defaultValue = undefined;
        /**
         * Sets the height and width for the field. Only supported on multi-selects,
         * long text, rich text, and fields that get rendered as INPUT (type=text) fields.
         * This API is not supported on rich text and list/record fields.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {number} options.height The new height of the field.
         * @param {number} options.width The new width of the field.
         * @return {Field}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when height or width parameter is missing
         *
         * @since 2015.2
         */
        this.updateDisplaySize = function (options) { };

        /**
         * Updates the display type for the field.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {number} options.displayType The new display type of the field. Set this value using the serverWidget.FieldDisplayType enum.
         * @return {Field}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when displayType parameter is missing
         *
         * @since 2015.2
         */
        this.updateDisplayType = function (options) { };

        /**
         * If Rich Text Editing is enabled, you can use this property to set the height of the rich text field (in pixels). The minimum value is 100 pixels and the maximum value is 500 pixels.
         * @name Field#richTextHeight
         * @type {number}
         *
         * @since 2015.2
         */
        this.richTextHeight = undefined;
        /**
         * If Rich Text Editing is enabled, you can use this property to set the width of the rich text field (in pixels). The minimum value is 250 pixels and the maximum value is 800 pixels.
         * @name Field#richTextWidth
         * @type {number}
         *
         * @since 2015.2
         */
        this.richTextWidth = undefined;
        /**
         * The label of the field
         * There is a 40-character limit for custom field labels.
         * @name Field#label
         * @type {string}
         *
         * @since 2015.2
         */
        this.label = undefined;
        /**
         * There is a 40-character limit for custom field labels.
         * @name Field#padding
         * @type {number}
         *
         * @since 2015.2
         */
        this.padding = undefined;
        /**
         * Get the select options for a field
         * The internal ID and label of the options for a select field as name/value pairs is returned.
         * The first 1,000 available options are returned (at maximum).
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} [options.filter] A search string to filter the select options that are returned.
         * @param {string} [options.filteroperator]  Supported operators are contains | is | startswith. If not specified, defaults to the contains operator
         * @return {Array<Object>}
         *
         * @since 2015.2
         */
        this.getSelectOptions = function (options) { };

        /**
         * Set help text for a field
         * When the field label is clicked, a popup displays the help text defined using this method.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.help The help text for the field
         * @param {boolean} [options.showInlineForAssistant] This means that field help will appear only in a field help popup box when the field label is clicked. The default value is false, which means the field help appears in a popup when the field label is clicked and does not appear inline.
         * @return {void}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when help parameter is missing
         * @throws {SuiteScriptError} SSS_INVALID_TYPE_ARG when help parameter is not string
         * @since 2015.2
         */
        this.setHelpText = function (options) { };

        /**
         * Help text for the field
         * @name Field#helpText
         * @type {string}
         *
         * @since 2019.2
         */
        this.helpText = undefined;
        /**
         * Adds the select options that appears in the dropdown of a field.
         * After you create a select or multi-select field that is sourced from a record or list, you cannot add additional values with Field.addSelectOption(options). The select values are determined by the source record or list.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.value The internal id of the option
         * @param {string} options.text  The display text for this option
         * @param {boolean} [options.isSelected] If set to true, this option is selected by default in the UI. The default value for this parameter is false.
         * @return {void}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when value or text parameter is missing
         *
         * @since 2015.2
         */
        this.addSelectOption = function (options) { };

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

    return new Field();
});