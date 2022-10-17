define([], function () {
    /**
     * @class Certificate
     * @classdesc Certificate object mirrors all the properties settable in UI
     * @protected
     * @constructor
     */
    function Certificate() {

        /**
         * @name Certificate#file
         * @type {File}
         * @since 2019.2
         */
        this.file = undefined;
        /**
         * @name Certificate#subsidiaries
         * @type {Array<number>}
         * @since 2019.2
         */
        this.subsidiaries = undefined;
        /**
         * @name Certificate#restrictions
         * @type {Array<number>}
         * @since 2019.2
         */
        this.restrictions = undefined;
        /**
         * @name Certificate#scriptRestrictions
         * @type {Array<string>}
         * @since 2021.1
         */
        this.scriptRestrictions = undefined;
        /**
         * @name Certificate#notifications
         * @type {Array<number>}
         * @since 2019.2
         */
        this.notifications = undefined;
        /**
         * @name Certificate#password
         * @type {string}
         * @since 2019.2
         */
        this.password = undefined;
        /**
         * @name Certificate#scriptId
         * @type {string}
         * @since 2019.2
         */
        this.scriptId = undefined;
        /**
         * @name Certificate#name
         * @type {string}
         * @since 2019.2
         */
        this.name = undefined;
        /**
         * @name Certificate#description
         * @type {string}
         * @since 2019.2
         */
        this.description = undefined;
        /**
         * @name Certificate#weekReminder
         * @type {boolean}
         * @since 2019.2
         */
        this.weekReminder = undefined;
        /**
         * @name Certificate#monthReminder
         * @type {boolean}
         * @since 2019.2
         */
        this.monthReminder = undefined;
        /**
         * @name Certificate#threeMonthsReminder
         * @type {boolean}
         * @since 2019.2
         */
        this.threeMonthsReminder = undefined;
        /**
         * get JSON format of the object
         * @restriction Server SuiteScript only
         * @governance none
         * @return {Object}
         *
         * @since 2019.2
         */
        this.toJSON = function () { };

        /**
         * Returns the object type name (certificateControl.Certificate)
         * @restriction Server SuiteScript only
         * @governance none
         * @return {string}
         *
         * @since 2019.2
         */
        this.toString = function () { };

        /**
         * Persist current certificate object to database
         * @restriction Server SuiteScript only
         * @governance 10 units
         * @return {Object} Object containing scriptId property
         *
         * @since 2019.2
         */
        this.save = function () { };
    }

    return new Certificate();
});