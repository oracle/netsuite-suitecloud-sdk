'use strict';
const AccountDetails = require('../../../src/core/accountsetup/AccountDetails');

describe('AccountDetails construction:', function() {
	const options = {
		isDevelopment: true,
		netsuiteUrl: 'test netsuiteUrl',
		accountId: 1,
		accountName: 'test accountName',
		email: 'test email',
		roleId: 2,
		roleName: 'test roleName',
		password: 'test password',
		accountId: 3,
	};

	it('should contains expected values passed by constructor.', function() {
		const accDetail = new AccountDetails(options);

		expect(accDetail.isDevelopment).toEqual(options.isDevelopment);
		expect(accDetail.netSuiteUrl).toEqual(options.netsuiteUrl);
		expect(accDetail.accountId).toEqual(options.accountId);
		expect(accDetail.accountName).toEqual(options.accountName);
		expect(accDetail.email).toEqual(options.email);
		expect(accDetail.roleId).toEqual(options.roleId);
		expect(accDetail.roleName).toEqual(options.roleName);
		expect(accDetail.password).toEqual(options.password);
		expect(accDetail.accountId).toEqual(options.accountId);
	});
});

describe('AccountDetails toJSONWithoutPassword():', function() {
	const options = {
		isDevelopment: true,
		netsuiteUrl: 'test netsuiteUrl',
		accountId: 1,
		accountName: 'test accountName',
		email: 'test email',
		roleId: 2,
		roleName: 'test roleName',
		password: 'test password',
		accountId: 3,
	};

	it('Once parsed should not contain password.', function() {
		const accDetail = new AccountDetails(options);
		const parsedJson = accDetail.toJSONWithoutPassword();

		expect(parsedJson.password).toBeUndefined();
	});

	it('Once parsed should contain same data.', function() {
		const accDetail = new AccountDetails(options);
		const parsedJson = accDetail.toJSONWithoutPassword();

		expect(parsedJson.isDevelopment).toEqual(options.isDevelopment);
		expect(parsedJson.netsuiteUrl).toEqual(options.netsuiteUrl);
		expect(parsedJson.accountId).toEqual(options.accountId);
		expect(parsedJson.accountName).toEqual(options.accountName);
		expect(parsedJson.email).toEqual(options.email);
		expect(parsedJson.roleId).toEqual(options.roleId);
		expect(parsedJson.roleName).toEqual(options.roleName);
		expect(parsedJson.accountId).toEqual(options.accountId);
	});
});

describe('AccountDetails fromJSON():', function() {
	const json = {
		isDevelopment: true,
		netsuiteUrl: 'test netsuiteUrl',
		accountId: 1,
		accountName: 'test accountName',
		email: 'test email',
		roleId: 2,
		roleName: 'test roleName',
		password: 'test password',
		accountId: 3,
	};

	it('Once parsed should contain same data.', function() {
		const importedAccDetail = AccountDetails.fromJson(json);

		expect(importedAccDetail.isDevelopment).toEqual(json.isDevelopment);
		expect(importedAccDetail.netSuiteUrl).toEqual(json.netsuiteUrl);
		expect(importedAccDetail.accountId).toEqual(json.accountId);
		expect(importedAccDetail.accountName).toEqual(json.accountName);
		expect(importedAccDetail.email).toEqual(json.email);
		expect(importedAccDetail.roleId).toEqual(json.roleId);
		expect(importedAccDetail.roleName).toEqual(json.roleName);
		expect(importedAccDetail.accountId).toEqual(json.accountId);
	});
});
