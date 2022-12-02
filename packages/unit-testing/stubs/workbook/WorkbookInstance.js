define(['./Pivot', './Chart', './Table', './PivotIntersection'], function (Pivot, Chart, Table, PivotIntersection) {
	/**
	 * @class Workbook
	 * @classDescription Object representing SuiteAnalytics workbook
	 * @constructor
	 * @protected
	 *
	 * @since 2020.2
	 */
	function Workbook() {
		/**
		 * name of the workbook
		 * @name Workbook#name
		 * @type {string}
		 * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
		 *
		 * @since 2020.2
		 */
		this.name = undefined;
		/**
		 * description of the workbook
		 * @name Workbook#description
		 * @type {string}
		 * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
		 *
		 * @since 2020.2
		 */
		this.description = undefined;
		/**
		 * Workbook's pivots
		 * @name Workbook#pivots
		 * @type {Array<Pivot>}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.pivots = undefined;
		/**
		 * Workbook's charts
		 * @name Workbook#charts
		 * @type {Array<Chart>}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.charts = undefined;
		/**
		 * Workbook's tables
		 * @name Workbook#tables
		 * @type {Array<Table>}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.tables = undefined;
		/**
		 * id of the workbook
		 * @name Workbook#id
		 * @type {string}
		 * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
		 *
		 * @since 2020.2
		 */
		this.id = undefined;
		/**
		 * Runs pivot and returns array of intersections
		 * @param {Object} options
		 * @param {string} options.id id of the pivot
		 * @governance 10 units for each intersection returned
		 * @return {Array<PivotIntersection>}
		 * @throws {SuiteScriptError} PIVOT_DOES_NOT_EXIST when there is no pivot under supplied id in the workbook
		 *
		 * @since 2021.2
		 */
		this.runPivot = function (options) {};
		this.runPivot.promise = function (options) {};

		/**
		 * Returns the object type name (workbook.Workbook)
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
	return new Workbook();
});
