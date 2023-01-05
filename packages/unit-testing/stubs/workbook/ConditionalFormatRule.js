define(['./TableColumnFilter', './Style'], function (TableColumnFilter, Style) {
	/**
	 * @class ConditionalFormatRule
	 * @classDescription Conditional format rule object for styling resulting cells of a table column
	 * @constructor
	 * @protected
	 *
	 * @since 2021.1
	 */
	function ConditionalFormatRule() {
		/**
		 * filter determining which rows/cells to apply the style to
		 * @name ConditionalFormatRule#filter
		 * @type {TableColumnFilter}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2021.1
		 */
		this.filter = undefined;
		/**
		 * style for particular row/cell
		 * @name ConditionalFormatRule#style
		 * @type {Style}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2021.1
		 */
		this.style = undefined;
		/**
		 * Returns the object type name (workbook.ConditionalFormatRule)
		 * @governance none
		 * @return {string}
		 *
		 * @since 2021.1
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
	return new ConditionalFormatRule();
});
