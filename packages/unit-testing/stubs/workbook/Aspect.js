define(['./CalculatedMeasure', './DataMeasure'], function (CalculatedMeasure, DataMeasure) {
	/**
	 * @class Aspect
	 * @classDescription Aspect of a series in a chart
	 * @constructor
	 * @protected
	 *
	 * @since 2020.2
	 */
	function Aspect() {
		/**
		 * type of this aspect - color|measure
		 * @name Aspect#type
		 * @type {string}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 * @throws {SuiteScriptError} INVALID_ASPECT_TYPE when the type outside of the AspectType enum
		 *
		 * @since 2020.2
		 */
		this.type = undefined;
		/**
		 * measure of this aspect
		 * @name Aspect#measure
		 * @type {DataMeasure | CalculatedMeasure}
		 * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when the type is not right
		 *
		 * @since 2020.2
		 */
		this.measure = undefined;
	}
	return new Aspect();
});
