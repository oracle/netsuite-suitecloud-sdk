define(['./Aspect'], function (Aspect) {
	/**
	 * @class Series
	 * @classDescription Series of a chart
	 * @constructor
	 * @protected
	 *
	 * @since 2020.2
	 */
	function Series() {
		/**
		 * Aspects for this series
		 * @name Series#aspects
		 * @type {Array<Aspect>}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 * @throws {SuiteScriptError} NO_ASPECTS_DEFINED when the array is empty
		 *
		 * @since 2020.2
		 */
		this.aspects = undefined;
		/**
		 * Returns the object type name (workbook.Series)
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
	return new Series();
});
