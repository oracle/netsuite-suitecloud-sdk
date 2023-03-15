define([], function () {
    /**
     *
     * @param {JavaLikeIterator} delegate
     * @constructor
     * @protected
     */
    function Iterator() {

        /**
         * ECMA 2015 style
         *
         * @return {{done: boolean, value: *}}
         */
        this.next = function () { };

        /**
         * SuiteScript style
         *
         * @param {iteratorFunction} iteratorFunction
         */
        this.each = function (options) { };
    }

    return new Iterator();
});
