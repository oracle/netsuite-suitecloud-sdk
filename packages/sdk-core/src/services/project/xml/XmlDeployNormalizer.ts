/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/upl.
 */
'use strict';

import type { DeployGroup, DeployPath, DeployScript } from '../SuiteCloudControlFileTypes';
import { XML_TAGS } from '../SuiteCloudProjectConstants';
import { getXmlRoot, xmlChildren, xmlText, type XmlNode } from './XmlControlFileParser';

/* As of now Deploy.xml is only scanning for DeployGroups and doesn't check what it's actually packing.
 * Allowed groups (extracted from Java):
 * 		<configuration> (ACP only)
 * 		<files> (both)
 * 		<objects> (both)
 * 		<run> (SuitAapp only)
 * 		<translationimports> (both)
 *
 * 		Each item in DeployGroup can be a folder using a wildcard (include recursively) or a line per file (no wildcard, targeted include).
 * 		See: https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4737888643.html#bridgehead_4737993693
 *
 * 	TODO: Should we restrict the structure/allowed Groups? validate them? Read them accordingly?
 *   	TBD: Leave as it is or go for an approach more similar to ProjectManifest.
 */

export function normalizeXmlDeploy(document: unknown, filename: string): DeployGroup[] {
	const deploy = getXmlRoot(document, filename, XML_TAGS.DEPLOY);
	const counts = new Map<string, number>();
	const groups: DeployGroup[] = [];
	for (const child of xmlChildren(deploy)) {
		const kind = child['#name'];
		const index = (counts.get(kind) ?? 0) + 1;
		counts.set(kind, index);
		const propertyPath = `/${XML_TAGS.DEPLOY}/${kind}[${index}]`;
		const paths = xmlChildren(child, XML_TAGS.PATH).map((path, pathIndex) => ({
			value: xmlText(path),
			source: { file: filename, propertyPath: `${propertyPath}/${XML_TAGS.PATH}[${pathIndex + 1}]` },
		}));
		const scripts = kind === XML_TAGS.RUN ? parseScripts(child, filename, propertyPath) : [];
		groups.push({ kind, paths, scripts, source: { file: filename, propertyPath } });
	}
	return groups;
}

function parseScripts(run: XmlNode, filename: string, groupPath: string): DeployScript[] {
	return xmlChildren(run, XML_TAGS.SCRIPT).map((script, index) => {
		const propertyPath = `${groupPath}/${XML_TAGS.SCRIPT}[${index + 1}]`;
		const path: DeployPath = {
			value: xmlText(xmlChildren(script, XML_TAGS.PATH)[0]),
			source: { file: filename, propertyPath: `${propertyPath}/${XML_TAGS.PATH}[1]` },
		};
		return {
			path,
			deployment: xmlText(xmlChildren(script, XML_TAGS.DEPLOYMENT)[0]),
			deploymentSource: { file: filename, propertyPath: `${propertyPath}/${XML_TAGS.DEPLOYMENT}[1]` },
			source: { file: filename, propertyPath },
		};
	});
}
