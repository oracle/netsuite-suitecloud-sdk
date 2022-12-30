define([], function () {
	/**
	 * @class Color
	 * @classDescription Color for row/cell background
	 * @constructor
	 * @protected
	 *
	 * @since 2021.1
	 */
	function Color() {
		/**
		 * red portion of the color
		 * @name Color#red
		 * @type {number}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 * @throws {SuiteScriptError} INVALID_COLOR_VALUE when the value is not between 0 and 255
		 *
		 * @since 2021.1
		 */
		this.red = undefined;
		/**
		 * green portion of the color
		 * @name Color#green
		 * @type {number}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 * @throws {SuiteScriptError} INVALID_COLOR_VALUE when the value is not between 0 and 255
		 *
		 * @since 2021.1
		 */
		this.green = undefined;
		/**
		 * blue portion of the color
		 * @name Color#blue
		 * @type {number}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 * @throws {SuiteScriptError} INVALID_COLOR_VALUE when the value is not between 0 and 255
		 *
		 * @since 2021.1
		 */
		this.blue = undefined;
		/**
		 * opacity - transparency of the color
		 * @name Color#alpha
		 * @type {number}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 * @throws {SuiteScriptError} INVALID_ALPHA_VALUE when the value is not between 0 and 255
		 *
		 * @since 2021.1
		 */
		this.alpha = undefined;
		/**
		 * Returns the object type name (workbook.Color)
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
	return new Color();
});
