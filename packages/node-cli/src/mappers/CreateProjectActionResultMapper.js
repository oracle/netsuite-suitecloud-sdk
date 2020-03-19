'use strict';
const ActionResult = require('../commands/actionresult/ActionResult');
const CreateProjectActionResult = require('../commands/actionresult/CreateProjectActionResult');
const DefaultActionResultMapper = require('./DefaultActionResultMapper');


class CreateProjectActionResultMapper extends DefaultActionResultMapper.class {
    constructor() {
        super()
    }

    createActionResultFrom(actionCreateProjectData, projectType, includeUnitTesting) {
        if (actionCreateProjectData.operationResult.status === ActionResult.SUCCESS) {
            return CreateProjectActionResult.Builder
                .withSuccess()
                .withData(actionCreateProjectData.operationResult.data)
                .withResultMessage(actionCreateProjectData.operationResult.resultMessage)
                .withProjectType(projectType)
                .fromDirectory(actionCreateProjectData.projectDirectory)
                .withUnitTesting(includeUnitTesting)
                .withSuccessfullNpmInstalled(actionCreateProjectData.operationResult)
                .build();

        }
        else {
            return CreateProjectActionResult.Builder
                .withError(actionCreateProjectData.operationResult.errorMessages)
                .withResultMessage(actionCreateProjectData.operationResult.resultMessage)
                .build();
        }
    }
}

module.exports = new CreateProjectActionResultMapper();