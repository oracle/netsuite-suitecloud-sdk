/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import {
	ProjectAction,
	type ProjectActionDependencies,
	type ProjectActionInput,
} from './actions/project/ProjectAction';
import type { OperationResult } from './api/OperationResult';
import { DefaultProjectArchiveService } from './services/project/ProjectArchiveService';
import { DefaultProjectApiClient } from './services/project/ProjectApiClient';

export type SdkCoreDependencies = {
	project?: Partial<ProjectActionDependencies>;
};

export type SdkCore = {
	project: {
		execute(input: ProjectActionInput): Promise<OperationResult>;
	};
};

/**
 * Creates an sdk-core instance with explicit side-effecting dependencies.
 *
 * Production adapters are supplied by default. Tests and other clients can
 * replace only the ports they own without depending on a global DI container.
 */
export function createSdkCore(dependencies: SdkCoreDependencies = {}): SdkCore {
	const projectAction = new ProjectAction({
		archiveService:
			dependencies.project?.archiveService ?? new DefaultProjectArchiveService(),
		apiClient: dependencies.project?.apiClient ?? new DefaultProjectApiClient(),
	});

	return {
		project: {
			execute: (input) => projectAction.execute(input),
		},
	};
}
