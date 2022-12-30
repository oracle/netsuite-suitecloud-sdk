define(['./Sort', './DataDimensionItem'], function (Sort, DataDimensionItem) {
	/**
	 * @class SortByDataDimensionItem
	 * @classDescription Sort by option for data dimension items
	 * @constructor
	 * @protected
	 *
	 * @since 2020.2
	 */
	function SortByDataDimensionItem() {
		/**
		 * Sort object for this dimension sort
		 * @name SortByDataDimensionItem#sort
		 * @type {Sort}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.sort = undefined;
		/**
		 * Data dimension item
		 * @name SortByDataDimensionItem#item
		 * @type {DataDimensionItem}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.item = undefined;
		/**
		 * Returns the object type name (workbook.SortByDataDimensionItem)
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
	return new SortByDataDimensionItem();
});
