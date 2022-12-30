define(['../dataset/DatasetInstance', '../datasetLink/DatasetLinkInstance', './LimitingFilter', './ConditionalFilter', './Expression', './Legend', './Category', './Series'], function (
	Dataset,
	DatasetLink,
	LimitingFilter,
	ConditionalFilter,
	Expression,
	Legend,
	Category,
	Series
) {
	/**
	 * @class Chart
	 * @classDescription Object representing a chart of a workbook
	 * @constructor
	 * @protected
	 *
	 * @since 2020.2
	 */
	function Chart() {
		/**
		 * name of the chart
		 * @name Chart#name
		 * @type {string | Expression}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.name = undefined;
		/**
		 * portlet name of the chart
		 * @name Chart#portletName
		 * @type {string | Expression}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2021.2
		 */
		this.portletName = undefined;
		/**
		 * title of the chart
		 * @name Chart#title
		 * @type {string | Expression}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.title = undefined;
		/**
		 * Subtitle of the chart
		 * @name Chart#subTitle
		 * @type {string | Expression}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.subTitle = undefined;
		/**
		 * id of the chart
		 * @name Chart#id
		 * @type {string}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.id = undefined;
		/**
		 * stacking settings
		 * @name Chart#stacking
		 * @type {string}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 * @throws {SuiteScriptError} INVALID_STACKING_TYPE when assigned value is outside of Stacking enum
		 *
		 * @since 2020.2
		 */
		this.stacking = undefined;
		/**
		 * Filter expressions
		 * @name Chart#filterExpressions
		 * @type {Array<Expression>}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.filterExpressions = undefined;
		/**
		 * Limiting and conditional filters
		 * @name Chart#aggregationFilters
		 * @type {Array<LimitingFilter> | Array<ConditionalFilter>}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.aggregationFilters = undefined;
		/**
		 * Legend of the chart
		 * @name Chart#legend
		 * @type {Legend}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 * @since 2020.2
		 */
		this.legend = undefined;
		/**
		 * Category of the chart
		 * @name Chart#category
		 * @type {Category}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 * @since 2020.2
		 */
		this.category = undefined;
		/**
		 * Series of the chart
		 * @name Chart#series
		 * @type {Series}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 * @since 2020.2
		 */
		this.series = undefined;
		/**
		 * Type of the chart
		 * @name Chart#type
		 * @type {string}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 * @throws {SuiteScriptError} INVALID_CHART_TYPE when value outside of ChartType enum is used for type parameter
		 *
		 * @since 2020.2
		 */
		this.type = undefined;
		/**
		 * Underlying dataset
		 * @name Chart#dataset
		 * @type {Dataset}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.dataset = undefined;
		/**
		 * Underlying datasetLink
		 * @name Chart#datasetLink
		 * @type {DatasetLink}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.datasetLink = undefined;
		/**
		 * Returns the object type name (workbook.Chart)
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
	return new Chart();
});
