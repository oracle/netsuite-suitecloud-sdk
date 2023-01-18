define([], function () {
    /**
     * SuiteScript 2.0 util global object
     *
     * @name util
     * @type {Object}
     */
    var util = function () { };

    /**
     * @memberof util
     * @name util.each
     *
     * @param {Object|Array} iterable
     * @param {Function} callback
     * @returns {Object|Array} iterable - original collection
     */
    util.prototype.each = function (iterable, callback) { };

    /**
     * @memberof util
     * @name util.extend
     *
     * @param {Object} receiver
     * @param {Object} contributor
     * @returns {Object} receiver
     */
    util.prototype.extend = function (receiver, contributor) { };

    /**
     * @memberof util
     * @name util.deepExtend
     *
     * @param {Object} receiver
     * @param {Object} contributor
     * @returns {Object} receiver
     */
    util.prototype.deepExtend = function (receiver, contributor) { };

    /**
     * Determines if a variable refers to an instance of Object.prototype (aka "Plain Object" aka {})
     *
     * @memberof util
     * @name util.isObject
     *
     * @param {*} obj
     * @returns {boolean}
     */
    util.prototype.isObject = function (obj) { };

    /**
     * Determines if a variable refers to a Function
     *
     * @memberof util
     * @name util.isFunction
     *
     * @param {*} obj
     * @returns {boolean}
     */
    util.prototype.isFunction = function (obj) { };

    /**
     * Determines if a variable refers to an Async Function
     *
     * @memberof util
     * @name util.isAsyncFunction
     *
     * @param {*} obj
     * @returns {boolean}
     */
    util.prototype.isAsyncFunction = function (obj) { };

    /**
     *  Determines if a variable refers to an Array
     *
     * @memberof util
     * @name util.isArray
     *
     * @param {*} obj
     * @returns {boolean}
     */
    util.prototype.isArray = function (obj) { };

    /**
     * Determines if a variable refers to a boolean
     *
     * @memberof util
     * @name util.isBoolean
     *
     * @param {*} obj
     * @returns {boolean}
     */
    util.prototype.isBoolean = function (obj) { };

    /**
     * Determines if a variable refers to a string
     *
     * @memberof util
     * @name util.isString
     *
     * @param {*} obj
     * @returns {boolean}
     */
    util.prototype.isString = function (obj) { };

    /**
     * Determines if a variable refers to a number
     *
     * @memberof util
     * @name util.isNumber
     *
     * @param obj
     * @returns {boolean}
     */
    util.prototype.isNumber = function (obj) { };

    /**
     * Determines if a variable refers to a number or a string
     *
     * @memberof util
     * @name util.isNumberOrString
     *
     * @param obj
     * @returns {boolean}
     */
    util.prototype.isNumberOrString = function (obj) { };

    /**
     *
     * Determines if a variable refers to a Date
     *
     * @memberof util
     * @name util.isDate
     *
     * @param obj
     * @returns {boolean}
     */
    util.prototype.isDate = function (obj) { };

    /**
     * Determines if a variable refers to a RegExp
     *
     * @memberof util
     * @name util.isRegExp
     *
     * @param obj
     * @returns {boolean}
     */
    util.prototype.isRegExp = function (obj) { };

    /**
     * Determines if a variable refers to an Error
     *
     * @memberof util
     * @name util.isError
     *
     * @param obj
     * @returns {boolean}
     */
    util.prototype.isError = function (obj) { };

    /**
     * Remove leading and trailing whitespace from a string
     *
     * @memberof util
     * @name util.trim
     *
     * @param {string} str String to have leading/trailing whitespace extracted
     */
    util.prototype.trim = function (str) { };

    /**
     * @exports N/util
     * @namespace util
     */
    return new util();
});