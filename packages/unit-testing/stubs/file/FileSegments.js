define([], function () {
    /**
     * @class FileSegments
     * @classdesc Object for iterating over file segments
     * @protected
     * @constructor
     */
    function FileSegments() {

        /**
         * Returns true if there are still any segments which can be read from the file
         * @restriction Server SuiteScript only
         * @governance none
         * @return {boolean}
         *
         * @since 2019.1
         */
        this.hasNext = function () { };

        /**
         * Returns the current segment and moves the iterator to the next segment
         * @restriction Server SuiteScript only
         * @governance none
         * @return {string}
         *
         * @since 2019.1
         */
        this.next = function () { };

        /**
         * Sets the current segment to the first segment of the file
         * @restriction Server SuiteScript only
         * @governance none
         * @return {void}
         *
         * @since 2017.1
         */
        this.reset = function () { };
    }

    return new FileSegments();
});