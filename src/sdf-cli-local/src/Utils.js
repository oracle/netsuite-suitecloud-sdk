/*
** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
'use strict';

const xml_parser = require('fast-xml-parser');
const fs = require('fs');
const path = require('path');
const glob = require('glob').sync;
const _ = require('underscore');
const async = require('async');
const { promisify } = require('util');

const Translation = require('./services/Translation');

const Utils = {
	parseXml: (project_folder, xml_file) => {
		let file_path = path.join(project_folder, '**', xml_file);
		file_path = glob(file_path);
		file_path = file_path.length ? file_path[0] : null;

		if (!file_path) {
			throw Translation.getMessage('RESOURCE_NOT_FOUND', [xml_file, project_folder]);
		}

		const xml_data = fs.readFileSync(file_path).toString();
		if (!xml_parser.validate(xml_data)) {
			throw Translation.getMessage('INVALID_XML', [file_path]);
		}

		const parsed_xml = xml_parser.parse(xml_data, {});

		return parsed_xml;
	},

	parseFiles: (files_xml, replacer) => {
		let files = files_xml.files || {};
		files = files.file || {};
		files = _.map(files, file => {
			file = Utils.parseFileName(file);
			return replacer ? replacer(file) : file;
		});

		return files;
	},

	parseFileName: file => {
		const file_name = file.filename || file;
		return file_name.replace(/^\[(.*)\]$/, '$1');
	},

	runParallel: tasks => {
		const parallel = async.parallel;

		const wrapped_tasks = _.map(tasks, task => {
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
