'use strict';
const ActionResult = require('../commands/actionresult/ActionResult');
const CreateProjectActionResult = require('../commands/actionresult/CreateProjectActionResult');
const DefaultActionResultMapper = require('./DefaultActionResultMapper');


class CreateProjectActionResultMapper extends DefaultActionResultMapper {
    constructor() {
        super()
    }

    createActionResultFrom(actionCreateProjectData, projectType, includeUnitTesting) {
        if (actionCreateProjectData.operationResult.status === ActionResult.SUCCESS) {
            return CreateProjectActionResult.Builder.withSuccess(
                actionCreateProjectData.operationResult.data,
                actionCreateProjectData.operationResult.resultMessage,
                projectType,
                actionCreateProjectData.projectDirectory,
                includeUnitTesting,
                actionCreateProjectData.npmInstallSuccess
            ).build();
        }
        else {
            return CreateProjectActionResult.Builder.withError(actionCreateProjectData.operationResult.errorMessages);
        }
    }
}

module.exports = new CreateProjectActionResultMapper();