/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

import type { ControlFileAdapter } from '../ControlFileAdapterTypes';
import { parseXmlDocument } from './XmlControlFileParser';
import { normalizeXmlDeploy } from './XmlDeployNormalizer';
import { normalizeXmlManifest } from './XmlManifestNormalizer';

export const xmlControlFileAdapter: ControlFileAdapter = {
	parseDocument: parseXmlDocument,
	normalizeManifest: normalizeXmlManifest,
	normalizeDeploy: normalizeXmlDeploy,
};
