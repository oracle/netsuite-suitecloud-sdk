define([], function () {
    /**
     * A field group is a collection of fields that can be displayed in a one or two column format. Assign a field to a field group in order to label, hide or collapse a group of fields.
     *
     * @class FieldGroup
     * @classdesc Encapsulate a field group on an Assistant or a Form objects.
     * @protected
     * @constructor
     *
     * @since 2015.2
     */
    function FieldGroup() {

        /**
         * Indicates whether the field group can be collapsed.
         * The default value is false, which means the field group displays as a static group that cannot be opened or closed.
         * If set to true, the field group can be collapsed.
         * Only supported for fields on serverWidget.createAssistant(options) objects.
         * @name FieldGroup#isCollapsible
         * @type {boolean}
         *
         * @since 2015.2
         */
        this.isCollapsible = undefined;
        /**
         * Indicates whether field group is collapsed or expanded.
         * The default value is false, which means that when the page loads, the field group will not appear collapsed.
         * If set to true, the field group is collapsed.
         * Only supported for fields on serverWidget.createAssistant(options) objects.
         * @name FieldGroup#isCollapsed
         * @type {boolean}
         *
         * @since 2015.2
         */
        this.isCollapsed = undefined;
        /**
         * Indicates whether the field group border is hidden.
         * If set to false, a border around the field group is displayed.
         * The default value is false.
         * @name FieldGroup#isBorderHidden
         * @type {boolean}
         *
         * @since 2015.2
         */
        this.isBorderHidden = undefined;
        /**
         * Indicates whether the fields in this group display in a single column
         * The default value is false
         * @name Field#isSingleColumn
         * @type {boolean}
         *
         * @since 2015.2
         */
        this.isSingleColumn = undefined;
        /**
         * The label of the field group
         * @name FieldGroup#label
         * @type {string}
         *
         * @since 2015.2
         */
        this.label = undefined;
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

    return new FieldGroup();
});