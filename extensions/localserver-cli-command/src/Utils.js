/*
** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const { Parser } = require('xml2js');
const fs = require('fs');
const path = require('path');
const glob = require('glob').sync;
const async = require('async');
const { promisify } = require('util');

const Translation = require('./services/Translation');

const Utils = {
	parseXml(projectFolder, xmlFile) {
		let filePath = path.join(projectFolder, '**', xmlFile);
		filePath = glob(filePath);
		filePath = filePath.length ? filePath[0] : null;

		if (!filePath) {
			throw Translation.getMessage('RESOURCE_NOT_FOUND', [xmlFile, projectFolder]);
		}

		const xmlData = fs.readFileSync(filePath).toString();

		let parsedXml = {};

		new Parser({ explicitArray: false, trim: true, emptyTag: null }).parseString(
			xmlData,
			function(error, result) {
				if (error) {
					throw error;
				}
				parsedXml = result;
			}
		);

		return parsedXml;
	},

	arrayUnion(arr1, arr2 = []) {
		return [...new Set([...arr1, ...arr2])];
	},

	parseFiles(filesXml, replacer) {
		const parsedFiles = [];
		let files = filesXml.files || {};
		files = files.file || {};
		for (const key in files) {
			const file = Utils.parseFileName(files[key]);
			parsedFiles.push(replacer ? replacer(file) : file);
		}
		return parsedFiles;
	},

	parseFileName(file) {
		const fileName = file.filename || file;
		return fileName.replace(/^\[(.*)\]$/, '$1');
	},

	runParallel(tasks) {
		const parallel = async.parallel;

		const wrappedTasks = tasks.map(task => {
			return callback => {
				try {
					const promise = task();
					if (promise && promise.then) {
						return promise.then(result => callback(null, result)).catch(callback);
					}
					callback(null, promise);
				} catch (error) {
					callback(error);
				}
			};
		});

		return promisify(parallel)(wrappedTasks);
	},
};

module.exports = Utils;
