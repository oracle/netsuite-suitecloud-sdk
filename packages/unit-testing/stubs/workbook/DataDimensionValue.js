define(['./DataDimension', './DataDimensionItemValue'], function (DataDimension, DataDimensionItemValue) {
	/**
	 * @class DataDimensionValue
	 * @classDescription Value of the data dimension from pivot intersection
	 * @constructor
	 * @protected
	 *
	 * @since 2021.2
	 */
	function DataDimensionValue() {
		/**
		 * Data dimension
		 * @name DataDimensionValue#dataDimension
		 * @type {DataDimension}
		 * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
		 *
		 * @since 2021.2
		 */
		this.dataDimension = undefined;
		/**
		 * Item values
		 * @name DataDimensionValue#itemValues
		 * @type {Array<DataDimensionItemValue>}
		 * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
		 *
		 * @since 2021.2
		 */
		this.itemValues = undefined;
		/**
		 * Returns the object type name (workbook.DataDimensionValue)
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
	return new DataDimensionValue();
});
