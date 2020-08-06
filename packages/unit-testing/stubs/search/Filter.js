define([], function () {
	/**
	 * Return a new instance of search.Filter object.
	 *
	 * @classDescription Encapsulates a search filter used in a search.
	 * @protected
	 * @constructor
	 * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if a required parameter is missing
	 * @throws {SuiteScriptError} SSS_INVALID_SRCH_OPERATOR if an unknown operator is provided
	 *
	 * @since 2015.2
	 */

	function Filter() {
		/**
		 * Name or internal ID of the search field as a string.
		 * @name Filter#name
		 * @type {string}
		 * @readonly
		 * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
		 *
		 * @since 2015.2
		 */

		this.name = undefined;
		/**
		 * Join ID for the search filter as a string.
		 * @name Filter#join
		 * @type {string}
		 * @readonly
		 * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
		 *
		 * @since 2015.2
		 */

		this.join = undefined;
		/**
		 * Operator used for the search filter.
		 * @name Filter#operator
		 * @type {string}
		 * @readonly
		 * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
		 *
		 * @since 2015.2
		 */

		this.operator = undefined;
		/**
		 * Summary type for the search filter.
		 * @name Filter#summary
		 * @type {string}
		 * @throws {SuiteScriptError} SSS_INVALID_SRCH_FILTER_SUM when setting invalid summary type
		 *
		 * @since 2015.2
		 */

		this.summary = undefined;
		/**
		 * Formula used by the search filter.
		 * @name Filter#formula
		 * @type {string}
		 *
		 * @since 2015.2
		 */

		this.formula = undefined;
		/**
		 * Returns the object type name (search.Filter)
		 * @governance none
		 * @return {string}
		 *
		 * @since 2015.2
		 */

		this.toString = function () {};

		/**
		 * get JSON format of the object
		 * @governance none
		 * @return {Object}
		 *
		 * @since 2015.2
		 */

		this.toJSON = function () {};
	}
	return new Filter();
});
