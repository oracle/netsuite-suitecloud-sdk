define([], function () {
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
        this.toJSON = function () { };

        /**
         * @returns {string}
         */
        this.toString = function () { };
    }

    return new PiRemovalTaskStatus();
});