'use strict';

const xml_parser = require('fast-xml-parser');
const fs = require('fs');
const path = require('path');
const glob = require('glob').sync;
const _ = require('underscore');
const async = require('async');

const Utils = {

	parseXml: (project_folder, xml_file) => {
		let file_path = path.join(project_folder, '**', xml_file);
		file_path = glob(file_path);
		file_path = file_path.length ? file_path[0] : null;

		if(!file_path){
			throw `${xml_file} was not found in ${project_folder}`;
		}

		const xml_data = fs.readFileSync(file_path).toString();
		if(!xml_parser.validate(xml_data)){
			throw `Invalid xml ${file_path}`;
		}

		const parsed_xml = xml_parser.parse(xml_data, {});

		return parsed_xml;
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

	COLORS: {
		CYAN: '36',
		RED: '31',
		GREEN: '32',
		YELLOW: '33',
	},

	log: (message, color) => {
		const date = new Date();
		const timestamp = [date.getHours(), date.getMinutes(), date.getSeconds()].join(':');
		message = `[${timestamp}.${date.getMilliseconds()}] ${message}`;

		if(color){
			return console.log(`\x1b[${color}m%s\x1b[0m`, message);
		}

		console.log(message);
	}

};

module.exports = Utils;
