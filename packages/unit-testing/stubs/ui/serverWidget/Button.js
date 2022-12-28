define([], function () {
    /**
     * To add a button, use Form.addButton(options) or Sublist.addButton(options). When adding a button to a record or form, consider using a beforeLoad user event script.
     * Custom buttons only appear during Edit mode. On records, custom buttons appear to the left of the printer icon.
     *
     * @class Button
     * @classdesc Encapsulates button that appears in a UI object.
     * @protected
     * @constructor
     *
     * @since 2015.2
     */
    function Button() {

        /**
         * Indicates whether a button is grayed-out and disabled.
         * The default value is false.
         * If set to true, the button appears grayed-out in the and cannot be clicked.
         * @name Button#isDisabled
         * @type {boolean}
         *
         * @since 2015.2
         */
        this.isDisabled = undefined;
        /**
         * The label of the button
         * You can use this property to rename a button based on context, for example to re-label a button for particular users that are viewing a page.
         * @name Button#label
         * @type {string}
         *
         * @since 2015.2
         */
        this.label = undefined;
        /**
         * Indicates whether the button is hidden in the UI.
         * The default value is false, which means the button is visible.
         * If set to true, the button is not visible in the UI.
         * @name Button#isHidden
         * @type {boolean}
         *
         * @since 2015.2
         */
        this.isHidden = undefined;
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

    return new Button();
});