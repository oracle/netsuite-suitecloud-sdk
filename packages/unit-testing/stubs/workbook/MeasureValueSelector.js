define(['./MeasureSelector', './DescendantOrSelfNodesSelector', './PathSelector', './DimensionSelector', './ChildNodesSelector'], function (
	MeasureSelector,
	DescendantOrSelfNodesSelector,
	PathSelector,
	DimensionSelector,
	ChildNodesSelector
) {
	/**
	 * @class MeasureValueSelector
	 * @classDescription Selector for selecting a measure value using row, column and list of measures to use
	 * @constructor
	 * @protected
	 *
	 * @since 2021.1
	 */
	function MeasureValueSelector() {
		/**
		 * Measure selector
		 * @name MeasureValueSelector#measureSelector
		 * @type {Array<MeasureSelector>}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2021.1
		 */
		this.measureSelector = undefined;
		/**
		 * select row where to apply styling
		 * @name ReportStyle#rowSelector
		 * @type {DescendantOrSelfNodesSelector | PathSelector | DimensionSelector | ChildNodesSelector}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2021.1
		 */
		this.rowSelector = undefined;
		/**
		 * select column where to apply styling
		 * @name ReportStyle#rowSelector
		 * @type {DescendantOrSelfNodesSelector | PathSelector | DimensionSelector | ChildNodesSelector}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2021.1
		 */
		this.columnSelector = undefined;
		/**
		 * Returns the object type name (workbook.MeasureValueSelector)
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
	return new MeasureValueSelector();
});
