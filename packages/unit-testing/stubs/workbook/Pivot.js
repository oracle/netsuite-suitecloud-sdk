define(['../dataset/DatasetInstance', '../datasetLink/DatasetLinkInstance', './Expression', './LimitingFilter', './ConditionalFilter', './PivotAxis', './ReportStyle'], function (
	Dataset,
	DatasetLink,
	Expression,
	LimitingFilter,
	ConditionalFilter,
	PivotAxis,
	ReportStyle
) {
	/**
	 * @class Pivot
	 * @classDescription Object representing SuiteAnalytics pivot
	 * @constructor
	 * @protected
	 *
	 * @since 2020.2
	 */
	function Pivot() {
		/**
		 * Filter expressions
		 * @name Pivot#filterExpressions
		 * @type {Array<Expression>}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.filterExpressions = undefined;
		/**
		 * Limiting and conditional filters
		 * @name Pivot#aggregationFilters
		 * @type {Array<LimitingFilter> | Array<ConditionalFilter>}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.aggregationFilters = undefined;
		/**
		 * name of the pivot
		 * @name Pivot#name
		 * @type {string | Expression}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.name = undefined;
		/**
		 * portlet name of the pivot
		 * @name Pivot#portletName
		 * @type {string | Expression}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2021.2
		 */
		this.portletName = undefined;
		/**
		 * id of the pivot
		 * @name Pivot#id
		 * @type {string}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.id = undefined;
		/**
		 * Column axis of this pivot
		 * @name Pivot#columnAxis
		 * @type {PivotAxis}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.columnAxis = undefined;
		/**
		 * Row axis of this pivot
		 * @name Pivot#rowAxis
		 * @type {PivotAxis}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.rowAxis = undefined;
		/**
		 * Underlying dataset
		 * @name Pivot#dataset
		 * @type {Dataset}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.dataset = undefined;
		/**
		 * Underlying datasetLink
		 * @name Pivot#datasetLink
		 * @type {DatasetLink}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.datasetLink = undefined;
		/**
		 * Report styles
		 * @name Pivot#reportStyles
		 * @type {Array<ReportStyle>}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2021.1
		 */
		this.reportStyles = undefined;
		/**
		 * Returns the object type name (workbook.Pivot)
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
	return new Pivot();
});
