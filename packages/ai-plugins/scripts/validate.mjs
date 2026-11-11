/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { loadWorkspace, getNormalizedSkills } from './lib/build-config.mjs';
const workspace = await loadWorkspace();

for (const plugin of workspace.plugins) {
	console.log(
		`Validated ${plugin.sourceKey}: ${plugin.id} (${plugin.platform}) with ${getNormalizedSkills(plugin).length} skills`
	);
}
