define(['./MeasureValueSelector', './DataMeasure', './CalculatedMeasure', './ReportStyleRule'], function (
	MeasureValueSelector,
	DataMeasure,
	CalculatedMeasure,
	ReportStyleRule
) {
	/**
	 * @class ReportStyle
	 * @classDescription Conditional formatting object for reports
	 * @constructor
	 * @protected
	 *
	 * @since 2021.1
	 */
	function ReportStyle() {
		/**
		 * Selectors
		 * @name ReportStyle#selectors
		 * @type {Array<MeasureValueSelector>}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 * @throws {SuiteScriptError} NO_SELECTORS_DEFINED when the array is empty
		 *
		 * @since 2021.1
		 */
		this.selectors = undefined;
		/**
		 * measure of this report style
		 * @name ReportStyle#measure
		 * @type {DataMeasure | CalculatedMeasure}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2021.1
		 */
		this.measure = undefined;
		/**
		 * Formatting rules for this report style
		 * @name ReportStyle#rules
		 * @type {Array<ReportStyleRule>}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 * @throws {SuiteScriptError} NO_RULE_DEFINED when the array is empty
		 *
		 * @since 2021.1
		 */
		this.rules = undefined;
		/**
		 * Returns the object type name (workbook.ReportStyle)
		 * @governance none
		 * @return {string}
		 *
		 * @since 2021.1
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
	return new ReportStyle();
});
