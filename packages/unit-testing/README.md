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

- For ACP:
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
  projectType: SuiteCloudJestConfiguration.ProjectType.SuiteApp,
});
```

## Installation
To install SuiteCloud Unit Testing in your project, from your project folder, run the following command:
```
npm install @oracle/suitecloud-unit-testing --save-dev
```

➡ If you use SuiteCloud CLI for Node.js, you can install SuiteCloud Unit Testing when running the [`createproject`](../../packages/node-cli/README.md/##Commands) command by following the questions prompted.

⚠ SuiteCloud Unit Testing is installed as a `devDependency`.

## [Contributing](/CONTRIBUTING.md)
Suitecloud Unit Testing is an open source project. Pull Requests are currently not being accepted. See [CONTRIBUTING](/CONTRIBUTING.md) for details.

## [License](/LICENSE.txt)
Copyright (c) 2019 Oracle and/or its affiliates The Universal Permissive License (UPL), Version 1.0.