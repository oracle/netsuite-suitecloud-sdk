define([], function () {
	/**
	 * @class TableColumnFilter
	 * @classDescription Filter for a table view column
	 * @constructor
	 * @protected
	 *
	 * @since 2020.2
	 */
	function TableColumnFilter() {
		/**
		 * values for this filter
		 * @name TableColumnFilter#values
		 * @type {Array<boolean> | Array<number> | Array<string> | Array<Date> | Array<Object>}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.values = undefined;
		/**
		 * operator of this filter
		 * @name TableColumnFilter#operator
		 * @type {string}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 * @throws {SuiteScriptError} INVALID OPERATOR when the value is outside of query.Operator enum
		 *
		 * @since 2020.2
		 */
		this.operator = undefined;
		/**
		 * Returns the object type name (workbook.TableColumnFilter)
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
	return new TableColumnFilter();
});
