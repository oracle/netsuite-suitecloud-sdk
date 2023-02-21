define(['../dataset/DatasetInstance', './Expression', './TableColumn'], function (Dataset, Expression, TableColumn) {
	/**
	 * @class Table
	 * @classDescription Object representing SuiteAnalytics table
	 * @constructor
	 * @protected
	 *
	 * @since 2020.2
	 */
	function Table() {
		/**
		 * Dataset used in table view
		 * @name Table#dataset
		 * @type {Dataset}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.dataset = undefined;
		/**
		 * name of the table view
		 * @name Table#name
		 * @type {string | Expression}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.name = undefined;
		/**
		 * portlet name of the table view
		 * @name Table#portletName
		 * @type {string | Expression}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2021.2
		 */
		this.portletName = undefined;
		/**
		 * id of the table view
		 * @name Table#id
		 * @type {string}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.id = undefined;
		/**
		 * Columns used in table view
		 * @name Table#columns
		 * @type {Array<TableColumn>}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.columns = undefined;
	}
	return new Table();
});
