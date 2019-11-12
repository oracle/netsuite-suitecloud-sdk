define([], function () {

    /**
     * Return a new instance of sublist object
     *
     * @param {Object} sublist
     * @param {string} sublist.type type of sublist
     * @param {SublistState} sublist.sublistState SublistState

     * @return {Sublist}
     * @constructor
     *
     * @since 2015.2
     */
    function Sublist() {
        /**
         * The name of the sublist.
         * @name Sublist#name
         * @type string
         * @readonly
         */

        this.getName = function(options) {};

        // /**
        //  * The type of the sublist.
        //  * @name Sublist#type
        //  * @type string
        //  * @readonly
        //  */
        //
        // this.prototype.getType = function(options) {};
        //
        // /**
        //  * The sublist is changed
        //  * @name Sublist#isChanged
        //  * @type boolean
        //  * @readonly
        //  */
        //
        // this.prototype.isChanged = function(options) {};
        //
        // /**
        //  * The sublist is hidden
        //  * @name Sublist#isHidden
        //  * @type boolean
        //  * @readonly
        //  */
        //
        // this.prototype.isHidden = function(options) {};
        //
        // /**
        //  * The sublist is display
        //  * @name Sublist#isDisplay
        //  * @type boolean
        //  * @readonly
        //  */
        //
        // this.prototype.isDisplay = function(options) {};
        //
        // /**
        //  * A flag to indicate whether or not the sublist supports multi-line buffer feature.
        //  * @name Sublist#isMultilineEditable
        //  * @type boolean
        //  * @readonly
        //  */
        //
        // this.prototype.isMultilineEditable = function(options) {};
        //
        // /**
        //  * Returns the object type name (sublist.Sublist)
        //  * @returns {string}
        //  */
        //
        // this.prototype.toString = function(options) {};
        //
        // /**
        //  * JSON.stringify() implementation.
        //  * @returns {{id: string, type: string, isChanged: boolean, isDisplay: boolean}}
        //  */
        //
        // this.prototype.toJSON = function(options) {};
    }

    return new Sublist();
});