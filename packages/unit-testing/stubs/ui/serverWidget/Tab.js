define([], function () {
    /**
     *
     * You can add a new tab or subtab to a form using one of the following methods:
     * Form.addSubtab(options)
     * Form.addTab(options)
     * Form.insertSubtab(options)
     * Form.insertTab(options)
     *
     * @class Tab
     * @classdesc Encapsulates a tab or subtab on a serverWidget.Form object.
     * @protected
     * @constructor
     *
     * @since 2015.2
     */
    function Tab() {

        /**
         * The label of the Tab
         * @name Tab#label
         * @type {string}
         *
         * @since 2015.2
         */
        this.label = undefined;
        /**
         * The Tab's field help
         * @name Tab#helpText
         * @type {string}
         *
         * @since 2015.2
         */
        this.helpText = undefined;
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

    return new Tab();
});