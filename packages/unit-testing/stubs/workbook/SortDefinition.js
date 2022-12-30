define([
	'./SortByDataDimensionItem',
	'./SortByMeasure',
	'./DescendantOrSelfNodesSelector',
	'./PathSelector',
	'./DimensionSelector',
	'./ChildNodesSelector',
], function (SortByDataDimensionItem, SortByMeasure, DescendantOrSelfNodesSelector, PathSelector, DimensionSelector, ChildNodesSelector) {
	/**
	 * @class SortDefinition
	 * @classDescription Object used for defining a sort in a pivot or chart
	 * @constructor
	 * @protected
	 *
	 * @since 2020.2
	 */
	function SortDefinition() {
		/**
		 * Dimension and measure sorts
		 * @name LimitingFilter#sortBys
		 * @type {Array<SortByDataDimensionItem> | Array<SortByMeasure>}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.sortBys = undefined;
		/**
		 * Selector for this definition
		 * @name SortDefinition#selector
		 * @type {DescendantOrSelfNodesSelector | PathSelector | DimensionSelector | ChildNodesSelector}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.selector = undefined;
		/**
		 * Returns the object type name (workbook.SortDefinition)
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
	return new SortDefinition();
});
