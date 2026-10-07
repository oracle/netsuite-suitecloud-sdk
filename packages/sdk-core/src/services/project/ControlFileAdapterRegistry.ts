/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

import { PROJECT_CONTROL } from '../translation/TranslationKeys';
import { translationService } from '../translation/TranslationService';
import type { ControlFileAdapter } from './ControlFileAdapterTypes';
import type { FileFormat, SuiteCloudControlFile } from './SuiteCloudControlFileTypes';
import { FILES } from './SuiteCloudProjectConstants';
import { xmlControlFileAdapter } from './xml/XmlControlFileAdapter';

// Discovery recognizes future formats; Phase 1 only provides the XML adapter.
const CONTROL_FILE_ADAPTERS: Partial<Record<FileFormat, ControlFileAdapter>> = {
	[FILES.FILE_FORMATS.XML]: xmlControlFileAdapter,
};

export function getControlFileAdapter(file: SuiteCloudControlFile): ControlFileAdapter {
	const adapter = CONTROL_FILE_ADAPTERS[file.format];
	if (!adapter) {
		throw new Error(translationService.getMessage(PROJECT_CONTROL.ERROR.FORMAT_UNSUPPORTED, file.filename));
	}
	return adapter;
}
