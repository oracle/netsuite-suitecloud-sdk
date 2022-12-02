define(['./DataMeasure', './DataDimensionItem', './CalculatedMeasure'], function (DataMeasure, DataDimensionItem, CalculatedMeasure) {
	/**
	 * @class DataDimension
	 * @classDescription Object representing data dimension in a pivot
	 * @constructor
	 * @protected
	 *
	 * @since 2020.2
	 */
	function DataDimension() {
		/**
		 * Value of total line - HIDDEN/FIRST_LINE/LAST_LINE
		 * @name DataDimension#totalLine
		 * @type {string}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 * @throws {SuiteScriptError} INVALID_TOTAL_LINE when the value is outside of TotalLine enum
		 *
		 * @since 2020.2
		 */
		this.totalLine = undefined;
		/**
		 * Children of this data dimension
		 * @name DataDimension#children
		 * @type {Array<Section> | Array<DataDimension> | Array<DataMeasure> | Array<CalculatedMeasure>}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.children = undefined;
		/**
		 * items of this data dimension
		 * @name DataDimension#items
		 * @type {Array<DataDimensionItem>}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.items = undefined;
		/**
		 * Returns the object type name (workbook.DataDimension)
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
	return new DataDimension();
});
