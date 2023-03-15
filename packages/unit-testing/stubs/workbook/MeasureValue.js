define(['./Range', './Record', './Currency'], function (Range, Record, Currency) {
	/**
	 * @class MeasureValue
	 * @classDescription Value of the measure from pivot intersection
	 * @constructor
	 * @protected
	 *
	 * @since 2021.2
	 */
	function MeasureValue() {
		/**
		 * Measure
		 * @name MeasureValue#measure
		 * @type {MeasureValue}
		 * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
		 *
		 * @since 2021.2
		 */
		this.measure = undefined;
		/**
		 * Value of the measure
		 * @name MeasureValue#value
		 * @type {string|number|boolean|Range|Record|Currency}
		 * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
		 *
		 * @since 2021.2
		 */
		this.value = undefined;
		/**
		 * Returns the object type name (workbook.MeasureValue)
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
	return new MeasureValue();
});
