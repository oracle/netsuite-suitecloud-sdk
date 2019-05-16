'use strict';

const {
	validateFieldIsNotEmpty,
	validateFieldHasNoSpaces,
	validateFieldIsLowerCase,
	validatePublisherId,
	validateProjectVersion,
	validateArrayIsNotEmpty,
	validateSuiteApp,
	validateScriptId,
} = require('../InteractiveAnswersValidator');

describe('validateFieldIsNotEmpty', function() {
	it('should return true when string is not empty', function() {
		const expected = { result: true };
		expect(validateFieldIsNotEmpty('NoneEmptyString')).toEqual(expected);
	});

	it('should return false with validation message when string is empty', function() {
		const expected = { result: false, validationMessage: 'Error: This field cannot be empty.' };
		expect(validateFieldIsNotEmpty('')).toEqual(expected);
	});
});

describe('validateFieldHasNoSpaces', function() {
	it('should return true when string has no spaces', function() {
		const expected = { result: true };
		expect(validateFieldHasNoSpaces('StringNoSpaces')).toEqual(expected);
	});

	it('should return false with validation message when string has spaces', function() {
		const expected = {
			result: false,
			validationMessage: 'Error: This field cannot contain spaces.',
		};
		expect(validateFieldHasNoSpaces('String with spaces')).toEqual(expected);
	});
});

describe('validateFieldIsLowerCase', function() {
	it('should return true when string is in lower case', function() {
		const expected = { result: true };
		expect(validateFieldIsLowerCase('lowercase')).toEqual(expected);
	});

	it('should return false with validation message when string is not all in lower case', function() {
		const expected = {
			result: false,
			validationMessage: 'Error: This field must be in lower case.',
		};
		expect(validateFieldIsLowerCase('WithUpperCase')).toEqual(expected);
	});
});

describe('validatePublisherId', function() {
	it('should return true when string is in valid publisher id format', function() {
		const expected = { result: true };
		expect(validatePublisherId('com.netsuite')).toEqual(expected);
	});

	it('should return false with validation message when string does not have a "."', function() {
		const expected = {
			result: false,
			validationMessage:
				'Error: The publisher ID must be a fully qualified name, such as com.netsuite. It must contain lowercase alphanumeric characters and exactly one period. The ID may not begin or end with a period.',
		};
		expect(validatePublisherId('comnetsuite')).toEqual(expected);
	});

	it('should return false with validation message when string is not all in lower case', function() {
		const expected = {
			result: false,
			validationMessage:
				'Error: The publisher ID must be a fully qualified name, such as com.netsuite. It must contain lowercase alphanumeric characters and exactly one period. The ID may not begin or end with a period.',
		};
		expect(validatePublisherId('Com.netsuite')).toEqual(expected);
	});

	it('should return false with validation message when string has more than one "."', function() {
		const expected = {
			result: false,
			validationMessage:
				'Error: The publisher ID must be a fully qualified name, such as com.netsuite. It must contain lowercase alphanumeric characters and exactly one period. The ID may not begin or end with a period.',
		};
		expect(validatePublisherId('Com.net.suite')).toEqual(expected);
	});
});

describe('validateProjectVersion', function() {
	it('should return true when string is in valid project version format', function() {
		const expected = { result: true };
		expect(validateProjectVersion('1.0.0')).toEqual(expected);
	});

	it('should return false with validation message when string has letters', function() {
		const expected = {
			result: false,
			validationMessage:
				'The project version must only contain digits and dots in the format "0.0.0".',
		};
		expect(validateProjectVersion('1.a.b')).toEqual(expected);
	});

	it('should return false with validation message when string has less than 3 digits', function() {
		const expected = {
			result: false,
			validationMessage:
				'The project version must only contain digits and dots in the format "0.0.0".',
		};
		expect(validateProjectVersion('1.0')).toEqual(expected);
	});

	it('should return false with validation message when string has more than 3 digits', function() {
		const expected = {
			result: false,
			validationMessage:
				'The project version must only contain digits and dots in the format "0.0.0".',
		};
		expect(validateProjectVersion('1.0.0.0')).toEqual(expected);
	});
});

describe('validateArrayIsNotEmpty', function() {
	it('should return true when array is not empty', function() {
		const expected = { result: true };
		expect(validateArrayIsNotEmpty([1, 2, 3])).toEqual(expected);
	});

	it('should return false with validation message when array is empty', function() {
		const expected = {
			result: false,
			validationMessage: 'Error: You should choose at least one option.',
		};
		expect(validateArrayIsNotEmpty([])).toEqual(expected);
	});
});

describe('validateSuiteApp', function() {
	it('should return true when string is in valid SuiteApp id format', function() {
		const expected = { result: true };
		expect(validateSuiteApp('com.netsuite.suiteapp1')).toEqual(expected);
	});

	it('should return false with validation message when string does not have a "."', function() {
		const expected = {
			result: false,
			validationMessage:
				"The specified application ID is wrongly formatted. Ensure it follows a pattern such as 'com.example.mysuiteapp'.",
		};
		expect(validateSuiteApp('suiteapp1')).toEqual(expected);
	});

	it('should return false with validation message when string has less than 2 "."', function() {
		const expected = {
			result: false,
			validationMessage:
				"The specified application ID is wrongly formatted. Ensure it follows a pattern such as 'com.example.mysuiteapp'.",
		};
		expect(validateSuiteApp('netsuite.suiteapp1')).toEqual(expected);
	});

	it('should return false with validation message when string has more than 2 "."', function() {
		const expected = {
			result: false,
			validationMessage:
				"The specified application ID is wrongly formatted. Ensure it follows a pattern such as 'com.example.mysuiteapp'.",
		};
		expect(validateSuiteApp('com.netsuite.suiteapp1.extra')).toEqual(expected);
	});
});

describe('validateScriptId', function() {
	it('should return true when string is a valid script id', function() {
		const expected = { result: true };
		expect(validateScriptId('scriptid_1')).toEqual(expected);
	});

	it('should return false with validation message when string is not all in lower case', function() {
		const expected = {
			result: false,
			validationMessage:
				'The specified script ID contains forbidden characters. Use only lowercase letters, numbers, or underscores.',
		};
		expect(validateScriptId('Scriptid')).toEqual(expected);
	});
});
