/*
 ** Copyright (c) 2026 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const packageRoot = __dirname;

module.exports = {
	mode: 'production',
	target: 'node',
	entry: path.resolve(packageRoot, 'src/suitecloud.js'),
	output: {
		path: path.resolve(packageRoot, 'dist'),
		filename: 'src/suitecloud.js',
		clean: true,
	},
	devtool: 'source-map',
	optimization: {
		minimize: false,
	},
	externalsPresets: {
		node: true,
	},
	// The CLI resolves command generators and metadata from disk at runtime.
	// Keeping imports external preserves native CommonJS resolution and __dirname.
	externals: [
		({ context, request }, callback) => {
			if (!request) {
				return callback();
			}
			// Webpack presents the absolute entry as a request too; it must be bundled
			// so the distribution never refers back to this source checkout.
			if (context === packageRoot && path.resolve(context, request) === path.resolve(packageRoot, 'src/suitecloud.js')) {
				return callback();
			}

			return callback(null, `commonjs ${request}`);
		},
	],
	plugins: [
		new webpack.BannerPlugin({
			banner: '#!/usr/bin/env node',
			raw: true,
			entryOnly: true,
		}),
		new CopyWebpackPlugin({
			patterns: [
				{
					from: path.resolve(packageRoot, 'src'),
					to: 'src',
					globOptions: {
						ignore: ['**/suitecloud.js'],
					},
				},
				{ from: path.resolve(packageRoot, 'messages.json'), to: 'messages.json' },
				{ from: path.resolve(packageRoot, 'resources'), to: 'resources' },
				{ from: path.resolve(packageRoot, 'package.json'), to: 'package.json' },
				{ from: path.resolve(packageRoot, 'postinstall.js'), to: 'postinstall.js' },
				{ from: path.resolve(packageRoot, 'README.md'), to: 'README.md' },
			],
		}),
	],
};