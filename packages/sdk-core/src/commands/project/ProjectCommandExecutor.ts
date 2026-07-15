/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import {
	ProjectAction,
	type ProjectActionDependencies,
	type ProjectActionInput,
} from '../../actions/project/ProjectAction';
import type { OperationResult } from '../../api/project/ProjectCommand';
import {
	createDefaultProjectArchive,
	deleteFileQuietly,
} from '../../services/project/ProjectArchiveService';
import {
	sendDefaultProjectRequest,
} from '../../services/project/ProjectApiClient';

type ProjectCommandDependencies = {
	createProjectArchive?: ProjectActionDependencies['archiveService']['create'];
	deleteFile?: ProjectActionDependencies['archiveService']['remove'];
	sendProjectRequest?: ProjectActionDependencies['apiClient']['send'];
};

export function executeProjectCommand(
	input: ProjectActionInput,
	dependencies: ProjectCommandDependencies = {}
): Promise<OperationResult> {
	const action = new ProjectAction({
		archiveService: {
			create: dependencies.createProjectArchive ?? createDefaultProjectArchive,
			remove: dependencies.deleteFile ?? deleteFileQuietly,
		},
		apiClient: {
			send: dependencies.sendProjectRequest ?? sendDefaultProjectRequest,
		},
	});

	return action.execute(input);
}
