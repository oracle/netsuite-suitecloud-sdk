define([], function () {
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
        this.toJSON = function () { };

        /**
         * @returns {string}
         */
        this.toString = function () { };
    }
    return new PiRemovalTaskLogItem();
});