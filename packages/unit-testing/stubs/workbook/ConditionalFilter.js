define(['./DataMeasure', './DimensionSelector', './CalculatedMeasure', './ChildNodesSelector', './DescendantOrSelfNodesSelector', './Expression', './PathSelector'], function (
	DataMeasure,
	DimensionSelector,
	CalculatedMeasure,
	ChildNodesSelector,
	DescendantOrSelfNodesSelector,
	Expression,
	PathSelector
) {
	/**
	 * @class ConditionalFilter
	 * @classDescription Object for pivot filtering based on a measure
	 * @constructor
	 * @protected
	 *
	 * @since 2020.2
	 */
	function ConditionalFilter() {
		/**
		 * Indicator, whether filtering is appliad on rows (on columns if set to false)
		 * @name ConditionalFilter#row
		 * @type {boolean}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.row = undefined;
		/**
		 * Measure for this filter
		 * @name ConditionalFilter#measure
		 * @type {DataMeasure | CalculatedMeasure}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.measure = undefined;
		/**
		 * Row selector
		 * @name ConditionalFilter#rowSelector
		 * @type {DescendantOrSelfNodesSelector | PathSelector | DimensionSelector | ChildNodesSelector}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.rowSelector = undefined;
		/**
		 * Column selector
		 * @name ConditionalFilter#columnSelector
		 * @type {DescendantOrSelfNodesSelector | PathSelector | DimensionSelector | ChildNodesSelector}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.columnSelector = undefined;
		/**
		 * The actual predicate which sayes whether the condition is met
		 * @name ConditionalFilter#predicate
		 * @type {Expression}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.predicate = undefined;
		/**
		 * Returns the object type name (dataset.Dataset)
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
	return new ConditionalFilter();
});
