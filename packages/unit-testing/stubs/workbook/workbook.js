define([
	'./Aspect',
	'./CalculatedMeasure',
	'./Category',
	'./Chart',
	'./ChartAxis',
	'./ChildNodesSelector',
	'./Color',
	'./ConditionalFilter',
	'./ConditionalFormat',
	'./ConditionalFormatRule',
	'./Currency',
	'./DataDimension',
	'./DataDimensionItem',
	'./DataMeasure',
	'../dataset/DatasetInstance',
	'../datasetLink/DatasetLinkInstance',
	'./DescendantOrSelfNodesSelector',
	'./DimensionSelector',
	'./Duration',
	'./Expression',
	'./FieldContext',
	'./FontSize',
	'./Legend',
	'./LimitingFilter',
	'./MeasureSelector',
	'./MeasureSort',
	'./MeasureValueSelector',
	'./PathSelector',
	'./Pivot',
	'./PivotAxis',
	'./PositionPercent',
	'./PositionUnits',
	'./PositionValues',
	'./Range',
	'./RecordKey',
	'./ReportStyle',
	'./ReportStyleRule',
	'./Section',
	'./Series',
	'./Sort',
	'./SortByDataDimensionItem',
	'./SortByMeasure',
	'./SortDefinition',
	'./Style',
	'./Table',
	'./TableColumn',
	'./TableColumnCondition',
	'./TableColumnFilter',
	'./WorkbookInstance',
], function (
	Aspect,
	CalculatedMeasure,
	Category,
	Chart,
	ChartAxis,
	ChildNodesSelector,
	Color,
	ConditionalFilter,
	ConditionalFormat,
	ConditionalFormatRule,
	Currency,
	DataDimension,
	DataDimensionItem,
	DataMeasure,
	Dataset,
	DatasetLink,
	DescendantOrSelfNodesSelector,
	DimensionSelector,
	Duration,
	FieldContext,
	FontSize,
	Legend,
	LimitingFilter,
	MeasureSelector,
	MeasureSort,
	MeasureValueSelector,
	PathSelector,
	Pivot,
	PivotAxis,
	PositionPercent,
	PositionUnits,
	PositionValues,
	Range,
	RecordKey,
	ReportStyle,
	ReportStyleRule,
	Section,
	Series,
	Sort,
	SortByDataDimensionItem,
	SortByMeasure,
	SortDefinition,
	Style,
	Table,
	TableColumn,
	TableColumnCondition,
	TableColumnFilter,
	Workbook
) {
	/**
	 * SuiteScript workbook module
	 * Create/Load a workbook with possibility to execute Pivots and TableViews
	 *
	 * @module N/workbook
	 * @suiteScriptVersion 2.x
	 */
	var workbook = function () {};

	/**
	 * @enum {string}
	 * @readonly
	 */
	function workbookStacking() {
		this.DISABLED = 'DISABLED';
		this.NORMAL = 'NORMAL';
		this.PERCENT = 'PERCENT';
	}

	workbook.prototype.Stacking = new workbookStacking();

	/**
	 * @enum {string}
	 * @readonly
	 */
	function workbookChartType() {
		this.AREA = 'AREA';
		this.BAR = 'BAR';
		this.LINE = 'LINE';
		this.COLUMN = 'COLUMN';
	}

	workbook.prototype.ChartType = new workbookChartType();

	/**
	 * @enum {string}
	 * @readonly
	 */
	function workbookAspectType() {
		this.VALUE = 'value';
		this.COLOR = 'color';
	}

	workbook.prototype.AspectType = new workbookAspectType();

	/**
	 * @enum {string}
	 * @readonly
	 */
	function workbookTotalLine() {
		this.HIDDEN = 'HIDDEN';
		this.FIRST_LINE = 'FIRST_LINE';
		this.LAST_LINE = 'LAST_LINE';
	}

	workbook.prototype.TotalLine = new workbookTotalLine();

	/**
	 * @enum {string}
	 * @readonly
	 */
	function workbookColor() {
		this.BLACK = 'BLACK';
		this.BLUE = 'BLUE';
		this.BROWN = 'BROWN';
		this.GRAY = 'GRAY';
		this.GREEN = 'GREEN';
		this.ORANGE = 'ORANGE';
		this.PINK = 'PINK';
		this.PURPLE = 'PURPLE';
		this.RED = 'RED';
		this.YELLOW = 'YELLOW';
		this.WHITE = 'WHITE';
	}

	workbook.prototype.Color = new workbookColor();

	/**
	 * @enum {string}
	 * @readonly
	 */
	function workbookExpressionType() {
		this.AND = 'AND';
		this.ANY_OF = 'ANY_OF';
		this.BETWEEN = 'BETWEEN';
		this.CHILD_OF = 'CHILD_OF';
		this.COMPARE = 'COMPARE';
		this.CONSTANT = 'CONSTANT';
		this.CURRENCY_CONVERSION = 'CURRENCY_CONVERSION';
		this.DATE_RANGE_SELECTOR_ID = 'DATE_RANGE_SELECTOR_ID';
		this.DATE_SELECTOR_ID = 'DATE_SELECTOR_ID';
		this.DATE_TIME_PROPERTY = 'DATE_TIME_PROPERTY';
		this.DIVIDE = 'DIVIDE';
		this.EQUALS = 'EQUALS';
		this.FIELD = 'FIELD';
		this.HIERARCHY = 'HIERARCHY';
		this.HIERARCHY_TO_TEXT = 'HIERARCHY_TO_TEXT';
		this.IN_RANGE = 'IN_RANGE';
		this.IS_NULL = 'IS_NULL';
		this.LAMBDA = 'LAMBDA';
		this.MEASURE_VALUE = 'MEASURE_VALUE';
		this.MINUS = 'MINUS';
		this.MULTIPLY = 'MULTIPLY';
		this.NOT = 'NOT';
		this.OR = 'OR';
		this.PLUS = 'PLUS';
		this.RECORD_DISPLAY_VALUE = 'RECORD_DISPLAY_VALUE';
		this.RECORD_KEY = 'RECORD_KEY';
		this.SIMPLE_CONSOLIDATE = 'SIMPLE_CONSOLIDATE';
		this.TRANSLATE = 'TRANSLATE';
		this.TRUNCATE_DATE_TIME = 'TRUNCATE_DATE_TIME';
	}

	workbook.prototype.ExpressionType = new workbookExpressionType();

	/**
	 * @enum {string}
	 * @readonly
	 */
	function workbookImage() {
		this.EXCLAMATION = 'EXCLAMATION';
		this.QUESTION = 'QUESTION';
		this.SMILE = 'SMILE';
	}

	workbook.prototype.Image = new workbookImage();

	/**
	 * @enum {string}
	 * @readonly
	 */
	function workbookUnit() {
		this.CM = 'CM';
		this.MM = 'MM';
		this.IN = 'IN';
		this.PX = 'PX';
		this.PT = 'PT';
		this.PC = 'PC';
		this.EM = 'EM';
		this.EX = 'EX';
		this.CH = 'CH';
		this.REM = 'REM';
		this.VW = 'VW';
		this.VH = 'VH';
		this.VMIN = 'VMIN';
		this.VMAX = 'VMAX';
	}

	workbook.prototype.Unit = new workbookUnit();

	/**
	 * @enum {string}
	 * @readonly
	 */
	function workbookPosition() {
		this.LEFT = 'LEFT';
		this.RIGHT = 'RIGHT';
		this.CENTER = 'CENTER';
		this.TOP = 'TOP';
		this.BOTTOM = 'BOTTOM';
	}

	workbook.prototype.Position = new workbookPosition();

	/**
	 * @enum {string}
	 * @readonly
	 */
	function workbookFontSize() {
		this.MEDIUM = 'MEDIUM';
		this.XX_SMALL = 'XX_SMALL';
		this.X_SMALL = 'X_SMALL';
		this.SMALL = 'SMALL';
		this.LARGE = 'LARGE';
		this.X_LARGE = 'X_LARGE';
		this.XX_LARGE = 'XX_LARGE';
		this.SMALLER = 'SMALLER';
		this.LARGER = 'LARGER';
	}

	workbook.prototype.FontSize = new workbookFontSize();

	/**
	 * @enum {string}
	 * @readonly
	 */
	function workbookFontStyle() {
		this.NORMAL = 'NORMAL';
		this.ITALIC = 'ITALIC';
		this.OBLIQUE = 'OBLIQUE';
	}

	workbook.prototype.FontStyle = new workbookFontStyle();

	/**
	 * @enum {string}
	 * @readonly
	 */
	function workbookFontWeight() {
		this.NORMAL = 'NORMAL';
		this.BOLD = 'BOLD';
	}

	workbook.prototype.FontWeight = new workbookFontWeight();

	/**
	 * @enum {string}
	 * @readonly
	 */
	function workbookTextAlign() {
		this.LEFT = 'LEFT';
		this.RIGHT = 'RIGHT';
		this.CENTER = 'CENTER';
		this.JUSTIFY = 'JUSTIFY';
	}

	workbook.prototype.TextAlign = new workbookTextAlign();

	/**
	 * @enum {string}
	 * @readonly
	 */
	function workbookTextDecorationLine() {
		this.NONE = 'NONE';
		this.UNDERLINE = 'UNDERLINE';
		this.OVERLINE = 'OVERLINE';
		this.LINE_THROUGH = 'LINE_THROUGH';
	}

	workbook.prototype.TextDecorationLine = new workbookTextDecorationLine();

	/**
	 * @enum {string}
	 * @readonly
	 */
	function workbookTextDecorationStyle() {
		this.SOLID = 'SOLID';
		this.DOUBLE = 'DOUBLE';
		this.DOTTED = 'DOTTED';
		this.DASHED = 'DASHED';
		this.WAVY = 'WAVY';
	}

	workbook.prototype.TextDecorationStyle = new workbookTextDecorationStyle();

	/**
	 * @enum {string}
	 * @readonly
	 */
	function workbookAggregation() {
		this.AVG = 'AVG';
		this.MIN = 'MIN';
		this.MAX = 'MAX';
		this.MEDIAN = 'MEDIAN';
		this.COUNT = 'COUNT';
		this.COUNT_DISTINCT = 'COUNT_DISTINCT';
		this.SUM = 'SUM';
	}

	workbook.prototype.Aggregation = new workbookAggregation();

	/**
     * Loads a workbook
     * @governance 10 units
     * @param {Object} options
     * @param {string} options.id id of the workbook to load
    
     * @return {Workbook}
     *
     * @since 2020.2
     */
	workbook.prototype.loadWorkbook = function loadWorkbook() {};

	/**
	 * Creates an aspect for chart series
	 * @governance none
	 * @param {Object} options
	 * @param {string}  [options.type] type of this aspect (value|color) - default is value
	 * @param {DataMeasure|CalculatedMeasure}  options.measure measure of the series
	 * @return {Aspect}
	 *
	 * @since 2020.2
	 */
	workbook.prototype.createAspect = function createAspect() {};

	/**
	 * Creates a chart category
	 * @governance none
	 * @param {Object} options
	 * @param {ChartAxis}  options.axis category axis definition
	 * @param {Section|DataDimension} options.root data to feed the chart from
	 * @param {Array<SortDefinition>} [options.sortDefinitions] Sorting for this category
	 * @return {Category}
	 *
	 * @since 2020.2
	 */
	workbook.prototype.createCategory = function createCategory() {};

	/**
	 * Creates a chart
	 * @governance none
	 * @param {Object} options
	 * @param {string|Expression} options.name name of the chart
	 * @param {string|Expression} options.portletName portletName of the chart
	 * @param {string|Expression} [options.title] title of the chart
	 * @param {string|Expression} [options.subTitle] subTitle of the chart
	 * @param {string} options.id id of the chart
	 * @param {string} options.type type of the chart (BAR|AREA|COLUMN ...)
	 * @param {string} [options.stacking] stacking indicator (defaults to DISABLED)
	 * @param {Category} options.category Category for this chart
	 * @param {Legend} options.legend Legend for this chart
	 * @param {Array<Series>} options.series Series for this chart
	 * @param {Array<Expression>} [options.filterExpressions] simple non-aggregated filters
	 * @param {Array<(LimitingFilter|ConditionalFilter)>} [options.aggregationFilters] conditional and limiting filters
	 * @param {Dataset=} options.dataset Dataset on which is this chart is based
	 * @param {DatasetLink=} options.datasetLink DatasetLink on which this chart is based
	 * @throws {SuiteScriptError} INVALID_STACKING_TYPE when value outside of Stacking enum is used for stacking parameter
	 * @throws {SuiteScriptError} INVALID_CHART_TYPE when value outside of ChartType enum is used for type parameter
	 * @return {Chart}
	 *
	 * @since 2020.2
	 */
	workbook.prototype.createChart = function createChart() {};

	/**
	 * Creates a chart axis
	 * @governance none
	 * @param {Object} options
	 * @param {string|Expression}  options.title title of the axis
	 * @return {ChartAxis}
	 *
	 * @since 2020.2
	 */
	workbook.prototype.createChartAxis = function createChartAxis() {};

	/**
	 * Creates a Conditional filter
	 * @governance none
	 * @param {Object} options
	 * @param {boolean} options.row indicates whether to filter on rows (filters on column if set to false)
	 * @param {DimensionSelector|DescendantOrSelfNodesSelector|PathSelector|ChildNodesSelector} options.rowSelector selector for row
	 * @param {DimensionSelector|DescendantOrSelfNodesSelector|PathSelector|ChildNodesSelector} options.columnSelector - selector for column
	 * @param {DataMeasure|CalculatedMeasure} options.measure - filter measure
	 * @param {Expression} options.predicate - predicate expression for this filter
	 * @return {ConditionalFilter}
	 *
	 * @since 2020.2
	 */
	workbook.prototype.createConditionalFilter = function createConditionalFilter() {};

	/**
	 * Creates a DataDimension
	 * @governance none
	 * @param {Object} options
	 * @param {string} [options.totalLine]
	 * @param {Array<(DataDimension|Section|DataMeasure|CalculatedMeasure)>} [options.children]
	 * @param {Array<DataDimensionItem>} options.items
	 * @throws {SuiteScriptError} INVALID_TOTAL_LINE when using value outside of TotalLine enum for totalLine
	 * @throws {SuiteScriptError} NO_DIMENSION_ITEM_DEFINED when array of dimension items is empty
	 * @return {DataDimension}
	 *
	 * @since 2020.2
	 */
	workbook.prototype.createDataDimension = function createDataDimension() {};

	/**
	 * Creates a DataDimensionItem
	 * @governance none
	 * @param {Object} options
	 * @param {string|Expression} [options.label] - label to use
	 * @param {Expression} options.expression - expression for this data dimension item
	 * @return {DataDimensionItem}
	 *
	 * @since 2020.2
	 */
	workbook.prototype.createDataDimensionItem = function createDataDimensionItem() {};

	/**
	 * Creates a DimensionSelector
	 * @governance none
	 * @param {Object} options
	 * @param {DataDimension|Section} options.dimension - dimension to select
	 * @return {DimensionSelector}
	 *
	 * @since 2020.2
	 */
	workbook.prototype.createDimensionSelector = function createDimensionSelector() {};

	/**
	 * Creates an expression, that includes a function ID and parameters. Expressions can be used to create a pivot definition, a data dimension item, a measure, a conditional filter, and a dimension sort.
	 * @governance none
	 * @param {Object} options
	 * @param {string} options.functionId - The function for the expression.
	 * @param {Object} options.parameters - The parameters for the expression.
	 * @return {Expression}
	 *
	 * @since 2020.2
	 */
	workbook.prototype.createExpression = function createExpression() {};

	/**
	 * Creates a SortByDataDimensionItem object
	 * @governance none
	 * @param {Object} options
	 * @param {DataDimensionItem} options.item item to sort by
	 * @param {Sort} options.sort - sort object
	 * @return {SortByDataDimensionItem}
	 *
	 * @since 2020.2
	 */
	workbook.prototype.createSortByDataDimensionItem = function createSortByDataDimensionItem() {};

	/**
	 * Creates a field context for table view column
	 * @governance none
	 * @param {Object} options
	 * @param {string}  options.name name of this context
	 * @param   {Object} [options.parameters] parameters of this context
	 * @return {FieldContext}
	 *
	 * @since 2020.2
	 */
	workbook.prototype.createFieldContext = function createFieldContext() {};

	/**
	 * Creates a Limiting filter
	 * @governance none
	 * @param {Object} options
	 * @param {boolean} options.row indicates whether this filter is for a row axis (if set to false, then it is on column axis)
	 * @param {number} options.limit limit for this filter
	 * @param {Array<(MeasureSort|SortByDataDimensionItem)>} options.sortBys  - Particular sort by elements
	 * @param {DimensionSelector|DescendantOrSelfNodesSelector|PathSelector|ChildNodesSelector} options.filteredNodesSelector - selector for this filter
	 * @return {LimitingFilter}
	 *
	 * @since 2020.2
	 */
	workbook.prototype.createLimitingFilter = function createLimitingFilter() {};

	/**
	 * Creates a DataMeasure
	 * @governance none
	 * @param {Object} options
	 * @param {string|Expression} [options.label] label to use
	 * @param {string} options.aggregation - aggregation to use
	 * @param {Expression} options.expression - expression for this measure (if this is a single expression measure)
	 * @param {Array<Expression>} options.expressions - expressions for this measure (if this is a multi expression measure)
	 * @throws {SuiteScriptError} MUTUALLY_EXCLUSIVE_ARGUMENTS if both expressions and expression parameters are defined
	 * @throws {SuiteScriptError} AT_LEAST_ONE_EXPRESSION_IS_NEEDED if expressions parameter is empty array
	 * @throws {SuiteScriptError} EXPRESSIONS_MUST_BE_SPECIFIED_WHEN_USING_COUNT_DISTINCT_AGGREGATION when trying to use count distinct aggregation while not defining expressions
	 * @throws {SuiteScriptError} EXPRESSION_MUST_BE_SPECIFIED_WHEN_USING_OTHER_THAN_COUNT_DISTINCT_AGGREGATION when trying to use other than count distinct aggregation while not defining expression
	 * @return {DataMeasure}
	 *
	 * @since 2020.2
	 */
	workbook.prototype.createDataMeasure = function createDataMeasure() {};

	/**
	 * Creates a CalculatedMeasure
	 * @governance none
	 * @param {Object} options
	 * @param {string|Expression} [options.label] label to use
	 * @param {Expression} options.expression - expression for this calculated measure
	 * @return {CalculatedMeasure}
	 *
	 * @since 2021.1
	 */
	workbook.prototype.createCalculatedMeasure = function createCalculatedMeasure() {};

	/**
	 * Creates a chart legend
	 * @governance none
	 * @param {Object} options
	 * @param {Array<ChartAxis>}  options.axes legend axes definition
	 * @param {Section|DataDimension} options.root data to feed the chart from
	 * @param {Array<SortDefinition>} [options.sortDefinitions] Sorting for this legend
	 * @return {Legend}
	 *
	 * @since 2020.2
	 */
	workbook.prototype.createLegend = function createLegend() {};

	/**
	 * Creates a SortByMeasure object
	 * @governance none
	 * @param {Object} options
	 * @param {DataMeasure|CalculatedMeasure} options.measure sort by measure
	 * @param {DimensionSelector|DescendantOrSelfNodesSelector|PathSelector|ChildNodesSelector} options.otherAxisSelector selector of this sort
	 * @param {Sort} options.sort - sort object
	 * @return {SortByMeasure}
	 *
	 * @since 2020.2
	 */
	workbook.prototype.createSortByMeasure = function createSortByMeasure() {};

	/**
	 * Creates a PathSelector
	 * @governance none
	 * @param {Object} options
	 * @param {Array<(DescendantOrSelfNodesSelector|DimensionSelector|ChildNodesSelector)>} options.elements
	 * @return {PathSelector}
	 * @throws {SuiteScriptError} NO_ELEMENTS_DEFINED when elements array is empty
	 *
	 * @since 2020.2
	 */
	workbook.prototype.createPathSelector = function createPathSelector() {};

	/**
	 * Creates a pivot
	 * @governance none
	 * @param {Object} options
	 * @param {Array<Expression>} [options.filterExpressions] simple non-aggregated filters
	 * @param {Array<(LimitingFilter|ConditionalFilter)>} [options.aggregationFilters] conditional and limiting filters
	 * @param {string|Expression} options.name name of the pivot
	 * @param {string|Expression} [options.portletName] portlet name of the pivot
	 * @param {string} options.id id of the pivot
	 * @param {PivotAxis} options.rowAxis rowAxis containing sections, data dimensions ...
	 * @param {PivotAxis} options.columnAxis columnAxis containing sections, data dimensions ...
	 * @param {Dataset=} options.dataset Dataset on which is this pivot is based
	 * @param {DatasetLink=} options.datasetLink DatasetLink on which this pivot is based
	 * @param {Array<ReportStyle>} [options.reportStyles] Conditional formatting for this pivot
	 * @return {Pivot}
	 * @throws {SuiteScriptError} MUTUALLY_EXCLUSIVE_ARGUMENTS if both dataset and datasetLink are defined
	 * @throws {SuiteScriptError} NEITHER_ARGUMENT_DEFINED if neither dataset nor datasetLink is defined
	 *
	 * @since 2020.2
	 */
	workbook.prototype.createPivot = function createPivot() {};

	/**
	 * Creates a pivot axis
	 * @governance none
	 * @param {Object} options
	 * @param {Section|DataDimension}  options.root definition of the data
	 * @param {Array<SortDefinition>}  [options.sortDefinitions] sorting definition
	 * @return {PivotAxis}
	 *
	 * @since 2020.2
	 */
	workbook.prototype.createPivotAxis = function createPivotAxis() {};

	/**
	 * Creates a chart series
	 * @governance none
	 * @param {Object} options
	 * @param {Array<Aspect>}  options.aspects - aspects for this series
	 * @return {Series}
	 * @throws {SuiteScriptError} NO_ASPECTS_DEFINED when aspects array is empty
	 *
	 * @since 2020.2
	 */
	workbook.prototype.createSeries = function createSeries() {};

	/**
	 * Creates a Section
	 * @governance none
	 * @param {Object} options
	 * @param {string} [options.totalLine]
	 * @param {Array<(DataDimension|Section|DataMeasure|CalculatedMeasure)>} options.children
	 * @throws {SuiteScriptError} INVALID_TOTAL_LINE when using value outside of TotalLine enum for totalLine
	 * @throws {SuiteScriptError} NO_CHILDREN_DEFINED when children array is empty
	 * @return {Section}
	 *
	 * @since 2020.2
	 */
	workbook.prototype.createSection = function createSection() {};

	/**
	 * Creates a Sort object
	 * @param {Object} [options]
	 * @param {boolean} [options.ascending] ascending/descending indicator (defaults to true)
	 * @param {string} [options.locale]  - option for locale specific sorting (validated against query.SortLocale enum)
	 * @param {boolean} [options.nullsLast]  - sort null items last indicator (defaults to the value of ascending parameter)
	 * @param {boolean} [options.caseSensitive]  - case sensitivity indicator
	 * @throws {SuiteScriptError} INVALID_SORT_LOCALE - when using a value outside of query.SortLocale enum for locale parameter
	 * @return {Sort}
	 *
	 * @since 2020.2
	 */
	workbook.prototype.createSort = function createSort() {};

	/**
	 * Creates a SortDefinition
	 * @governance none
	 * @param {Object} options
	 * @param {DescendantOrSelfNodesSelector|DimensionSelector|PathSelector|ChildNodesSelector} options.selector  - selector for this sort definition
	 * @param {Array<(MeasureSort|SortByDataDimensionItem)>} options.sortBys  - Particular sort by elements
	 * @throws {SuiteScriptError} NO_SORT_BY_DEFINED - when sortBys array is empty
	 * @return {SortDefinition}
	 *
	 * @since 2020.2
	 */
	workbook.prototype.createSortDefinition = function createSortDefinition() {};

	/**
	 * Creates a table
	 * @governance none
	 * @param {Object} options
	 * @param {string|Expression} options.name name of the table
	 * @param {string|Expression} [options.portletName] name of the table
	 * @param {string} options.id id of the table view
	 * @param {Dataset} options.dataset Dataset on which is this table view based
	 * @param {Array<TableColumn>} options.columns columns used in this table view
	 * @return {Table}
	 *
	 * @since 2020.2
	 */
	workbook.prototype.createTable = function createTable() {};

	/**
	 * Creates a table view column
	 * @governance none
	 * @param {Object} options
	 * @param {TableColumnCondition}  [options.condition] additional condition
	 * @param {number} [options.width] width of the column in pixels
	 * @param {string} options.datasetColumnAlias alias of underlying dataset column
	 * @param {string|Expression} [options.label] label for this column
	 * @param {Sort} options.sort sorting definition for this column
	 * @param {Array<ConditionalFormat>} options.conditionalFormats Conditional formatting for this column
	 * @return {TableColumn}
	 *
	 * @since 2020.2
	 */
	workbook.prototype.createTableColumn = function createTableColumn() {};

	/**
	 * Creates a table column filter
	 * @governance none
	 * @param {Object} options
	 * @param {string}  options.operator operator of this filter
	 * @param {Array<(null|number|string|boolean|Date|Object)>} [options.values] values for this filter
	 * @throws {SuiteScriptError} INVALID_OPERATOR if the operator is not valid
	 * @return {TableColumnFilter}
	 *
	 * @since 2020.2
	 */
	workbook.prototype.createTableColumnFilter = function createTableColumnFilter() {};

	/**
	 * Creates a table column condition
	 * @governance none
	 * @param {Object} options
	 * @param {string}  options.operator operator of this filter
	 * @param {Array<TableColumnFilter>} options.filters] filters for this condition
	 * @throws {SuiteScriptError} INVALID_OPERATOR if the operator is not valid
	 * @return {TableColumnCondition}
	 *
	 * @since 2021.1
	 */
	workbook.prototype.createTableColumnCondition = function createTableColumnCondition() {};

	/**
	 * Creates a conditional format rule
	 * @governance none
	 * @param {Object} options
	 * @param {Style}  options.style style to use for this conditional formatting rule
	 * @param {TableColumnFilter} options.filter restriction when such formatting rule should be applied
	 * @return {ConditionalFormatRule}
	 *
	 * @since 2021.1
	 */
	workbook.prototype.createConditionalFormatRule = function createConditionalFormatRule() {};

	/**
	 * Creates a conditional format
	 * @governance none
	 * @param {Object} options
	 * @param {Array<ConditionalFormatRule>} options.rules style to use for this conditional formatting object
	 * @throws {SuiteScriptError} NO_RULE_DEFINED when array rules is empty
	 * @return {ConditionalFormat}
	 *
	 * @since 2021.1
	 */
	workbook.prototype.createConditionalFormat = function createConditionalFormat() {};

	/**
	 * Creates a report style
	 * @governance none
	 * @param {Object} options
	 * @param {Array<ReportStyleRule>} options.rules rules to apply in this report style
	 * @param {Array<MeasureValueSelector>} options.selectors select where to apply the style
	 * @throws {SuiteScriptError} NO_RULE_DEFINED when array of rules is empty
	 * @throws {SuiteScriptError} NO_SELECTORS_DEFINED when array of selectors is empty
	 * @return {ReportStyle}
	 *
	 * @since 2021.1
	 */
	workbook.prototype.createReportStyle = function createReportStyle() {};

	/**
	 * Creates a measure value selector
	 * @governance none
	 * @param {Object} options
	 * @param {MeasureSelector} options.measureSelector measures to apply conditional formatting to
	 * @param {DescendantOrSelfNodesSelector|DimensionSelector|PathSelector|ChildNodesSelector} options.rowSelector select row to style
	 * @param {DescendantOrSelfNodesSelector|DimensionSelector|PathSelector|ChildNodesSelector} options.columnSelector select column to style
	 * @return {MeasureValueSelector}
	 *
	 * @since 2021.1
	 */
	workbook.prototype.createMeasureValueSelector = function createMeasureValueSelector() {};

	/**
	 * Creates a measure selector
	 * @governance none
	 * @param {Object} options
	 * @param {Array<(DataMeasure|CalculatedMeasure)>} options.measures
	 * @throws {SuiteScriptError} NO_MEASURE_DEFINED when array of measures is empty
	 * @return {MeasureSelector}
	 *
	 * @since 2021.1
	 */
	workbook.prototype.createMeasureSelector = function createMeasureSelector() {};

	/**
	 * Creates a measure sort, which defines a sort on a measure.
	 * @governance none
	 * @param {Object} options
	 * @param {Measure} options.measure The measure for the measure sort.
	 * @param {DimensionSelector|PathSelector} options.otherAxisSelector The selector for the other axis of the measure sort.
	 * @param {DimensionSelector|PathSelector} options.selector The selector of the measure sort. This corresponds to the MeasureSort.sort property.
	 * @param {Sort} options.sort The sort for the measure sort.
	 * @return {MeasureSort}
	 *
	 * @since 2021.1
	 */
		workbook.prototype.createMeasureSort = function createMeasureSort() {};

	/**
	 * Creates a report style formatting rule
	 * @governance none
	 * @param {Object} options
	 * @param {Style}  options.style style to use for this report style rule
	 * @param {Expression} options.expression restriction when such formatting rule should be applied
	 * @return {ReportStyleRule}
	 *
	 * @since 2021.1
	 */
	workbook.prototype.createReportStyleRule = function createReportStyleRule() {};

	/**
	 * Creates a color
	 * @governance none
	 * @param {Object} options
	 * @param {number}  [options.red] red portion of the color
	 * @param {number}  [options.green] green portion of the color
	 * @param {number}  [options.blue] blud portion of the color
	 * @param {number}  [options.alpha] opacity - transparency
	 * @throws {SuiteScriptError} INVALID_COLOR_VALUE if value for any of red|green/blue is either smaller than 0 or greater
	 *     than 255
	 * @throws {SuiteScriptError} INVALID_INVALID_ALPHA_VALUE if value for alpha parameter is either smaller than 0 or greater
	 *     than 1
	 * @return {Color}
	 *
	 * @since 2021.1
	 */
	workbook.prototype.createColor = function createColor() {};

	/**
	 * Creates a percent-defined background position
	 * @governance none
	 * @param {Object} options
	 * @param {number}  options.percentX percent of the X dimension
	 * @param {number}  options.percentY percent of the Y dimension
	 * @return {PositionPercent}
	 *
	 * @since 2021.1
	 */
	workbook.prototype.createPositionPercent = function createPositionPercent() {};

	/**
	 * Creates a values-defined background position
	 * @governance none
	 * @param {Object} options
	 * @param {string}  options.horizontal horizontal setting
	 * @param {string}  options.vertical vertical setting
	 * @throws {SuiteScriptError} INVALID_POSITION if the value vertical|horizontal position is outside of Position enum
	 * @return {PositionValues}
	 *
	 * @since 2021.1
	 */
	workbook.prototype.createPositionValues = function createPositionValues() {};

	/**
	 * Creates a font size defined by units
	 * @governance none
	 * @param {Object} options
	 * @param {number}  options.size size of the font
	 * @param {string}  options.unit unit of the font size
	 * @throws {SuiteScriptError} INVALID_UNIT when assigned value is outside of Unit enum
	 * @return {FontSize}
	 *
	 * @since 2021.1
	 */
	workbook.prototype.createFontSize = function createFontSize() {};

	/**
	 * Creates a background position defined by x/y coordinates and units
	 * @governance none
	 * @param {Object} options
	 * @param {number}  options.x X coordinate
	 * @param {number}  options.y Y coordinate
	 * @param {string}  options.unit units to use for x/y coordinates
	 * @throws {SuiteScriptError} INVALID_POSITION if the value vertical|horizontal position is outside of Position enum
	 * @return {PositionUnits}
	 *
	 * @since 2021.1
	 */
	workbook.prototype.createPositionUnits = function createPositionUnits() {};

	/**
	 * Creates a style to be used in conditional formatting
	 * @governance none
	 * @param {Object} options
	 * @param {string} [options.backgroundImage] background image
	 * @param {Color|string} [options.backgroundColor] background color
	 * @param {PositionUnits|PositionValues|PositionPercent} [options.backgroundPosition] background position
	 * @param {string} [options.fontSize] font size
	 * @param {string} [options.fontStyle] font style
	 * @param {string} [options.fontWeight] font weight
	 * @param {string} [options.textAlign] text alignment
	 * @param {Color|string} [options.color] color
	 * @param {Color|string} [options.textDecorationColor] text decoration color
	 * @param {string} [options.textDecorationLine] text decoration line
	 * @param {string} [options.textDecorationStyle] text decoration style
	 * @throws {SuiteScriptError} INVALID_IMAGE if backgroundImage parameter is outside of Image enum
	 * @throws {SuiteScriptError} INVALID_FONT_SIZE if fontSize parameter is outside of FontSize enum
	 * @throws {SuiteScriptError} INVALID_FONT_STYLE if fontStyle parameter is outside of FontStyle enum
	 * @throws {SuiteScriptError} INVALID_FONT_WEIGHT if fontWeight parameter is outside of FontWeight enum
	 * @throws {SuiteScriptError} INVALID_TEXT_ALIGN if textAlign parameter is outside of TextAlign enum
	 * @throws {SuiteScriptError} INVALID_COLOR if backgroundColor, color or textDecorationColor is outside of Color enum
	 *     (while not being color object)
	 * @throws {SuiteScriptError} INVALID_TEXT_DECORATION_LINE if textDecorationLine parameter is outside of TextDecorationLine
	 *     enum
	 * @throws {SuiteScriptError} INVALID_TEXT_DECORATION_STYLE if textDecorationStyle parameter is outside of
	 *     TextDecorationStyle enum
	 * @return {Style}
	 *
	 * @since 2021.1
	 */
	workbook.prototype.createStyle = function createStyle() {};

	/**
	 * Create a Workbook object
	 * @governance none
	 * @param {Object} options
	 * @param {Array<Pivot>} [options.pivots] Pivots in this workbook
	 * @param {Array<Chart>} [options.charts] Charts in this workbook
	 * @param {Array<Table>} [options.tables] Tables in this workbook
	 * @return {Workbook}
	 *
	 * @since 2020.2
	 */
	workbook.prototype.createWorkbook = function createWorkbook() {};

	/**
	 * Create translation expression
	 * @param {Object} options
	 * @param {string} {options.key} Key of the translation
	 * @param {string} {options.collection} Collection of the translation
	 * @return {Expression} Expression for the translation
	 *
	 * @since 2021.2
	 */
	workbook.prototype.createTranslation = function createTranslation() {};

	/**
	 * Creates a Range object
	 * @param {Object} options
	 * @param {string} {options.start} Date or Date time formatted as string
	 * @param {string} {options.end} Date or Date time formatted as string
	 * @return {Range} Range object
	 *
	 * @since 2021.2
	 */
	workbook.prototype.createRange = function createRange() {};

	/**
	 * Creates a Duration object
	 * @param {Object} options
	 * @param {string} {options.start} Date or Date time formatted as string
	 * @param {string} {options.end} Date or Date time formatted as string
	 * @throws {SuiteScriptError} INVALID_TEMPORAL_UNIT if provided units are outside of TemporalUnit enum
	 * @return {Duration} Duration object
	 *
	 * @since 2021.2
	 */
	workbook.prototype.createDuration = function createDuration() {};

	/**
	 * Creates a complex RecordKey object from an object
	 * @param {Object} options Properties of the record key (e. g. {numberkey: 1, stringkey:"a"})
	 * @return {RecordKey} RecordKey object
	 *
	 * @since 2021.2
	 */
	workbook.prototype.createComplexRecordKey = function createComplexRecordKey() {};

	/**
	 * Creates a RecordKey object
	 * @param {Object} options
	 * @param {string|number} {options.key} string or number key
	 * @return {RecordKey} RecordKey object
	 *
	 * @since 2021.2
	 */
	workbook.prototype.createSimpleRecordKey = function createSimpleRecordKey() {};

	/**
	 * Creates a Currency object
	 * @param {Object} options
	 * @param {number} {options.amount} Currency amount
	 * @param {string} {options.id} Currency id
	 * @throws {SuiteScriptError} INVALID_CURRENCY if provided currency id is outside of Currency enum
	 * @return {Currency} Range object
	 *
	 * @since 2021.2
	 */
	workbook.prototype.createCurrency = function createCurrency() {};

	/**
	 * Create pivot storage which can be used to hold results of asynchronous pivot execution
	 * @governance 10 units
	 * @return {number} Id of pivot storage which can be used to retrieve results of asynchronous pivot execution
	 *
	 * @since 2021.2
	 */
	workbook.prototype.createPivotStorage = function createPivotStorage() {};

	/**
	 * Loads pivot results from storage
	 * @governance 10 units
	 * @param {Object} options
	 * @param {number} options.id id of the pivot storage
	 *
	 * @return {Iterator}
	 * @throws {SuiteScriptError} SSS_INVALID_API_USAGE when method is called from browser
	 * @since 2021.2
	 */
	workbook.prototype.loadPivotResults = function loadPivotResults() {};

	/**
	 * @exports N/workbook
	 * @namespace workbook
	 */
	return new workbook();
});
