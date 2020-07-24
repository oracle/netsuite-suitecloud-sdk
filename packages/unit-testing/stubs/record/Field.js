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

		this.prototype.label = undefined;
		/**
		 * Return id of the field
		 * @name Field#id
		 * @type string
		 * @readonly
		 * @since 2015.2
		 */

		this.prototype.id = undefined;
		/**
		 * Disabled state of the field
		 * @name Field#isDisabled
		 * @type boolean
		 * @since 2015.2
		 */

		this.prototype.isDisabled = undefined;
		/**
		 * Display state of the field
		 * @name Field#isDisplay
		 * @type boolean
		 * @since 2015.2
		 */

		this.prototype.isDisplay = undefined;
		/**
		 * Mandatory state of the field
		 * @name Field#isMandatory
		 * @type boolean
		 * @since 2015.2
		 */

		this.prototype.isMandatory = undefined;
		/**
		 * Read Only state of the field
		 * @name Field#isReadOnly
		 * @type boolean
		 * @since 2015.2
		 */

		this.prototype.isReadOnly = undefined;
		/**
		 * Visible state of the field
		 * @name Field#isVisible
		 * @type boolean
		 * @since 2015.2
		 */

		this.prototype.isVisible = undefined;
		/**
		 * Return type of the field
		 * @name Field#type
		 * @type string
		 * @readonly
		 * @since 2015.2
		 */

		this.prototype.type = undefined;
		/**
		 * Return the sublistId of the field
		 * @name Field#sublistId
		 * @type string
		 * @readonly
		 * @since 2015.2
		 */

		this.prototype.sublistId = undefined;
		/**
		 * Returns if the field is a popup
		 * @name Field#isPopup
		 * @type boolean
		 * @readonly
		 * @since 2015.2
		 */

		this.prototype.isPopup = undefined;
		/**
		 * get JSON format of the object
		 * @return {{id: *, label: *, type: *}}
		 *
		 */

		this.prototype.toJSON = function (options) {};

		/**
		 * @return {string}
		 *
		 */

		this.prototype.toString = function (options) {};
	}

	return new Field();
});
