define(['./TableColumnFilter'], function (TableColumnFilter) {
	/**
	 * @class TableColumnCondition
	 * @classDescription Condition for a table view column
	 * @constructor
	 * @protected
	 *
	 * @since 2020.2
	 */
	function TableColumnCondition() {
		/**
		 * filters for this condition
		 * @name TableColumnCondition#filters
		 * @type {Array<TableColumnFilter>}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.filters = undefined;
		/**
		 * operator of this filter
		 * @name TableColumnCondition#operator
		 * @type {string}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 * @throws {SuiteScriptError} INVALID OPERATOR when the value is neither AND nor OR
		 *
		 * @since 2020.2
		 */
		this.operator = undefined;
		/**
		 * Returns the object type name (workbook.TableColumnCondition)
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
		 * @since 2021.1
		 */
		this.toJSON = function () {};
	}
	return new TableColumnCondition();
});
