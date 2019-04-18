'use strict';

const xml_parser = require('fast-xml-parser');
const fs = require('fs');
const path = require('path');
const glob = require('glob').sync;
const _ = require('underscore');
const async = require('async');

const { COMMAND_LOCAL } = require('./../../services/TranslationKeys');
const TranslationService = require('./../../services/TranslationService');
const NodeUtils = require('./../../utils/NodeUtils');

const Utils = {

	parseXml: (project_folder, xml_file) => {
		let file_path = path.join(project_folder, '**', xml_file);
		file_path = glob(file_path);
		file_path = file_path.length ? file_path[0] : null;

		if(!file_path){
			throw Utils.translate('RESOURCE_NOT_FOUND', [xml_file, project_folder]);
		}

		const xml_data = fs.readFileSync(file_path).toString();
		if(!xml_parser.validate(xml_data)){
			throw Utils.translate('INVALID_XML', [file_path]);
		}

		const parsed_xml = xml_parser.parse(xml_data, {});

		return parsed_xml;
	},

	translate: (key, params = []) => {
		return TranslationService.getMessage(
			COMMAND_LOCAL[key], ...params
		);
	},

	parseFiles: (files_xml) => {
		let files = files_xml.files || {};
		files = files.file || {};
		files = _.map(files, Utils.parseFileName);
		return files;
	},

	parseFileName: (file) => {
		const file_name = file.filename || file;
		return file_name.replace(/^\[(.*)\]$/, '$1');
	},

	runParallel: (tasks) => {

		const parallel = async.parallel;

		const wrapped_tasks = _.map(tasks, (task) => {
			return (callback) => {
				try {
					const promise = task();
					if (promise && promise.then) {
						return promise
							.then((result) => callback(null, result))
							.catch(callback);
					}
					callback(null, promise);
				} catch (error) {
					callback(error);
				}
			};
		});

		return new Promise((resolve, reject) => {
			parallel(wrapped_tasks, (error, results) => {
				if(error){
					return reject(error);
				}
				resolve(results);
			});
		});
	},

	createFolder: (folder_name, parent_path) => {
		const folder_path = path.join(parent_path, folder_name);

		if(!fs.existsSync(folder_path)){
			fs.mkdirSync(folder_path);
		}

		return folder_path;
	},

	COLORS: NodeUtils.COLORS,

	separator: (color = NodeUtils.COLORS.DEFAULT) => {
		NodeUtils.println('-------------------------------------------------', color);
	},

	log: (options) => {
		
		const date = new Date();
		const timestamp = [date.getHours(), date.getMinutes(), date.getSeconds()].join(':');
		
		const translation = Utils.translate(options.translation, options.params);
		const message = `[${timestamp}.${date.getMilliseconds()}] ${translation}`;

		NodeUtils.println(message, options.color || NodeUtils.COLORS.DEFAULT);
	}

};

module.exports = Utils;
