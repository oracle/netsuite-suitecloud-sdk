define(['./DataDimensionValue', './SectionValue', './MeasureValue'], function (DimensionValue, SectionValue, MeasureValue) {
	/**
	 * @class PivotIntersection
	 * @classDescription Intersection of row and column holding measure values
	 * @constructor
	 * @protected
	 *
	 * @since 2021.2
	 */
	function PivotIntersection() {
		/**
		 * Row dimension value
		 * @name PivotIntersection#row
		 * @type {DataDimensionValue | SectionValue}
		 * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
		 *
		 * @since 2021.2
		 */
		this.row = undefined;
		/**
		 * Column dimension values
		 * @name PivotIntersection#column
		 * @type {DataDimensionValue | SectionValue}
		 * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
		 *
		 * @since 2021.2
		 */
		this.column = undefined;
		/**
		 * Measure values in the intersection
		 * @name PivotIntersection#measureValues
		 * @type {Array<MeasureValue>}
		 * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
		 *
		 * @since 2021.2
		 */
		this.measureValues = undefined;
		/**
		 * Returns the object type name (workbook.PivotIntersection)
		 * @governance none
		 * @return {string}
		 *
		 * @since 2021.2
		 */
		this.toString = function () {};

		/**
		 * get JSON format of the object
		 * @governance none
		 * @return {Object}
		 *
		 * @since 2021.2
		 */
		this.toJSON = function () {};
	}
	return new PivotIntersection();
});
