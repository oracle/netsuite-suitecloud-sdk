/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

import { homedir } from 'os';
import { join } from 'path';
import { sdkDownloadUrl, sdkFilename } from './extension.config.json';

export const SDK_DOWNLOAD_URL = sdkDownloadUrl;
export const SDK_FILENAME = sdkFilename;

export const SUITECLOUD_FOLDER = '.suitecloud-sdk';
export const VSCODE_SDK_FOLDER = 'vscode';
export const sdkPath = join(homedir(), SUITECLOUD_FOLDER, VSCODE_SDK_FOLDER, SDK_FILENAME);
