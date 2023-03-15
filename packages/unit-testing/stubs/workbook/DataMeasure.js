define(['./Expression',], function (Expression) {
	/**
	 * @class DataMeasure
	 * @classDescription Object representing data measure to be used in pivot or chart
	 * @constructor
	 * @protected
	 *
	 * @since 2020.2
	 */
	function DataMeasure() {
		/**
		 * desired aggregation of the measure
		 * @name DataMeasure#aggregation
		 * @type {string}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 * @throws {SuiteScriptError} INVALID_AGGREGATION when the the value is outside of Aggregation enum
		 * @throws {SuiteScriptError} EXPRESSIONS_MUST_BE_SPECIFIED_WHEN_USING_COUNT_DISTINCT_AGGREGATION when trying to assign count distinct aggregation while expressions are not specified
		 * @throws {SuiteScriptError} EXPRESSION_MUST_BE_SPECIFIED_WHEN_USING_OTHER_THAN_COUNT_DISTINCT_AGGREGATION when trying to assign other that count distinct aggregation while expression is not specified
		 *
		 * @since 2020.2
		 */
		this.aggregation = undefined;
		/**
		 * expression for this measure, used if this is a single expression measure (cannot be used when doing COUNT_DISTINCT aggregation)
		 * @name DataMeasure#expression
		 * @type {Expression}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 * @throws {SuiteScriptError} MUTUALLY_EXCLUSIVE_ARGUMENTS when expressions are already defined
		 * @throws {SuiteScriptError} EXPRESSION_CANNOT_BE_SPECIFIED_WHEN_USING_COUNT_DISTINCT_AGGREGATION when count distinct aggregation is used
		 *
		 * @since 2020.2
		 */
		this.expression = undefined;
		/**
		 * expressions for this measure, used if this is a multi expression measure (needed when COUNT_DISTINCT aggregation is used)
		 * @name DataMeasure#expressions
		 * @type {Array<Expression>}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 * @throws {SuiteScriptError} MUTUALLY_EXCLUSIVE_ARGUMENTS expression is already defined
		 * @throws {SuiteScriptError} AT_LEAST_ONE_EXPRESSION_IS_NEEDED supplied expressions array is empty
		 * @throws {SuiteScriptError} EXPRESSIONS_CANNOT_BE_SPECIFIED_WHEN_USING_OTHER_THAN_COUNT_DISTINCT_AGGREGATION when other than count distinct aggregation is used
		 *
		 * @since 2020.2
		 */
		this.expressions = undefined;
		/**
		 * label of the measure
		 * @name DataMeasure#label
		 * @type {string | Expression}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.label = undefined;
		/**
		 * Returns the object type name (workbook.DataMeasure)
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
	return new DataMeasure();
});
