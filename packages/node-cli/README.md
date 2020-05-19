<p align="center"><a href="#"><img width="250" src="https://cdn.app.compendium.com/uploads/user/8cae7864-8129-4f90-831f-58f1a01c3e5e/60b3624a-ca2d-4418-ac2b-a3997bb708a0/File/d87530554fbd39ba90fcbb144d8df218/oraclenetsuite_horiz.svg"></a></p>

# SuiteCloud CLI for Node.js
<p>
  <a href="https://www.npmjs.com/package/@oracle/suitecloud-cli">
    <img src="https://img.shields.io/npm/dm/@oracle/suitecloud-cli.svg" alt="npm-cli"/>
  </a>
</p>

SuiteCloud Command Line Interface (CLI) for Node.js is a SuiteCloud SDK tool to manage SuiteCloud project components and validate and deploy projects to your account.\
CLI for Node.js is an interactive tool that guides you through all the steps of the communication between your local project and your account.

## Prerequisites
The following software is required to work with SuiteCloud CLI for Node.js:
- Node.js version 12.14.0 LTS or greater
- Java JDK version 11

Read the full list of prerequisites in [NetSuite's Help Center](https://system.netsuite.com/app/help/helpcenter.nl?fid=section_1558708810.html).

## Supported Versions
Although you may have access to older versions of CLI for Node.js, only the versions in this section are officially supported.

Each version of CLI for Node.js in NPM works optimally with a specific NetSuite version. To check the equivalence among versions, see the following table:

| Version in NPM | Version in NetSuite |
|:--------------:|:-------------------:|
| 1.X.X | 2020.1 |
  
## Installation
Since CLI for Node.js is a development tool, use a global instance to install it by running the following command:

```
npm install -g @oracle/suitecloud-cli
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
|[`account:setup`](https://system.netsuite.com/app/help/helpcenter.nl?fid=section_156044528841.html)|Sets up an account to use with the SuiteCloud CLI for Node.js.|
|[`config:proxy`](https://system.netsuite.com/app/help/helpcenter.nl?fid=section_156044426239.html)|Configures a proxy server.|
|[`file:import`](https://system.netsuite.com/app/help/helpcenter.nl?fid=section_156041963273.html)|Imports files from an account to your account customization project.|
|[`file:list`](https://system.netsuite.com/app/help/helpcenter.nl?fid=section_156042966488.html)|Lists the files in the File Cabinet of your account.|
|[`object:import`](https://system.netsuite.com/app/help/helpcenter.nl?fid=section_156042181820.html)|Imports custom objects from an account to your SuiteCloud project.|
|[`object:list`](https://system.netsuite.com/app/help/helpcenter.nl?fid=section_156043303237.html)|Lists the custom objects deployed in an account.|
|[`object:update`](https://system.netsuite.com/app/help/helpcenter.nl?fid=section_156050566547.html)|Overwrite the custom objects in the project with the custom objects in an account.|
|[`project:adddependencies`](https://system.netsuite.com/app/help/helpcenter.nl?fid=section_155981452469.html)| Adds missing dependencies to the manifest file.|
|[`project:create`](https://system.netsuite.com/app/help/helpcenter.nl?fid=section_156041348327.html)|Creates a SuiteCloud project, either a SuiteApp or an account customization project (ACP).|
|[`project:deploy`](https://system.netsuite.com/app/help/helpcenter.nl?fid=section_156044636320.html)|Deploys the folder containing the project.|
|[`project:validate`](https://system.netsuite.com/app/help/helpcenter.nl?fid=section_156049843194.html)|Validates the folder containing the SuiteCloud project.|
|[`suitecommerce:localserver`](https://system.netsuite.com/app/help/helpcenter.nl?fid=section_156043691482.html)|Generates a local server of your SuiteCommerce extensions and themes.|

To check the help for a specific command, run the following command:
```
suitecloud {command} -h
```

Read the detailed documentation for all the commands in [NetSuite's Help Center](https://system.netsuite.com/app/help/helpcenter.nl?fid=chapter_155931263126.html).

## Getting Started
Create a new project in an empty folder by running the following command:
```
suitecloud project:create -i
```

After you create a project, configure a NetSuite account, by running the following command within the project folder:
```
suitecloud account:setup
```

## Release Notes & Documentation
To read the 2020.1 NetSuite's release notes and documentation, check the following sections of NetSuite's Help Center:
- Read the latest updates under SuiteCloud SDK in the [Weekly Update section](https://system.netsuite.com/app/help/helpcenter.nl?fid=section_158955980607.html).
- Read the release notes for NetSuite 2020.1 in [SuiteCloud CLI for Node.js Release Notes](https://system.netsuite.com/app/help/helpcenter.nl?fid=section_1558730192.html#subsect_157467836973).
- Read the CLI for Node.js documentation in [NetSuite's Help Center](https://system.netsuite.com/app/help/helpcenter.nl?fid=chapter_1558708800.html).

## [Contributing](/CONTRIBUTING.md)
SuiteCloud CLI for Node.js is an open source project. Pull Requests are currently not being accepted. See [CONTRIBUTING](/CONTRIBUTING.md) for details.

## [License](/LICENSE.txt)
Copyright (c) 2020 Oracle and/or its affiliates The Universal Permissive License (UPL), Version 1.0.
