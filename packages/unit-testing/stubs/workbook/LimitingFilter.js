define([
	'./SortByDataDimensionItem',
	'./SortByMeasure',
	'./DescendantOrSelfNodesSelector',
	'./PathSelector',
	'./DimensionSelector',
	'./ChildNodesSelector',
], function (SortByDataDimensionItem, SortByMeasure, DescendantOrSelfNodesSelector, PathSelector, DimensionSelector, ChildNodesSelector) {
	/**
	 * @class LimitingFilter
	 * @classDescription Object representing limiting aggregation filter
	 * @constructor
	 * @protected
	 *
	 * @since 2020.2
	 */
	function LimitingFilter() {
		/**
		 * Row axis indicator
		 * @name LimitingFilter#row
		 * @type {boolean}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.row = undefined;
		/**
		 * Sort by elements of this filter
		 * @name LimitingFilter#sortBys
		 * @type {Array<SortByDataDimensionItem> | Array<SortByMeasure>}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.sortBys = undefined;
		/**
		 * What to filter
		 * @name LimitingFilter#filteredNodesSelector
		 * @type {DescendantOrSelfNodesSelector | PathSelector | DimensionSelector | ChildNodesSelector}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.filteredNodesSelector = undefined;
		/**
		 * Limit number for this filter
		 * @name LimitingFilter#limit
		 * @type {number}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.limit = undefined;
		/**
		 * Returns the object type name (workbook.LimitingFilter)
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
	return new LimitingFilter();
});
