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
jest.mock('../../src/ApplicationConstants', () => ({ SDK_REQUIRED_JAVA_VERSION: '11' }));

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

describe('isInstalledJavaVersionValid() (expecting java 11)', () => {
	it.each([
		[false, '		my string with java version "17.850"'],
		[false, '		my string with openjdk version "17.850"'],
		[
			true,
			`		Picked up _JAVA_OPTIONS: -Djava.io.tmpdir=/suitecloudhome
		openjdk version "11.0.16" 2022-07-19 LTS
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

