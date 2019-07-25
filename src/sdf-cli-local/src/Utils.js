/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
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
	parseXml(project_folder, xml_file) {
		let file_path = path.join(project_folder, '**', xml_file);
		file_path = glob(file_path);
		file_path = file_path.length ? file_path[0] : null;

		if (!file_path) {
			throw Translation.getMessage('RESOURCE_NOT_FOUND', [xml_file, project_folder]);
		}

		const xml_data = fs.readFileSync(file_path).toString();

		let parsed_xml = {};

		new Parser({ explicitArray: false, trim: true, emptyTag: null }).parseString(
			xml_data,
			function(error, result) {
				if (error) {
					throw error;
				}
				parsed_xml = result;
			}
		);

		return parsed_xml;
	},

	arrayUnion(arr1, arr2 = []) {
		return [...new Set([...arr1, ...arr2])];
	},

	parseFiles(files_xml, replacer) {
		const parsed_files = [];
		let files = files_xml.files || {};
		files = files.file || {};
		for (const key in files) {
			const file = Utils.parseFileName(files[key]);
			parsed_files.push(replacer ? replacer(file) : file);
		}
		return parsed_files;
	},

	parseFileName(file) {
		const file_name = file.filename || file;
		return file_name.replace(/^\[(.*)\]$/, '$1');
	},

	runParallel(tasks) {
		const parallel = async.parallel;

		const wrapped_tasks = tasks.map(task => {
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

		return promisify(parallel)(wrapped_tasks);
	},
};

module.exports = Utils;
