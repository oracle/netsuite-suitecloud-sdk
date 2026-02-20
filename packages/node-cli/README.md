<p align="left"><a href="#"><img width="250" src="resources/Netsuite-logo-ocean-150-bg.png"></a></p>

# SuiteCloud CLI for Node.js
<p>
  <a href="https://www.npmjs.com/package/@oracle/suitecloud-cli">
    <img src="https://img.shields.io/npm/dm/@oracle/suitecloud-cli.svg" alt="npm-cli"/>
    <img src="https://img.shields.io/npm/v/@oracle/suitecloud-cli.svg" alt="npm-cli"/>
  </a>
</p>

SuiteCloud Command Line Interface (CLI) for Node.js is a SuiteCloud SDK tool to manage SuiteCloud project components and validate and deploy projects to your account.\
CLI for Node.js is an interactive tool that guides you through all the steps of the communication between your local project and your account.

## Prerequisites
The following software is required to work with SuiteCloud CLI for Node.js:
- Node.js version 22 LTS
- Oracle JDK version 17 or 21

Read the full list of prerequisites in [SuiteCloud CLI for Node.js Installation Prerequisites](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_1558708810.html).

## Supported Versions
To ensure that you get the latest features and bug fixes, you should use the latest version of the SuiteCloud CLI for Node.js available in NPM. 

The following table shows the CLI versions currently available in NPM.

| CLI Versions Available in NPM | 
|:-----------------------------:|
| 3.1.2 |
| 3.1.1 |


## Installation
Since CLI for Node.js is a development tool, use a global instance to install it by running the following command:

```
npm install -g @oracle/suitecloud-cli
```
When installing SuiteCloud CLI for Node.js via script, for instance in a CI environment, you can skip showing the license presented during the normal installation process by adding the --acceptSuiteCloudSDKLicense flag to the install script as shown below. Note that by adding the mentioned flag to the script, you confirm that you have read and accepted the Oracle Free Use Terms and Conditions license. See the [License](#license) section for details.

```
npm install -g --acceptSuiteCloudSDKLicense @oracle/suitecloud-cli
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
|[`account:manageauth`](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_157304934116.html)|Manages authentication IDs for all your projects.|
|[`account:setup`](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/article_89132630266.html)|Sets up an account to use with SuiteCloud SDK and configures the default auth ID for the SuiteCloud project. It requires browser-based login to NetSuite.|
|[`account:setup:ci`](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/article_81134826821.html)|Sets up an account to use with SuiteCloud SDK and configures the default auth ID for the SuiteCloud project. It also allows you to select an existing auth ID for the SuiteCloud project. This command does not require browser-based login to NetSuite and is helpful for automated environments such as CI.|
|[`file:create`](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_162810635242.html)|Creates SuiteScript files in the selected folder using the correct template with SuiteScript modules injected.|
|[`file:import`](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_156041963273.html)|Imports files from an account to your account customization project.|
|[`file:list`](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_156042966488.html)|Lists the files in the File Cabinet of your account.|
|[`file:upload`](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_159066070687.html)|Uploads files from your project to an account.|
|[`object:import`](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_156042181820.html)|Imports SDF custom objects from an account to your SuiteCloud project.|
|[`object:list`](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_156043303237.html)|Lists the SDF custom objects deployed in an account.|
|[`object:update`](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_156050566547.html)|Overwrites the SDF custom objects in the project with their matching objects imported from the account. In the case of custom records, custom instances can be included.|
|[`project:adddependencies`](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_155981452469.html)| Adds missing dependencies to the manifest file.|
|[`project:create`](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_156041348327.html)|Creates a SuiteCloud project, either a SuiteApp or an account customization project (ACP).|
|[`project:deploy`](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_156044636320.html)|Deploys the folder containing the project.|
|[`project:package`](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_159550971388.html)|Generates a ZIP file from your project, respecting the structure specified in the deploy.xml file.|
|[`project:validate`](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_156049843194.html)|Validates the folder containing the SuiteCloud project.|

To check the help for a specific command, run the following command:
```
suitecloud {command} -h
```

Read the detailed documentation for all the commands in [SuiteCloud CLI for Node.js Reference](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_155931263126.html).

## Getting Started
🎞 To see how to install and set up CLI for Node.js, watch the following video:

<a href="https://videohub.oracle.com/media/Setting+Up+CLI+for+Nodej.s/0_091fc2ca"><img src="resources/video_setting_up_nodejs_cli.png" alt="Setting up CLI for Node.js video" width="400"></a>


Create a new project in an empty folder by running the following command:
```
suitecloud project:create -i
```

After you create a project, configure a NetSuite account, by running the following command within the project folder:
```
suitecloud account:setup
```

## Release Notes & Documentation
To read the 2025.2 NetSuite's release notes and documentation, check the following sections of NetSuite's Help Center:
- Read the release notes for NetSuite 2025.2 in [SuiteCloud SDK Release Notes](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_1558730192.html).
- Read the latest updates under SuiteCloud SDK in the [Help Center Weekly Updates](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_3798389663.html).
- Read the CLI for Node.js documentation in [SuiteCloud CLI for Node.js Guide](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_1558708800.html).

## Contributing
SuiteCloud CLI for Node.js is an open source project. Pull Requests are currently not being accepted. See [Contributing](/CONTRIBUTING.md) for details.

## [License](/LICENSE.txt)
Copyright (c) 2019, 2023 Oracle and/or its affiliates The Universal Permissive License (UPL), Version 1.0.

By installing SuiteCloud CLI for Node.js, you are accepting the installation of the SuiteCloud SDK dependency under the [Oracle Free Use Terms and Conditions](https://www.oracle.com/downloads/licenses/oracle-free-license.html) license.