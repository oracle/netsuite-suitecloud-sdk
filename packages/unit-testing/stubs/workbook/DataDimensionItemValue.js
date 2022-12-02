define(['./DataDimension', './Record', './Currency', './Range'], function (DataDimension, Record, Currency, Range) {
	/**
	 * @class DataDimensionItemValue
	 * @classDescription Class holding reference to the dimension item and its value
	 * @constructor
	 * @protected
	 *
	 * @since 2021.2
	 */
	function DataDimensionItemValue() {
		/**
		 * Data dimension item
		 * @name DataDimensionItemValue#dataDimensionItem
		 * @type {DataDimension}
		 * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
		 *
		 * @since 2021.2
		 */
		this.item = undefined;
		/**
		 * Value of the data dimension item
		 * @name DataDimensionItemValue#value
		 * @type {string|number|boolean|Record|Currency|Range}
		 * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
		 *
		 * @since 2021.2
		 */
		this.value = undefined;
		/**
		 * Returns the object type name (workbook.DataDimensionItemValue)
		 * @governance none
		 * @return {string}
		 *
		 * @since 2021.2
		 */
		this.toString = function () {};

		/**
		 * get JSON format of the object
		 * @governance none
		 * @return {Object}
		 *
		 * @since 2021.2
		 */
		this.toJSON = function () {};
	}
	return new DataDimensionItemValue();
});
