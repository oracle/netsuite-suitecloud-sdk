/*
 ** Copyright (c) 2019 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

'use strict';

const LocalCommand = require('@oracle/netsuite-suitecloud-localserver-cli-command/src/LocalCommand');

let localCommand;

const options = {
	projectFolder: './',
	colors: jest.fn(),
	filesystem: jest.fn(),
	translation: [
		{ getMessage: jest.fn(key => key) },
		{
			COMPILATION_START: 'COMMAND_LOCAL_COMPILATION_START',
			COMPILATION_START_FOR: 'COMMAND_LOCAL_COMPILATION_START_FOR',
			COMPILATION_FINISH: 'COMMAND_LOCAL_COMPILATION_FINISH',
			COMPILATION_FINISH_FOR: 'COMMAND_LOCAL_COMPILATION_FINISH_FOR',
			SERVER: 'COMMAND_LOCAL_SERVER',
			WATCH: 'COMMAND_LOCAL_WATCH',
			SSP_LOCAL_FILES_INFO: 'COMMAND_LOCAL_SSP_LOCAL_FILES_INFO',
			CANCEL_ACTION: 'COMMAND_LOCAL_CANCEL_ACTION',
			CHOOSE_THEME: 'COMMAND_LOCAL_CHOOSE_THEME',
			CHOOSE_EXTENSION: 'COMMAND_LOCAL_CHOOSE_EXTENSION',
			OVERRIDE: 'COMMAND_LOCAL_OVERRIDE',
			NO_THEMES: 'COMMAND_LOCAL_NO_THEMES',
			RESOURCE_NOT_FOUND: 'COMMAND_LOCAL_RESOURCE_NOT_FOUND',
			INVALID_XML: 'COMMAND_LOCAL_INVALID_XML',
		},
	],
};

const objects = {
	extensions: {
		'custcommerceextension_extension1.xml': '/',
		'custcommerceextension_extension2.xml': '/',
	},
	themes: {
		'custcommercetheme_theme1.xml': '/',
		'custcommercetheme_theme2.xml': '/',
	},
};

localCommand = new LocalCommand(options);
localCommand.themes = objects.themes;
localCommand.extensions = objects.extensions;
localCommand.filesPath = './';
localCommand.objectsPath = './';

describe('executeAction', function() {
	it('should throw an exception when there are no themes objects in the objects folder', async () => {
		const answers = { theme: [], extensions: ['custcommerceextension_extension.xml'] };
		let error;
		try {
			await localCommand.executeAction(answers);
		} catch (err) {
			error = err;
		}
		expect(error).toBeDefined();
		expect(error.message).toContain('COMMAND_LOCAL_NO_THEMES');
	});

	it('should throw an exception when a theme object does not exist', async () => {
		const answers = {
			theme: 'custcommercetheme_unexistant.xml',
			extensions: [],
		};
		localCommand.themes = {
			'custcommercetheme_theme.xml': './',
		};
		let error;
		try {
			await localCommand.executeAction(answers);
		} catch (err) {
			error = err;
		}
		expect(error).toBeDefined();
		expect(error.message).toContain('COMMAND_LOCAL_RESOURCE_NOT_FOUND');
	});
});

describe('getCommandQuestions', function() {
	it('should call the callback and return prompt choices', async () => {
		const callback = jest.fn(options => options);

		const results = await localCommand.getCommandQuestions(callback);

		expect(results).toBeDefined();
		expect(results.length).toBeGreaterThan(0);

		const choices = [];
		results.forEach(result => choices.push(...result.choices));

		expect(choices).toContain('custcommercetheme_theme.xml');
		expect(choices).toContain('custcommerceextension_extension1.xml');
		expect(choices).toContain('custcommerceextension_extension2.xml');
	});
});
