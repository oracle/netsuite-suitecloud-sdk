/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const path = require('path');
const webpack = require('webpack');

module.exports = {
	mode: 'production',
	target: 'node22',
	entry: path.resolve(__dirname, 'src/suitecloud.js'),
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'suitecloud.js',
		clean: true,
	},
	devtool: false,
	optimization: {
		minimize: false,
		splitChunks: false,
		runtimeChunk: false,
	},
	externalsPresets: {
		node: true,
	},
	module: {
		rules: [
			{ resourceQuery: /source/, type: 'asset/source' },
			{ test: /[\\/]templates[\\/].*\.(?:xml|template)$/, type: 'asset/source' },
		],
	},
	plugins: [
		new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
		new webpack.BannerPlugin({
			banner: '#!/usr/bin/env node',
			raw: true,
			entryOnly: true,
		}),
	],
};