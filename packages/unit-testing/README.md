# SuiteCloud Unit Testing
Suitecloud Unit Testing allows you to use unit testing with [Jest](https://jestjs.io/) for your SDF projects.

## Prerequisites
The following software is required to use SuiteCloud Unit Testing package:
- Node.js version 12.14.0 LTS or greater
- [Jest](https://jestjs.io/docs/en/getting-started.html)
- A `__tests__` folder in the root of your SDF project.
- A `jest.config.js` file in the root of your SDF project.

## `jest.config.js` File Examples
The `jest.config.js` file must follow a specific structure. Depending on your SDF project type, check one of the following examples:

- For Account Customization Projects:
```
const SuiteCloudJestConfiguration = require("@oracle/suitecloud-unit-testing/SuiteCloudJestConfiguration");

module.exports = SuiteCloudJestConfiguration.build({
  projectFolder: 'src', //or your project folder
  projectType: SuiteCloudJestConfiguration.ProjectType.ACP,
});
```

- For SuiteApps:
```
const SuiteCloudJestConfiguration = require("@oracle/suitecloud-unit-testing/SuiteCloudJestConfiguration");

module.exports = SuiteCloudJestConfiguration.build({
  projectFolder: 'src', //or your project folder
  projectType: SuiteCloudJestConfiguration.ProjectType.SUITEAPP,
});
```

## Installation
> ⚠ SuiteCloud Unit Testing is installed as a `devDependency`.

To install SuiteCloud Unit Testing in your project, from your project folder, run the following command:
```
npm install @oracle/suitecloud-unit-testing --save-dev
```

➡ If you use SuiteCloud CLI for Node.js, you can install SuiteCloud Unit Testing when running the [`project:create`](../../packages/node-cli/README.md/##Commands) command by following the questions prompted.

## SuiteCloud Unit Testing Examples

Here you can find two examples on how to use SuiteCloud Unit Testing with a SuiteCloud project.

The first example covers testing for the **N/record** module, which is fully mocked in SuiteCloud Unit Testing. Whereas the second example covers the testing of a module that is not mocked in SuiteCloud Unit Testing, by using a custom stub.

>💡 You can manually mock any module that is still not supported in SuiteCloud Unit Testing.

### N/record Module Example

Make sure your project follows a structure similar to the one presented below:
```
myAccountCustomizationProject
		> __tests__
					> Suitelet.test.js
		> src
					> AccountConfiguration
					> FileCabinet
							> SuiteScripts
                  > Suitelet.js
							> Templates
							> Web Site Hosting Files
					> Objects
					> Translations
					deploy.xml
					manifest.xml
		suitecloud.config.js
		jest.config.js
```

To see the content of the files you need to make SuiteCloud Unit Testing work, check the following list:

- `jest.config.js` file
```javascript
const SuiteCloudJestConfiguration = require("@oracle/suitecloud-unit-testing/jest-configuration/SuiteCloudJestConfiguration");

module.exports = SuiteCloudJestConfiguration.build({
		projectFolder: 'src',
		projectType: SuiteCloudJestConfiguration.ProjectType.ACP,
});
```

- `Suitelet.js` file

```javascript
/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(["N/record"], function(record) {
    return {
        onRequest: function(context) {
            if (context.request.method === 'GET') {
                const salesOrderId = context.request.parameters.salesOrderId;
                let salesOrderRecord = record.load({id: salesOrderId});
                salesOrderRecord.setValue({fieldId: 'memo', value: "foobar"});
                salesOrderRecord.save({enableSourcing: false});
            }
        }
    };
});
```

- `Suitelet.test.js` file

```javascript
import Suitelet from "SuiteScripts/Suitelet";

import record from "N/record";
import Record from "N/record/instance";

jest.mock("N/record");
jest.mock("N/record/instance");

beforeEach(() => {
    jest.clearAllMocks();
});

describe("Suitelet Test", () => {
    it("Sales Order memo field has been updated", () => {
        // given
        const context = {
            request: {
                method: 'GET',
                parameters: {
                    salesOrderId: 1352
                }
            }
        };

        record.load.mockReturnValue(Record);
        Record.save.mockReturnValue(1352);

        // when
        Suitelet.onRequest(context);

        // then
        expect(record.load).toHaveBeenCalledWith({id: 1352});
        expect(Record.setValue).toHaveBeenCalledWith({fieldId: 'memo', value: 'foobar'});
        expect(Record.save).toHaveBeenCalledWith({enableSourcing: false});
    });
});

```

To read a comprehensive description of this example, visit [NetSuite's Help Center](https://system.netsuite.com/app/help/helpcenter.nl?fid=section_158436693543.html#subsect_158437822806).

### Custom Stub Example 

In order for your tests to fully work, your project needs to follow a specific structure. Use the following structure as an example:

```
myAccountCustomizationProject
		> customStubs
					> http.js
		> __tests__
					> http.test.js
		> src
					> AccountConfiguration
					> FileCabinet
							> SuiteScripts
							> Templates
							> Web Site Hosting Files
					> Objects
					> Translations
					deploy.xml
					manifest.xml
		suitecloud.config.js
		jest.config.js
```

Once you have a file structure similar to the one above, you can start creating the testing files. 

To see the content of the files you need to make SuiteCloud Unit Testing work, check the following list:

- `jest.config.js` file
```javascript
const SuiteCloudJestConfiguration = require("@oracle/suitecloud-unit-testing/jest-configuration/SuiteCloudJestConfiguration");

module.exports = SuiteCloudJestConfiguration.build({
		projectFolder: 'src',
		projectType: SuiteCloudJestConfiguration.ProjectType.ACP,
		customStubs: [
			{
				module: "N/http",
				path: "&lt;rootDir>/customStubs/http.js"
			}
		]
});
```
- `http.js` file: This is the stub file. It partially mocks NetSuite's **N/http** module.
>💡 The JSDoc annotations are copied from NetSuite's **N/http** module. Comment out the ones you do not need, or remove them completely.
```javascript
define([], function() {
    /**
     * @namespace http
     */
    var http = function() {};

    /**
     * Send a HTTP GET request and return a reponse from a server.
     *
     * @governance 10 units
     * @restriction Server SuiteScript only
     *
     * @param {Object} options
     * @param {string} options.url the HTTP URL being requested
     * @param {Object} options.headers (optional) The HTTP headers
     * @return {ClientResponse}
     *
     * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if a required argument is missing
     * @throws {SuiteScriptError} SSS_INVALID_URL if an incorrect protocol is used (ex: http in the HTTPS module)
     *
     * @since 2015.2
     */
    http.prototype.get = function(options) {};

    /**
     * @exports N/http
     * @namespace http
     */
    return new http();
});

```
- `http.test.js` file
```javascript
import http from 'N/http';

jest.mock('N/http');

beforeEach(() => {
    jest.clearAllMocks();
});

describe('Sample test with user defined http module stub', () => {
    it('should call http get method', () => {
        // given
        const clientResponseMock = {
            code: 200,
            body: {
                data: 'foobar'
            }
            // more properties and functions here if needed
        };
        http.get.mockReturnValue(clientResponseMock);

        const options = {
            url: 'https://netsuite.com'
        };

        // when
        const clientResponse = http.get(options);

        // then
        expect(http.get).toHaveBeenCalledWith(options);
        expect(clientResponse).toMatchObject({
            code: 200,
            body: {
                data: 'foobar'
            }
        });
    });
});
```

To read a comprehensive description of this example, visit [NetSuite's Help Center](https://system.netsuite.com/app/help/helpcenter.nl?fid=section_158436693543.html#subsect_158437820311).

## [Contributing](/CONTRIBUTING.md)
Suitecloud Unit Testing is an open source project. Pull Requests are currently not being accepted. See [CONTRIBUTING](/CONTRIBUTING.md) for details.

## [License](/LICENSE.txt)
Copyright (c) 2019 Oracle and/or its affiliates The Universal Permissive License (UPL), Version 1.0.