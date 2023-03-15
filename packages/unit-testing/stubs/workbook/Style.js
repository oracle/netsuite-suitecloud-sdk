define(['./Color', './FontSize', './PositionUnits', './PositionValues', './PositionPercent'], function (
	Color,
	FontSize,
	PositionUnits,
	PositionValues,
	PositionPercent
) {
	/**
	 * @class Style
	 * @classDescription Style to be used in conditional filter
	 * @constructor
	 * @protected
	 *
	 * @since 2021.1
	 */
	function Style() {
		/**
		 * Background image
		 * @name Style#backgroundImage
		 * @type {string}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 * @throws {SuiteScriptError} INVALID_IMAGE when assigned value is outside of Image enum
		 *
		 * @since 2021.1
		 */
		this.backgroundImage = undefined;
		/**
		 * Background color
		 * @name Style#backgroundColor
		 * @type {Color | string}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 * @throws {SuiteScriptError} UNSUPPORTED_COLOR when a string value outside of Color enum is used to set the value
		 *
		 * @since 2021.1
		 */
		this.backgroundColor = undefined;
		/**
		 * Background position
		 * @name Style#backgroundPosition
		 * @type {PositionUnits | PositionValues | PositionPercent}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2021.1
		 */
		this.backgroundPosition = undefined;
		/**
		 * Font size
		 * @name Style#fontSize
		 * @type {string | FontSize}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 * @throws {SuiteScriptError} INVALID_FONT_SIZE when assigned value is outside of FontSize enum
		 *
		 * @since 2021.1
		 */
		this.fontSize = undefined;
		/**
		 * Font style
		 * @name Style#fontStyle
		 * @type {string}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 * @throws {SuiteScriptError} INVALID_FONT_STYLE when assigned value is outside of FontStyle enum
		 *
		 * @since 2021.1
		 */
		this.fontStyle = undefined;
		/**
		 * Font weight
		 * @name Style#fontWeight
		 * @type {string}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 * @throws {SuiteScriptError} INVALID_FONT_WEIGHT when assigned value is outside of FontWeight enum
		 *
		 * @since 2021.1
		 */
		this.fontWeight = undefined;
		/**
		 * Text align
		 * @name Style#textAlign
		 * @type {string}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 * @throws {SuiteScriptError} INVALID_TEXT_ALIGN when assigned value is outside of TextAlign enum
		 *
		 * @since 2021.1
		 */
		this.textAlign = undefined;
		/**
		 * Color
		 * @name Style#color
		 * @type {Color | string}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 * @throws {SuiteScriptError} UNSUPPORTED_COLOR when a string value outside of Color enum is used to set the value
		 *
		 * @since 2021.1
		 */
		this.color = undefined;
		/**
		 * Text decoration color
		 * @name Style#textDecorationColor
		 * @type {Color | string}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 * @throws {SuiteScriptError} UNSUPPORTED_COLOR when a string value outside of Color enum is used to set the value
		 *
		 * @since 2021.1
		 */
		this.textDecorationColor = undefined;
		/**
		 * Text decoration line
		 * @name Style#textDecorationLine
		 * @type {string}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 * @throws {SuiteScriptError} INVALID_TEXT_DECORATION_LINE when assigned value is outside of TextDecorationLine enum
		 *
		 * @since 2021.1
		 */
		this.textDecorationLine = undefined;
		/**
		 * Text decoration style
		 * @name Style#textDecorationStyle
		 * @type {string}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 * @throws {SuiteScriptError} INVALID_TEXT_DECORATION_STYLE when assigned value is outside of TextDecorationStyle enum
		 *
		 * @since 2021.1
		 */
		this.textDecorationStyle = undefined;
		/**
		 * Returns the object type name (workbook.Style)
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
	return new Style();
});
