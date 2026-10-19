/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

import type { ProjectDeploySkeleton, ProjectManifestSkeleton } from '../SuiteCloudControlFileTypes';
export interface ControlFileAdapter {
	parseDocument(contents: string, filename: string): unknown;
	normalizeManifest(document: unknown, filename: string): ProjectManifestSkeleton;
	normalizeDeploy(document: unknown, filename: string): ProjectDeploySkeleton;
};
