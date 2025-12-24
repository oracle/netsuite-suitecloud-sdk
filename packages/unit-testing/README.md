<p align="left"><a href="#"><img width="250" src="resources/Netsuite-logo-ocean-150-bg.png"></a></p>

# SuiteCloud Unit Testing
<p>
   <a href="https://www.npmjs.com/package/@oracle/suitecloud-unit-testing">
      <img src="https://img.shields.io/npm/dm/@oracle/suitecloud-unit-testing.svg" alt="npm-unit-testing"/>
      <img src="https://img.shields.io/npm/v/@oracle/suitecloud-unit-testing.svg" alt="npm-unit-testing"/>
   </a>
</p>

Suitecloud Unit Testing allows you to use unit testing with [Jest](https://jestjs.io/) for your SuiteCloud projects.

## Features
- Provides a default configuration to run unit tests with Jest in SuiteCloud projects.
- Supports unit testing for SuiteScript 2.x files.
- Provides stubs for all SuiteScript 2.x modules.
- Allows you to create custom stubs for any module used in SuiteScript 2.x files.

For more information about the available SuitScript 2.x modules, see [SuiteScript 2.x Modules](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_4220488571.html).  
For more information about all the mockable stubs, see the CORE_STUBS list in  [SuiteCloudJestConfiguration.js](./jest-configuration/SuiteCloudJestConfiguration.js).

## Prerequisites
- Node.js version 22 LTS
- Having a SuiteCloud project

## Getting Started
If you use SuiteCloud CLI for Node.js, you can install SuiteCloud Unit Testing when running the `project:create` command by following the questions prompted. This way, your project is initialized with SuiteCloud Unit Testing, and all the dependencies are being taken care of.

> ⚠ SuiteCloud Unit Testing is installed as a `devDependency`.

However, if you want to configure SuiteCloud Unit Testing manually, do the following:

1. Inside of your SuiteCloud project folder, create a `src` folder.
2. Move your project files inside of the `src` folder.
3. To initialize the NPM package, from the root of your SuiteCloud project folder, run `npm init`.
>💡 A `package.json` file is created in your SuiteCloud project folder.
4. In your `package.json` file, add the following code:
    ```json
    {
        "scripts": {
            "test": "jest"
        }
    }
    ```
5. From the root of your SuiteCloud project folder, run the following command:
    ```
    npm install --save-dev @oracle/suitecloud-unit-testing jest
    ```
6. Create a `__tests__` folder, inside of the root of your SuiteCloud project folder.
7. Create a `sample-test.js` file, inside of the `__tests__` folder, with the following content:
    ```javascript
    describe('Basic jest test with simple assert', () => {
        it('should assert strings are equal', () => {
            const a = 'foobar';
            const b = 'foobar';
            expect(a).toMatch(b);
        });
    });
    ```
8. From the root of your SuiteCloud project folder, run `npm test`
to run your test. You should see an output similar to the following:
    ```
    PASS  __tests__/sample-test.js
    Basic jest test with simple assert
        √ should assert strings are equal (2ms)
    ```

**You successfully ran your first test for a SuiteCloud project!**

## Additional Configuration
To properly run your tests against the SuiteScript 2.x files of your SuiteCloud project, create a `jest.config.js` file inside of the root of your SuiteCloud project folder.

The `jest.config.js` file must follow a specific structure. Depending on your SuiteCloud project type, check one of the following examples:

- For Account Customization Projects:
```javascript
const SuiteCloudJestConfiguration = require("@oracle/suitecloud-unit-testing/jest-configuration/SuiteCloudJestConfiguration");

module.exports = SuiteCloudJestConfiguration.build({
  projectFolder: 'src', //or your SuiteCloud project folder
  projectType: SuiteCloudJestConfiguration.ProjectType.ACP,
});
```

- For SuiteApps:
```javascript
const SuiteCloudJestConfiguration = require("@oracle/suitecloud-unit-testing/jest-configuration/SuiteCloudJestConfiguration");

module.exports = SuiteCloudJestConfiguration.build({
  projectFolder: 'src', //or your SuiteCloud project folder
  projectType: SuiteCloudJestConfiguration.ProjectType.SUITEAPP,
});
```

## SuiteCloud Unit Testing Examples

Here you can find two examples on how to use SuiteCloud Unit Testing with a SuiteCloud project.

The first example covers testing for the **N/record** module, which is fully mocked in SuiteCloud Unit Testing. Whereas the second example covers the testing of a module that is not mocked in SuiteCloud Unit Testing, by using a custom stub.

>💡 You can manually mock any module that is still not supported in SuiteCloud Unit Testing.

### N/record Module Example

This example follows the structure presented below:
```
myAccountCustomizationProject
├── __tests__
│   └── sample-test.js
├── node_modules
├── src
│   ├── AccountConfiguration
│   ├── FileCabinet
│       ├── SuiteScripts
│           └── Suitelet.js
│   ├── Objects
│   ├── Translations
│   ├── deploy.xml
│   └── manifest.xml
├── jest.config.js
├── suitecloud.config.js
├── package-lock.json
├── package.json
└── project.json
```

See below the content of the SuiteCloud Unit Testing files:

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

### Custom Stub Example 

This example follows the structure presented below:

```
myAccountCustomizationProject
├── customStubs
│   └── http.js
├── __tests__
│   └── http.test.js
├── node_modules
├── src
│   ├── AccountConfiguration
│   ├── FileCabinet
│       ├── SuiteScripts
│       ├── Templates
│       ├── Web Site Hosting Files 
│   ├── Objects
│   ├── Translations
│   ├── deploy.xml
│   └── manifest.xml
├── jest.config.js
├── suitecloud.config.js
├── package-lock.json
├── package.json
└── project.json
``` 

See below the content of the SuiteCloud Unit Testing files:

- `jest.config.js` file
```javascript
const SuiteCloudJestConfiguration = require("@oracle/suitecloud-unit-testing/jest-configuration/SuiteCloudJestConfiguration");

module.exports = SuiteCloudJestConfiguration.build({
		projectFolder: 'src',
		projectType: SuiteCloudJestConfiguration.ProjectType.ACP,
		customStubs: [
			{
				module: "N/http",
				path: "<rootDir>/customStubs/http.js"
			}
		]
});
```
- `http.js` file: This is the stub file. It partially mocks NetSuite's **N/http** module.
>💡 The JSDoc annotations are copied from NetSuite's **N/http** module, but are not required to run SuiteCloud Unit Testing.
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

## Contributing
Suitecloud Unit Testing is an open source project. Pull requests are currently not being accepted. See [Contributing](/CONTRIBUTING.md) for details.

## [License](/LICENSE.txt)
Copyright (c) 2019, 2023 Oracle and/or its affiliates The Universal Permissive License (UPL), Version 1.0.
