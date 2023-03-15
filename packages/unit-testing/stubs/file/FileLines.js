define([], function () {
    /**
     * @class FileLines
     * @classdesc Object for iterating over file lines
     * @protected
     * @constructor
     */
    function FileLines() {

        /**
         * Returns true if there are still any line which can be read from the file
         * @restriction Server SuiteScript only
         * @governance none
         * @return {boolean}
         *
         * @since 2017.1
         */
        this.hasNext = function () { };

        /**
         * Returns the current line and moves the iterator to the next line
         * @restriction Server SuiteScript only
         * @governance none
         * @return {string}
         *
         * @since 2017.1
         */
        this.next = function () { };

        /**
         * Sets the current line to the first line of the file
         * @restriction Server SuiteScript only
         * @governance none
         * @return {void}
         *
         * @since 2017.1
         */
        this.reset = function () { };
    }

    return new FileLines();
});