define([], function() {

    /**
     * Primary object used to encapsulate a record sublist line object.
     *
     * @protected
     * @param {Object} options
     * @param {Record} options.unproxiedRecord - Instance of recordDefinition that owns the Line object.
     * @param {string} options.sublistId
     * @param {string} options.lineInstanceId
     * @param {boolean} options.fromBuffer
     * @param {boolean} options.isReadOnly
     * @return {Line}
     * @constructor
     */
    function Line() {}

    return new Line();
});