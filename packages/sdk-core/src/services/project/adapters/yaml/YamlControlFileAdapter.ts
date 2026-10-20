/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

import type { ControlFileAdapter } from '../ControlFileAdapterTypes';
import { normalizeSdfV2Deploy, normalizeSdfV2Manifest } from '../sdfv2_commons/SDFv2ControlFileNormalizer';
import { parseYamlDocument } from './YamlControlFileParser';

export const yamlControlFileAdapter: ControlFileAdapter = {
	parseDocument: parseYamlDocument,
	normalizeManifest: normalizeSdfV2Manifest,
	normalizeDeploy: normalizeSdfV2Deploy,
};
