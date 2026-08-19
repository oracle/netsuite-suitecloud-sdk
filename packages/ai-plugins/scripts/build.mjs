/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { buildPlugins } from './lib/plugin-builder.mjs';
const args = process.argv.slice(2);
const pluginArgIndex = args.indexOf('--plugin');
const pluginName = pluginArgIndex >= 0 ? args[pluginArgIndex + 1] : null;

if (pluginArgIndex >= 0 && !pluginName) {
	throw new Error('--plugin requires a provider-qualified source key or a unique plugin id');
}

const results = await buildPlugins(pluginName ? [pluginName] : []);

for (const result of results) {
	console.log(`Built ${result.plugin.sourceKey} -> ${result.outputDir}`);
}
