define([], function () {
	/**
	 * @class FontSize
	 * @classDescription Font size defined by units
	 * @constructor
	 * @protected
	 *
	 * @since 2021.1
	 */
	function FontSize() {
		/**
		 * Size
		 * @name FontSize#size
		 * @type {number}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2021.1
		 */
		this.size = undefined;
		/**
		 * Units of the font size
		 * @name FontSize#unit
		 * @type {string}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 * @throws {SuiteScriptError} INVALID_UNIT when assigned value is outside of Unit enum
		 *
		 * @since 2021.1
		 */
		this.unit = undefined;
		/**
		 * Returns the object type name (workbook.PositionUnits)
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
	return new FontSize();
});
