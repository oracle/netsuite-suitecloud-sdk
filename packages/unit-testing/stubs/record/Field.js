define([], function () {
	/**
	 * @protected
	 * @constructor
	 */
	function Field() {
		/**
		 * Return label of the field
		 * @name Field#label
		 * @type string
		 * @readonly
		 * @since 2015.2
		 */

		this.label = undefined;
		/**
		 * Return id of the field
		 * @name Field#id
		 * @type string
		 * @readonly
		 * @since 2015.2
		 */

		this.id = undefined;
		/**
		 * Disabled state of the field
		 * @name Field#isDisabled
		 * @type boolean
		 * @since 2015.2
		 */

		this.isDisabled = undefined;
		/**
		 * Display state of the field
		 * @name Field#isDisplay
		 * @type boolean
		 * @since 2015.2
		 */

		this.isDisplay = undefined;
		/**
		 * Mandatory state of the field
		 * @name Field#isMandatory
		 * @type boolean
		 * @since 2015.2
		 */

		this.isMandatory = undefined;
		/**
		 * Read Only state of the field
		 * @name Field#isReadOnly
		 * @type boolean
		 * @since 2015.2
		 */

		this.isReadOnly = undefined;
		/**
		 * Visible state of the field
		 * @name Field#isVisible
		 * @type boolean
		 * @since 2015.2
		 */

		this.isVisible = undefined;
		/**
		 * Return type of the field
		 * @name Field#type
		 * @type string
		 * @readonly
		 * @since 2015.2
		 */

		this.type = undefined;
		/**
		 * Return the sublistId of the field
		 * @name Field#sublistId
		 * @type string
		 * @readonly
		 * @since 2015.2
		 */

		this.sublistId = undefined;
		/**
		 * Returns if the field is a popup
		 * @name Field#isPopup
		 * @type boolean
		 * @readonly
		 * @since 2015.2
		 */

		this.isPopup = undefined;
		/**
		 * get JSON format of the object
		 * @return {{id: *, label: *, type: *}}
		 *
		 */

		this.toJSON = function (options) {};

		/**
		 * @return {string}
		 *
		 */

		this.toString = function (options) {};
	}

	return new Field();
});
