'use strict';

const ActionResult = require('../commands/actionresult/ActionResult');
const { SUCCESS } = require('../commands/actionresult/ActionResult')

class DefaultActionResultMapper {
    constructor() { }
    createActionResultFrom(operationResult) {
        if (operationResult.status === SUCCESS) {
            return ActionResult.Builder
                .withSuccess()
                .withData(operationResult.data)
                .withResultMessage(operationResult.resultMessage)
                .build();
        }
        else {
            return new ActionResult.Builder.withError(operationResult.errorMessages);
        }
    }
}

module.exports = new DefaultActionResultMapper();
module.exports.class = DefaultActionResultMapper;