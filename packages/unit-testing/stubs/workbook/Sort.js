define([], function () {
	/**
	 * @class Sort
	 * @classDescription Object which can be used in sort definitions
	 * @constructor
	 * @protected
	 *
	 * @since 2020.2
	 */
	function Sort() {
		/**
		 * ascending indicator
		 * @name Sort#ascending
		 * @type {boolean}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.ascending = undefined;
		/**
		 * locale of the sort
		 * @name Sort#locale
		 * @type {string}
		 * @throws {SuiteScriptError} INVALID_SORT_LOCALE if the locale is invalid
		 *
		 * @since 2020.2
		 */
		this.locale = undefined;
		/**
		 * nullsLast indicator
		 * @name Sort#nullsLast
		 * @type {boolean}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.nullsLast = undefined;
		/**
		 * case sensitivity indicator
		 * @name Sort#caseSensitive
		 * @type {boolean}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.caseSensitive = undefined;
		/**
		 * sort order indicator
		 * @name Sort#order
		 * @type {number}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2022.2
		 */
		this.order = undefined;
		/**
		 * Returns the object type name (workbook.Sort)
		 * @governance none
		 * @return {string}
		 *
		 * @since 2020.2
		 */
		this.toString = function () {};

		/**
		 * get JSON format of the object
		 * @governance none
		 * @return {Object}
		 *
		 * @since 2020.2
		 */
		this.toJSON = function () {};
	}
	return new Sort();
});
