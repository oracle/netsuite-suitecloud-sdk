define(['./Node'], function (Node) {
    /**
     * @class XPath
     * @classDescription XPath Query Object
     * @constructor
     * @protected
     *
     * @since 2015.2
     */
    function XPath() {

        /**
         * Returns an Array of Nodes matching the provided XPath expression.
         * @param {Object} options
         * @param {string} options.xpath an XPath expression
         * @param {Node} options.node XML node being queried
         * @return {Array<Node>} nodes associated with the current result
         *
         * @since 2015.2
         */
        this.select = function (options) { };
    }

    return new XPath();
});