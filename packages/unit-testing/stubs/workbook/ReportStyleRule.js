define(['./Expression', './Style'], function (Expression, Style) {
	/**
	 * @class ReportStyleRule
	 * @classDescription A rule for a report style
	 * @constructor
	 * @protected
	 *
	 * @since 2021.1
	 */
	function ReportStyleRule() {
		/**
		 * A Boolean expression indicating whether the style should be applied.
		 * @name ReportStyleRule#expression
		 * @type {Expression}
		 */
		this.expression = undefined;
		/**
		 * The style to be applied.
		 * @name ReportStyleRule#style
		 * @type {Style}
		 *
		 * @since 2021.1
		 */
		this.style = undefined;
		/**
		 * Returns the object type name (workbook.ReportStyleRule)
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
	return new ReportStyleRule();
});
