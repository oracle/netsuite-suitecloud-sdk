'use strict';

const mockSpawnSyncFn = jest.fn();
const EnvironmentInformationServiceClass = require('../../src/services/EnvironmentInformationService');
jest.mock('child_process', () => {
	return {
		__esModule: true,
		default: jest.fn(),
		spawnSync: mockSpawnSyncFn,
	};
});

describe('getInstalledJavaVersionString() method', () => {
	it.each([
		['17.850', '		my string with java version "17.850"'],
		['17.850', '		my string with openjdk version "17.850"'],
		[
			'11.0.16',
			`		Picked up _JAVA_OPTIONS: -Djava.io.tmpdir=/suitecloudhome
		openjdk version "11.0.16" 2022-07-19 LTS
		OpenJDK Runtime Environment (Red_Hat-11.0.16.0.8-1.0.1.el7_9) (build 11.0.16+8-LTS)
		OpenJDK 64-Bit Server VM (Red_Hat-11.0.16.0.8-1.0.1.el7_9) (build 11.0.16+8-LTS, mixed mode, sharing)`,
		],
	])('should extract the version %s from the following output:\n%s', (expectedJavaVersion, javaVersionStringOutput) => {
		//given
		mockSpawnSyncFn.mockReturnValue({
			stderr: javaVersionStringOutput,
		});
		//when
		const environmentInformationService = new EnvironmentInformationServiceClass();
		//then
		expect(environmentInformationService.getInstalledJavaVersionString()).toEqual(expectedJavaVersion);
	});

	it.each([
		['', '		my string with no double quotes java version 17.850'],
		['', '		my string with unsupportedjava version "17.850"'],
		['', "		my string with single quotes version '17.850'"],
	])('should return empty string from the following output:\n%s%s', (expectedJavaVersion, javaVersionStringOutput) => {
		//given
		mockSpawnSyncFn.mockReturnValue({
			stderr: javaVersionStringOutput,
		});
		//when
		const environmentInformationService = new EnvironmentInformationServiceClass();
		//then
		expect(environmentInformationService.getInstalledJavaVersionString()).toEqual(expectedJavaVersion);
	});
});

describe('isInstalledJavaVersionValid()', () => {
	it.each([
		[true, '		my string with java version "17.850"'],
		[true, '		my string with openjdk version "17.850"'],
		[
			true,
			`		Picked up _JAVA_OPTIONS: -Djava.io.tmpdir=/suitecloudhome
		openjdk version "17.0.16" 2022-07-19 LTS
		OpenJDK Runtime Environment (Red_Hat-11.0.16.0.8-1.0.1.el7_9) (build 11.0.16+8-LTS)
		OpenJDK 64-Bit Server VM (Red_Hat-11.0.16.0.8-1.0.1.el7_9) (build 11.0.16+8-LTS, mixed mode, sharing)`,
		],
		[false, '		my string with no double quotes java version 17.850'],
		[false , '		my string with unsupportedjava version "17.850"'],
		[false , "		my string with single quotes version '17.850'"],
	])('should return %s from the following output:\n%s', (expectedReturnValue, javaVersionStringOutput) => {
		//given
		mockSpawnSyncFn.mockReturnValue({
			stderr: javaVersionStringOutput,
		});
		//when
		const environmentInformationService = new EnvironmentInformationServiceClass();
		//then
		expect(environmentInformationService.isInstalledJavaVersionValid()).toEqual(expectedReturnValue);
	});

});

describe('supported Java releases', () => {
	it.each(['17', '17.0.12', '21', '21.0.7', '25', '25.0.5.0.3'])(
		'accepts %s from either Java version output format', (version) => {
			for (const vendor of ['java', 'openjdk']) {
				mockSpawnSyncFn.mockReturnValue({ status: 0, stderr: Buffer.from(`${vendor} version "${version}"`) });
				expect(new EnvironmentInformationServiceClass().getInstalledJavaVersionString()).toBe(version);
				expect(new EnvironmentInformationServiceClass().isInstalledJavaVersionValid()).toBe(true);
			}
		});

	it.each(['11.0.16', '24', '26', '170', '210.1', '250.0.1', '', '25-ea'])(
		'rejects unsupported or invalid version %s', (version) => {
			expect(new EnvironmentInformationServiceClass().isJavaVersionSupported(version)).toBe(false);
		});

	it('reads version output from stdout', () => {
		mockSpawnSyncFn.mockReturnValue({ status: 0, stdout: 'java version "25.0.5.0.3"' });
		expect(new EnvironmentInformationServiceClass().getInstalledJavaVersionString()).toBe('25.0.5.0.3');
	});

	it.each([{ error: new Error('ENOENT'), stderr: null }, { status: 1, stderr: 'java version "25"' }])(
		'returns no version when Java cannot run', (result) => {
			mockSpawnSyncFn.mockReturnValue(result);
			expect(new EnvironmentInformationServiceClass().getInstalledJavaVersionString()).toBe('');
		});
});
