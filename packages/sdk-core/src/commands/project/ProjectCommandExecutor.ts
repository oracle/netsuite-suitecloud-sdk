/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import {
	createDefaultProjectAction,
	ProjectAction,
	type ProjectActionDependencies,
	type ProjectActionInput,
} from '../../actions/project/ProjectAction';
import type { OperationResult } from '../../api/project/ProjectCommand';
import { PROJECT_COMMAND, SDK_OPERATION_STATUS } from '../../api/project/ProjectCommand';
import {
	createDefaultProjectArchive,
	deleteFileQuietly,
} from '../../services/project/ProjectArchiveService';
import {
	sendDefaultProjectRequest,
	type ProjectHttpResponse,
} from '../../services/project/ProjectApiClient';

type LegacyDependencies = {
	createProjectArchive?: ProjectActionDependencies['archiveService']['create'];
	deleteFile?: ProjectActionDependencies['archiveService']['remove'];
	sendProjectRequest?: ProjectActionDependencies['apiClient']['send'];
};

export { PROJECT_COMMAND, SDK_OPERATION_STATUS };
export type { ProjectHttpResponse };

export function executeProjectCommand(
	input: ProjectActionInput,
	legacyDependencies: LegacyDependencies = {}
): Promise<OperationResult> {
	if (!hasLegacyDependencies(legacyDependencies)) {
		return createDefaultProjectAction().execute(input);
	}

	const action = new ProjectAction({
		archiveService: {
			create: legacyDependencies.createProjectArchive || createDefaultProjectArchive,
			remove: legacyDependencies.deleteFile || deleteFileQuietly,
		},
		apiClient: {
			send: legacyDependencies.sendProjectRequest || sendDefaultProjectRequest,
		},
	});

	return action.execute(input);
}

function hasLegacyDependencies(dependencies: LegacyDependencies): boolean {
	return Boolean(dependencies.createProjectArchive || dependencies.deleteFile || dependencies.sendProjectRequest);
}
