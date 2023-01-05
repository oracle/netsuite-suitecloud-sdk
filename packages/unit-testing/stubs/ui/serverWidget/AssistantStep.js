define([], function () {
    /**
     * Create a step by calling Assistant.addStep(options).
     *
     * @class AssistantStep
     * @classdesc Encapsulates a step within a custom NetSuite assistant.
     * @protected
     * @constructor
     *
     * @since 2015.2
     */
    function AssistantStep() {

        /**
         * The internal id of the step.
         * @name AssistantStep#id
         * @type {string}
         * @readonly
         *
         * @since 2015.2
         */
        this.id = undefined;
        /**
         * The label of the step
         * @name AssistantStep#label
         * @type {string}
         *
         * @since 2015.2
         */
        this.label = undefined;
        /**
         * The index of this step as a number
         * A sequence of assistant steps starts at 1.
         * @name AssistantStep#stepNumber
         * @type {number}
         *
         * @since 2015.2
         */
        this.stepNumber = undefined;
        /**
         * Help text for the step
         * @name AssistantStep#helpText
         * @type {string}
         *
         * @since 2015.2
         */
        this.helpText = undefined;
        /**
         * Gets the IDs for all the sublist fields (line items) in a step
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.group  The internal id of the sublist
         * @return {Array<string>}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when group parameter is missing
         *
         * @since 2015.2
         */
        this.getSublistFieldIds = function (options) { };

        /**
         * Gets the IDs for all the sublists submitted in a step.
         * @restriction Server SuiteScript only
         * @governance none
         * @return {Array<string>}
         *
         * @since 2015.2
         */
        this.getSubmittedSublistIds = function () { };

        /**
         * Gets the IDs for all the fields in a step.
         * @restriction Server SuiteScript only
         * @governance none
         * @return {Array<string>}
         *
         * @since 2015.2
         */
        this.getFieldIds = function () { };

        /**
         * Gets the IDs for all the fields in a step.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.id Internal id for the field
         * @return {string|Array<string>}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when id parameter is missing
         *
         * @since 2015.2
         */
        this.getValue = function (options) { };

        /**
         * Gets the number of lines on a sublist in a step. If the sublist does not exist, -1 is returned.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.group internal Id of the sublist
         * @return {number}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when group parameter is missing
         *
         * @since 2015.2
         */
        this.getLineCount = function (options) { };

        /**
         * Gets the current value of a sublist field (line item) in a step.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.group Internal id of the sublist
         * @param {string} options.id Internal id of the field
         * @param {string} options.line line number
         * @return {string}
         *
         * @since 2015.2
         */
        this.getSublistValue = function (options) { };

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

    return new AssistantStep();
});