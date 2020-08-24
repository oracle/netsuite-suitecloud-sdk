define([], function () {
	/**
	 * Return a new instance of search.Column object.
	 *
	 * @classDescription Encapsulates a single search column in a search.Search. Use the methods and properties available to the Column object to get or set Column properties.
	 * @protected
	 * @constructor
	 * @throws {SuiteScriptError} SSS_INVALID_SRCH_COLUMN_SUM if an unknown summary type is provided
	 * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when name parameter is missing
	 *
	 * @since 2015.2
	 */

	function Column() {
		/**
		 * The name of the search column.
		 * @name Column#name
		 * @type {string}
		 * @readonly
		 * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
		 *
		 * @since 2015.2
		 */

		this.name = undefined;
		/**
		 * The join ID for this search column.
		 * @name Column#join
		 * @type {string}
		 * @readonly
		 * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
		 *
		 * @since 2015.2
		 */

		this.join = undefined;
		/**
		 * The summary type for this search column.
		 * @name Column#summary
		 * @type {string}
		 * @readonly
		 * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
		 *
		 * @since 2015.2
		 */

		this.summary = undefined;
		/**
		 * The formula used for this search column.
		 * @name Column#formula
		 * @type {string}
		 *
		 * @since 2015.2
		 */

		this.formula = undefined;
		/**
		 * The label used for this search column.
		 * @name Column#label
		 * @type {string}
		 *
		 * @since 2015.2
		 */

		this.label = undefined;
		/**
		 * The function used in this search column.
		 * @name Column#function
		 * @type {string}
		 * @throws {SuiteScriptError} INVALID_SRCH_FUNCTN Unknown function is set.
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE When assigning unsupported function is attempted
		 *
		 * @since 2015.2
		 */

		this['function'] = undefined;
		/**
		 * The sort direction for this search column. Use values from the Sort enum.
		 * @name Column#sort
		 * @type {string}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE When assigning unsupported direction is attempted
		 * @since 2015.2
		 */

		this.sort = undefined;
		/**
		 * Returns the search column for which the minimal or maximal value should be found when returning the search.Column
		 * value. For example, can be set to find the most recent or earliest date, or the largest or smallest amount for a
		 * record, and then the search.Column value for that record is returned. Can only be used when summary type is MIN
		 * or MAX.
		 * @governance none
		 * @param {Object} options  the options object
		 * @param {string} options.name The name of the search column for which the minimal or maximal value should be found.
		 * @param {string} options.join The join id for the search column.
		 * @return {Column} this search column
		 *
		 * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when name or join parameter is missing
		 *
		 * @since 2015.2
		 */

		this.setWhenOrderedBy = function (options) {};

		/**
		 * Returns the object type name (search.Column)
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
	return new Column();
});
