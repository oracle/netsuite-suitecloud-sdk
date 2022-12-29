/**
 * SuiteScript module
 *
 * @module N/piremoval
 * @NApiVersion 2.x
 *
 */
define([], function(){        
    /**
     * @namespace piremoval
     */    
    var piremoval = {};    
        
    /**
     * Enum status values.
     * @readonly
     * @enum {string}
     */    
    function piremovalStatus() {
        this.CREATED = 'CREATED';
        this.PENDING = 'PENDING';
        this.COMPLETE = 'COMPLETE';
        this.ERROR = 'ERROR';
        this.DELETED = 'DELETED';
        this.NOT_APPLIED = 'NOT_APPLIED';
    }
    
    piremoval.prototype.Status = new piremovalStatus();    
        
    /**
     * @protected
     * @constructor
     */    
    function PiRemovalTaskLogItem() {    
        
        /**
         * Type
         * @name PiRemovalTaskLogItem#type
         * @type {string}
         * @since 2019.2
         */        
        this.type = undefined;        
        /**
         * Status
         * @name PiRemovalTaskLogItem#status
         * @type {string}
         * @since 2019.2
         */        
        this.status = undefined;        
        /**
         * Message
         * @name PiRemovalTaskLogItem#message
         * @type {string}
         * @since 2019.2
         */        
        this.message = undefined;        
        /**
         * Exception
         * @name PiRemovalTaskLogItem#exception
         * @type {string}
         * @since 2019.2
         */        
        this.exception = undefined;        
        /**
         * get JSON format of the object
         * @returns {Object}
         */        
        this.toJSON = function() {};        
        
        /**
         * @returns {string}
         */        
        this.toString = function() {};        
    }    
        
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
        this.save = function() {};        
        
        /**
         * Delete
         * @returns {undefined}
         * @since 2019.2
         */        
        this.deleteTask = function() {};        
        
        /**
         * Run
         * @returns {undefined}
         * @since 2019.2
         */        
        this.run = function() {};        
        
        /**
         * get JSON format of the object
         * @returns {Object}
         */        
        this.toJSON = function() {};        
        
        /**
         * @returns {string}
         */        
        this.toString = function() {};        
    }    
        
    /**
     * @protected
     * @constructor
     */    
    function PiRemovalTaskStatus() {    
        
        /**
         * Status
         * @name PiRemovalTaskStatus#status
         * @type {string}
         * @since 2019.2
         */        
        this.status = undefined;        
        /**
         * Log List
         * @name PiRemovalTaskStatus#logList
         * @type {list}
         * @since 2019.2
         */        
        this.logList = undefined;        
        /**
         * get JSON format of the object
         * @returns {Object}
         */        
        this.toJSON = function() {};        
        
        /**
         * @returns {string}
         */        
        this.toString = function() {};        
    }    
    
    N.piremoval = piremoval;
    
    /**
     * @exports N/piremoval
     */
    return piremoval;
});