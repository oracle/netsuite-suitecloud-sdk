define(['./CsvImportTask',
    './CsvImportTaskStatus',
    './EntityDeduplicationTask',
    './EntityDeduplicationTaskStatus',
    './MapReduceScriptTask',
    './MapReduceScriptTaskStatus',
    './PivotExecutionTask',
    './PivotTaskStatus',
    './QueryTask',
    './QueryTaskStatus',
    './RecordActionTask',
    './RecordActionTaskStatus',
    './ScheduledScriptTask',
    './ScheduledScriptTaskStatus',
    './SearchTask',
    './SearchTaskStatus',
    './SuiteQLTask',
    './SuiteQLTaskStatus',
    './WorkflowTriggerTask',
    './WorkflowTriggerTaskStatus'],
    function (CsvImportTask,
        CsvImportTaskStatus,
        EntityDeduplicationTask,
        EntityDeduplicationTaskStatus,
        MapReduceScriptTask,
        MapReduceScriptTaskStatus,
        PivotExecutionTask,
        PivotTaskStatus,
        QueryTask,
        QueryTaskStatus,
        RecordActionTask,
        RecordActionTaskStatus,
        ScheduledScriptTask,
        ScheduledScriptTaskStatus,
        SearchTask,
        SearchTaskStatus,
        SuiteQLTask,
        SuiteQLTaskStatus,
        WorkflowTriggerTask,
        WorkflowTriggerTaskStatus) {
        /**
         * SuiteScript module
         *
         * @module N/task
         * @suiteScriptVersion 2.x
         *
         */
        var task = function () { };

        /**
         * Creates a task of the given type and returns the task object.
         * @restriction Server SuiteScript only
         * @governance none
         *
         * @param {Object} options
         * @param {string} options.taskType specifies the type of task to be created; use values from the task.TaskType enum
         * @return {ScheduledScriptTask|MapReduceScriptTask|CsvImportTask|EntityDeduplicationTask|WorkflowTriggerTask|SearchTask|RecordActionTask|PivotExecutionTask|QueryTask|SuiteQLTask}
         * @throws {SSS_MISSING_REQD_ARGUMENT} if taskType argument is missing
         *
         * @since 2015.2
         */
        task.prototype.create = function (options) { };

        /**
         * Check current status of a submitted task. The task to be checked is identified by its task ID.
         * @restriction Server SuiteScript only
         * @governance none
         *
         * @param {Object} options
         * @param {string} options.taskId
         * @return {ScheduledScriptTaskStatus|MapReduceScriptTaskStatus|CsvImportTaskStatus|EntityDeduplicationTaskStatus|WorkflowTriggerTaskStatus|SearchTaskStatus|RecordActionTaskStatus|PivotTaskStatus|QueryTaskStatus|SuiteQLTaskStatus}
         * @throws {SSS_MISSING_REQD_ARGUMENT} if taskId argument is missing
         *
         * @since 2015.2
         */
        task.prototype.checkStatus = function (options) { };

        /**
         * Enumeration that holds the string values for the types of task objects, supported by the N/task Module, that you can create with task.create(options).
         * @enum {string}
         * @readonly
         */
        function taskTaskType() {
            this.SCHEDULED_SCRIPT = 'SCHEDULED_SCRIPT';
            this.MAP_REDUCE = 'MAP_REDUCE';
            this.CSV_IMPORT = 'CSV_IMPORT';
            this.ENTITY_DEDUPLICATION = 'ENTITY_DEDUPLICATION';
            this.WORKFLOW_TRIGGER = 'WORKFLOW_TRIGGER';
            this.SEARCH = 'SEARCH';
            this.QUERY = 'QUERY';
            this.SUITE_QL = 'SUITEQL';
            this.RECORD_ACTION = 'RECORD_ACTION';
            this.PIVOT = 'PIVOT';
        }

        task.prototype.TaskType = new taskTaskType();

        /**
         * Enumeration that holds the string values for the possible status of tasks created and submitted with the N/task Module.
         * @enum {string}
         * @readonly
         */
        function taskTaskStatus() {
            this.PENDING = 'PENDING';
            this.PROCESSING = 'PROCESSING';
            this.COMPLETE = 'COMPLETE';
            this.FAILED = 'FAILED';
        }

        task.prototype.TaskStatus = new taskTaskStatus();

        /**
         * Enumeration that holds the string values for supported master selection modes when merging duplicate records with EntityDeduplicationTask.
         * @enum {string}
         * @readonly
         */
        function taskMasterSelectionMode() {
            this.CREATED_EARLIEST = 'CREATED_EARLIEST';
            this.MOST_RECENT_ACTIVITY = 'MOST_RECENT_ACTIVITY';
            this.MOST_POPULATED_FIELDS = 'MOST_POPULATED_FIELDS';
            this.SELECT_BY_ID = 'SELECT_BY_ID';
        }

        task.prototype.MasterSelectionMode = new taskMasterSelectionMode();

        /**
         * Enumeration that holds the string values for available deduplication modes when merging duplicate records with EntityDeduplicationTask.
         * @enum {string}
         * @readonly
         */
        function taskDedupeMode() {
            this.MERGE = 'MERGE';
            this.DELETE = 'DELETE';
            this.MAKE_MASTER_PARENT = 'MAKE_MASTER_PARENT';
            this.MARK_AS_NOT_DUPES = 'MARK_AS_NOT_DUPES';
        }

        task.prototype.DedupeMode = new taskDedupeMode();

        /**
         * Enumeration that holds the string values for entity types for which you can merge duplicate records with EntityDeduplicationTask.
         * @enum {string}
         * @readonly
         */
        function taskDedupeEntityType() {
            this.CUSTOMER = 'CUSTOMER';
            this.CONTACT = 'CONTACT';
            this.VENDOR = 'VENDOR';
            this.PARTNER = 'PARTNER';
            this.LEAD = 'LEAD';
            this.PROSPECT = 'PROSPECT';
        }

        task.prototype.DedupeEntityType = new taskDedupeEntityType();

        /**
         * Enumeration that holds the string values for the stages of a map/reduce script deployment, which is encapsulated by the MapReduceScriptTask object.
         * @enum {string}
         * @readonly
         */
        function taskMapReduceStage() {
            this.GET_INPUT = 'GET_INPUT';
            this.MAP = 'MAP';
            this.SHUFFLE = 'SHUFFLE';
            this.REDUCE = 'REDUCE';
            this.SUMMARIZE = 'SUMMARIZE';
        }

        task.prototype.MapReduceStage = new taskMapReduceStage();

        /**
         * Enumeration that holds the string values for the possible record action conditions.
         * @enum {Object}
         * @readonly
         */
        function taskActionCondition() {
            this.ALL_QUALIFIED_INSTANCES = 'ALL_QUALIFIED_INSTANCES';
        }

        task.prototype.ActionCondition = new taskActionCondition();

        /**
         * @exports N/task
         * @namespace task
         */
        return new task();
    });