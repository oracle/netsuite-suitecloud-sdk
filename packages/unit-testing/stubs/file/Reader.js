define([], function () {
    /**
     * @class Reader
     * @classdesc object for reading arbitrary amount of data from a file
     * @protected
     * @constructor
     */
    function Reader() {

        /**
         * Returns string from current position to the next occurrence of options.tag
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.tag
         * @throws {SuiteScriptError} SSS_TAG_CANNOT_BE_EMPTY if tag to read until is empty
         * @return {string}
         *
         * @since 2019.1
         */
        this.readUntil = function (options) { };

        /**
         * Returns the next options.number characters from the current position
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {number} options.number
         * @throws {SuiteScriptError} SSS_INVALID_READ_SIZE if number of characters to read is not greater than zero
         * @return {string}
         *
         * @since 2019.1
         */
        this.readChars = function (options) { };

        /**
         * Resets the stream, so the next read starts from the beginning of the file
         * @restriction Server SuiteScript only
         * @governance none
         * @return {void}
         *
         * @since 2017.1
         */
        this.reset = function () { };
    }

    return new Reader();
});