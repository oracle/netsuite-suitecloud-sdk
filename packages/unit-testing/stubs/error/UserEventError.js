define([], function () {
    /**
     *
     * @protected
     * @class UserEventError
     * @classdesc SuiteScript error class for user events
     * @constructor
     *
     * @since 2015.2
     */
    function UserEventError() {

        /**
         * Internal ID of the submitted record that triggered the script. This property only holds a value when the error
         * is thrown by an afterSubmit user event.
         * @name UserEventError#recordId
         * @type {string}
         * @readonly
         *
         * @since 2015.2
         */
        this.recordId = undefined;
        /**
         * @name UserEventError#eventType
         * @type {string}
         * @readonly
         *
         * @since 2015.2
         */
        this.eventType = undefined;
        /**
         * get JSON format of the object
         * @governance none
         * @return {Object}
         *
         * @since 2015.2
         */
        this.toJSON = function () { };

        /**
         * Returns stringified representation of this error
         * @governance none
         * @return {string}
         *
         * @since 2015.2
         */
        this.toString = function () { };
    }

    return new UserEventError();
});