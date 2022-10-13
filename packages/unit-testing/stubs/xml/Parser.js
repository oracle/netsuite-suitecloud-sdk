define(['./Document'], function (Document) {
    /**
     * @class Parser
     * @classDescription XML Parser Object
     * @constructor
     * @protected
     *
     * @since 2015.2
     */
    function Parser() {

        /**
         * Generate XML Document object from a string.
         * @governance none
         * @param {Object} options
         * @param {string} options.text XML text
         * @return {Document}
         *
         * @since 2015.2
         */
        this.fromString = function (options) { };

        /**
         * Generate a String from an XML Document object.
         * @governance none
         * @param {Object} options
         * @param {Document} options.document XML Document object
         * @return {string}
         *
         * @since 2015.2
         */
        this.toString = function (options) { };
    }

    return new Parser();
});