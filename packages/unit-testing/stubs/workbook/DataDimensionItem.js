define(['./Expression',], function (Expression) {
	/**
	 * @class DataDimensionItem
	 * @classDescription Object representing data dimension item of a data dimension
	 * @constructor
	 * @protected
	 *
	 * @since 2020.2
	 */
	function DataDimensionItem() {
		/**
		 * Label
		 * @name DataDimensionItem#label
		 * @type {string | Expression}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.label = undefined;
		/**
		 * Expression for data dimension item
		 * @name DataDimensionItem#expression
		 * @type {Expression}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.expression = undefined;
		/**
		 * Returns the object type name (workbook.DataDimensionItem)
		 * @governance none
		 * @return {string}
		 *
		 * @since 2020.2
		 */
		this.toString = function () { };

		/**
		 * get JSON format of the object
		 * @governance none
		 * @return {Object}
		 *
		 * @since 2020.2
		 */
		this.toJSON = function () { };
	}
	return new DataDimensionItem();
});
