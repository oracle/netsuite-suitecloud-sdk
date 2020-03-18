'use strict';

const ActionResult = require('../commands/actionresult/ActionResult');
const { SUCCESS } = require('../commands/actionresult/ActionResult')

class DefaultActionResultMapper {
    constructor() { }
    createActionResultFrom(operationResult) {
        if (operationResult.status === SUCCESS) {
            return new ActionResult.Builder().withSuccess(operationResult.data, operationResult.resultMessage).build();
        }
        else {
            return new ActionResult.Builder().withError(operationResult.errorMessages);
        }
    }
}

module.exports = DefaultActionResultMapper;