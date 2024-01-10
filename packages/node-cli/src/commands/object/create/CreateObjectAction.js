/*
 ** Copyright (c) 2024 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

const TemplateKeys = require('../../../templates/TemplateKeys');
const BaseAction = require('../../base/BaseAction');
const FileSystemService = require('../../../services/FileSystemService');

module.exports = class CreateObjectAction extends BaseAction {
	constructor(options) {
		super(options);
		this._fileSystemService = new FileSystemService();
	}

	async execute(params) {
		const createFilePromise = this._fileSystemService.createFileFromTemplate({
			template: TemplateKeys.SCRIPTS['blankscript'],
			destinationFolder: params.relatedfiledestinationfolder,
			fileName: params.relatedfilename,
			fileExtension: 'js',
		});
		const createObjectPromise = this._fileSystemService.createFileFromTemplate({
			template: TemplateKeys.OBJECTS['commerceextension'],
			destinationFolder: params.folder,
			fileName: params.objectfilename,
			fileExtension: 'xml',
			bindings: [{ id: 'scriptid', value: params.type.prefix + params.objectfilename }],
		});
		await Promise.all([createFilePromise, createObjectPromise]);
	}
};
