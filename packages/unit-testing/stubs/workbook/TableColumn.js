define(['./ConditionalFormat', './Expression', './FieldContext', './TableColumnCondition'], function (ConditionalFormat, Expression, FieldContext, TableColumnCondition) {
	/**
	 * @class TableColumn
	 * @classDescription Column of a table view
	 * @constructor
	 * @protected
	 *
	 * @since 2020.2
	 */
	function TableColumn() {
		/**
		 * condition for the column
		 * @name TableColumn#condition
		 * @type {TableColumnCondition}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2021.1
		 */
		this.condition = undefined;
		/**
		 * conditional formats for the column
		 * @name TableColumn#conditionalFormats
		 * @type {Array<ConditionalFormat>}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.conditionalFormats = undefined;
		/**
		 * Context specification for the field used in this column
		 * @name TableColumn#fieldContext
		 * @type {FieldContext}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.fieldContext = undefined;
		/**
		 * Alias of dataset column from which was this column created
		 * @name TableColumn#datasetColumnAlias
		 * @type {number}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 * @throws {SuiteScriptError} MUTUALLY_EXCLUSIVE_ARGUMENTS datasetColumnId is already defined
		 *
		 * @since 2020.2
		 */
		this.datasetColumnAlias = undefined;
		/**
		 * desired width of the column in UI
		 * @name TableColumn#width
		 * @type {number}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 */
		this.width = undefined;
		/**
		 * label of the column
		 * @name TableColumn#label
		 * @type {string | Expression}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.label = undefined;
		/**
		 * Returns the object type name (workbook.TableColumn)
		 * @governance none
		 * @return {string}
		 *
		 * @since 2020.2
		 */
		this.toString = function () { };

		/**
		 * get JSON format of the object
		 * @governance none
		 * @return {Object}
		 *
		 * @since 2020.2
		 */
		this.toJSON = function () { };
	}
	return new TableColumn();
});
