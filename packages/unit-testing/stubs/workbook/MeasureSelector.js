define(['./CalculatedMeasure', './DataMeasure'], function (CalculatedMeasure, DataMeasure) {
	/**
	 * @class MeasureSelector
	 * @classDescription Selector for measures to be used in conditional formatting of pivot
	 * @constructor
	 * @protected
	 *
	 * @since 2021.1
	 */
	function MeasureSelector() {
		/**
		 * Measures of this selector
		 * @name MeasureSelector#measures
		 * @type {Array<CalculatedMeasure> | Array<DataMeasure>}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the array is empty
		 *
		 * @since 2021.1
		 */
		this.measures = undefined;
		/**
		 * Returns the object type name (workbook.MeasureSelector)
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
	return new MeasureSelector();
});
