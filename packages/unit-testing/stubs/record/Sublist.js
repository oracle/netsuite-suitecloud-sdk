define(['./Column'], function (Column) {
    function Sublist() {
        /**
         * Returns a column in the sublist.
         * @param {Object} options
         * @param {Object} options.fieldId - The internal ID of the column field in the sublist.
         * @return {Column}
         */

        this.getColumn = function (options) { };

        this.isChanged = undefined;

        this.isDisplay = undefined;

        this.type = undefined;

        this.id = undefined;

        /**
         * Returns the object type name (sublist.Sublist)
         * @returns {string}
         */

        this.toString = function (options) { };

        /**
         * JSON.stringify() implementation.
         * @returns {{id: string, type: string, isChanged: boolean, isDisplay: boolean}}
         */

        this.toJSON = function (options) { };
    }

    return new Sublist();
});