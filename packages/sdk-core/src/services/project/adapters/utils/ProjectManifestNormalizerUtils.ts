/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

import type { ProjectManifest } from '../../SuiteCloudControlFileTypes';

export function getApplicationId(this: Pick<ProjectManifest, 'publisherId' | 'projectId'>): string | undefined {
	const { publisherId, projectId } = this;
	return publisherId && projectId ? `${publisherId}.${projectId}` : undefined;
}
