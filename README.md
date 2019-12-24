# SuiteCloud CLI for Node.js
> ⚠ This project is work in progress.
> The full supported version will be available after NetSuite 20.1 is released.

SuiteCloud Command Line Interface (CLI) for Node.js is a SuiteCloud SDK tool to manage SuiteCloud project components and validate and deploy projects to your account.\
CLI for Node.js is an interactive tool that guides you through all the steps of the communication between your local project and your account.

## Prerequisites
The following software is required to work with SuiteCloud CLI for Node.js:
- Node.js version 10.16.0 LTS
- Java JRE version 8
  
## Installation
Download the contents of this repository as a ZIP file, and do the following:
1.  Unzip the file in an empty folder.
2.  From within this folder, run `npm install`.
3.  Optionally, to make CLI for Node.js available from within any directory, run `npm link`.

## Usage
CLI for Node.js uses the following syntax: 
```
suitecloud <command> <--option> <argument>
```

### Commands
| Command | Description |
| --- | --- |
|`adddependencies`| Adds missing dependencies to the manifest file.|
|`createproject`|Creates a SuiteCloud project, either a SuiteApp or an account customization project (ACP).|
|`deploy`|Deploys the folder containing the project.|
|`importfiles`|Imports files from an account to your account customization project.|
|`importobjects`|Imports custom objects from an account to your SuiteCloud project.|
|`listfiles`|Lists the files in the File Cabinet of your account.|
|`listobjects`|Lists the custom objects deployed in an account.|
|`localserver`|Generates a local server of your SuiteCommerce extensions and themes.|
|`proxy`|Configures a proxy server.|
|`setupaccount`|Sets up an account to use with the SuiteCloud CLI for Node.js.|
|`validate`|Validates the folder containing the SuiteCloud project.|

To check the help for a specific command, run `suitecloud {command} -h`.

## Getting Started
Create a new project in an empty folder by running the following command:
```
suitecloud createproject -i
```

After you create a project, configure a NetSuite account, by running the following command within the project folder:
```
suitecloud setupaccount
```

## [Contributing](./CONTRIBUTING.md)
SuiteCloud CLI for Node.js is an open source project. Pull Requests are currently not being accepted. See [CONTRIBUTING](./CONTRIBUTING.md) for details.

## [License](./LICENSE.txt)
Copyright (c) 2019 Oracle and/or its affiliates The Universal Permissive License (UPL), Version 1.0.