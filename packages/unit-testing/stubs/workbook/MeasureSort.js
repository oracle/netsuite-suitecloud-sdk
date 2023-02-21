define(['./DimensionSelector', './PathSelector', './Sort'], function (DimensionSelector, PathSelector, Sort) {
	/**
	 * @class MeasureSort
	 * @classDescription A measure sort. A measure sort can be used when you create a limiting filter or a sort definition.
	 * You can create a measure sort using workbook.createMeasureSort(options).
	 * @constructor
	 * @protected
	 *
	 * @since 2021.2
	 */
	function MeasureSort() {
		/**
		 * Measure
		 * @name MeasureSort #measure
		 * @type {MeasureSort}
		 * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
		 *
		 * @since 2021.2
		 */
		this.measure = undefined;
		/**
		 * Value of the measure
		 * @name MeasureSort #otherAxisSelector
		 * @type {DimensionSelector|PathSelector}
		 * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
		 *
		 * @since 2021.2
		 */
		this.otherAxisSelector = undefined;
		/**
		 * Value of the measure
		 * @name MeasureSort #sort
		 * @type {Sort}
		 * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
		 *
		 * @since 2021.2
		 */
		this.sort = undefined;
		/**
		 * Returns the object type name (workbook.MeasureSort )
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
	return new MeasureSort();
});
