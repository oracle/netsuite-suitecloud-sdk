define(['./Line', './Sublist', './Field'], function (Line, Sublist, Field) {

    /**
     * Primary object used to encapsulate a record object.
     *
     * @protected
     * @param {Object} options
     * @param {Object} options.recordObj (server-generated object holding the full metadata and data for a record type,
     *     including all scripting and customization. See RecordSerializationKey.java)
     * @param {number} options.recordObj.id
     * @param {boolean} options.recordObj.isSubrecord = true if the record instance is a subrecord
     * @param {boolean} options.recordObj.isReadOnly = true if the record instance is read only instance
     * @param {boolean} options.recordObj.isDynamic = true if the record instance is a dynamic record
     * @param {boolean} options.recordObj.isCurrentRecord
     * @param {boolean} options.recordObj.isUserEvent
     * @param {Object} options.recordObj.recordContext
     * @param {Metadata} options.recordObj.metadata (record metadata data used to populate the model controller)
     * @param {ModelController} options.recordObj.data (record data used to populate the model)
     * @param {RecordStateController} options.recordObj.state (record state to use to pre-populate the model controller)
     * @return {Record} client-side record implementation
     * @constructor
     */
    function Record() {

        /**
         * @type {number}
         * @readonly
         */
        this.id = undefined;

        /**
         * @type {boolean}
         * @readonly
         */
        this.isDynamic = undefined;

        /**
         * @type {string}
         * @readonly
         */
        this.type = undefined;

        /**
         * provide scripting context for records
         * getScriptContext is only in recordDefinition.js and not in dynamicrecord.js.So it is only visible inside NetSuite.
         */

        this.getScriptingContext = function (options) { };

        /**
         * provide scripting context for records
         */

        this.eventHandlerModules = function (options) { };

        /**
         * return array of names of all body fields, including machine header field and matrix header fields
         * @return {string[]}
         */

        this.getFields = function (options) { };

        /**
         * return array of names of all sublists
         * @return {string[]}
         */

        this.getSublists = function (options) { };

        /**
         * return value of the field
         * @param {Object} options
         * @param {string} options.fieldId
         * @return {(number|Date|string|Array|boolean)}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if fieldId is missing or undefined
         * @throws {SuiteScriptError} SSS_INVALID_API_USAGE if invoked after using setText
         */

        this.getValue = function (options) { };

        /**
         * set value of the field
         * @param {Object} options
         * @param {string} options.fieldId
         * @param {number|Date|string|Array|boolean} options.value
         * @param {boolean} [options.ignoreFieldChange=false] Ignore the field change script
         * @return {Record} same record, for chaining
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if fieldId is missing or undefined
         */

        this.setValue = function (options) { };

        /**
         * get value of the field in text representation
         * @param {Object} options
         * @param {string} options.fieldId
         * @return {string}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if fieldId is missing or undefined
         */

        this.getText = function (options) { };

        /**
         * set value of the field by text representation
         * @param {Object} options
         * @param {string} options.fieldId
         * @param {string} options.text ----- The text or texts to change the field value to.
         *    If the field type is multiselect: - This parameter accepts an array of string values. - This parameter accepts a
         *     null value. Passing in null deselects all currentlsy selected values. If the field type is not multiselect: this
         *     parameter accepts only a single string value.
         * @param {boolean} [options.ignoreFieldChange=false] ignore field change script and slaving event if set to true
         * @return {Record} same record, for chaining
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if fieldId is missing or undefined
         */

        this.setText = function (options) { };

        /**
         * return the line number for the first occurrence of a field value in a sublist and return -1 if not found
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {string} options.fieldId
         * @param {(number|Date|string|Array|boolean)} options.value
         * @return {number}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId or field is missing
         */

        this.findSublistLineWithValue = function (options) { };

        /**
         * return value of a sublist field
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {string} options.fieldId
         * @param {number} options.line
         * @return {(number|Date|string|Array|boolean)}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId, fieldId, or line is missing
         * @throws {SuiteScriptError} SSS_INVALID_SUBLIST_OPERATION if invalid sublist id, field id, or line number
         * @throws {SuiteScriptError} SSS_INVALID_API_USAGE if invoked after using setSublistText
         */

        this.getSublistValue = function (options) { };

        /**
         * set the value of a sublist field (available for deferred dynamic only)
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {string} options.fieldId
         * @param {number} options.line
         * @param {(number|Date|string|Array|boolean)} options.value
         * @return {Record} same record, for chaining
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId, fieldId, or line is missing
         * @throws {SuiteScriptError} SSS_INVALID_SUBLIST_OPERATION if invalid sublist id, field id, or line number
         */

        this.setSublistValue = function (options) { };

        /**
         * return value of a sublist field in text representation
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {string} options.fieldId
         * @param {number} options.line
         * @return {string}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId, fieldId, or line is missing
         * @throws {SuiteScriptError} SSS_INVALID_SUBLIST_OPERATION if invalid sublist id, field id, or line number
         * @throws {SuiteScriptError} SSS_INVALID_API_USAGE if invoked prior using setSublistText
         */

        this.getSublistText = function (options) { };

        /**
         * set the value of a sublist field in text representation (available for deferred dynamic only)
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {string} options.fieldId
         * @param {number} options.line
         * @param {string} options.text
         * @return {Record} same record, for chaining
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId, fieldId, or line is missing
         * @throws {SuiteScriptError} SSS_INVALID_SUBLIST_OPERATION if invalid sublist id, field id, or line number
         */

        this.setSublistText = function (options) { };

        /**
         * return line count of sublist
         * @param {Object} options
         * @param {string} options.sublistId
         * @return {number}
         */

        this.getLineCount = function (options) { };

        /**
         * insert a sublist line
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {number} options.line
         * @param {string} options.beforeLineInstanceId
         * @param {boolean} [ignoreRecalc=false] options.ignoreRecalc ignore recalc scripting
         * @return {Line} [new line object]
         * @throws {SuiteScriptError} MUTUALLY_EXCLUSIVE_ARGUMENTS if both line and beforeLineInstanceId are provided
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId is missing or both line and beforeLineInstanceId
         *     are missing
         * @throws {SuiteScriptError} SSS_INVALID_SUBLIST_OPERATION if sublistId or line index is invalid or if machine is not
         *     editable or before exists and before is an instanceId that does not point to a line in the sublist.
         */

        this.insertLine = function (options) { };

        /**
         * remove a sublist line
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {number} options.line
         * @param {string} options.lineInstanceId
         * @param {boolean} [ignoreRecalc=false] options.ignoreRecalc ignore recalc scripting
         * @return {Record} same record, for chaining
         * @throws {SuiteScriptError} MUTUALLY_EXCLUSIVE_ARGUMENTS if both line and lineInstanceId are provided
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId is missing or both line and lineInstanceId are
         *     missing
         * @throws {SuiteScriptError} SSS_INVALID_SUBLIST_OPERATION if sublistId or line index is invalid or if machine is not
         *     editable
         */

        this.removeLine = function (options) { };

        /**
         * Selects an existing line in a sublist.
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {number} options.line
         * @return {Line} [line object]
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId is missing or undefined
         * @throws {SuiteScriptError} SSS_INVALID_SUBLIST_OPERATION if invalid sublist id or sublist is not editable
         */

        this.selectLine = function (options) { };

        /**
         * select a new line at the end of sublist
         * @param {Object} options
         * @param {string} options.sublistId
         * @return {Line} [new line object]
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId is missing or undefined
         * @throws {SuiteScriptError} SSS_INVALID_SUBLIST_OPERATION if invalid sublist id or sublist is not editable
         * @restriction only available in dynamic record
         */

        this.selectNewLine = function (options) { };

        /**
         * cancel the current selected line
         * @param {Object} options
         * @param {string} options.sublistId
         * @return {Record} same record, for chaining
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId is missing or undefined
         * @throws {SuiteScriptError} SSS_INVALID_SUBLIST_OPERATION if sublistId is invalid or if machine is not editable
         * @restriction only available in dynamic record
         */

        this.cancelLine = function (options) { };

        /**
         * commit the current selected line
         * @param {Object} options
         * @param {string} options.sublistId
         * @return {Record} same record, for chaining
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId is missing or undefined
         * @throws {SuiteScriptError} SSS_INVALID_SUBLIST_OPERATION if invalid sublist id
         * @restriction only available in dynamic record
         */

        this.commitLine = function (options) { };

        /**
         * return value of a sublist field on the current selected sublist line
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {string} options.fieldId
         * @return {(number|Date|string|Array|boolean)}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId or fieldId is missing
         * @throws {SuiteScriptError} SSS_INVALID_SUBLIST_OPERATION if invalid sublist id or field id
         * @restriction only available in dynamic record
         */

        this.getCurrentSublistValue = function (options) { };

        /**
         * set the value for field in the current selected line
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {string} options.fieldId
         * @param {(number|Date|string|Array|boolean)} options.value
         * @param {boolean} [options.ignoreFieldChange=false] ignore field change script and slaving event if set to true
         * @return {Record} same record, for chaining
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId or fieldId is missing
         * @throws {SuiteScriptError} A_SCRIPT_IS_ATTEMPTING_TO_EDIT_THE_1_SUBLIST_THIS_SUBLIST_IS_CURRENTLY_IN_READONLY_MODE_AND_CANNOT_BE_EDITED_CALL_YOUR_NETSUITE_ADMINISTRATOR_TO_DISABLE_THIS_SCRIPT_IF_YOU_NEED_TO_SUBMIT_THIS_RECORD
         *     if user tries to edit readonly sublist field
         */

        this.setCurrentSublistValue = function (options) { };

        /**
         * return the value for field in the current selected line by text representation
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {string} options.fieldId
         * @return {(number|Date|string|Array|boolean)}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId or fieldId is missing
         * @throws {SuiteScriptError} SSS_INVALID_SUBLIST_OPERATION if invalid sublist id or field id
         * @restriction only available in dynamic record
         */

        this.getCurrentSublistText = function (options) { };

        /**
         * set the value for field in the current selected line by text representation
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {string} options.fieldId
         * @param {(number|Date|string|Array|boolean)} options.text
         * @param {boolean} [options.ignoreFieldChange=false] ignore field change script and slaving event if set to true
         * @return {Record} same record, for chaining
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId or fieldId is missing
         * @throws {SuiteScriptError} A_SCRIPT_IS_ATTEMPTING_TO_EDIT_THE_1_SUBLIST_THIS_SUBLIST_IS_CURRENTLY_IN_READONLY_MODE_AND_CANNOT_BE_EDITED_CALL_YOUR_NETSUITE_ADMINISTRATOR_TO_DISABLE_THIS_SCRIPT_IF_YOU_NEED_TO_SUBMIT_THIS_RECORD
         *     if user tries to edit readonly sublist field
         * @restriction only available in dynamic record
         */

        this.setCurrentSublistText = function (options) { };

        /**
         * save record updates to the system
         * @governance 20 units for transactions, 4 for custom records, 10 for all other records
         *
         * @param {Object} options
         * @param {boolean} [options.enableSourcing=false] enable sourcing during record update
         * @param {boolean} [options.ignoreMandatoryFields=false] ignore mandatory field during record submission
         * @return {number} id of submitted record
         */

        this.save = function (options) { };
        this.save.promise = function (options) { };

        /**
         * return a value indicating if the field has a subrecord
         * @param {Object} options
         * @param {string} options.fieldId
         * @return {boolean}
         */

        this.hasSubrecord = function (options) { };

        /**
         * get the subrecord for the associated field
         * @param {Object} options
         * @param {string} options.fieldId
         * @return {Record} [client-side subrecord implementation]
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if options.fieldId is missing or undefined
         * @throws {SuiteScriptError} FIELD_1_IS_NOT_A_SUBRECORD_FIELD if field is not a subrecord field
         * @throws {SuiteScriptError} FIELD_1_IS_DISABLED_YOU_CANNOT_APPLY_SUBRECORD_OPERATION_ON_THIS_FIELD if field is disable
         */

        this.getSubrecord = function (options) { };

        /**
         * remove the subrecord for the associated field
         * @param {Object} options
         * @param {string} options.fieldId
         * @return {Record} same record, for chaining
         */

        this.removeSubrecord = function (options) { };

        /**
         * return a value indicating if the associated sublist field has a subrecord
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {string} options.fieldId
         * @param {number} options.line
         * @restriction only available in deferred dynamic record
         * @return {boolean}
         */

        this.hasSublistSubrecord = function (options) { };

        /**
         * get the subrecord for the associated sublist field
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {string} options.fieldId
         * @param {number} options.line
         * @restriction only available in deferred dynamic record
         * @return {Record} [client-side subrecord implementation]
         */

        this.getSublistSubrecord = function (options) { };

        /**
         * remove the subrecord for the associated sublist field
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {string} options.fieldId
         * @param {number} options.line
         * @restriction only available in deferred dynamic record
         * @return {Record} same record, for chaining
         */

        this.removeSublistSubrecord = function (options) { };

        /**
         * return a value indicating if the associated sublist field has a subrecord on the current line
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {string} options.fieldId
         * @restriction only available in dynamic record
         * @return {boolean}
         */

        this.hasCurrentSublistSubrecord = function (options) { };

        /**
         * get the subrecord for the associated sublist field on the current line
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {string} options.fieldId
         * @restriction only available in dynamic record
         * @return {Record} [client-side subrecord implementation]
         */

        this.getCurrentSublistSubrecord = function (options) { };

        /**
         * remove the subrecord for the associated sublist field on the current line
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {string} options.fieldId
         * @restriction only available in dynamic record
         * @return {Record} same record, for chaining
         */

        this.removeCurrentSublistSubrecord = function (options) { };

        /**
         * returns the specified sublist
         * @param {Object} options
         * @param {string} options.sublistId
         * @return {Sublist} [requested sublist]
         */

        this.getSublist = function (options) { };

        /**
         * return array of names of all fields in a sublist
         * @param {Object} options
         * @param {string} options.sublistId
         * @return {Array}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if options.sublistId is missing or undefined
         */

        this.getSublistFields = function (options) { };

        /**
         * return field object from record
         * @param {Object} options
         * @param {string} options.fieldId
         * @return {Field}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if options.fieldId is missing or undefined
         */

        this.getField = function (options) { };

        /**
         * return field object from record's sublist
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {string} options.fieldId
         * @param {number} options.line
         * @return {Field} [requested field]
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId or fieldId is missing
         * @throws {SuiteScriptError} SSS_INVALID_SUBLIST_OPERATION if line number is invalid
         */

        this.getSublistField = function (options) { };

        /**
         * return field object from record's sublist current line
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {string} options.fieldId
         * @return {Field}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId or fieldId is missing
         * @restriction only available in dynamic record
         */

        this.getCurrentSublistField = function (options) { };

        /**
         * set the value for the associated header in the matrix
         * @param {Object} options
         * @param {string} options.sublistId the id of sublist in which the matrix is in.
         * @param {string} options.fieldId the id of the matrix field
         * @param {number} options.column the column number for the field
         * @param {string} options.value the value to set it to
         * @param {boolean} [options.ignoreFieldChange] Ignore the field change script (default false)
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if any required values are missing
         * @return {Record} same record, for chaining
         */

        this.setMatrixHeaderValue = function (options) { };

        /**
         * get the value for the associated header in the matrix
         * @param {Object} options
         * @param {string} options.sublistId the id of sublist in which the matrix is in.
         * @param {string} options.fieldId the id of the matrix field
         * @param {number} options.column the column number for the field
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if any required values are missing
         * @return {number|Date|string}
         */

        this.getMatrixHeaderValue = function (options) { };

        /**
         * set the value for the associated field in the matrix
         * @param {Object} options
         * @param {string} options.sublistId the id of sublist in which the matrix is in.
         * @param {string} options.fieldId the id of the matrix field
         * @param {number} options.line the line number for the field
         * @param {number} options.column the column number for the field
         * @param {string} options.value the value to set it to
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if any required values are missing
         * @restriction only available in deferred dynamic record
         * @return {Record} same record, for chaining
         */

        this.setMatrixSublistValue = function (options) { };

        /**
         * get the value for the associated field in the matrix
         * @param {Object} options
         * @param {string} options.sublistId the id of sublist in which the matrix is in.
         * @param {string} options.fieldId the id of the matrix field
         * @param {number} options.line the line number for the field
         * @param {number} options.column the column number for the field
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if any required values are missing
         * @return {number|Date|string}
         */

        this.getMatrixSublistValue = function (options) { };

        /**
         * get the field for the specified header in the matrix
         * @param {Object} options
         * @param {string} options.sublistId the id of sublist in which the matrix is in.
         * @param {string} options.fieldId the id of the matrix field
         * @param {number} options.column the column number for the field
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if any required values are missing
         * @return {Field} [requested field]
         */

        this.getMatrixHeaderField = function (options) { };

        /**
         * get the field for the specified sublist in the matrix
         * @param {Object} options
         * @param {string} options.sublistId the id of sublist in which the matrix is in.
         * @param {string} options.fieldId the id of the matrix field
         * @param {number} options.column the column number for the field
         * @param {number} options.line the line number for the field
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if any required values are missing
         * @return {Field} [requested field]
         */

        this.getMatrixSublistField = function (options) { };

        /**
         * returns the line number of the first line that contains the specified value in the specified column of the matrix
         * @param {Object} options
         * @param {string} options.sublistId the id of sublist in which the matrix is in.
         * @param {string} options.fieldId the id of the matrix field
         * @param {number} options.value the column number for the field
         * @param {number} options.column the line number for the field
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if any required values are missing
         * @return {number}
         */

        this.findMatrixSublistLineWithValue = function (options) { };

        /**
         * returns the number of columns for the specified matrix.
         * @param {Object} options
         * @param {string} options.sublistId the id of sublist in which the matrix is in.
         * @param {string} options.fieldId the id of the matrix field
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if any required values are missing
         * @return {number}
         */

        this.getMatrixHeaderCount = function (options) { };

        /**
         * set the value for the line currently selected in the matrix
         * @param {Object} options
         * @param {string} options.sublistId - the id of sublist in which the matrix is in.
         * @param {string} options.fieldId - the id of the matrix field
         * @param {number} options.column - the column number for the field
         * @param {string} options.value - the value to set it to
         * @param {boolean} options.ignoreFieldChange (optional) - Ignore the field change script (default false)
         * @param {boolean} options.fireSlavingSync (optional) - Flag to perform slaving synchronously (default false)
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if any required values are missing
         * @restriction only available in dynamic record
         * @return {Record} same record, for chaining
         */

        this.setCurrentMatrixSublistValue = function (options) { };

        /**
         * get the value for the line currently selected in the matrix
         * @param {Object} options
         * @param {string} options.sublistId - the id of sublist in which the matrix is in.
         * @param {string} options.fieldId - the id of the matrix field
         * @param {number} options.column - the column number for the field
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if any required values are missing
         * @restriction only available in dynamic record
         * @return {number|Date|string}
         */

        this.getCurrentMatrixSublistValue = function (options) { };
    }

    return new Record();
});