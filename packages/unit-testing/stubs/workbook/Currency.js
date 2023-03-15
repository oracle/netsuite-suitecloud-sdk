define([], function () {
	/**
	 * @class Currency
	 * @classDescription Simple container for currency id and amount
	 * @constructor
	 * @protected
	 *
	 * @since 2021.2
	 */
	function Currency() {
		/**
		 * id of the currency (USD|EUR|GBP ...)
		 * @name Currency#id
		 * @type {string}
		 * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
		 *
		 * @since 2021.2
		 */
		this.id = undefined;
		/**
		 * amount of the currency
		 * @name Currency#amount
		 * @type {number}
		 * @throws {SuiteScriptError} READ_ONLY_PROPERTY when setting the property is attempted
		 *
		 * @since 2021.2
		 */
		this.amount = undefined;
		/**
		 * Returns the object type name (workbook.Currency)
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
	return new Currency();
});
