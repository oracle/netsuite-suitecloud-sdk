define([
	'./Sort',
	'./DataMeasure',
	'./CalculatedMeasure',
	'./DescendantOrSelfNodesSelector',
	'./PathSelector',
	'./DimensionSelector',
	'./ChildNodesSelector',
], function (Sort, DataMeasure, CalculatedMeasure, DescendantOrSelfNodesSelector, PathSelector, DimensionSelector, ChildNodesSelector) {
	/**
	 * @class SortByMeasure
	 * @classDescription Sort by option for measures
	 * @constructor
	 * @protected
	 *
	 * @since 2020.2
	 */
	function SortByMeasure() {
		/**
		 * Sort object for this sort
		 * @name SortByMeasure#sort
		 * @type {Sort}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.sort = undefined;
		/**
		 * This sort's measure
		 * @name SortByMeasure#parameters
		 * @type {DataMeasure | CalculatedMeasure}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 */
		this.measure = undefined;
		/**
		 * In a sort definition, the sort is applied to a row or column, this is the selector for the other axis
		 * @name SortByMeasure#otherAxisSelector
		 * @type {DescendantOrSelfNodesSelector | PathSelector | DimensionSelector | ChildNodesSelector}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.otherAxisSelector = undefined;
		/**
		 * Returns the object type name (workbook.SortByMeasure)
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
	return new SortByMeasure();
});
