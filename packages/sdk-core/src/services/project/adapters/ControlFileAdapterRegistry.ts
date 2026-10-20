/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

import { PROJECT_CONTROL } from '../../translation/TranslationKeys';
import { translationService } from '../../translation/TranslationService';
import type { ControlFileAdapter } from './ControlFileAdapterTypes';
import type { SdfSupportedFileFormat, SdfControlFileMetadata } from '../SuiteCloudControlFileTypes';
import { SDF_SUPPORTED_FILE_FORMATS } from '../SuiteCloudProjectConstants';
import { jsonControlFileAdapter } from './json/JsonControlFileAdapter';
import { xmlControlFileAdapter } from './xml/XmlControlFileAdapter';
import { yamlControlFileAdapter } from './yaml/YamlControlFileAdapter';

const CONTROL_FILE_ADAPTERS: Record<SdfSupportedFileFormat, ControlFileAdapter> = {
	[SDF_SUPPORTED_FILE_FORMATS.XML]: xmlControlFileAdapter,
	[SDF_SUPPORTED_FILE_FORMATS.JSON]: jsonControlFileAdapter,
	[SDF_SUPPORTED_FILE_FORMATS.YAML]: yamlControlFileAdapter,
	[SDF_SUPPORTED_FILE_FORMATS.YML]: yamlControlFileAdapter,
};

export function getControlFileAdapter(file: SdfControlFileMetadata): ControlFileAdapter {
	const adapter = CONTROL_FILE_ADAPTERS[file.fileFormat];
	if (!adapter) {
		throw new Error(translationService.getMessage(PROJECT_CONTROL.ERROR.FORMAT_UNSUPPORTED, file.fileName));
	}
	return adapter;
}
