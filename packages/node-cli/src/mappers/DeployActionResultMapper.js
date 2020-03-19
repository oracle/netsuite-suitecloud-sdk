'use strict';
const ActionResult = require('../commands/actionresult/ActionResult');
const DeployActionResult = require('../commands/actionresult/DeployActionResult');
const DefaultActionResultMapper = require('./DefaultActionResultMapper')


class DeployActionResultMapper extends DefaultActionResultMapper {
    constructor() {
        super()
    }

    createActionResultFrom(operationResult, isValidate, isApplyProtection) {
        if (operationResult.status === SUCCESS) {
            return DeployActionResult.Builder
                .withSuccess()
                .withData(operationResult.data)
                .withResultMessage(operationResult.resultMessage)
                .withValidate(isValidate)
                .withAppliedProtection(isApplyProtection)
                .build();
        }
        else {
            return new DeployActionResult.Builder().withError(operationResult.errorMessages);
        }
    }
}

module.exports = new DeployActionResultMapper();