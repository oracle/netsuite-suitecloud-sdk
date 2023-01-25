define([], function () {
    /**
     * @protected
     * @constructor
     */
    function PiRemovalTask() {
        /**
         * Task id
         * @name PiRemovalTask#id
         * @type {string}
         * @since 2019.2
         */
        this.id = undefined;
        /**
         * Record Type
         * @name PiRemovalTask#recordType
         * @type {string}
         * @since 2019.2
         */
        this.recordType = undefined;
        /**
         * Record Ids
         * @name PiRemovalTask#recordIds
         * @type {Array<string>}
         * @since 2019.2
         */
        this.recordIds = undefined;
        /**
         * Field Ids
         * @name PiRemovalTask#fieldIds
         * @type {Array<string>}
         * @since 2019.2
         */
        this.fieldIds = undefined;
        /**
         * Workflow ids
         * @name PiRemovalTask#workflowIds
         * @type {Array<string>}
         * @since 2019.2
         */
        this.workflowIds = undefined;
        /**
         * History Only flag
         * @name PiRemovalTask#historyOnly
         * @type {boolean}
         * @since 2019.2
         */
        this.historyOnly = undefined;
        /**
         * History Replacement
         * @name PiRemovalTask#historyReplacement
         * @type {string}
         * @since 2019.2
         */
        this.historyReplacement = undefined;
        /**
         * Status
         * @name PiRemovalTask#status
         * @type {PiRemovalTaskStatus}
         * @since 2019.2
         */
        this.status = undefined;
        /**
         * Save
         * @returns {undefined}
         * @since 2019.2
         */
        this.save = function () { };

        /**
         * Delete
         * @returns {undefined}
         * @since 2019.2
         */
        this.deleteTask = function () { };

        /**
         * Run
         * @returns {undefined}
         * @since 2019.2
         */
        this.run = function () { };

        /**
         * get JSON format of the object
         * @returns {Object}
         */
        this.toJSON = function () { };

        /**
         * @returns {string}
         */
        this.toString = function () { };
    }

    return new PiRemovalTask();
});