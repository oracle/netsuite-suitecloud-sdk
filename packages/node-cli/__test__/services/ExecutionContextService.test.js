'use strict';
const { validateMachineToMachineAuthIsAllowed }  = require('../../../node-cli/src/services/ExecutionContextService');
const { validateBrowserBasedAuthIsAllowed, getBrowserBasedWarningMessages } = require('../../src/services/ExecutionContextService');

const {
	ENV_VARS: {
		SUITECLOUD_CI,
		SUITECLOUD_CI_PASSKEY,
		SUITECLOUD_FALLBACK_PASSKEY
	}
} = require('../../src/ApplicationConstants');

describe('validateMachineToMachineAuthIsAllowed', () => {

	let original_SUITECLOUD_CI;
	let original_SUITECLOUD_CI_PASSKEY;
	let original_SUITECLOUD_FALLBACK_PASSKEY;
	beforeAll(() => {
		original_SUITECLOUD_CI = process.env[SUITECLOUD_CI];
		original_SUITECLOUD_CI_PASSKEY = process.env[SUITECLOUD_CI_PASSKEY];
		original_SUITECLOUD_FALLBACK_PASSKEY = process.env[SUITECLOUD_FALLBACK_PASSKEY];
	});

	afterAll(() => {
		process.env[SUITECLOUD_CI] = original_SUITECLOUD_CI;
		process.env[SUITECLOUD_CI_PASSKEY] = original_SUITECLOUD_CI_PASSKEY;
		process.env[SUITECLOUD_FALLBACK_PASSKEY] = original_SUITECLOUD_FALLBACK_PASSKEY;
	});

	beforeEach(() => {
		delete process.env[SUITECLOUD_CI];
		delete process.env[SUITECLOUD_CI_PASSKEY];
		delete process.env[SUITECLOUD_FALLBACK_PASSKEY];
	});


	it('should not throw error for CI execution mode', () => {
		process.env[SUITECLOUD_CI] = '1';
		process.env[SUITECLOUD_CI_PASSKEY] = 'some_passkey';
		expect(validateMachineToMachineAuthIsAllowed).not.toThrow();
	});

	it('should not throw error for AUTH_CI_SETUP execution mode', () => {
		process.env[SUITECLOUD_CI_PASSKEY] = 'some_passkey';
		expect(validateMachineToMachineAuthIsAllowed).not.toThrow();
	});

	it('should throw error for DEV_MACHINE_FALLBACK_PASSKEY execution mode', () => {
		process.env[SUITECLOUD_FALLBACK_PASSKEY] = 'some_passkey';
		expect(() => validateMachineToMachineAuthIsAllowed()).toThrow();
	});

	it('should throw error for DEV_MACHINE execution mode', () => {
		expect(() => validateMachineToMachineAuthIsAllowed()).toThrow();
	});

});

describe('validateBrowserBasedAuthIsAllowed', () => {
	let original_SUITECLOUD_CI;
	let original_SUITECLOUD_CI_PASSKEY;
	let original_SUITECLOUD_FALLBACK_PASSKEY;
	beforeAll(() => {
		original_SUITECLOUD_CI = process.env[SUITECLOUD_CI];
		original_SUITECLOUD_CI_PASSKEY = process.env[SUITECLOUD_CI_PASSKEY];
		original_SUITECLOUD_FALLBACK_PASSKEY = process.env[SUITECLOUD_FALLBACK_PASSKEY];
	});

	afterAll(() => {
		process.env[SUITECLOUD_CI] = original_SUITECLOUD_CI;
		process.env[SUITECLOUD_CI_PASSKEY] = original_SUITECLOUD_CI_PASSKEY;
		process.env[SUITECLOUD_FALLBACK_PASSKEY] = original_SUITECLOUD_FALLBACK_PASSKEY;
	});

	beforeEach(() => {
		delete process.env[SUITECLOUD_CI];
		delete process.env[SUITECLOUD_CI_PASSKEY];
		delete process.env[SUITECLOUD_FALLBACK_PASSKEY];
	});

	it('should throw error for CI execution mode', () => {
		process.env[SUITECLOUD_CI] = '1';
		process.env[SUITECLOUD_CI_PASSKEY] = 'some_passkey';
		expect(validateBrowserBasedAuthIsAllowed).toThrow();
	});

	it('should throw error for AUTH_CI_SETUP execution mode', () => {
		process.env[SUITECLOUD_CI_PASSKEY] = 'some_passkey';
		expect(validateBrowserBasedAuthIsAllowed).toThrow();
	});

	it('should not should not throw error for DEV_MACHINE_FALLBACK_PASSKEY execution mode', () => {
		process.env[SUITECLOUD_FALLBACK_PASSKEY] = 'some_passkey';
		expect(validateBrowserBasedAuthIsAllowed).not.toThrow();
	});

	it('should not throw error for DEV_MACHINE execution mode', () => {
		expect(validateBrowserBasedAuthIsAllowed).not.toThrow();
	});
});


describe('getBrowserBasedWarningMessages', () => {

	let original_SUITECLOUD_CI;
	let original_SUITECLOUD_CI_PASSKEY;
	let original_SUITECLOUD_FALLBACK_PASSKEY;
	beforeAll(() => {
		original_SUITECLOUD_CI = process.env[SUITECLOUD_CI];
		original_SUITECLOUD_CI_PASSKEY = process.env[SUITECLOUD_CI_PASSKEY];
		original_SUITECLOUD_FALLBACK_PASSKEY = process.env[SUITECLOUD_FALLBACK_PASSKEY];
	});

	afterAll(() => {
		process.env[SUITECLOUD_CI] = original_SUITECLOUD_CI;
		process.env[SUITECLOUD_CI_PASSKEY] = original_SUITECLOUD_CI_PASSKEY;
		process.env[SUITECLOUD_FALLBACK_PASSKEY] = original_SUITECLOUD_FALLBACK_PASSKEY;
	});

	beforeEach(() => {
		delete process.env[SUITECLOUD_CI];
		delete process.env[SUITECLOUD_CI_PASSKEY];
		delete process.env[SUITECLOUD_FALLBACK_PASSKEY];
	});

	it('should return undefined for CI execution mode', () => {
		process.env[SUITECLOUD_CI] = '1';
		process.env[SUITECLOUD_CI_PASSKEY] = 'some_passkey';
		expect(getBrowserBasedWarningMessages()).toBeUndefined();
	});

	it('should return undefined for AUTH_CI_SETUP execution mode', () => {
		process.env[SUITECLOUD_CI_PASSKEY] = 'some_passkey';
		expect(getBrowserBasedWarningMessages()).toBeUndefined();
	});

	it('should return a message for DEV_MACHINE_FALLBACK_PASSKEY execution mode', () => {
		process.env[SUITECLOUD_FALLBACK_PASSKEY] = 'some_passkey';
		expect(getBrowserBasedWarningMessages()).toBeDefined();
	});

	it('should return undefined for DEV_MACHINE execution mode', () => {
		expect(getBrowserBasedWarningMessages()).toBeUndefined();
	});
});