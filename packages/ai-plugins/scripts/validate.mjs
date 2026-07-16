import { loadWorkspace, getNormalizedSkills } from './lib/build-config.mjs';

const workspace = await loadWorkspace();

for (const plugin of workspace.plugins) {
	console.log(
		`Validated ${plugin.sourceDirectoryName}: ${plugin.id} (${plugin.platform}) with ${getNormalizedSkills(plugin).length} skills`
	);
}
