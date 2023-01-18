define([], function () {
    /**
     * @class EntityDeduplicationTask
     * @classdesc Encapsulates all the properties of a merge duplicate records task request. Use the methods and properties of this object to submit a merge duplicate record job task into the NetSuite task queue.
     * @protected
     * @constructor
     *
     * @since 2015.2
     */
    function EntityDeduplicationTask() {

        /**
         * The ID of the task.
         * @name EntityDeduplicationTask#id
         * @type {string}
         *
         * @since 2015.2
         */
        this.id = undefined;
        /**
         * Represents the entity type. Use values from the task.DedupeEntityType enum.
         * @name EntityDeduplicationTask#entityType
         * @type {string}
         *
         * @since 2015.2
         */
        this.entityType = undefined;
        /**
         * Master record ID.
         * @name EntityDeduplicationTask#masterRecordId
         * @type {number}
         *
         * @since 2015.2
         */
        this.masterRecordId = undefined;
        /**
         * Master selection mode. Use values from the task.MasterSelectionMode enum.
         * @name EntityDeduplicationTask#masterSelectionMode
         * @type {string}
         *
         * @since 2015.2
         */
        this.masterSelectionMode = undefined;
        /**
         * Deduplication mode. Use values from the task.DedupeMode enum.
         * @name EntityDeduplicationTask#dedupeMode
         * @type {string}
         *
         * @since 2015.2
         */
        this.dedupeMode = undefined;
        /**
         * Records to deduplicate.
         * @name EntityDeduplicationTask#recordIds
         * @type {Array<number>}
         *
         * @since 2015.2
         */
        this.recordIds = undefined;
        /**
         * Submits the task and returns an unique ID.
         * @restriction Server SuiteScript only
         * @governance 100 units
         *
         * @return {string} taskId
         * @throws {SuiteScriptError} FAILED_TO_SUBMIT_JOB_REQUEST_1 when task cannot be submitted for some reason
         *
         * @since 2015.2
         */
        this.submit = function () { };

        /**
         * Returns the object type name (task.EntityDeduplicationTask).
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

    return new EntityDeduplicationTask();
});