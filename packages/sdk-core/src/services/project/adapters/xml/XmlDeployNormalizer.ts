/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

import type { DeployScript, ProjectDeploySkeleton } from '../../SuiteCloudControlFileTypes';
import { getDeployPathGroup } from '../utils/ProjectDeployNormalizerUtils';
import { CONTROL_FILE_FIELDS } from '../../SuiteCloudProjectConstants';
import { getXmlRoot, xmlChildren, xmlText, type XmlNode } from './XmlControlFileParser';

const { DEPLOY } = CONTROL_FILE_FIELDS;

export function normalizeXmlDeploy(document: unknown, filename: string): ProjectDeploySkeleton {
	const deploy = getXmlRoot(document, filename, DEPLOY.ROOT);
	const result: ProjectDeploySkeleton = {};
	for (const child of xmlChildren(deploy)) {
		const groupId = child['#name'];
		if (groupId === DEPLOY.RUN) {
			(result.run ??= []).push(...parseScripts(child));
		} else {
			const paths = getDeployPathGroup(result, groupId, filename, `/${DEPLOY.ROOT}/${groupId}`);
			paths.push(...xmlChildren(child, DEPLOY.PATH).map(xmlText));
		}
	}
	return result;
}

function parseScripts(run: XmlNode): DeployScript[] {
	return xmlChildren(run, DEPLOY.SCRIPT).map((script) => ({
		path: xmlText(xmlChildren(script, DEPLOY.PATH)[0]),
		deployment: xmlText(xmlChildren(script, DEPLOY.DEPLOYMENT)[0]),
	}));
}
