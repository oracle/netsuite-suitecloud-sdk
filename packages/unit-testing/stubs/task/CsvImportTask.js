define([], function () {
    /**
     * @class CsvImportTask
     * @classdesc Encapsulates the properties of a CSV import task. Use the methods and properties for this object to submit a CSV import task into the task queue and asynchronously import record data into NetSuite.
     * @protected
     * @constructor
     *
     * @since 2015.2
     */
    function CsvImportTask() {

        /**
         * The ID of the task.
         * @name CsvImportTask#id
         * @type {string}
         *
         * @since 2015.2
         */
        this.id = undefined;
        /**
         * A file.File object containing data to be imported OR a string containing raw CSV text to be imported.
         * @name CsvImportTask#importFile
         * @type {string | File}
         *
         * @since 2015.2
         */
        this.importFile = undefined;
        /**
         * Internal ID or script ID of a saved import map to be used for the import.
         * @name CsvImportTask#mappingId
         * @type {string | number}
         */
        this.mappingId = undefined;
        /**
         * Overrides the CSV import queue preference.
         * @name CsvImportTask#queueId
         * @type {number}
         *
         * @since 2015.2
         */
        this.queueId = undefined;
        /**
         * The name of the import job to be shown on the status page for CSV imports.
         * @name CsvImportTask#name
         * @type {string}
         *
         * @since 2015.2
         */
        this.name = undefined;
        /**
         * A map of key/value pairs "sublist->file" for a multi-file import job.
         * The key defines the internal ID of the record sublist for which data is being imported.
         * The value is a file.File object containing data to be imported OR a string containing raw CSV text to be imported.
         * @name CsvImportTask#linkedFiles
         * @type {Object}
         *
         * @since 2015.2
         */
        this.linkedFiles = undefined;
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
         * Returns the object type name (task.CsvImportTask).
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

    return new CsvImportTask();
});