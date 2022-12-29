define([], function () {
    /**
     * @class Key
     * @classdesc Key object mirrors all the properties settable in UI
     * @protected
     * @constructor
     */
    function Key() {

        /**
         * @name Key#file
         * @type {File}
         * @since 2019.2
         */
        this.file = undefined;
        /**
         * @name Key#restrictions
         * @type {Array<number>}
         * @since 2019.2
         */
        this.restrictions = undefined;
        /**
         * @name Key#scriptRestrictions
         * @type {Array<string>}
         * @since 2019.2
         */
        this.scriptRestrictions = undefined;
        /**
         * @name Key#password
         * @type {String}
         * @since 2019.2
         */
        this.password = undefined;
        /**
         * @name Key#scriptId
         * @type {String}
         * @since 2019.2
         */
        this.scriptId = undefined;
        /**
         * @name Key#name
         * @type {String}
         * @since 2019.2
         */
        this.name = undefined;
        /**
         * @name Key#description
         * @type {String}
         * @since 2019.2
         */
        this.description = undefined;
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
         * Returns the object type name (keyControl.Key)
         * @restriction Server SuiteScript only
         * @governance none
         * @return {string}
         *
         * @since 2019.2
         */
        this.toString = function () { };

        /**
         * Persist current key object to database
         * @restriction Server SuiteScript only
         * @governance 10 units
         * @return {Object} Object containing scriptId property
         *
         * @since 2019.2
         */
        this.save = function () { };
    }

    return new Key();
});