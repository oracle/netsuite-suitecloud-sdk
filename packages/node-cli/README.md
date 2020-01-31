# SuiteCloud CLI for Node.js
SuiteCloud Command Line Interface (CLI) for Node.js is a SuiteCloud SDK tool to manage SuiteCloud project components and validate and deploy projects to your account.\
CLI for Node.js is an interactive tool that guides you through all the steps of the communication between your local project and your account.

## Prerequisites
The following software is required to work with SuiteCloud CLI for Node.js:
- Node.js version 12.14 LTS
- Java JDK version 11

Read the full list of prerequisites in [NetSuite's Help Center](https://system.netsuite.com/app/help/helpcenter.nl?fid=section_1558708810.html).
  
## Installation
To install CLI for Node.js, run the following command:
```
npm install @oracle/netsuite-suitecloud-nodejs-cli --global
```

CLI for Node.js is available from within any directory by running `suitecloud`.

## Usage
CLI for Node.js uses the following syntax: 
```
suitecloud <command> <option> <argument>
```

### Commands
| Command | Description |
| --- | --- |
| [`adddependencies`](https://system.netsuite.com/app/help/helpcenter.nl?fid=section_155981452469.html)| Adds missing dependencies to the manifest file.|
|[`createproject`](https://system.netsuite.com/app/help/helpcenter.nl?fid=section_156041348327.html)|Creates a SuiteCloud project, either a SuiteApp or an account customization project (ACP).|
|[`deploy`](https://system.netsuite.com/app/help/helpcenter.nl?fid=section_156044636320.html)|Deploys the folder containing the project.|
|[`importfiles`](https://system.netsuite.com/app/help/helpcenter.nl?fid=section_156041963273.html)|Imports files from an account to your account customization project.|
|[`importobjects`](https://system.netsuite.com/app/help/helpcenter.nl?fid=section_156042181820.html)|Imports custom objects from an account to your SuiteCloud project.|
|[`listfiles`](https://system.netsuite.com/app/help/helpcenter.nl?fid=section_156042966488.html)|Lists the files in the File Cabinet of your account.|
|[`listobjects`](https://system.netsuite.com/app/help/helpcenter.nl?fid=section_156043303237.html)|Lists the custom objects deployed in an account.|
|[`localserver`](https://system.netsuite.com/app/help/helpcenter.nl?fid=section_156043691482.html)|Generates a local server of your SuiteCommerce extensions and themes.|
|[`manageauth`](https://system.netsuite.com/app/help/helpcenter.nl?fid=section_157304934116.html)|Manages authentication IDs (authid) for all your projects.|
|[`proxy`](https://system.netsuite.com/app/help/helpcenter.nl?fid=section_156044426239.html)|Configures a proxy server.|
|[`setupaccount`](https://system.netsuite.com/app/help/helpcenter.nl?fid=section_156044528841.html)|Sets up an account to use with the SuiteCloud CLI for Node.js.|
|[`validate`](https://system.netsuite.com/app/help/helpcenter.nl?fid=section_156049843194.html)|Validates the folder containing the SuiteCloud project.|

To check the help for a specific command, run the following command:
```
suitecloud {command} -h
```

Read the detailed documentation for all the commands in [NetSuite's Help Center](https://system.netsuite.com/app/help/helpcenter.nl?fid=chapter_155931263126.html).

## Getting Started
Create a new project in an empty folder by running the following command:
```
suitecloud createproject -i
```

After you create a project, configure a NetSuite account, by running the following command within the project folder:
```
suitecloud setupaccount
```

## Documentation
Read all the documentation about CLI for Node.js in [NetSuite's Help Center](
https://system.netsuite.com/app/help/helpcenter.nl?fid=chapter_1558708800.html).

## [Contributing](./CONTRIBUTING.md)
SuiteCloud CLI for Node.js is an open source project. Pull Requests are currently not being accepted. See [CONTRIBUTING](../../CONTRIBUTING.md) for details.

## [License](./LICENSE.txt)
Copyright (c) 2019 Oracle and/or its affiliates The Universal Permissive License (UPL), Version 1.0.