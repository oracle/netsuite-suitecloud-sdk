/*
 ** Copyright (c) 2026 Oracle and/or its affiliates. All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as fs from 'fs';
import * as path from 'path';
import { FILES, FOLDERS } from '../ApplicationConstants';
import { commandsInfoMap } from '../commandsMap';
import { CLIConfigurationService, ProjectInfoService } from '../util/ExtensionUtil';
import { ObjectProject } from './Configuration';

export function containsPath(parent: string, child: string): boolean {
	const relative = path.relative(parent, child);
	return relative === '' || (!path.isAbsolute(relative) && relative !== '..' && !relative.startsWith(`..${path.sep}`));
}

/** Reload project-owned configuration modules; leave SDK and installed dependencies cached. */
function clearConfigurationCache(filename: string, root: string, visited = new Set<string>()): void {
	if (visited.has(filename)) { return; }
	visited.add(filename);
	const cached = require.cache[filename];
	if (!cached) { return; }
	for (const child of cached.children) {
		if (containsPath(root, child.filename) && !child.filename.split(path.sep).includes('node_modules')) {
			clearConfigurationCache(child.filename, root, visited);
		}
	}
	delete require.cache[filename];
}

/** Called only after VS Code has granted workspace trust. */
export function resolveProjects(root: string, schemaUrl: string): ObjectProject[] {
	const configuration = path.join(root, FILES.SUITECLOUD_CONFIG_JS);
	const service = new CLIConfigurationService();
	if (fs.existsSync(configuration)) {
		clearConfigurationCache(require.resolve(configuration), fs.realpathSync(root));
	}
	service.initialize(root);
	const sources = new Set<string>([
		path.resolve(service.getProjectFolder()),
		path.resolve(service.getProjectFolder(commandsInfoMap.importobjects.cliCommandName)),
		path.resolve(service.getProjectFolder('account:import')),
	]);
	return [...sources].filter(source =>
		new ProjectInfoService(source).isSuiteCloudProject()
	).map(source => ({ root, source, objects: path.join(source, FOLDERS.OBJECTS), schemaUrl }));
}

export function projectForPath(projects: readonly ObjectProject[], filename: string): ObjectProject | undefined {
	const ranked = projects.map(project => ({ project, specificity: Math.max(
		containsPath(project.source, filename) ? project.source.length : -1,
		containsPath(project.root, filename) ? project.root.length : -1,
	) })).filter(match => match.specificity >= 0).sort((a, b) => b.specificity - a.specificity);
	// A root can resolve multiple command-specific source folders. Let the user choose in that case.
	return ranked.length && ranked.filter(match => match.specificity === ranked[0].specificity).length === 1 ? ranked[0].project : undefined;
}
